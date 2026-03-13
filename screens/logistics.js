/* =============================================================
   Logistics Screen V5 — ロケ管理・移動時間自動計算・ドラッグ並替え
   緯度経度は住所から自動ジオコーディング (Nominatim)
   移動時間・距離はOSRM APIで自動計算
   ============================================================= */

/* ── ジオコーディング (住所 → 座標) ───────────────────────── */
async function geocodeAddress(address) {
    if (!address) return null;
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=jp`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'ja' } });
        const data = await res.json();
        if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch (e) { console.warn('Geocoding failed:', e); }
    return null;
}

/* ── ルート計算 (OSRM) ───────────────────────────────────── */
async function calcRoute(from, to) {
    if (!from?.lat || !to?.lat) return null;
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
            const r = data.routes[0];
            return {
                distanceKm: (r.distance / 1000).toFixed(1),
                durationMin: Math.round(r.duration / 60)
            };
        }
    } catch (e) { console.warn('OSRM route failed:', e); }
    return null;
}

/* ── メイン描画 ─────────────────────────────────────────── */
window.renderLogistics = function () {
    const locs = Store.locations;
    const p = Store.project;

    function locCard(loc, idx) {
        const statusColors = {
            'current': { bg: 'var(--primary-t)', border: 'var(--primary)', label: '撮影中', icon: 'videocam' },
            'next': { bg: 'rgba(96,165,250,.1)', border: '#60A5FA', label: '次のロケ', icon: 'navigate_next' },
            'wrapped': { bg: 'var(--success-t)', border: 'var(--success)', label: '撤収済み', icon: 'check_circle' },
            'standby': { bg: 'rgba(122,118,112,.08)', border: 'var(--border2)', label: '待機中', icon: 'schedule' }
        };
        const st = statusColors[loc.status] || statusColors['standby'];

        return `
      <div class="loc-card slide-up-enter" data-loc-id="${loc.id}" draggable="true"
           style="background:var(--surface);border:1.5px solid ${st.border};border-radius:16px;overflow:hidden;transition:all .3s;margin-bottom:12px">
        <!-- Header -->
        <div style="display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border)">
          <span class="material-symbols-outlined" style="font-size:16px;color:var(--border2);cursor:grab;flex-shrink:0">drag_indicator</span>
          <div style="width:36px;height:36px;border-radius:10px;background:${st.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <span class="material-symbols-outlined" style="font-size:18px;color:${st.border}">${st.icon}</span>
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
              <span style="font-family:var(--font-display);font-weight:900;font-size:12px;color:${st.border};background:${st.bg};padding:1px 8px;border-radius:6px">${idx + 1}</span>
              <h3 style="font-family:var(--font-display);font-weight:700;font-size:14px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${loc.name}</h3>
            </div>
            <span style="font-size:10px;padding:2px 6px;border-radius:4px;background:${st.bg};color:${st.border};font-weight:700;font-family:var(--font-display)">${st.label}</span>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <p style="font-size:8px;color:var(--muted)">集合</p>
            <p style="font-family:var(--font-display);font-weight:900;font-size:20px;color:${st.border};line-height:1">${loc.callTime || '--:--'}</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
            <button class="loc-edit-btn" data-loc-edit="${loc.id}" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--border);background:var(--bg);cursor:pointer;color:var(--muted);transition:all .2s">
              <span class="material-symbols-outlined" style="font-size:14px">edit</span>
            </button>
            <button class="loc-del-btn" data-loc-del="${loc.id}" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--border);background:var(--bg);cursor:pointer;color:var(--muted);transition:all .2s">
              <span class="material-symbols-outlined" style="font-size:14px">delete</span>
            </button>
          </div>
        </div>
        <!-- Details -->
        <div style="padding:12px 16px;display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px">
          ${loc.address ? `<div style="grid-column:1/-1;display:flex;align-items:start;gap:6px">
            <span class="material-symbols-outlined" style="font-size:14px;color:var(--muted);flex-shrink:0;margin-top:1px">location_on</span>
            <span style="color:var(--text-2)">${loc.address}</span>
          </div>` : ''}
          ${loc.parking ? `<div style="display:flex;align-items:center;gap:5px"><span class="material-symbols-outlined" style="font-size:13px;color:var(--muted)">local_parking</span><span style="color:var(--text-2)">${loc.parking}</span></div>` : ''}
          ${loc.power ? `<div style="display:flex;align-items:center;gap:5px"><span class="material-symbols-outlined" style="font-size:13px;color:var(--muted)">bolt</span><span style="color:var(--text-2)">${loc.power}</span></div>` : ''}
          ${loc.loadIn ? `<div style="display:flex;align-items:center;gap:5px"><span class="material-symbols-outlined" style="font-size:13px;color:var(--muted)">local_shipping</span><span style="color:var(--text-2)">${loc.loadIn}</span></div>` : ''}
          ${loc.rainAlt ? `<div style="display:flex;align-items:center;gap:5px"><span class="material-symbols-outlined" style="font-size:13px;color:var(--muted)">umbrella</span><span style="color:var(--text-2)">${loc.rainAlt}</span></div>` : ''}
          ${loc.notes ? `<div style="grid-column:1/-1;display:flex;align-items:start;gap:5px;margin-top:4px"><span class="material-symbols-outlined" style="font-size:13px;color:var(--muted);flex-shrink:0;margin-top:1px">sticky_note_2</span><span style="color:var(--muted)">${loc.notes}</span></div>` : ''}
        </div>
        <!-- Google Maps link -->
        ${loc.address ? `<div style="padding:0 16px 12px">
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}" target="_blank" rel="noopener"
             style="display:flex;align-items:center;gap:6px;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--primary);font-family:var(--font-display);font-weight:700;font-size:11px;text-decoration:none;transition:all .2s">
            <span class="material-symbols-outlined" style="font-size:16px">map</span>Google マップで開く
          </a>
        </div>` : ''}
      </div>`;
    }

    // 移動時間カード (ロケ間)
    function routeCard(locId) {
        return `<div class="route-card" data-route-from="${locId}" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 16px;margin:0 20px 12px;background:var(--surface2);border:1px dashed var(--border2);border-radius:10px;font-size:11px;color:var(--muted)">
          <span class="material-symbols-outlined" style="font-size:16px">directions_car</span>
          <span class="route-info" style="font-family:var(--font-display);font-weight:700">計算中...</span>
        </div>`;
    }

    // 天気セクション
    const weatherHtml = `
    <div id="weather-section" class="scale-in" style="margin:0 16px 16px;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <p style="font-family:var(--font-display);font-size:10px;font-weight:700;letter-spacing:.1em;color:var(--muted)">天気・環境データ</p>
        <div id="weather-current" style="display:flex;align-items:center;gap:6px">
          <span class="material-symbols-outlined" style="font-size:20px;color:var(--primary)">partly_cloudy_day</span>
          <span style="font-family:var(--font-display);font-weight:900;font-size:18px;color:var(--text)">--°</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="background:var(--bg);border-radius:10px;padding:10px;text-align:center">
          <span class="material-symbols-outlined" style="font-size:16px;color:#F7C948">wb_sunny</span>
          <p style="font-size:9px;color:var(--muted);margin:2px 0">日の出</p>
          <p id="sunrise-val" style="font-family:var(--font-display);font-weight:900;font-size:16px;color:var(--text)">--:--</p>
        </div>
        <div style="background:var(--bg);border-radius:10px;padding:10px;text-align:center">
          <span class="material-symbols-outlined" style="font-size:16px;color:#EF4565">wb_twilight</span>
          <p style="font-size:9px;color:var(--muted);margin:2px 0">日没</p>
          <p id="sunset-val" style="font-family:var(--font-display);font-weight:900;font-size:16px;color:var(--text)">--:--</p>
        </div>
      </div>
      <div id="hourly-weather" style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px" class="hide-scrollbar"></div>
    </div>`;

    return `
<div id="screen-logistics" class="screen" style="flex-direction:column">
  <header class="safe-top" style="flex-shrink:0;display:flex;align-items:center;gap:16px;background:var(--surface);border-bottom:1px solid var(--border);padding:14px 16px">
    <button id="loc-back" class="back-btn">
      <span class="material-symbols-outlined">arrow_back</span>
    </button>
    <div style="flex:1">
      <h1 style="font-family:var(--font-display);font-weight:900;font-size:20px;color:var(--text);letter-spacing:-.02em">ロケーション</h1>
      <p style="color:var(--primary);font-size:10px;font-family:var(--font-display);font-weight:700">${locs.length} 箇所</p>
    </div>
    <div style="display:flex;gap:8px">
      <button id="loc-sort-btn" style="display:flex;align-items:center;gap:4px;padding:8px 12px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--muted);font-family:var(--font-display);font-weight:700;font-size:11px;cursor:pointer">
        <span class="material-symbols-outlined" style="font-size:14px">sort</span>時間順
      </button>
      <button id="loc-add-btn" style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:var(--primary);border:none;cursor:pointer">
        <span class="material-symbols-outlined" style="font-size:20px;color:var(--bg)">add_location_alt</span>
      </button>
    </div>
  </header>

  <div class="hide-scrollbar" style="flex:1;overflow-y:auto;padding:16px 0 90px">
    <!-- Weather -->
    ${weatherHtml}

    <!-- Location Cards -->
    <div id="loc-list" style="padding:0 16px">
      ${locs.length > 0 ? locs.map((loc, i) => {
        let html = locCard(loc, i);
        // 次のロケとの移動時間カード
        if (i < locs.length - 1) html += routeCard(loc.id);
        return html;
      }).join('') : `
      <div style="text-align:center;padding:40px 0">
        <span class="material-symbols-outlined" style="font-size:48px;color:var(--border2);display:block;margin-bottom:12px">add_location_alt</span>
        <p style="font-family:var(--font-display);font-weight:700;color:var(--muted);margin-bottom:4px">ロケ地未登録</p>
        <p style="font-size:12px;color:var(--border2)">「＋」ボタンから追加してください</p>
      </div>`}
    </div>
  </div>

  <!-- Add/Edit Location Modal -->
  <div id="loc-modal" class="modal-overlay">
    <div class="modal-sheet">
      <div class="modal-drag"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h3 id="loc-modal-title" style="margin-bottom:0">ロケ地を追加</h3>
        <button id="loc-modal-close" style="background:none;border:none;cursor:pointer;color:var(--muted)"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <input type="hidden" id="loc-edit-id"/>
        <div><label class="field-label">名称 *</label><input id="loc-name" class="field-input" type="text" placeholder="A棟 屋上 / 公園 南口"/></div>
        <div><label class="field-label">住所</label><input id="loc-address" class="field-input" type="text" placeholder="東京都渋谷区神南1-1-1"/></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <label class="field-label">ステータス</label>
            <select id="loc-status" class="field-input">
              <option value="standby">待機中</option>
              <option value="current">撮影中</option>
              <option value="next">次のロケ</option>
              <option value="wrapped">撤収済み</option>
            </select>
          </div>
          <div><label class="field-label">集合時間</label><input id="loc-calltime" class="field-input" type="time" value="09:00"/></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><label class="field-label">駐車場</label><input id="loc-parking" class="field-input" type="text" placeholder="2台分 / コインP"/></div>
          <div><label class="field-label">電源</label><input id="loc-power" class="field-input" type="text" placeholder="常設100V / 発電機"/></div>
        </div>
        <div><label class="field-label">搬入口</label><input id="loc-loadin" class="field-input" type="text" placeholder="正面入口 / 地下搬入口"/></div>
        <div><label class="field-label">雨天時</label><input id="loc-rainalt" class="field-input" type="text" placeholder="屋内代替 or 中止判断"/></div>
        <div><label class="field-label">メモ</label><textarea id="loc-notes" class="field-input" placeholder="注意事項、管理者連絡先等"></textarea></div>
        <button id="loc-save-btn" class="btn-primary">保存する</button>
        <button id="loc-delete-btn" style="display:none;width:100%;background:none;border:1.5px solid var(--accent);border-radius:12px;color:var(--accent);font-family:var(--font-display);font-weight:700;font-size:13px;padding:12px;cursor:pointer">このロケ地を削除</button>
      </div>
    </div>
  </div>
</div>`;
};

/* ── 初期化 ─────────────────────────────────────────────── */
window.initLogistics = function () {
    document.getElementById('loc-back')?.addEventListener('click', () => window.navigateTo('manage'));

    const locs = Store.locations;

    // ── 天気データ取得 ────────────────────────────────────
    (async () => {
        const refLoc = locs.find(l => l.lat && l.lng) || { lat: 35.6812, lng: 139.7671 };
        const p = Store.project;
        try {
            const w = await Weather.fetchWeather(refLoc.lat, refLoc.lng, p.shootDate);
            if (w.current) {
                const curEl = document.getElementById('weather-current');
                if (curEl) curEl.innerHTML = `
                    <span class="material-symbols-outlined" style="font-size:20px;color:var(--primary)">${w.current.icon}</span>
                    <span style="font-family:var(--font-display);font-weight:900;font-size:18px;color:var(--text)">${w.current.temp}°</span>`;
            }
            if (w.sunriseTime) { const el = document.getElementById('sunrise-val'); if (el) el.textContent = w.sunriseTime; }
            if (w.sunsetTime) { const el = document.getElementById('sunset-val'); if (el) el.textContent = w.sunsetTime; }
            if (w.hourly && w.hourly.length > 0) {
                const hw = document.getElementById('hourly-weather');
                if (hw) hw.innerHTML = w.hourly.map(h => `
                    <div style="flex-shrink:0;text-align:center;background:var(--bg);border-radius:10px;padding:8px 10px;min-width:56px">
                      <p style="font-size:9px;color:var(--muted);font-family:var(--font-display);font-weight:700">${h.time}</p>
                      <span class="material-symbols-outlined" style="font-size:20px;color:var(--primary);display:block;margin:4px 0">${h.icon}</span>
                      <p style="font-family:var(--font-display);font-weight:700;font-size:12px;color:var(--text)">${h.temp}°</p>
                      ${h.rain > 30 ? `<p style="font-size:9px;color:var(--accent)">${h.rain}%</p>` : ''}
                    </div>`).join('');
            }
        } catch (e) { console.warn('Weather load error:', e); }
    })();

    // ── ロケ間の移動時間を計算 ───────────────────────────
    (async () => {
        for (let i = 0; i < locs.length - 1; i++) {
            const from = locs[i];
            const to = locs[i + 1];
            const routeEl = document.querySelector(`.route-card[data-route-from="${from.id}"] .route-info`);
            if (!routeEl) continue;

            // ジオコーディングが必要な場合
            if (!from.lat && from.address) {
                const coords = await geocodeAddress(from.address);
                if (coords) Store.updateLocation(from.id, coords);
                Object.assign(from, coords || {});
            }
            if (!to.lat && to.address) {
                const coords = await geocodeAddress(to.address);
                if (coords) Store.updateLocation(to.id, coords);
                Object.assign(to, coords || {});
            }

            if (from.lat && to.lat) {
                const route = await calcRoute(from, to);
                if (route) {
                    routeEl.innerHTML = `
                        <span style="color:var(--primary)">${route.durationMin}分</span>
                        <span style="color:var(--border2)">|</span>
                        <span>${route.distanceKm} km</span>`;

                    // Google Maps ナビリンク追加
                    const card = routeEl.closest('.route-card');
                    if (card && from.address && to.address) {
                        card.style.cursor = 'pointer';
                        card.onclick = () => {
                            window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from.address)}&destination=${encodeURIComponent(to.address)}&travelmode=driving`, '_blank');
                        };
                    }
                } else {
                    routeEl.textContent = '計算不可';
                }
            } else {
                routeEl.textContent = '住所未登録';
            }
        }
    })();

    // ── 時間順ソート ─────────────────────────────────────
    document.getElementById('loc-sort-btn')?.addEventListener('click', () => {
        const sorted = [...locs].sort((a, b) => (a.callTime || '99:99').localeCompare(b.callTime || '99:99'));
        Store.reorderLocations(sorted.map(l => l.id));
        window.showToast('✓ 時間順に並べ替えました', 'success');
        window.navigateTo('logistics');
    });

    // ── ドラッグ&ドロップ ────────────────────────────────
    const locList = document.getElementById('loc-list');
    let dragEl = null;

    document.querySelectorAll('.loc-card').forEach(card => {
        card.addEventListener('dragstart', e => {
            dragEl = card;
            card.style.opacity = '0.4';
            e.dataTransfer.effectAllowed = 'move';
        });
        card.addEventListener('dragend', () => {
            card.style.opacity = '1';
            document.querySelectorAll('.loc-card').forEach(c => c.classList.remove('drag-snap-line'));
            dragEl = null;
        });
        card.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            card.classList.add('drag-snap-line');
        });
        card.addEventListener('dragleave', () => {
            card.classList.remove('drag-snap-line');
        });
        card.addEventListener('drop', e => {
            e.preventDefault();
            card.classList.remove('drag-snap-line');
            if (!dragEl || dragEl === card) return;

            const cards = [...locList.querySelectorAll('.loc-card')];
            const fromIdx = cards.indexOf(dragEl);
            const toIdx = cards.indexOf(card);

            const newOrder = locs.map(l => l.id);
            const [moved] = newOrder.splice(fromIdx, 1);
            newOrder.splice(toIdx, 0, moved);

            Store.reorderLocations(newOrder);
            window.showToast('✓ ロケ順を変更しました', 'success');
            window.navigateTo('logistics');
        });
    });

    // ── モーダル ──────────────────────────────────────────
    const modal = document.getElementById('loc-modal');
    document.getElementById('loc-add-btn')?.addEventListener('click', () => openLocModal(null));
    document.getElementById('loc-modal-close')?.addEventListener('click', () => modal?.classList.remove('show'));
    modal?.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });

    document.querySelectorAll('.loc-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const loc = locs.find(l => l.id === btn.dataset.locEdit);
            if (loc) openLocModal(loc);
        });
    });

    document.querySelectorAll('.loc-del-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('このロケ地を削除しますか？')) {
                Store.deleteLocation(btn.dataset.locDel);
                window.showToast('ロケ地を削除しました');
                window.navigateTo('logistics');
            }
        });
    });

    // ── 保存 ──────────────────────────────────────────────
    document.getElementById('loc-save-btn')?.addEventListener('click', async () => {
        const editId = document.getElementById('loc-edit-id')?.value;
        const data = {
            name: document.getElementById('loc-name')?.value.trim() || '',
            address: document.getElementById('loc-address')?.value.trim() || '',
            status: document.getElementById('loc-status')?.value || 'standby',
            callTime: document.getElementById('loc-calltime')?.value || '09:00',
            parking: document.getElementById('loc-parking')?.value.trim() || '',
            power: document.getElementById('loc-power')?.value.trim() || '',
            loadIn: document.getElementById('loc-loadin')?.value.trim() || '',
            rainAlt: document.getElementById('loc-rainalt')?.value.trim() || '',
            notes: document.getElementById('loc-notes')?.value.trim() || '',
        };
        if (!data.name) { window.showToast('名称を入力してください', 'error'); return; }

        // 住所からジオコーディング
        if (data.address) {
            window.showToast('住所から座標を取得中...', 'success');
            const coords = await geocodeAddress(data.address);
            if (coords) { data.lat = coords.lat; data.lng = coords.lng; }
        }

        if (editId) {
            Store.updateLocation(editId, data);
            window.showToast('✓ ロケ地を更新しました', 'success');
        } else {
            Store.addLocation(data);
            window.showToast('✓ ロケ地を追加しました', 'success');
        }
        modal?.classList.remove('show');
        window.navigateTo('logistics');
    });

    // ── モーダル内削除 ────────────────────────────────────
    document.getElementById('loc-delete-btn')?.addEventListener('click', () => {
        const editId = document.getElementById('loc-edit-id')?.value;
        if (editId && confirm('このロケ地を削除しますか？')) {
            Store.deleteLocation(editId);
            modal?.classList.remove('show');
            window.navigateTo('logistics');
        }
    });
};

/* ── モーダルオープン ───────────────────────────────────── */
function openLocModal(loc) {
    const modal = document.getElementById('loc-modal');
    document.getElementById('loc-modal-title').textContent = loc ? 'ロケ地を編集' : 'ロケ地を追加';
    document.getElementById('loc-edit-id').value = loc?.id || '';
    document.getElementById('loc-name').value = loc?.name || '';
    document.getElementById('loc-address').value = loc?.address || '';
    document.getElementById('loc-calltime').value = loc?.callTime || '09:00';
    document.getElementById('loc-parking').value = loc?.parking || '';
    document.getElementById('loc-power').value = loc?.power || '';
    document.getElementById('loc-loadin').value = loc?.loadIn || '';
    document.getElementById('loc-rainalt').value = loc?.rainAlt || '';
    document.getElementById('loc-notes').value = loc?.notes || '';
    const statusEl = document.getElementById('loc-status');
    if (statusEl && loc?.status) statusEl.value = loc.status;
    document.getElementById('loc-delete-btn').style.display = loc ? 'block' : 'none';
    modal?.classList.add('show');
}
