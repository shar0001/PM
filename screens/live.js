/* =============================================================
   Live Progress Screen — 撮影進行モード
   ============================================================= */
window.renderLive = function () {
    const stats = Store.getStats();
    const live = Store.liveState;
    const currentShot = stats.shooting || (stats.remaining.length > 0 ? stats.remaining[0] : null);
    const nextShotIndex = currentShot ? Store.shotOrder.indexOf(currentShot.id) + 1 : -1;
    const nextShotId = nextShotIndex < Store.shotOrder.length ? Store.shotOrder[nextShotIndex] : null;
    const nextShot = nextShotId ? Store.shots.find(s => s.id === nextShotId) : null;

    const delay = live.delayMinutes || 0;
    const delayColor = delay > 0 ? 'var(--accent)' : delay < 0 ? 'var(--success)' : 'var(--muted)';
    const delayPrefix = delay > 0 ? '押：+' : delay < 0 ? '巻：' : 'オンタイム';

    return `
<div id="screen-live" class="screen flex-col h-full bg-bg">
  <header class="safe-top shrink-0 px-5 py-4 border-b border-border flex items-center justify-between">
    <div>
      <h1 class="font-display font-bold text-2xl mb-1 text-text">撮影進行</h1>
      <p class="text-muted text-[11px] font-display uppercase tracking-wider">${Store.project.title}</p>
    </div>
    <div class="flex flex-col items-end">
      <div id="live-delay" class="text-xs font-display font-black px-2 py-1 rounded" style="background:${delayColor}22; color:${delayColor}">
        ${delayPrefix}${Math.abs(delay)}分
      </div>
    </div>
  </header>

  <div class="flex-1 p-5 overflow-y-auto pb-24 space-y-6">
    
    <!-- CURRENT SHOT -->
    <section>
      <p class="section-header !mb-3">CURRENT <span class="text-primary">•</span> 撮影中</p>
      ${currentShot ? `
      <div class="bg-surface2 rounded-3xl border border-primary border-opacity-30 p-6 shadow-xl relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary opacity-5 rounded-full -mr-16 -mt-16"></div>
        <div class="flex justify-between items-start mb-4">
          <div class="w-14 h-14 bg-primary text-bg rounded-2xl flex items-center justify-center font-display font-black text-2xl">
            ${currentShot.number || '—'}
          </div>
          <div class="text-right">
            <p class="text-[10px] text-muted uppercase font-display font-bold tracking-widest">START TIME</p>
            <p class="text-lg font-display font-black text-primary">${currentShot.startTime || '00:00'}</p>
          </div>
        </div>
        <h2 class="text-xl font-bold mb-2 leading-tight">${currentShot.title || 'Scene Untitled'}</h2>
        <div class="flex gap-4 text-xs text-muted mb-6">
          <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">location_on</span>${currentShot.location || 'スタジオ'}</span>
          <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">timer</span>予定: ${currentShot.duration}分</span>
        </div>

        <div class="grid grid-cols-2 gap-3 mt-4">
          <button id="live-start-btn" class="flex-1 py-4 rounded-2xl bg-surface border border-border font-display font-black text-sm uppercase tracking-widest transition-transform active:scale-95" 
                  ${currentShot.status === 'shooting' ? 'disabled style="opacity:0.3"' : ''}>
            START
          </button>
          <button id="live-finish-btn" class="flex-1 py-4 rounded-2xl bg-primary text-bg font-display font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 transition-transform active:scale-95">
            FINISH
          </button>
        </div>
      </div>
      ` : `
      <div class="bg-surface2 rounded-3xl p-8 text-center text-muted border border-dashed border-border">
        <span class="material-symbols-outlined text-4xl mb-4 block">done_all</span>
        <p class="font-bold">すべての撮影が完了しました</p>
      </div>
      `}
    </section>

    <!-- NEXT SHOT -->
    <section>
      <p class="section-header !mb-3">NEXT <span class="text-muted">•</span> 次の予定</p>
      ${nextShot ? `
      <div class="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4 opacity-70">
        <div class="w-10 h-10 border border-border rounded-lg flex items-center justify-center font-display font-bold text-muted">
          ${nextShot.number || '—'}
        </div>
        <div class="flex-1">
          <p class="text-[9px] text-muted font-display font-bold uppercase tracking-wider">${nextShot.startTime} START</p>
          <h3 class="text-sm font-bold truncate">${nextShot.title}</h3>
        </div>
        <span class="material-symbols-outlined text-muted">chevron_right</span>
      </div>
      ` : `
      <p class="text-center text-[10px] text-muted py-4">次はありません</p>
      `}
    </section>

    <!-- STATS -->
    <div class="grid grid-cols-2 gap-3">
        <div class="bg-surface rounded-2xl p-4 border border-border">
            <p class="text-[9px] text-muted uppercase font-display font-bold mb-1">PROGRESS</p>
            <p class="text-lg font-display font-black text-text">${stats.done} / ${stats.total}</p>
            <div class="w-full h-1 bg-border rounded-full mt-2 overflow-hidden">
                <div class="h-full bg-success" style="width:${stats.pct}%"></div>
            </div>
        </div>
        <div class="bg-surface rounded-2xl p-4 border border-border flex flex-col justify-center">
            <p class="text-[9px] text-muted uppercase font-display font-bold mb-1">REMAINING</p>
            <p class="text-lg font-display font-black text-text">${stats.total - stats.done} CUTS</p>
        </div>
    </div>

  </div>
</div>`;
};

window.initLive = function () {
    const startBtn = document.getElementById('live-start-btn');
    const finishBtn = document.getElementById('live-finish-btn');

    startBtn?.addEventListener('click', () => {
        const stats = Store.getStats();
        const currentShot = stats.shooting || (stats.remaining.length > 0 ? stats.remaining[0] : null);
        if (currentShot) {
            Store.updateShot(currentShot.id, { status: 'shooting' });
            window.showToast('✓ 撮影開始を記録しました', 'success');
            window.navigateTo('live');
        }
    });

    finishBtn?.addEventListener('click', () => {
        const stats = Store.getStats();
        const currentShot = stats.shooting || (stats.remaining.length > 0 ? stats.remaining[0] : null);
        if (currentShot) {
            // 現在の時間を完了時間として記録
            Store.completeShot(currentShot.id);
            
            // 自動で次をshootingにする
            const nextIdx = Store.shotOrder.indexOf(currentShot.id) + 1;
            if (nextIdx < Store.shotOrder.length) {
                Store.updateShot(Store.shotOrder[nextIdx], { status: 'shooting' });
            }

            window.showToast('✓ 撮影完了。次へ移行します', 'success');
            window.navigateTo('live');
        }
    });
};
