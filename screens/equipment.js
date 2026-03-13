/* =============================================================
   Equipment Management Hub V8.5 — Status Tracking & Gear OS
   ============================================================= */
window.renderEquipment = function () {
    const eq = Store.equipment;
    const depts = ['camera', 'lighting', 'grip', 'audio'];
    const deptLabel = { camera: 'カメラ', lighting: '照明', grip: 'グリップ', audio: '音響' };
    const deptIcon = { camera: 'videocam', lighting: 'lightbulb', grip: 'build', audio: 'mic' };

    const statusMap = {
        'standby': { label: '準備完了', color: 'var(--success)', icon: 'check_circle' },
        'moving': { label: '移動中', color: 'var(--primary)', icon: 'local_shipping' },
        'removed': { label: '撤収済', color: 'var(--muted)', icon: 'archive' },
        'in-use': { label: '使用中', color: 'var(--accent)', icon: 'sensors' }
    };

    function eqItem(item) {
        const s = statusMap[item.status || 'standby'];
        const battWarn = item.battery != null && item.battery < 20;

        return `
        <div class="bg-surface border border-border rounded-2xl p-4 mb-3 relative overflow-hidden">
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" style="background:${s.color}22; color:${s.color}; border:1px solid ${s.color}44">
                            <span class="material-symbols-outlined text-[10px] align-middle mr-0.5">${s.icon}</span>${s.label}
                        </span>
                    </div>
                    <h3 class="font-bold text-sm truncate">${item.name}</h3>
                    <p class="text-[10px] text-muted">S/N: ${item.serial || '---'} • ${item.location || '機材車'}</p>
                </div>
                <div class="flex gap-2">
                    <button class="eq-edit-btn text-muted" data-id="${item.id}"><span class="material-symbols-outlined text-lg">edit</span></button>
                    <button class="eq-del-btn text-muted hover:text-accent" data-id="${item.id}"><span class="material-symbols-outlined text-lg">delete</span></button>
                </div>
            </div>

            <!-- Resource Bars -->
            <div class="grid grid-cols-2 gap-4 mb-3">
                ${item.battery != null ? `
                <div class="space-y-1">
                    <div class="flex justify-between items-center text-[9px] font-bold">
                        <span class="text-muted flex items-center gap-1"><span class="material-symbols-outlined text-[11px]">battery_5_bar</span>BATT</span>
                        <span class="${battWarn ? 'text-accent' : 'text-success'}">${item.battery}%</span>
                    </div>
                    <div class="h-1 bg-bg rounded-full overflow-hidden">
                        <div class="h-full ${battWarn ? 'bg-accent' : 'bg-success'}" style="width:${item.battery}%"></div>
                    </div>
                </div>` : ''}
                ${item.media != null ? `
                <div class="space-y-1">
                    <div class="flex justify-between items-center text-[9px] font-bold">
                        <span class="text-muted flex items-center gap-1"><span class="material-symbols-outlined text-[11px]">sd_card</span>MEDIA</span>
                        <span class="text-primary">${item.media}%</span>
                    </div>
                    <div class="h-1 bg-bg rounded-full overflow-hidden">
                        <div class="h-full bg-primary" style="width:${item.media}%"></div>
                    </div>
                </div>` : ''}
            </div>

            <!-- Status Quick Actions -->
            <div class="flex gap-1.5 overflow-x-auto hide-scrollbar pt-1">
                ${Object.entries(statusMap).map(([key, val]) => `
                    <button class="eq-status-btn flex-1 py-1.5 px-2 rounded-lg border text-[9px] font-black uppercase tracking-tighter whitespace-nowrap transition-all ${item.status === key ? 'bg-surface2 border-primary text-primary' : 'border-border text-muted bg-bg/50'}"
                            data-id="${item.id}" data-status="${key}">
                        ${val.label}
                    </button>
                `).join('')}
            </div>
        </div>`;
    }

    return `
<div id="screen-equipment" class="screen flex-col h-full bg-bg">
    <header class="safe-top shrink-0 flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
            <h1 class="font-display font-bold text-2xl mb-1 text-text">機材・備品管理</h1>
            <p class="text-muted text-[11px] font-display uppercase tracking-wider">${eq.length} ITEMS TOTAL</p>
        </div>
        <button id="eq-back" class="back-btn">
            <span class="material-symbols-outlined">arrow_back</span>
        </button>
    </header>

    <div id="eq-dept-tabs" class="shrink-0 flex gap-2 px-5 py-3 border-b border-border overflow-x-auto hide-scrollbar">
        ${depts.map(d => `
            <button class="eq-tab px-4 py-2 rounded-full border border-border text-xs font-bold whitespace-nowrap transition-colors" data-dept="${d}">
                <span class="material-symbols-outlined text-sm align-middle mr-1">${deptIcon[d]}</span>${deptLabel[d]}
            </button>
        `).join('')}
    </div>

    <div class="flex-1 overflow-y-auto px-5 pt-4 pb-24" id="eq-list">
        <!-- Rendered by init -->
    </div>

    <button id="eq-add-btn" class="fixed bottom-24 right-6 w-14 h-14 bg-primary text-bg rounded-2xl shadow-xl flex items-center justify-center z-10 transition-transform active:scale-95">
        <span class="material-symbols-outlined text-3xl">add</span>
    </button>

    <!-- Modal -->
    <div id="eq-modal" class="absolute inset-0 bg-bg/90 backdrop-blur-sm z-30 hidden flex-col justify-end">
        <div class="bg-surface rounded-t-3xl p-6 border-t border-border slide-up">
            <h3 id="eq-modal-title" class="font-display font-bold text-lg mb-5">機材を追加</h3>
            <div class="space-y-4">
                <input type="hidden" id="eq-id"/>
                <div><label class="field-label">名称</label><input id="eq-name" class="field-input" type="text" placeholder="Alexa / Slider etc."/></div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="field-label">カテゴリ</label>
                        <select id="eq-category" class="field-input">
                            <option value="camera">カメラ</option><option value="lighting">照明</option>
                            <option value="grip">グリップ</option><option value="audio">音響</option>
                        </select>
                    </div>
                    <div><label class="field-label">シリアル</label><input id="eq-serial" class="field-input" type="text" placeholder="S/N"/></div>
                </div>
                <div><label class="field-label">保管場所</label><input id="eq-location" class="field-input" type="text" placeholder="A-Cam Case / Car A"/></div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="field-label">バッテリー (%)</label><input id="eq-batt" class="field-input" type="number" placeholder="100"/></div>
                    <div><label class="field-label">メディア (%)</label><input id="eq-media" class="field-input" type="number" placeholder="100"/></div>
                </div>
                <button id="eq-save-btn" class="w-full bg-primary text-bg font-bold py-4 rounded-2xl mt-4">保存する</button>
                <button id="eq-modal-close" class="w-full text-muted py-2 text-sm mt-2">キャンセル</button>
            </div>
        </div>
    </div>
</div>`;
};

window.initEquipment = function () {
    document.getElementById('eq-back')?.addEventListener('click', () => window.navigateTo('manage'));
    let activeDept = 'camera';

    function renderList() {
        const listEl = document.getElementById('eq-list');
        if (!listEl) return;
        const filtered = Store.equipment.filter(e => e.category === activeDept);
        listEl.innerHTML = filtered.length > 0 ? filtered.map(item => {
            const s = {
                'standby': { label: '準備完了', color: 'var(--success)', icon: 'check_circle' },
                'moving': { label: '移動中', color: 'var(--primary)', icon: 'local_shipping' },
                'removed': { label: '撤収済', color: 'var(--muted)', icon: 'archive' },
                'in-use': { label: '使用中', color: 'var(--accent)', icon: 'sensors' }
            }[item.status || 'standby'];
            const battWarn = item.battery != null && item.battery < 20;

            return `
            <div class="bg-surface border border-border rounded-2xl p-4 mb-3 relative overflow-hidden">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" style="background:${s.color}22; color:${s.color}; border:1px solid ${s.color}44">
                                <span class="material-symbols-outlined text-[10px] align-middle mr-0.5">${s.icon}</span>${s.label}
                            </span>
                        </div>
                        <h3 class="font-bold text-sm truncate">${item.name}</h3>
                        <p class="text-[10px] text-muted">S/N: ${item.serial || '---'} • ${item.location || '機材車'}</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-3">
                    ${item.battery != null ? `
                    <div class="space-y-1">
                        <div class="flex justify-between items-center text-[9px] font-bold">
                            <span class="text-muted flex items-center gap-1">BATT</span>
                            <span class="${battWarn ? 'text-accent' : 'text-success'}">${item.battery}%</span>
                        </div>
                        <div class="h-1 bg-bg rounded-full overflow-hidden"><div class="h-full ${battWarn ? 'bg-accent' : 'bg-success'}" style="width:${item.battery}%"></div></div>
                    </div>` : ''}
                    ${item.media != null ? `
                    <div class="space-y-1">
                        <div class="flex justify-between items-center text-[9px] font-bold">
                            <span class="text-muted flex items-center gap-1">MEDIA</span>
                            <span class="text-primary">${item.media}%</span>
                        </div>
                        <div class="h-1 bg-bg rounded-full overflow-hidden"><div class="h-full bg-primary" style="width:${item.media}%"></div></div>
                    </div>` : ''}
                </div>
                <div class="flex gap-2 overflow-x-auto hide-scrollbar pt-2">
                    ${['standby', 'moving', 'in-use', 'removed'].map(key => {
                        const l = { standby: '準備中', moving: '移動中', 'in-use': '使用中', removed: '撤収済' }[key];
                        return `<button class="eq-status-btn flex-1 py-2 px-1 rounded-xl border text-[10px] font-bold whitespace-nowrap transition-all ${item.status === key ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted bg-bg/50'}"
                                data-id="${item.id}" data-status="${key}">${l}</button>`;
                    }).join('')}
                    <button class="eq-edit-btn ml-auto w-10 h-10 flex items-center justify-center text-muted border border-border rounded-xl" data-id="${item.id}"><span class="material-symbols-outlined text-lg">edit</span></button>
                </div>
            </div>`;
        }).join('') : `<p class="text-center py-12 text-xs text-muted border border-dashed border-border rounded-2xl">アイテムがありません</p>`;

        // Re-attach listeners
        document.querySelectorAll('.eq-status-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Store.updateEquipment(btn.dataset.id, { status: btn.dataset.status });
                renderList();
            });
        });
        document.querySelectorAll('.eq-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = Store.equipment.find(e => e.id === btn.dataset.id);
                if (item) openEqModal(item);
            });
        });
    }

    // Tabs
    document.querySelectorAll('.eq-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            activeDept = tab.dataset.dept;
            document.querySelectorAll('.eq-tab').forEach(t => t.classList.remove('bg-primary', 'text-bg', 'border-primary'));
            tab.classList.add('bg-primary', 'text-bg', 'border-primary');
            renderList();
        });
    });

    // Initial tab active
    const firstTab = document.querySelector('.eq-tab[data-dept="camera"]');
    if (firstTab) firstTab.click();

    // Back
    document.getElementById('eq-back')?.addEventListener('click', () => window.navigateTo('manage'));

    // Modal logic
    const modal = document.getElementById('eq-modal');
    document.getElementById('eq-add-btn')?.addEventListener('click', () => openEqModal(null));
    document.getElementById('eq-modal-close')?.addEventListener('click', () => modal?.classList.add('hidden'));

    function openEqModal(item) {
        document.getElementById('eq-id').value = item?.id || '';
        document.getElementById('eq-name').value = item?.name || '';
        document.getElementById('eq-category').value = item?.category || 'camera';
        document.getElementById('eq-serial').value = item?.serial || '';
        document.getElementById('eq-location').value = item?.location || '';
        document.getElementById('eq-batt').value = item?.battery || '';
        document.getElementById('eq-media').value = item?.media || '';
        document.getElementById('eq-modal-title').textContent = item ? '機材を編集' : '機材を追加';
        modal?.classList.remove('hidden');
    }

    document.getElementById('eq-save-btn')?.addEventListener('click', () => {
        const id = document.getElementById('eq-id').value;
        const data = {
            name: document.getElementById('eq-name').value.trim(),
            category: document.getElementById('eq-category').value,
            serial: document.getElementById('eq-serial').value.trim(),
            location: document.getElementById('eq-location').value.trim(),
            battery: document.getElementById('eq-batt').value !== '' ? parseInt(document.getElementById('eq-batt').value) : null,
            media: document.getElementById('eq-media').value !== '' ? parseInt(document.getElementById('eq-media').value) : null,
            status: id ? Store.equipment.find(e => e.id === id).status : 'standby'
        };
        if (!data.name) return window.showToast('名称を入力してください', 'error');
        if (id) Store.updateEquipment(id, data);
        else Store.addEquipment(data);
        modal?.classList.add('hidden');
        renderList();
    });
};
