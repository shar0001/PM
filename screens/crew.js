/* =============================================================
   Crew & Cast Management V8 — 現場OS対応版
   ============================================================= */
window.renderCrew = function () {
    const crew = Store.crew || [];
    const performers = Store.performers || [];

    const deptColors = {
        'Direction': '#E8A832', 'Camera': '#4F91FF', 'Electric': '#F7C948',
        'Audio': '#A78BFA', 'Art': '#34D399', 'HMU': '#F472B6',
        'Cast': '#EF4565', 'Production': '#60A5FA', 'その他': '#7A7670'
    };

    function performerCard(p) {
        return `
        <div class="bg-surface border border-border rounded-2xl p-4 mb-3 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-16 h-16 bg-accent opacity-5 rounded-full -mr-8 -mt-8"></div>
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-accent/10 border-2 border-accent text-accent flex items-center justify-center font-bold text-xs">
                        演
                    </div>
                    <div>
                        <h3 class="font-bold text-sm">${p.name || '未設定'}</h3>
                        <p class="text-[10px] text-muted">${p.role || '出演者'}</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="perf-edit-btn text-muted hover:text-text" data-id="${p.id}"><span class="material-symbols-outlined text-lg">edit</span></button>
                    <button class="perf-del-btn text-muted hover:text-accent" data-id="${p.id}"><span class="material-symbols-outlined text-lg">delete</span></button>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-2">
                <div class="bg-bg rounded-lg p-2 text-center">
                    <p class="text-[8px] text-muted uppercase font-bold mb-0.5">入り</p>
                    <p class="font-display font-black text-xs text-text">${p.arrivalTime || '--:--'}</p>
                </div>
                <div class="bg-bg rounded-lg p-2 text-center">
                    <p class="text-[8px] text-muted uppercase font-bold mb-0.5">メイク</p>
                    <p class="font-display font-black text-xs text-accent">${p.makeupTime || '--:--'}</p>
                </div>
                <div class="bg-bg rounded-lg p-2 text-center">
                    <p class="text-[8px] text-muted uppercase font-bold mb-0.5">完了</p>
                    <p class="font-display font-black text-xs text-success">${p.readyTime || '--:--'}</p>
                </div>
            </div>
            ${p.notes ? `<p class="mt-2 text-[10px] text-muted bg-surface2 p-2 rounded-lg">※ ${p.notes}</p>` : ''}
        </div>`;
    }

    const deptMap = {
        'Direction': '監', 'Camera': '撮', 'Electric': '照',
        'Audio': '録', 'Art': '美', 'HMU': 'メ',
        'Cast': '演', 'Production': '制', 'その他': '他'
    };

    function crewCard(c) {
        const color = deptColors[c.dept] || '#7A7670';
        const label = deptMap[c.dept] || '？';
        return `
        <div class="bg-surface border border-border rounded-xl p-4 mb-3 flex items-center justify-between">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs" style="background:${color}22; color:${color}; border:1px solid ${color}44">
                    ${label}
                </div>
                <div>
                    <p class="font-bold text-sm">${c.name}</p>
                    <p class="text-[10px] text-muted">${c.dept} / ${c.role}</p>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="text-right">
                    <p class="text-[8px] text-muted uppercase font-bold tracking-tighter">集合</p>
                    <p class="font-display font-black text-sm text-text">${c.callTime || '09:00'}</p>
                </div>
                <button class="crew-edit-btn text-muted hover:text-text" data-id="${c.id}"><span class="material-symbols-outlined">more_vert</span></button>
            </div>
        </div>`;
    }

    return `
<div id="screen-crew" class="screen flex-col h-full bg-bg">
    <header class="safe-top shrink-0 flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
            <h1 class="font-display font-bold text-2xl mb-1 text-text">スタッフ・出演者</h1>
            <p class="text-muted text-[11px] font-display uppercase tracking-wider">${crew.length + performers.length} PEOPLE ON SITE</p>
        </div>
        <button id="crew-back" class="w-10 h-10 flex items-center justify-center rounded-xl border border-border text-muted">
            <span class="material-symbols-outlined">arrow_back</span>
        </button>
    </header>

    <div class="flex-1 overflow-y-auto px-5 pt-4 pb-24">
        
        <!-- PERFORMANCE / CAST SECTION -->
        <section class="mb-10">
            <div class="flex justify-between items-center mb-4">
                <p class="section-header !mt-0 !mb-0">Performer <span class="text-accent">•</span> 出演者</p>
                <button id="crew-share-btn" class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-border text-primary font-bold text-[10px] shadow-sm active:scale-95 transition-transform">
                    <span class="material-symbols-outlined" style="font-size:14px">share</span> スタッフ共有用コピー
                </button>
            </div>
            ${performers.length > 0 ? performers.map(perfCard).join('') : '<p class="text-center py-10 text-xs text-muted border border-dashed border-border rounded-2xl">出演者の登録はありません</p>'}
        </section>

        <!-- STAFF SECTION -->
        <section class="mb-8">
            <div class="flex justify-between items-center mb-4">
                <p class="section-header !mt-0 !mb-0">Crew <span class="text-primary">•</span> スタッフ</p>
                <div class="flex gap-2">
                    <button id="crew-add-btn" class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-[10px]">
                        <span class="material-symbols-outlined" style="font-size:14px">group_add</span> 追加
                    </button>
                </div>
            </div>
            ${crew.length > 0 ? crew.map(crewCard).join('') : '<p class="text-center py-8 text-xs text-muted border border-dashed border-border rounded-2xl">スタッフの登録はありません</p>'}
        </section>

        <!-- EMERGENCY / TROUBLE SECTION -->
        <section class="mb-12">
            <p class="section-header">Trouble Response <span class="text-accent">•</span> 緊急連絡先</p>
            <div class="grid grid-cols-1 gap-3">
                ${(Store.emergency || []).map(e => `
                    <a href="tel:${e.number}" class="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                <span class="material-symbols-outlined">call</span>
                            </div>
                            <div>
                                <p class="text-sm font-bold text-text">${e.label}</p>
                                <p class="text-[10px] font-display font-black text-accent tracking-widest">${e.number}</p>
                            </div>
                        </div>
                        <span class="material-symbols-outlined text-accent/40">arrow_forward_ios</span>
                    </a>
                `).join('')}
            </div>
            <div class="mt-4 p-5 bg-surface rounded-2xl border border-border border-dashed text-center">
                <p class="text-[10px] text-muted mb-3 italic">トラブル発生時はPD/デスクへ即時報告してください</p>
                <button class="text-[10px] font-bold text-primary flex items-center gap-1 mx-auto bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                    <span class="material-symbols-outlined text-sm">add_circle</span> 連絡先を追加
                </button>
            </div>
        </section>

        <!-- SHARE SUMMARY MODAL (Requirement 6) -->
        <div id="share-modal" class="absolute inset-0 bg-bg/90 backdrop-blur-md z-[100] hidden flex-col items-center justify-center p-6">
            <div class="bg-surface border border-border rounded-[2rem] w-full max-w-sm p-8 shadow-2xl slide-up">
                <h3 class="font-display font-black text-xl mb-4 text-primary text-center">スタッフ共有情報</h3>
                <textarea id="share-text" readonly class="w-full h-48 bg-bg border border-border rounded-xl p-4 text-[11px] font-mono leading-relaxed mb-6 resize-none focus:outline-none focus:border-primary"></textarea>
                <div class="flex flex-col gap-3">
                    <button id="copy-summary-btn" class="w-full bg-primary text-bg font-bold py-4 rounded-xl shadow-lg ring-4 ring-primary/10">テキストをコピー</button>
                    <button onclick="document.getElementById('share-modal').classList.add('hidden')" class="w-full bg-surface2 text-muted font-bold py-3 rounded-xl">閉じる</button>
                </div>
            </div>
        </div>

    </div>

    <!-- Modals -->
    <div id="perf-modal" class="absolute inset-0 bg-bg/90 backdrop-blur-sm z-30 hidden flex-col justify-end">
        <div class="bg-surface rounded-t-3xl p-6 border-t border-border slide-up">
            <h3 id="perf-modal-title" class="font-display font-bold text-lg mb-5">出演者を追加</h3>
            <div class="space-y-4">
                <input type="hidden" id="perf-id"/>
                <div><label class="field-label">氏名 / 役名</label><input id="perf-name" class="field-input" type="text" placeholder="役名 または 氏名"/></div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="field-label">役職 / カテゴリ</label><input id="perf-role" class="field-input" type="text" placeholder="Main Cast"/></div>
                    <div><label class="field-label">電話番号</label><input id="perf-phone" class="field-input" type="tel" placeholder="090-..."/></div>
                </div>
                <div class="grid grid-cols-3 gap-2">
                    <div><label class="field-label text-[10px]">現場入り</label><input id="perf-arrival" class="field-input text-sm" type="time" value="09:00"/></div>
                    <div><label class="field-label text-[10px]">メイク開始</label><input id="perf-makeup" class="field-input text-sm" type="time" value="09:30"/></div>
                    <div><label class="field-label text-[10px]">支度完了</label><input id="perf-ready" class="field-input text-sm" type="time" value="10:30"/></div>
                </div>
                <div><label class="field-label">備考（衣装・アレルギー等）</label><input id="perf-notes" class="field-input" type="text" placeholder="衣装A、お弁当無し等"/></div>
                <button id="perf-save-btn" class="w-full bg-accent text-white font-bold py-4 rounded-2xl mt-4 shadow-lg shadow-accent/20">保存する</button>
                <button id="perf-modal-close" class="w-full text-muted py-2 text-sm mt-2">キャンセル</button>
            </div>
        </div>
    </div>

    <!-- Crew Modal (Simple) -->
    <div id="crew-modal" class="absolute inset-0 bg-bg/90 backdrop-blur-sm z-30 hidden flex-col justify-end">
        <div class="bg-surface rounded-t-3xl p-6 border-t border-border slide-up">
            <h3 id="crew-modal-title" class="font-display font-bold text-lg mb-5">スタッフを追加</h3>
            <div class="space-y-4">
                <input type="hidden" id="crew-id"/>
                <div><label class="field-label">氏名</label><input id="crew-name" class="field-input" type="text" placeholder="スタッフ名"/></div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="field-label">部署</label>
                        <select id="crew-dept" class="field-input">
                            <option>Direction</option><option>Camera</option><option>Electric</option>
                            <option>Audio</option><option>Art</option><option>HMU</option>
                            <option>Cast</option><option>Production</option><option>その他</option>
                        </select>
                    </div>
                    <div><label class="field-label">役職</label><input id="crew-role" class="field-input" type="text" placeholder="Role"/></div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="field-label">集合時間</label><input id="crew-call" class="field-input" type="time" value="09:00"/></div>
                    <div><label class="field-label">電話番号</label><input id="crew-phone" class="field-input" type="tel" placeholder="090-..."/></div>
                </div>
                <button id="crew-save-btn" class="w-full bg-primary text-bg font-bold py-4 rounded-2xl mt-4 shadow-lg shadow-primary/20">保存する</button>
                <button id="crew-modal-close" class="w-full text-muted py-2 text-sm mt-2">キャンセル</button>
            </div>
        </div>
    </div>
</div>`;
};

window.initCrew = function () {
    const backBtn = document.getElementById('crew-back');
    backBtn?.addEventListener('click', () => window.navigateTo('manage'));

    // --- CAST LOGIC ---
    const perfModal = document.getElementById('perf-modal');
    document.getElementById('perf-add-btn')?.addEventListener('click', () => {
        resetPerfFields();
        document.getElementById('perf-modal-title').textContent = '出演者を追加';
        perfModal?.classList.remove('hidden');
    });
    document.getElementById('perf-modal-close')?.addEventListener('click', () => perfModal?.classList.add('hidden'));

    document.querySelectorAll('.perf-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const p = Store.performers.find(x => x.id === id);
            if (p) {
                document.getElementById('perf-id').value = p.id;
                document.getElementById('perf-name').value = p.name || '';
                document.getElementById('perf-role').value = p.role || '';
                document.getElementById('perf-phone').value = p.phone || '';
                document.getElementById('perf-arrival').value = p.arrivalTime || '09:00';
                document.getElementById('perf-makeup').value = p.makeupTime || '09:30';
                document.getElementById('perf-ready').value = p.readyTime || '10:30';
                document.getElementById('perf-notes').value = p.notes || '';
                document.getElementById('perf-modal-title').textContent = '出演者を編集';
                perfModal?.classList.remove('hidden');
            }
        });
    });

    document.querySelectorAll('.perf-del-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('この出演者を削除しますか？')) {
                Store.deletePerformer(btn.dataset.id);
                window.navigateTo('crew');
            }
        });
    });

    document.getElementById('perf-save-btn')?.addEventListener('click', () => {
        const id = document.getElementById('perf-id').value;
        const data = {
            name: document.getElementById('perf-name').value.trim(),
            role: document.getElementById('perf-role').value.trim(),
            phone: document.getElementById('perf-phone').value.trim(),
            arrivalTime: document.getElementById('perf-arrival').value,
            makeupTime: document.getElementById('perf-makeup').value,
            readyTime: document.getElementById('perf-ready').value,
            notes: document.getElementById('perf-notes').value.trim()
        };
        if (!data.name) return window.showToast('名前を入力してください', 'error');
        if (id) Store.updatePerformer(id, data);
        else Store.addPerformer(data);
        perfModal?.classList.add('hidden');
        window.navigateTo('crew');
    });

    function resetPerfFields() {
        document.getElementById('perf-id').value = '';
        document.getElementById('perf-name').value = '';
        document.getElementById('perf-role').value = '';
        document.getElementById('perf-phone').value = '';
        document.getElementById('perf-arrival').value = '09:00';
        document.getElementById('perf-makeup').value = '09:30';
        document.getElementById('perf-ready').value = '10:30';
        document.getElementById('perf-notes').value = '';
    }

    // --- CREW LOGIC ---
    // Share Functionality (Requirement 6)
    document.getElementById('crew-share-btn')?.addEventListener('click', () => {
        const performers = Store.performers;
        const crew = Store.crew;
        const prj = Store.project;

        let txt = `【${prj.title || '制作案件'}】スタッフ・キャスト入り時間共有\n`;
        txt += `撮影日: ${prj.shootDate || '未定'}\n`;
        txt += `------------------------------\n\n`;

        if (performers.length > 0) {
            txt += `■出演者 (Cast)\n`;
            performers.forEach(p => {
                txt += `・${p.name || '未設定'}: 入${p.arrivalTime || '--:--'} / M${p.makeupTime || '--:--'} / 支度完了${p.readyTime || '--:--'} \n`;
            });
            txt += `\n`;
        }

        if (crew.length > 0) {
            txt += `■スタッフ (Crew)\n`;
            // 部署ごとに並び替えると丁寧
            const sortedCrew = [...crew].sort((a,b) => a.dept.localeCompare(b.dept));
            sortedCrew.forEach(c => {
                txt += `・[${c.dept}] ${c.name}: ${c.callTime || '--:--'}入り\n`;
            });
        }

        const modal = document.getElementById('share-modal');
        const area = document.getElementById('share-text');
        if (modal && area) {
            area.value = txt;
            modal.classList.remove('hidden');
        }
    });

    document.getElementById('copy-summary-btn')?.addEventListener('click', () => {
        const area = document.getElementById('share-text');
        if (area) {
            area.select();
            document.execCommand('copy');
            window.showToast('📋 クリップボードにコピーしました', 'success');
            document.getElementById('share-modal').classList.add('hidden');
        }
    });

    const crewModal = document.getElementById('crew-modal');
    document.getElementById('crew-add-btn')?.addEventListener('click', () => {
        resetCrewFields();
        document.getElementById('crew-modal-title').textContent = 'スタッフを追加';
        crewModal?.classList.remove('hidden');
    });
    document.getElementById('crew-modal-close')?.addEventListener('click', () => crewModal?.classList.add('hidden'));

    document.querySelectorAll('.crew-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const c = Store.crew.find(x => x.id === id);
            if (c) {
                document.getElementById('crew-id').value = c.id;
                document.getElementById('crew-name').value = c.name || '';
                document.getElementById('crew-dept').value = c.dept || 'Production';
                document.getElementById('crew-role').value = c.role || '';
                document.getElementById('crew-call').value = c.callTime || '09:00';
                document.getElementById('crew-phone').value = c.phone || '';
                document.getElementById('crew-modal-title').textContent = 'スタッフを編集';
                crewModal?.classList.remove('hidden');
            }
        });
    });

    document.getElementById('crew-save-btn')?.addEventListener('click', () => {
        const id = document.getElementById('crew-id').value;
        const data = {
            name: document.getElementById('crew-name').value.trim(),
            dept: document.getElementById('crew-dept').value,
            role: document.getElementById('crew-role').value.trim(),
            callTime: document.getElementById('crew-call').value,
            phone: document.getElementById('crew-phone').value.trim()
        };
        if (!data.name) return window.showToast('名前を入力してください', 'error');
        if (id) Store.updateCrew(id, data);
        else Store.addCrew(data);
        crewModal?.classList.add('hidden');
        window.navigateTo('crew');
    });

    function resetCrewFields() {
        document.getElementById('crew-id').value = '';
        document.getElementById('crew-name').value = '';
        document.getElementById('crew-dept').value = 'Production';
        document.getElementById('crew-role').value = '';
        document.getElementById('crew-call').value = '09:00';
        document.getElementById('crew-phone').value = '';
    }
};
