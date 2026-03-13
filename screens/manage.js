/* =============================================================
   Management Hub Screen — 管理機能一覧
   ============================================================= */
window.renderManage = function () {
    const projects = Store.allProjects;
    return `
<div id="screen-manage" class="screen flex-col h-full bg-bg">
  <header class="safe-top shrink-0 flex items-center justify-between px-5 py-4 border-b border-border">
    <div>
      <h1 class="font-display font-bold text-2xl mb-1 text-text">管理ハブ</h1>
      <p class="text-muted text-[11px] font-display uppercase tracking-wider">Project Management Hub</p>
    </div>
    <button id="manage-prj-switch" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted font-display font-bold text-[10px] hover:bg-surface2 transition-colors">
      <span class="material-symbols-outlined" style="font-size:14px">folder</span> 案件切替
    </button>
  </header>

  <div class="flex-1 overflow-y-auto p-5 pb-24">
    <!-- Section: 制作・デスク -->
    <p class="section-header !mt-0">Production & Desk</p>
    <div class="grid grid-cols-2 gap-3 mb-8">
      <button class="manage-btn" data-screen="crew">
        <div class="manage-icon" style="background:rgba(232, 168, 50, 0.1); color:var(--primary)">
          <span class="material-symbols-outlined">groups</span>
        </div>
        <div class="manage-text">
          <span class="title">スタッフ・出演者</span>
          <span class="desc">現場・ゲストの名簿</span>
        </div>
      </button>
      <button class="manage-btn" data-screen="budget">
        <div class="manage-icon" style="background:rgba(52, 211, 153, 0.1); color:var(--success)">
          <span class="material-symbols-outlined">account_balance_wallet</span>
        </div>
        <div class="manage-text">
          <span class="title">予算・経費</span>
          <span class="desc">実費・残予算管理</span>
        </div>
      </button>
    </div>

    <!-- Section: 現場・機材 -->
    <p class="section-header">Field & Gear</p>
    <div class="grid grid-cols-2 gap-3 mb-8">
      <button class="manage-btn" data-screen="equipment">
        <div class="manage-icon" style="background:rgba(239, 69, 101, 0.1); color:var(--accent)">
          <span class="material-symbols-outlined">videocam</span>
        </div>
        <div class="manage-text">
          <span class="title">機材チェック</span>
          <span class="desc">機材の搬入・搬出状態</span>
        </div>
      </button>
      <button class="manage-btn" data-screen="logistics">
        <div class="manage-icon" style="background:rgba(59, 130, 246, 0.1); color:#3b82f6">
          <span class="material-symbols-outlined">location_on</span>
        </div>
        <div class="manage-text">
          <span class="title">ロケ地・天気</span>
          <span class="desc">集合場所・気象状況</span>
        </div>
      </button>
    </div>

    <!-- Section: ツール・設定 -->
    <p class="section-header">Tools & Tools</p>
    <div class="grid grid-cols-2 gap-3 mb-8">
      <button class="manage-btn" data-screen="callsheet">
        <div class="manage-icon" style="background:var(--border); color:var(--text)">
          <span class="material-symbols-outlined">description</span>
        </div>
        <div class="manage-text">
          <span class="title">香盤表・PDF</span>
          <span class="desc">印刷・スタッフ配布用</span>
        </div>
      </button>
    </div>

    <!-- App Info / Settings Link -->
    <div class="mt-4 p-4 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-center">
      <p class="text-muted text-[10px] uppercase font-display tracking-widest mb-2">Production OS V8.5</p>
      <button id="manage-settings" class="text-primary text-xs font-bold border-b border-primary border-opacity-30">アプリ設定・インポート・エクスポート</button>
    </div>
  </div>
</div>`;
};

window.initManage = function () {
    document.querySelectorAll('.manage-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.navigateTo(btn.dataset.screen);
        });
    });

    document.getElementById('manage-prj-switch')?.addEventListener('click', () => {
        window.navigateTo('projects');
    });

    document.getElementById('manage-settings')?.addEventListener('click', () => {
        const overlay = document.getElementById('drawer-overlay');
        if (overlay) {
            overlay.style.opacity = '1';
            overlay.style.pointerEvents = 'auto';
            overlay.classList.add('show');
        }
    });
};
