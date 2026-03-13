/* =============================================================
   Professional Schedule (香盤表) V8 — Field OS Edition
   ============================================================= */
window.renderTimeline = function () {
    const shots = Store.orderedShots;
    const p = Store.project;
    const stats = Store.getStats();
    const delay = Store.liveState.delayMinutes || 0;
    
    const nowM = Utils.nowMin();
    const delayColor = delay > 0 ? 'var(--accent)' : delay < 0 ? 'var(--success)' : 'var(--muted)';

    function shotRow(shot, idx) {
        const isCompleted = shot.status === 'completed';
        const isShooting = shot.status === 'shooting';
        const castStr = (shot.cast || []).join(', ') || '—';
        
        let statusClass = 'border-border opacity-70';
        if (isShooting) statusClass = 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-lg';
        if (isCompleted) statusClass = 'border-border opacity-30';

        return `
        <div class="flex gap-3 mb-4 last:mb-0 draggable-shot" draggable="true" data-id="${shot.id}">
            <!-- Time Column -->
            <div class="w-14 shrink-0 flex flex-col items-center pt-1">
                <span class="font-display font-black text-xs ${isShooting ? 'text-primary' : isCompleted ? 'text-muted' : 'text-text'}">
                    ${shot.startTime}
                </span>
                <div class="w-px flex-1 bg-border my-2 relative">
                    ${isShooting ? '<div class="absolute inset-0 bg-primary animate-pulse"></div>' : ''}
                </div>
                <div class="text-[8px] font-bold text-muted uppercase bg-surface px-1.5 py-0.5 rounded border border-border">
                    ${shot.duration}分
                </div>
            </div>

            <!-- Card Column -->
            <div class="flex-1 bg-surface border rounded-2xl p-4 transition-all ${statusClass}">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                        <span class="w-8 h-8 rounded-lg bg-bg border border-border flex items-center justify-center font-display font-black text-xs text-muted">
                            ${shot.number}
                        </span>
                        <div>
                            <h3 class="font-bold text-sm ${isCompleted ? 'line-through' : ''}">${shot.title}</h3>
                            <p class="text-[9px] text-muted flex items-center gap-1">
                                <span class="material-symbols-outlined text-[10px]">location_on</span>${shot.location}
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="tl-complete text-muted hover:text-success" data-id="${shot.id}" title="${isCompleted ? '完了取消' : '完了にする'}">
                            <span class="material-symbols-outlined text-lg">${isCompleted ? 'undo' : 'check_circle'}</span>
                        </button>
                        <button class="tl-edit text-muted hover:text-primary" data-id="${shot.id}">
                            <span class="material-symbols-outlined text-lg">edit</span>
                        </button>
                    </div>
                </div>

                <div class="flex flex-wrap gap-2 mt-3">
                    <span class="text-[10px] bg-bg/50 px-2 py-1 rounded-md border border-border/50 text-muted">
                        <span class="material-symbols-outlined text-[11px] align-middle mr-0.5">groups</span>${castStr}
                    </span>
                    ${shot.lens ? `
                    <span class="text-[10px] bg-bg/50 px-2 py-1 rounded-md border border-border/50 text-muted">
                        <span class="material-symbols-outlined text-[11px] align-middle mr-0.5">videocam</span>${shot.lens}
                    </span>` : ''}
                </div>

                ${shot.notes ? `
                <div class="mt-3 p-2 bg-primary/5 border border-primary/10 rounded-lg">
                    <p class="text-[9px] text-primary leading-tight font-body">※ ${shot.notes}</p>
                </div>` : ''}

                ${isCompleted ? `
                <div class="mt-2 flex items-center gap-1 text-[9px] text-success font-bold">
                    <span class="material-symbols-outlined text-[11px]">check_circle</span> 撮影完了 (${shot.completedAt})
                </div>` : ''}
            </div>
        </div>`;
    }

    return `
<div id="screen-timeline" class="screen flex-col h-full bg-bg">
    <header class="safe-top shrink-0 px-5 py-4 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-10">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="font-display font-black text-2xl text-text leading-tight">香盤表</h1>
                <p class="text-muted text-[11px] font-display uppercase tracking-widest">${p.shootDay || 'DAY 1'} · ${p.shootDate}</p>
            </div>
            <div class="flex gap-2">
                <button id="tl-callsheet" class="w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-border text-muted transition-transform active:scale-95">
                    <span class="material-symbols-outlined">description</span>
                </button>
                <button id="tl-add-shot" class="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-bg transition-transform active:scale-95">
                    <span class="material-symbols-outlined">add</span>
                </button>
            </div>
        </div>
        
    </header>

    <div class="flex-1 overflow-y-auto px-5 pt-6 pb-24" id="tl-list">
        ${shots.length > 0 ? shots.map(shotRow).join('') : `
        <div class="h-64 flex flex-col items-center justify-center text-center opacity-40">
            <span class="material-symbols-outlined text-5xl mb-4">list_alt</span>
            <p class="text-sm font-bold">カットが登録されていません</p>
            <p class="text-[11px]">右上の＋からカットを追加してください</p>
        </div>`}
    </div>
</div>`;
};

window.initTimeline = function () {
    const clockTimer = setInterval(() => {
        const el = document.getElementById('tl-clock');
        if (el) el.textContent = Utils.nowStr();
        else clearInterval(clockTimer);
    }, 10000);

    document.getElementById('tl-callsheet')?.addEventListener('click', () => window.navigateTo('callsheet'));
    document.getElementById('tl-add-shot')?.addEventListener('click', () => {
        window._editShotTarget = null;
        window.navigateTo('shots');
    });

    document.querySelectorAll('.tl-complete').forEach(btn => {
        btn.addEventListener('click', () => {
            Store.completeShot(btn.dataset.id);
            window.navigateTo('timeline');
        });
    });

    document.querySelectorAll('.tl-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            window._editShotTarget = btn.dataset.id;
            window.navigateTo('shots');
        });
    });

    // Drag and Drop reordering
    const container = document.getElementById('tl-list');
    let draggedId = null;

    document.querySelectorAll('.draggable-shot').forEach(el => {
        el.addEventListener('dragstart', (e) => {
            draggedId = el.dataset.id;
            el.classList.add('opacity-40');
            e.dataTransfer.effectAllowed = 'move';
        });
        el.addEventListener('dragend', () => {
            el.classList.remove('opacity-40');
            draggedId = null;
        });
        el.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingEl = document.querySelector(`[data-id="${draggedId}"]`);
            if (draggingEl && el !== draggingEl) {
                const rect = el.getBoundingClientRect();
                const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                container.insertBefore(draggingEl, next ? el.nextSibling : el);
            }
        });
    });

    container?.addEventListener('drop', (e) => {
        e.preventDefault();
        const newOrder = Array.from(container.querySelectorAll('.draggable-shot')).map(el => el.dataset.id);
        Store.reorderShots(newOrder);
        window.showToast('✓ 香盤の順序を更新しました', 'success');
    });
};
