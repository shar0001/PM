/* =============================================================
   Production OS V4 — AppStore
   多案件対応 / 項目実務化 (納品仕様・画角等) / 日の出・日没管理
   ============================================================= */

class AppStore {
    constructor() {
        this._listeners = {};
        this._data = this._load();
        if (!this._data || this._data.version < 5) {
            this._data = this._defaultData();
            this._save();
        }
    }

    _migrateV3toV4() {
        this._data.version = 4;
        Object.values(this._data.projects).forEach(p => {
            if (p.info.insurance) delete p.info.insurance;
            p.info.deliveryFormat = p.info.deliveryFormat || 'ProRes 4444';
            p.info.aspectRatio = p.info.aspectRatio || '16:9';
            p.info.colorProfile = p.info.colorProfile || 'Rec.709';
            p.sunriseOverride = null;
            p.locations.forEach(loc => {
                loc.callTime = loc.callTime || '08:00';
                loc.type = loc.type || '外観';
            });
        });
    }

    // ── デフォルトデータ ──────────────────────────────────
    _defaultData() {
        const prjId = 'prj-' + Date.now();
        return {
            version: 5,
            currentProjectId: prjId,
            projects: {
                [prjId]: this._newProject({
                    title: '新規案件',
                }, prjId),
            },
        };
    }

    _newProject(info, id) {
        const projId = id || ('prj-' + Date.now());
        return {
            id: projId,
            info: {
                title: '新規案件', client: '', agency: '', director: '', producer: '',
                productionCo: '', format: '4K / ARRI RAW', fps: 24, cm_length: '30s',
                deliveryFormat: 'ProRes 4444', aspectRatio: '16:9', colorProfile: 'Rec.709',
                shootDate: new Date().toISOString().slice(0, 10),
                shootDays: 1, shootDay: 'DAY 1 / 1', startTime: '09:00', wrapTime: '20:00',
                deadline: '', prNumber: '', notes: '',
                ...info,
            },
            shots: [],
            shotOrder: [],
            locations: [],
            budget: {
                total: 0,
                categories: [
                    { id: 'cast', label: 'キャスト', icon: 'groups', budget: 0 },
                    { id: 'equipment', label: '機材', icon: 'videocam', budget: 0 },
                    { id: 'location', label: 'ロケ地', icon: 'location_on', budget: 0 },
                    { id: 'art', label: '美術・小道具', icon: 'palette', budget: 0 },
                    { id: 'postpro', label: 'ポスプロ', icon: 'movie_edit', budget: 0 },
                    { id: 'other', label: 'その他・雑費', icon: 'more_horiz', budget: 0 },
                ],
                expenses: [],
            },
            crew: [],
            performers: [], // [NEW] 出演者管理
            equipment: [],  // [NEW] 機材リスト
            emergency: [
                { label: '救急', number: '119' }, { label: '警察', number: '110' }
            ],
            kanban: null,
            liveState: {    // [NEW] 撮影進行モードの状態
                activeShotId: null,
                delayMinutes: 0,
                isPaused: false
            },
            sunsetOverride: null,
            sunriseOverride: null,
        };
    }

    // ── localStorage ─────────────────────────────────────
    _save() { try { localStorage.setItem('pos_v3', JSON.stringify(this._data)); } catch (e) { } }
    _load() { try { return JSON.parse(localStorage.getItem('pos_v3')); } catch (e) { return null; } }

    // ── Event Emitter ─────────────────────────────────────
    on(event, fn) { if (!this._listeners[event]) this._listeners[event] = []; this._listeners[event].push(fn); return () => this.off(event, fn); }
    off(event, fn) { this._listeners[event] = (this._listeners[event] || []).filter(f => f !== fn); }
    emit(event, data) { (this._listeners[event] || []).forEach(fn => fn(data)); (this._listeners['*'] || []).forEach(fn => fn(event, data)); }

    // ── Current project accessor ──────────────────────────
    get _prj() { return this._data.projects[this._data.currentProjectId]; }
    get currentProjectId() { return this._data.currentProjectId; }
    get allProjects() { return Object.values(this._data.projects).map(p => ({ id: p.id, title: p.info.title, client: p.info.client, shootDate: p.info.shootDate })); }
    get project() { return this._prj.info; }

    addProject() {
        const p = this._newProject({});
        this._data.projects[p.id] = p;
        this._data.currentProjectId = p.id;
        this._save(); this.emit('project'); this.emit('*');
        return p.id;
    }
    switchProject(id) {
        if (!this._data.projects[id]) return;
        this._data.currentProjectId = id;
        this._save(); this.emit('project'); this.emit('*');
    }
    deleteProject(id) {
        if (Object.keys(this._data.projects).length <= 1) return false;
        delete this._data.projects[id];
        if (this._data.currentProjectId === id) this._data.currentProjectId = Object.keys(this._data.projects)[0];
        this._save(); this.emit('project'); this.emit('*');
        return true;
    }
    setProject(patch) {
        Object.assign(this._prj.info, patch);
        this._save(); this.emit('project');
    }

    // ── Shots ─────────────────────────────────────────────
    get shots() { return this._prj.shots; }
    get shotOrder() { return this._prj.shotOrder; }
    get orderedShots() {
        const map = Object.fromEntries(this._prj.shots.map(s => [s.id, s]));
        return this._prj.shotOrder.map(id => map[id]).filter(Boolean);
    }

    addShot(shot) {
        const id = 's' + Date.now();
        const s = {
            id, number: '', scene: 1, title: '', type: '', status: 'upcoming',
            startTime: '', duration: 30, lens: '', cast: [], props: [], location: '', notes: '', completedAt: null, ...shot
        };
        this._prj.shots.push(s);
        this._prj.shotOrder.push(id);
        this._recalcSchedule(); this._save(); this.emit('shots'); this.emit('timeline');
        return s;
    }
    updateShot(id, patch) {
        const s = this._prj.shots.find(s => s.id === id);
        if (!s) return;
        Object.assign(s, patch); this._recalcSchedule();
        this._save(); this.emit('shots'); this.emit('timeline');
    }
    deleteShot(id) {
        this._prj.shots = this._prj.shots.filter(s => s.id !== id);
        this._prj.shotOrder = this._prj.shotOrder.filter(x => x !== id);
        this._save(); this.emit('shots'); this.emit('timeline');
    }
    completeShot(id) {
        const shot = this._prj.shots.find(s => s.id === id);
        if (shot) {
            if (shot.status === 'completed') {
                // 完了取消ロジック
                const oldActualEnd = Utils.timeToMin(shot.completedAt || shot.startTime) + (shot.duration || 0);
                const scheduledEnd = Utils.timeToMin(shot.startTime) + (shot.duration || 0);
                const diffToRemove = oldActualEnd - scheduledEnd;
                
                shot.status = 'upcoming';
                shot.completedAt = null;
                this.updateLiveState({ delayMinutes: (this.liveState.delayMinutes || 0) - diffToRemove });
            } else {
                // 完了実行ロジック
                shot.status = 'completed';
                shot.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                const scheduledEnd = Utils.timeToMin(shot.startTime) + (shot.duration || 0);
                const actualEnd = Utils.timeToMin(shot.completedAt);
                const diff = actualEnd - scheduledEnd;
                this.updateLiveState({ delayMinutes: (this.liveState.delayMinutes || 0) + diff });
            }
            
            this._save();
            this.emit('shots');
            this.emit('live');
            this.emit('timeline');
        }
    }
    startShot(id) {
        const shot = this._prj.shots.find(s => s.id === id);
        if (shot) {
            shot.status = 'shooting';
            this.updateLiveState({ activeShotId: id });
            this._save();
            this.emit('shots');
            this.emit('live');
            this.emit('timeline');
        }
    }
    reorderShots(newOrder) {
        this._prj.shotOrder = newOrder;
        this._recalcSchedule();
        this._save(); this.emit('shots'); this.emit('timeline');
    }

    _recalcSchedule() {
        const [h0, m0] = (this._prj.info.startTime || '09:00').split(':').map(Number);
        let cursor = h0 * 60 + m0;
        this._prj.shotOrder.forEach(id => {
            const s = this._prj.shots.find(x => x.id === id);
            if (!s) return;
            if (s.status === 'completed') { cursor = this._timeToMin(s.completedAt || s.startTime) + (s.duration || 0); return; }
            s.startTime = this._minToTime(cursor);
            cursor += (s.duration || 30);
        });
    }
    _timeToMin(t) { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h * 60 + m; }
    _minToTime(m) { const h = Math.floor(m / 60) % 24, mm = m % 60; return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; }

    // ── Locations ─────────────────────────────────────────
    get locations() { return this._prj.locations; }
    addLocation(loc) {
        const id = 'l' + Date.now();
        this._prj.locations.push({ id, ...loc });
        this._save(); this.emit('locations');
        return id;
    }
    updateLocation(id, patch) { const l = this._prj.locations.find(l => l.id === id); if (l) { Object.assign(l, patch); this._save(); this.emit('locations'); } }
    deleteLocation(id) { this._prj.locations = this._prj.locations.filter(l => l.id !== id); this._save(); this.emit('locations'); }
    reorderLocations(newOrder) {
        const map = Object.fromEntries(this._prj.locations.map(l => [l.id, l]));
        this._prj.locations = newOrder.map(id => map[id]).filter(Boolean);
        this._save(); this.emit('locations');
    }

    // ── Budget ────────────────────────────────────────────
    get budget() { return this._prj.budget; }
    addExpense(exp) { const id = 'x' + Date.now(); this._prj.budget.expenses.push({ id, ...exp }); this._save(); this.emit('budget'); return id; }
    deleteExpense(id) { this._prj.budget.expenses = this._prj.budget.expenses.filter(e => e.id !== id); this._save(); this.emit('budget'); }
    updateBudgetTotal(total) { this._prj.budget.total = total; this._save(); this.emit('budget'); }
    updateBudgetCategory(catId, patch) { const c = this._prj.budget.categories.find(c => c.id === catId); if (c) { Object.assign(c, patch); this._save(); this.emit('budget'); } }
    addBudgetCategory(cat) { const id = 'cat' + Date.now(); this._prj.budget.categories.push({ id, ...cat }); this._save(); this.emit('budget'); }
    deleteBudgetCategory(catId) { this._prj.budget.categories = this._prj.budget.categories.filter(c => c.id !== catId); this._prj.budget.expenses = this._prj.budget.expenses.filter(e => e.cat !== catId); this._save(); this.emit('budget'); }
    getCategoryTotal(catId) { return this._prj.budget.expenses.filter(e => e.cat === catId).reduce((s, e) => s + e.amount, 0); }
    getTotalSpent() { return this._prj.budget.expenses.reduce((s, e) => s + e.amount, 0); }

    // ── Performers ────────────────────────────────────────
    get performers() { return this._prj.performers || []; }
    addPerformer(data) {
        const id = 'perf-' + Date.now();
        this._prj.performers = this.performers;
        this._prj.performers.push({ id, ...data });
        this._save(); this.emit('performers');
        return id;
    }
    updatePerformer(id, patch) {
        const p = this.performers.find(x => x.id === id);
        if (p) { Object.assign(p, patch); this._save(); this.emit('performers'); }
    }
    deletePerformer(id) {
        this._prj.performers = this.performers.filter(p => p.id !== id);
        this._save(); this.emit('performers');
    }

    // ── Equipment ─────────────────────────────────────────
    get equipment() { return this._prj.equipment || []; }
    addEquipment(data) {
        const id = 'eq-' + Date.now();
        this._prj.equipment = this.equipment;
        this._prj.equipment.push({ id, ...data });
        this._save(); this.emit('equipment');
        return id;
    }
    updateEquipment(id, patch) {
        const e = this.equipment.find(x => x.id === id);
        if (e) { Object.assign(e, patch); this._save(); this.emit('equipment'); }
    }
    deleteEquipment(id) {
        this._prj.equipment = this.equipment.filter(e => e.id !== id);
        this._save(); this.emit('equipment');
    }

    // ── Live State ────────────────────────────────────────
    get liveState() { return this._prj.liveState || { activeShotId: null, delayMinutes: 0, isPaused: false }; }
    updateLiveState(patch) {
        this._prj.liveState = { ...this.liveState, ...patch };
        this._save(); this.emit('live');
    }


    // ── Crew / Emergency / Kanban / Sun ───────────────────
    get crew() { return this._prj.crew; }
    get emergency() { return this._prj.emergency; }
    get kanban() { return this._prj.kanban; }
    get sunsetOverride() { return this._prj.sunsetOverride; }
    get sunriseOverride() { return this._prj.sunriseOverride; }
    setSunStats(t) { this._prj.sunriseOverride = t.sunrise; this._prj.sunsetOverride = t.sunset; this._save(); }

    addCrew(data) {
        const id = 'crew-' + Date.now();
        this._prj.crew.push({ id, ...data });
        this._save(); this.emit('crew');
        return id;
    }
    updateCrew(id, patch) {
        const c = this._prj.crew.find(x => x.id === id);
        if (c) { Object.assign(c, patch); this._save(); this.emit('crew'); }
    }
    deleteCrew(id) {
        this._prj.crew = this._prj.crew.filter(c => c.id !== id);
        this._save(); this.emit('crew');
    }
    addEmergency(data) {
        this._prj.emergency.push({ label: data.label, number: data.number });
        this._save(); this.emit('crew');
    }
    deleteEmergency(idx) {
        this._prj.emergency.splice(idx, 1);
        this._save(); this.emit('crew');
    }

    // ── Kanban ─────────────────────────────────────────────
    setKanban(kanban) {
        this._prj.kanban = kanban;
        this._save(); this.emit('kanban');
    }

    // ── Emergency (直接セット) ────────────────────────────
    setEmergency(list) {
        this._prj.emergency = list;
        this._save(); this.emit('crew');
    }

    // ── Stats ─────────────────────────────────────────────
    getStats() {
        const shots = this.orderedShots;
        const done = shots.filter(s => s.status === 'completed').length;
        const total = shots.length;
        return {
            done, total, pct: total > 0 ? Math.round(done / total * 100) : 0,
            remaining: shots.filter(s => s.status !== 'completed'),
            shooting: shots.find(s => s.status === 'shooting')
        };
    }

    // ── エクスポート ──────────────────────────────────────
    exportProject(id) {
        const prj = this._data.projects[id || this._data.currentProjectId];
        if (!prj) return null;
        return JSON.parse(JSON.stringify(prj));
    }

    // ── インポート ──────────────────────────────────────
    importProject(jsonData) {
        const newId = 'prj-' + Date.now();
        const prj = JSON.parse(JSON.stringify(jsonData));
        prj.id = newId;
        prj.info.title = (prj.info.title || '新規案件') + ' (インポート)';
        this._data.projects[newId] = prj;
        this._data.currentProjectId = newId;
        this._save(); this.emit('project'); this.emit('*');
        return newId;
    }

    // ── 案件複製 ──────────────────────────────────────────
    duplicateProject(id) {
        const src = this._data.projects[id];
        if (!src) return null;
        const newId = 'prj-' + Date.now();
        const copy = JSON.parse(JSON.stringify(src));
        copy.id = newId;
        copy.info.title = (copy.info.title || '') + ' (コピー)';
        // ショットIDを新規に振り直す
        const idMap = {};
        copy.shots.forEach(s => {
            const oldId = s.id;
            s.id = 's' + Date.now() + Math.random().toString(36).slice(2, 6);
            s.status = 'upcoming';
            s.completedAt = null;
            idMap[oldId] = s.id;
        });
        copy.shotOrder = copy.shotOrder.map(oldId => idMap[oldId] || oldId);
        copy.kanban = null;
        this._data.projects[newId] = copy;
        this._data.currentProjectId = newId;
        this._save(); this.emit('project'); this.emit('*');
        return newId;
    }

    reset() { this._data = this._defaultData(); this._save(); this.emit('*'); }
}

window.Store = new AppStore();
