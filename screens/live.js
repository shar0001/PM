/* =============================================================
   Live Progress Screen V8.5 — REALTIME FIELD OS
   ============================================================= */
window.renderLive = function () {
    const stats = Store.getStats();
    const live = Store.liveState;
    
    // 現在撮影中のショット、または未撮影の最初のショット
    const shootingShot = Store.shots.find(s => s.status === 'shooting');
    const currentShot = shootingShot || (stats.remaining.length > 0 ? stats.remaining[0] : null);
    
    const nextShotIndex = currentShot ? Store.shotOrder.indexOf(currentShot.id) + 1 : -1;
    const nextShotId = nextShotIndex < Store.shotOrder.length ? Store.shotOrder[nextShotIndex] : null;
    const nextShot = nextShotId ? Store.shots.find(s => s.id === nextShotId) : null;

    const delay = live.delayMinutes || 0;
    const delayColor = delay > 0 ? 'var(--accent)' : delay < 0 ? 'var(--success)' : 'var(--muted)';
    const delayPrefix = delay > 0 ? '押：+' : delay < 0 ? '巻：' : 'オンタイム';

    return `
<div id="screen-live" class="screen flex-col h-full bg-bg">
  <header class="safe-top shrink-0 px-5 py-4 border-b border-border flex items-center justify-between bg-surface/30 backdrop-blur-md sticky top-0 z-50">
    <div>
      <h1 class="font-display font-black text-2xl mb-1 text-text flex items-baseline gap-2">
        進行 <span class="text-primary text-lg">${stats.pct}%</span>
      </h1>
      <p class="text-muted text-[11px] font-display uppercase tracking-widest truncate max-w-[200px]">${Store.project.title}</p>
    </div>
    <div class="flex flex-col items-end gap-1.5">
      <div id="live-delay" class="text-[10px] font-display font-black px-3 py-1 rounded-full border transition-all" 
           style="background:${delayColor}11; color:${delayColor}; border-color:${delayColor}33">
        ${delayPrefix}${Math.abs(delay)}分
      </div>
      <div class="flex items-center gap-1.5 bg-surface2 px-2 py-0.5 rounded-md border border-border2">
        <span class="text-[9px] text-muted uppercase font-bold tracking-widest">ETA</span>
        <span class="text-sm font-display font-black text-primary" id="live-eta-time">--:--</span>
      </div>
    </div>
  </header>

  <div class="flex-1 p-5 overflow-y-auto pb-24 space-y-8">
    
    <!-- CURRENT / ACTIVE SHOT -->
    <section>
      <div class="flex items-center gap-2 mb-4">
          <span class="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
          <p class="section-header !mt-0 !mb-0 font-black">現在のカット <span class="text-primary">/</span> SCENE</p>
      </div>

      ${currentShot ? `
      <div class="bg-surface2 rounded-[2.5rem] border ${currentShot.status === 'shooting' ? 'border-primary shadow-[0_0_40px_rgba(232,168,50,0.1)]' : 'border-border'} p-8 relative overflow-hidden transition-all duration-500">
        <div class="absolute top-0 right-0 w-48 h-48 bg-primary opacity-5 rounded-full -mr-24 -mt-24"></div>
        
        <div class="flex justify-between items-start mb-6">
          <div class="w-16 h-16 bg-primary text-bg rounded-2xl flex items-center justify-center font-display font-black text-3xl shadow-lg shadow-primary/20">
            ${currentShot.number || '—'}
          </div>
          <div class="text-right">
            <p class="text-[10px] text-muted uppercase font-display font-bold tracking-widest mb-1">開始予定</p>
            <p class="text-2xl font-display font-black text-primary leading-none">${currentShot.startTime}</p>
          </div>
        </div>

        <h2 class="text-2xl font-bold mb-3 leading-tight tracking-tight">${currentShot.title || 'Scene Untitled'}</h2>
        
        <div class="flex flex-wrap gap-3 text-xs text-muted mb-8 italic opacity-80">
          <span class="flex items-center gap-1.5 bg-bg/40 px-3 py-1.5 rounded-full border border-border/50">
             <span class="material-symbols-outlined text-[14px]">location_on</span>${currentShot.location || 'スタジオ'}
          </span>
          <span class="flex items-center gap-1.5 bg-bg/40 px-3 py-1.5 rounded-full border border-border/50">
             <span class="material-symbols-outlined text-[14px]">timer</span>予定: ${currentShot.duration}分
          </span>
        </div>

        <div class="flex flex-col gap-3">
          ${currentShot.status !== 'shooting' ? `
            <button id="live-start-btn" class="w-full py-5 rounded-[1.5rem] bg-text text-bg font-bold text-sm uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl">
              撮影を開始する
            </button>
          ` : `
            <button id="live-finish-btn" class="w-full py-6 rounded-[1.5rem] bg-primary text-bg font-bold text-lg uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl shadow-primary/30">
              完了して次のカットへ
            </button>
            <div class="text-center mt-2">
                <span class="text-[10px] font-bold text-primary animate-pulse">● 撮影進行中 / ON RECORD</span>
            </div>
          `}
        </div>
      </div>
      ` : `
      <div class="bg-surface2 rounded-[2.5rem] p-12 text-center text-muted border border-dashed border-border flex flex-col items-center">
        <span class="material-symbols-outlined text-6xl mb-6 opacity-20">celebration</span>
        <p class="font-bold text-lg mb-2 text-text">本日の撮影完了！</p>
        <p class="text-xs">全工程が終了しました。お疲れ様でした。</p>
      </div>
    `}
    </section>

    <!-- NEXT UP -->
    <section>
       <p class="section-header !mb-4">次のカット <span class="text-muted">•</span> NEXT UP</p>
      ${nextShot ? `
      <div class="bg-surface rounded-3xl border border-border p-5 flex items-center gap-5 opacity-60 grayscale-[0.5]">
        <div class="w-12 h-12 bg-bg border border-border rounded-xl flex items-center justify-center font-display font-bold text-muted text-lg">
          ${nextShot.number || '—'}
        </div>
        <div class="flex-1">
          <p class="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">${nextShot.startTime} 開始予定</p>
          <h3 class="text-base font-bold truncate text-text">${nextShot.title}</h3>
        </div>
        <span class="material-symbols-outlined text-muted">arrow_forward_ios</span>
      </div>
    ` : `
      <div class="text-center py-6 border border-dashed border-border rounded-3xl opacity-30">
          <p class="text-[10px] uppercase font-bold">終了 / Last Shot</p>
      </div>
    `}
    </section>

    <!-- STATS OVERVIEW -->
    <div class="grid grid-cols-2 gap-4">
        <div class="bg-surface2 rounded-3xl p-5 border border-border">
            <p class="text-[9px] text-muted uppercase font-bold tracking-widest mb-2">カット消化率 Status</p>
            <p class="text-2xl font-display font-black text-text">${stats.done} / ${stats.total}</p>
            <div class="w-full h-1.5 bg-border rounded-full mt-3 overflow-hidden">
                <div class="h-full bg-success transition-all duration-1000" style="width:${stats.pct}%"></div>
            </div>
        </div>
        <div class="bg-surface2 rounded-3xl p-5 border border-border flex flex-col justify-center">
            <p class="text-[9px] text-muted uppercase font-bold tracking-widest mb-2">残りのカット数 Remaining</p>
            <p class="text-2xl font-display font-black text-text">${stats.total - stats.done} <span class="text-sm text-muted">CUTS</span></p>
        </div>
    </div>

  </div>
</div>`;
};

window.initLive = function () {
    const startBtn = document.getElementById('live-start-btn');
    const finishBtn = document.getElementById('live-finish-btn');
    const etaDisplay = document.getElementById('live-eta-time');

    // ETA Update Logic
    function updateETA() {
        if (!etaDisplay) return;
        const remainingShots = Store.shots.filter(s => s.status !== 'completed');
        const remainingMin = remainingShots.reduce((sum, s) => sum + parseInt(s.duration || 30), 0);
        const eta = window.Utils ? window.Utils.minToTime(window.Utils.nowMin() + remainingMin) : '--:--';
        etaDisplay.textContent = eta;
    }
    
    updateETA();
    // Update every minute
    const etaInterval = setInterval(updateETA, 60000);
    // Cleanup interval on unmount (assuming single page app, can bind to window or screen detach. For now just clear on next render)
    if (window._liveEtaInterval) clearInterval(window._liveEtaInterval);
    window._liveEtaInterval = etaInterval;

    startBtn?.addEventListener('click', () => {
        window.Utils?.triggerHaptic('Heavy');
        const stats = Store.getStats();
        const currentShot = Store.shots.find(s => s.status === 'shooting') || (stats.remaining.length > 0 ? stats.remaining[0] : null);
        if (currentShot) {
            Store.startShot(currentShot.id);
            window.showToast('🎬 撮影開始。REC中...', 'success');
            window.navigateTo('live');
        }
    });

    finishBtn?.addEventListener('click', () => {
        window.Utils?.triggerHaptic('Success');
        const activeShot = Store.shots.find(s => s.status === 'shooting');
        if (activeShot) {
            Store.completeShot(activeShot.id);
            window.showToast('✅ 撮影完了。次の準備へ。', 'success');
            window.navigateTo('live');
        }
    });
};
