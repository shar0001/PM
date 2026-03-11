/* =============================================================
   Simulator Screen V2 — 実データ・残カット・日没・残業リスク
   ============================================================= */
window.renderSimulator = function () {
  const shots = Store.orderedShots;
  const p = Store.project;
  const refLoc = Store.locations[0] || { lat: 35.6812, lng: 139.7671 };
  const sunset = Store.sunsetOverride || Utils.calcSunset(refLoc.lat, refLoc.lng, p.shootDate);
  const initDelay = Utils.calcDelay(shots, p.startTime);
  const stats = Utils.calcRemainingStats(shots, sunset, initDelay);

  const sliderVal = Math.min(120, Math.max(0, 60 + initDelay));

  function riskColor(risk) {
    return risk === 'high' ? 'text-accent' : risk === 'medium' ? 'text-orange-400' : 'text-green-400';
  }
  function riskLabel(risk) {
    return risk === 'high' ? '高リスク🔴' : risk === 'medium' ? '中リスク🟡' : '低リスク🟢';
  }

  return `
<div id="screen-simulator" class="screen flex-col h-full">
  <header class="safe-top shrink-0 flex items-center bg-background-dark border-b border-border-col px-4 py-3 gap-2">
    <button id="sim-back-btn" class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface transition-colors">
      <span class="material-symbols-outlined">arrow_back</span>
    </button>
    <div class="flex-1">
      <h1 class="font-display font-bold text-base">Schedule Simulator</h1>
      <p class="text-[10px] text-primary font-display uppercase tracking-widest">押し巻きシミュレーション</p>
    </div>
    <button id="sim-apply-btn" class="badge badge-primary px-3 py-1.5 text-[11px] hover:opacity-80 transition-opacity">反映</button>
  </header>

  <div class="flex-1 overflow-y-auto pb-4">
    <!-- Delay Slider -->
    <div class="m-4 bg-surface border border-border-col/50 rounded-xl p-5 space-y-5">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-display font-bold uppercase tracking-widest text-muted flex items-center gap-1.5">
          <span class="material-symbols-outlined text-primary text-sm">tune</span> 時間調整
        </h2>
        <span id="sim-delay-label" class="font-display text-2xl font-black ${initDelay > 0 ? 'text-accent' : 'text-primary'}">${initDelay === 0 ? '定刻' : Utils.fmtDiff(initDelay)}</span>
      </div>
      <div class="space-y-2">
        <input id="sim-slider" type="range" min="0" max="120" value="${sliderVal}" step="5" class="w-full"/>
        <div class="flex justify-between text-[9px] font-display font-bold text-muted uppercase">
          <span>−60m 巻き</span><span>±0m 定刻</span><span>+60m 押し</span>
        </div>
      </div>

      <!-- Before / After -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-background-dark border border-border-col rounded-xl p-4">
          <p class="field-label">規定終了</p>
          <p class="font-display font-bold text-xl">${p.wrapTime}</p>
        </div>
        <div id="sim-end-card" class="bg-primary/5 border border-primary/30 rounded-xl p-4">
          <p class="field-label text-primary">予測終了</p>
          <p id="sim-end-time" class="font-display font-bold text-xl text-primary">${stats.estimatedEnd}</p>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="mx-4 grid grid-cols-2 gap-3 mb-4">
      <div class="bg-surface border border-border-col rounded-xl p-4">
        <p class="text-[10px] font-display font-bold text-muted uppercase mb-1 flex items-center gap-1">
          <span class="material-symbols-outlined text-[12px]">movie</span>残りカット
        </p>
        <p id="sim-remaining" class="font-display font-bold text-2xl text-text-main">${stats.totalRemaining}<span class="text-sm text-muted ml-1">カット</span></p>
      </div>
      <div class="bg-surface border ${stats.cantDoBeforeSunset > 0 ? 'border-accent/50 bg-accent/5' : 'border-border-col'} rounded-xl p-4">
        <p class="text-[10px] font-display font-bold text-muted uppercase mb-1 flex items-center gap-1">
          <span class="material-symbols-outlined text-[12px]">wb_twilight</span>日没前に撮れる
        </p>
        <p id="sim-before-sunset" class="font-display font-bold text-2xl ${stats.cantDoBeforeSunset > 0 ? 'text-accent' : 'text-primary'}">${stats.canDoBeforeSunset}<span class="text-sm text-muted ml-1">カット</span></p>
        ${stats.cantDoBeforeSunset > 0 ? `<p class="text-[10px] text-accent mt-1">${stats.cantDoBeforeSunset}カット不足</p>` : '<p class="text-[10px] text-green-400 mt-1">✓ 日没前に完了可能</p>'}
      </div>
      <div class="bg-surface border border-border-col rounded-xl p-4">
        <p class="text-[10px] font-display font-bold text-muted uppercase mb-1 flex items-center gap-1">
          <span class="material-symbols-outlined text-[12px]">wb_sunny</span>日没時刻
        </p>
        <p id="sim-sunset" class="font-display font-bold text-2xl text-text-main">${sunset}</p>
      </div>
      <div class="bg-surface border ${stats.overtimeRisk === 'high' ? 'border-accent/50' : stats.overtimeRisk === 'medium' ? 'border-orange-500/50' : 'border-border-col'} rounded-xl p-4">
        <p class="text-[10px] font-display font-bold text-muted uppercase mb-1 flex items-center gap-1">
          <span class="material-symbols-outlined text-[12px]">schedule</span>残業リスク
        </p>
        <p id="sim-overtime" class="font-display font-bold text-lg ${riskColor(stats.overtimeRisk)}">${riskLabel(stats.overtimeRisk)}</p>
        ${stats.overtimeMin > 0 ? `<p id="sim-overtime-min" class="text-[10px] text-muted mt-1">約${stats.overtimeMin}分超過</p>` : ''}
      </div>
    </div>

    <!-- Shot Timeline visualization -->
    <div class="mx-4 bg-surface border border-border-col rounded-xl overflow-hidden">
      <div class="px-4 py-3 border-b border-border-col">
        <p class="section-header mb-0">残りカット timeline</p>
      </div>
      <div class="p-4 space-y-1" id="sim-shot-list">
        ${Store.orderedShots.filter(s => s.status !== 'completed').map(s => {
    const startM = Utils.timeToMin(s.startTime);
    const sunM = Utils.timeToMin(sunset);
    const isConflict = startM + s.duration > sunM;
    return `<div class="flex items-center gap-3 py-2 border-b border-border-col/30 last:border-none">
            <span class="badge badge-muted w-10 shrink-0 text-center">${s.number}</span>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-display font-bold truncate">${s.title}</div>
              <div class="text-[10px] text-muted">${s.startTime} — ${Utils.minToTime(Utils.timeToMin(s.startTime) + s.duration)} (${s.duration}分)</div>
            </div>
            ${isConflict ? '<span class="material-symbols-outlined text-accent text-sm shrink-0">wb_twilight</span>' : '<span class="material-symbols-outlined text-green-400 text-sm shrink-0" style="opacity:.4">check</span>'}
          </div>`;
  }).join('')}
      </div>
    </div>
  </div>
</div>`;
};

window.initSimulator = function () {
  document.getElementById('sim-back-btn')?.addEventListener('click', () => window.navigateTo('timeline'));

  const slider = document.getElementById('sim-slider');
  if (!slider) return;

  const shots = Store.orderedShots;
  const p = Store.project;
  const refLoc = Store.locations[0] || { lat: 35.6812, lng: 139.7671 };
  const sunset = Store.sunsetOverride || Utils.calcSunset(refLoc.lat, refLoc.lng, p.shootDate);

  let currentDelay = 0;

  function updateSim() {
    const val = parseInt(slider.value);
    currentDelay = val - 60;
    const stats = Utils.calcRemainingStats(shots, sunset, currentDelay);

    const sign = currentDelay > 0 ? '+' : '';
    const delayLabel = currentDelay === 0 ? '定刻' : `${sign}${currentDelay}m`;
    const delayEl = document.getElementById('sim-delay-label');
    if (delayEl) {
      delayEl.textContent = delayLabel;
      delayEl.className = `font-display text-2xl font-black ${currentDelay > 0 ? 'text-accent' : currentDelay < 0 ? 'text-primary' : 'text-muted'}`;
    }

    // Slider gradient
    const pct = val / 120 * 100;
    const midPct = 50;
    if (currentDelay > 0) {
      slider.style.background = `linear-gradient(to right,#27272A 0%,#27272A ${midPct}%,#FF3366 ${midPct}%,#FF3366 ${pct}%,#27272A ${pct}%,#27272A 100%)`;
    } else if (currentDelay < 0) {
      slider.style.background = `linear-gradient(to right,#27272A 0%,#dcf906 ${pct}%,#27272A ${pct}%,#27272A 100%)`;
    } else {
      slider.style.background = '#27272A';
    }

    const setEl = (id, txt, cls) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = txt;
      if (cls !== undefined) el.className = cls;
    };

    setEl('sim-end-time', stats.estimatedEnd);
    setEl('sim-remaining', stats.totalRemaining + '');
    setEl('sim-before-sunset', stats.canDoBeforeSunset + '');
    const riskColors = { high: 'text-accent', medium: 'text-orange-400', low: 'text-green-400' };
    const riskLabels = { high: '高リスク🔴', medium: '中リスク🟡', low: '低リスク🟢' };
    setEl('sim-overtime', riskLabels[stats.overtimeRisk]);
    const otEl = document.getElementById('sim-overtime-min');
    if (otEl) otEl.textContent = stats.overtimeMin > 0 ? `約${stats.overtimeMin}分超過` : '';
  }

  document.getElementById('sim-apply-btn')?.addEventListener('click', () => {
    if (currentDelay !== 0) {
      // 現在の案件のstartTimeを直接取得し、差分（分）を適用する
      const currentStartMin = Utils.timeToMin(p.startTime || '09:00');
      const newStartMin = Math.max(0, currentStartMin + currentDelay);
      const newStartTime = Utils.minToTime(newStartMin);

      Store.setProject({ startTime: newStartTime }); // Storeに保存 (合わせてshotの時間再計算も発火)
      Store._recalcSchedule(); // 念のため即時再計算
      Store._save();
      window.showToast(`✓ 前倒し・遅れ(${currentDelay > 0 ? '+' + currentDelay : currentDelay}分) を香盤に反映しました`, 'success');
    } else {
      window.showToast('スケジュールの変更はありません', 'success');
    }
    window.navigateTo('timeline');
  });

  slider.addEventListener('input', updateSim);
  updateSim(); // Initial
};
