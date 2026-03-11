/* =============================================================
   Production OS V2 — Utils
   時間計算・日没・スケジュール・香盤アルゴリズム
   ============================================================= */

const Utils = (() => {

    // ── 時刻変換 ──────────────────────────────────────────
    function timeToMin(t) {
        if (!t) return 0;
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    }
    function minToTime(m) {
        if (m < 0) m = 0;
        const h = Math.floor(m / 60) % 24;
        const mm = m % 60;
        return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    }
    function fmtDiff(diffMin) {
        const abs = Math.abs(diffMin);
        const h = Math.floor(abs / 60);
        const m = abs % 60;
        const sign = diffMin > 0 ? '+' : diffMin < 0 ? '−' : '±';
        if (h > 0) return `${sign}${h}時間${m > 0 ? m + '分' : ''}`;
        return `${sign}${m}分`;
    }

    // ── 現在時刻 ──────────────────────────────────────────
    function nowStr() {
        const d = new Date();
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    }
    function nowMin() { return timeToMin(nowStr()); }

    // ── 日没時刻（天文計算） ──────────────────────────────
    function calcSunset(lat, lng, dateStr) {
        // Julian date
        const date = dateStr ? new Date(dateStr) : new Date();
        const jd = Math.floor(date.getTime() / 86400000) + 2440587.5;
        const n = jd - 2451545.0;
        const L = (280.46 + 0.9856474 * n) % 360;
        const g = (357.528 + 0.9856003 * n) % 360;
        const gRad = g * Math.PI / 180;
        const lambda = L + 1.915 * Math.sin(gRad) + 0.02 * Math.sin(2 * gRad);
        const lamRad = lambda * Math.PI / 180;
        const dec = Math.asin(0.3978 * Math.sin(lamRad)) * 180 / Math.PI;
        const decRad = dec * Math.PI / 180;
        const latRad = lat * Math.PI / 180;
        const cosH = (Math.sin(-0.8333 * Math.PI / 180) - Math.sin(latRad) * Math.sin(decRad))
            / (Math.cos(latRad) * Math.cos(decRad));
        if (cosH < -1 || cosH > 1) return '19:00'; // fallback
        const hDeg = Math.acos(cosH) * 180 / Math.PI;
        // Solar noon
        const eot = (L - lambda) / 15; // approx
        const noon = 12 - lng / 15 - eot + 9; // UTC+9
        const sunsetH = noon + hDeg / 15;
        const totalMin = Math.round(sunsetH * 60);
        return minToTime(totalMin);
    }

    // ── スケジュール再計算 ────────────────────────────────
    function recalcSchedule(orderedShots, startTimeStr, delayMin = 0) {
        let cursor = timeToMin(startTimeStr) + delayMin;
        return orderedShots.map(shot => {
            if (shot.status === 'completed') {
                // Keep completed shots at their actual end time
                const endMin = timeToMin(shot.completedAt || shot.startTime) + (shot.duration || 0);
                if (endMin > cursor) cursor = endMin;
                return { ...shot };
            }
            const s = { ...shot, startTime: minToTime(cursor) };
            cursor += (shot.duration || 30);
            return s;
        });
    }

    // ── 押し・巻き計算 ────────────────────────────────────
    function calcDelay(orderedShots, originalStartTime) {
        const shooting = orderedShots.find(s => s.status === 'shooting');
        if (!shooting) {
            const firstUpcoming = orderedShots.find(s => s.status === 'upcoming');
            if (!firstUpcoming) return 0;
        }
        // 完了カットの実績完了時刻からの遅れを計算
        const completed = orderedShots.filter(s => s.status === 'completed');
        if (completed.length === 0) return 0;
        const last = completed[completed.length - 1];
        // Expected end = original start + sum of completed durations
        const expectedEnd = timeToMin(originalStartTime) + completed.reduce((s, c) => s + (c.duration || 0), 0);
        const actualEnd = timeToMin(last.completedAt || last.startTime) + (last.duration || 0);
        return actualEnd - expectedEnd;
    }

    // ── 残カット・日没計算 ────────────────────────────────
    function calcRemainingStats(orderedShots, sunsetTimeStr, delayMin = 0) {
        const sunsetMin = timeToMin(sunsetTimeStr);
        const remaining = orderedShots.filter(s => s.status !== 'completed');
        const nowM = nowMin() + delayMin;

        let cursor = nowM;
        let canDoBeforeSunset = 0;
        let totalRemainingMin = 0;

        remaining.forEach(shot => {
            const dur = shot.duration || 30;
            totalRemainingMin += dur;
            if (cursor + dur <= sunsetMin) {
                canDoBeforeSunset++;
                cursor += dur;
            }
        });

        const estimatedEnd = nowM + totalRemainingMin;
        const wrapTime = timeToMin(Store.project.wrapTime || '20:00');
        const overtimeMin = Math.max(0, estimatedEnd - wrapTime);
        const overtimeRisk = overtimeMin > 120 ? 'high' : overtimeMin > 30 ? 'medium' : 'low';

        return {
            totalRemaining: remaining.length,
            canDoBeforeSunset,
            cantDoBeforeSunset: remaining.length - canDoBeforeSunset,
            estimatedEnd: minToTime(estimatedEnd),
            estimatedEndMin: estimatedEnd,
            overtimeMin,
            overtimeRisk,
            sunsetMin,
        };
    }

    // ── AI香盤アルゴリズム ────────────────────────────────
    // 戦略: ロケ地ごとにグループ化 → 出演者の拘束時間を考慮 → 移動コスト最小化
    function generateKanban(shots, crew, locations, params = {}) {
        const {
            startTime = Store.project.startTime || '09:00',
            travelMinutes = 30, // デフォルト移動時間
        } = params;

        // 未完了カットのみ
        const pending = shots.filter(s => s.status !== 'completed');
        if (pending.length === 0) return { blocks: [], generatedAt: new Date().toISOString() };

        // ロケ別グループ
        const locGroups = {};
        pending.forEach(shot => {
            const loc = shot.location || '未定';
            if (!locGroups[loc]) locGroups[loc] = [];
            locGroups[loc].push(shot);
        });

        // キャスト別優先度スコア（多くのカットに登場するキャストから優先）
        const castCount = {};
        pending.forEach(shot => {
            (shot.cast || []).forEach(name => {
                castCount[name] = (castCount[name] || 0) + 1;
            });
        });

        // ロケをよく使うキャストスコアで並べ替え
        const sortedLocs = Object.keys(locGroups).sort((a, b) => {
            const scoreA = locGroups[a].reduce((s, shot) =>
                s + (shot.cast || []).reduce((cs, c) => cs + (castCount[c] || 0), 0), 0);
            const scoreB = locGroups[b].reduce((s, shot) =>
                s + (shot.cast || []).reduce((cs, c) => cs + (castCount[c] || 0), 0), 0);
            return scoreB - scoreA;
        });

        // スケジュール生成
        const blocks = [];
        let cursor = timeToMin(startTime);
        let prevLoc = null;

        sortedLocs.forEach(locName => {
            // 移動ブロック
            if (prevLoc && prevLoc !== locName) {
                blocks.push({
                    type: 'travel',
                    from: prevLoc,
                    to: locName,
                    startMin: cursor,
                    endMin: cursor + travelMinutes,
                    label: `移動: ${prevLoc} → ${locName}`,
                });
                cursor += travelMinutes;
            }

            // ロケ内ショット（出演者の連続性を考慮して並べ替え）
            const locShots = locGroups[locName].sort((a, b) => {
                // castの重複が多い順に並べる（無駄な呼び戻しを減らすため）
                const overlapA = (a.cast || []).filter(c => (b.cast || []).includes(c)).length;
                return -overlapA;
            });

            locShots.forEach(shot => {
                blocks.push({
                    type: 'shot',
                    shot,
                    location: locName,
                    startMin: cursor,
                    endMin: cursor + (shot.duration || 30),
                    startTime: minToTime(cursor),
                    endTime: minToTime(cursor + (shot.duration || 30)),
                });
                cursor += (shot.duration || 30);
            });

            prevLoc = locName;
        });

        // ランチブレイク挿入（12:00-13:00 の間にカットが入る場合）
        const lunchStart = timeToMin('12:00');
        const lunchEnd = timeToMin('13:00');
        let lunchInserted = false;
        const withLunch = [];
        blocks.forEach(block => {
            if (!lunchInserted && block.startMin >= lunchStart && block.startMin < lunchEnd) {
                withLunch.push({
                    type: 'break', label: '昼食・休憩',
                    startMin: lunchStart, endMin: lunchEnd,
                });
                lunchInserted = true;
                // Shift subsequent blocks by lunch duration
                const shift = lunchEnd - block.startMin;
                if (shift > 0) cursor += shift;
            }
            withLunch.push(block);
        });

        return {
            blocks: withLunch,
            generatedAt: new Date().toISOString(),
            params,
            totalShots: pending.length,
            estimatedEnd: minToTime(cursor),
        };
    }

    // ── 金額フォーマット ──────────────────────────────────
    function fmtYen(n) {
        return '¥' + Math.round(n).toLocaleString('ja-JP');
    }

    // ── ランダムID ────────────────────────────────────────
    function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

    return {
        timeToMin, minToTime, fmtDiff, nowStr, nowMin,
        calcSunset, recalcSchedule, calcDelay,
        calcRemainingStats, generateKanban,
        fmtYen, uid,
    };
})();

window.Utils = Utils;
