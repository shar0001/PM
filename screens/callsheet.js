/* =============================================================
   Call Sheet Screen V2 — 自動生成・PDF出力
   ============================================================= */
window.renderCallsheet = function () {
    const p = Store.project;
    const crew = Store.crew;
    const locs = Store.locations;
    const shots = Store.orderedShots;
    const em = Store.emergency;
    const mainLoc = locs.find(l => l.status === 'current');
    const cast = crew.filter(c => c.dept === 'Cast');
    const staff = crew.filter(c => c.dept !== 'Cast');
    const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

    function deptGroup(deptName) {
        const members = staff.filter(c => c.dept === deptName);
        if (members.length === 0) return '';
        return `
      <tr>
        <td style="background:rgba(220,249,6,.05); color:var(--muted); font-size:10px; font-family:'Space Grotesk',sans-serif; font-weight:700; padding:4px 8px; text-transform:uppercase; letter-spacing:.08em;"
            colspan="3">${deptName}</td>
      </tr>
      ${members.map(c => `
        <tr>
          <td>${c.name}</td>
          <td>${c.role}</td>
          <td style="color:var(--primary); font-weight:700;">${c.callTime}</td>
        </tr>`).join('')}`;
    }

    const depts = [...new Set(staff.map(c => c.dept))];

    return `
<div id="screen-callsheet" class="screen flex-col h-full">
  <header class="safe-top shrink-0 flex items-center bg-background-dark border-b border-border-col px-4 py-3 gap-2 no-print">
    <button onclick="window.navigateTo('crew')" class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface transition-colors">
      <span class="material-symbols-outlined">arrow_back</span>
    </button>
    <div class="flex-1">
      <h1 class="font-display font-bold text-base">コールシート</h1>
      <p class="text-muted text-[10px] font-display">Call Sheet</p>
    </div>
    <button id="cs-share-btn" class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary text-primary text-xs font-display font-bold hover:bg-primary/10 transition-colors">
      <span class="material-symbols-outlined text-sm">link</span>共有URL
    </button>
    <button id="cs-print-btn" class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-background-dark text-xs font-display font-bold hover:opacity-90 transition-opacity">
      <span class="material-symbols-outlined text-sm">print</span>PDF化
    </button>
  </header>

  <div class="flex-1 overflow-y-auto cs-container pb-4">
    <!-- CS Header -->
    <div class="p-4 print-page">
      <div class="flex items-start justify-between mb-5">
        <div>
          <p class="text-[10px] font-display font-bold text-primary uppercase tracking-widest mb-1">CALL SHEET</p>
          <h2 class="font-display font-bold text-2xl leading-tight">${p.title}</h2>
          <p class="text-muted text-sm">${p.client} / ${p.agency}</p>
        </div>
        <div class="text-right">
          <p class="font-display font-bold text-lg text-primary">${p.shootDate}</p>
          <p class="text-muted text-sm">${p.shootDay}</p>
          <p class="text-muted text-xs">${today}</p>
        </div>
      </div>

      <!-- Project Info -->
      <div class="bg-surface border border-border-col rounded-xl p-4 mb-4">
        <p class="section-header">プロジェクト情報</p>
        <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <div><span class="text-muted">クライアント：</span><span class="font-bold">${p.client}</span></div>
          <div><span class="text-muted">代理店：</span><span class="font-bold">${p.agency}</span></div>
          <div><span class="text-muted">監督：</span><span class="font-bold">${p.director}</span></div>
          <div><span class="text-muted">プロデューサー：</span><span class="font-bold">${p.producer}</span></div>
          <div><span class="text-muted">撮影開始：</span><span class="font-bold text-primary">${p.startTime}</span></div>
          <div><span class="text-muted">撮影終了（予定）：</span><span class="font-bold">${p.wrapTime}</span></div>
        </div>
      </div>

      <!-- Location -->
      ${mainLoc ? `
      <div class="bg-surface border border-border-col rounded-xl p-4 mb-4">
        <p class="section-header">本日のロケ地</p>
        <div class="space-y-2 text-xs">
          <div class="flex gap-2">
            <span class="text-muted shrink-0">場所：</span>
            <span class="font-bold text-primary">${mainLoc.name}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted shrink-0">住所：</span>
            <span>${mainLoc.address}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted shrink-0">駐車場：</span>
            <span>${mainLoc.parking}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted shrink-0">搬入：</span>
            <span>${mainLoc.loadIn}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted shrink-0">電源：</span>
            <span>${mainLoc.power}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted shrink-0">雨天：</span>
            <span>${mainLoc.rainAlt}</span>
          </div>
        </div>
      </div>` : ''}

      <!-- Cast Call Times -->
      <div class="bg-surface border border-border-col rounded-xl overflow-hidden mb-4">
        <p class="section-header px-4 pt-4 pb-0">キャスト集合時間</p>
        <table class="kanban-table mt-2">
          <thead><tr><th>氏名</th><th>役</th><th>集合時間</th></tr></thead>
          <tbody>
            ${cast.map(c => `<tr><td>${c.name}</td><td>${c.role}</td><td style="color:var(--primary); font-weight:700;">${c.callTime}</td></tr>`).join('')}
            ${cast.length === 0 ? '<tr><td colspan="3" style="text-align:center; color:var(--muted);">キャスト未登録</td></tr>' : ''}
          </tbody>
        </table>
      </div>

      <!-- Staff Call Times -->
      <div class="bg-surface border border-border-col rounded-xl overflow-hidden mb-4">
        <p class="section-header px-4 pt-4 pb-0">スタッフ集合時間</p>
        <table class="kanban-table mt-2">
          <thead><tr><th>氏名</th><th>役職</th><th>集合時間</th></tr></thead>
          <tbody>
            ${depts.map(deptGroup).join('')}
            ${staff.length === 0 ? '<tr><td colspan="3" style="text-align:center; color:var(--muted);">スタッフ未登録</td></tr>' : ''}
          </tbody>
        </table>
      </div>

      <!-- Today's Shots -->
      <div class="bg-surface border border-border-col rounded-xl overflow-hidden mb-4">
        <p class="section-header px-4 pt-4 pb-0">本日の撮影カット</p>
        <table class="kanban-table mt-2">
          <thead><tr><th>時刻</th><th>カット</th><th>内容</th><th>出演者</th><th>場所</th></tr></thead>
          <tbody>
            ${shots.filter(s => s.status !== 'completed').map(s => `
              <tr>
                <td class="font-display font-bold text-xs text-primary">${s.startTime}</td>
                <td class="font-display font-bold text-xs">${s.number}</td>
                <td><div class="font-bold text-xs">${s.title}</div><div style="font-size:10px;color:var(--muted)">${s.type}</div></td>
                <td class="text-xs">${(s.cast || []).join(', ') || '—'}</td>
                <td class="text-xs text-muted">${s.location}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <!-- Emergency Contacts -->
      <div class="bg-surface border border-border-col rounded-xl p-4 mb-4">
        <p class="section-header">緊急連絡先</p>
        <div class="grid grid-cols-2 gap-3">
          ${em.map(e => `
            <div class="flex justify-between items-center py-1">
              <span class="text-xs text-muted">${e.label}</span>
              <a href="tel:${e.number}" class="text-sm font-display font-bold text-primary">${e.number}</a>
            </div>`).join('')}
        </div>
        <!-- Editable emergency contacts -->
        <div id="cs-emergency-edit" class="mt-3 pt-3 border-t border-border-col/50 space-y-2">
          <input id="cs-em-label" class="field-input" type="text" placeholder="ラベル（例: ロケ担当）"/>
          <input id="cs-em-number" class="field-input" type="tel" placeholder="000-0000-0000"/>
          <button id="cs-em-add" class="w-full text-xs font-display font-bold text-primary border border-primary/30 rounded-lg py-2 hover:bg-primary/10 transition-colors">+ 緊急連絡先を追加</button>
        </div>
      </div>

      <p class="text-center text-[10px] text-muted font-display mt-4 tracking-widest">Production OS — CONFIDENTIAL</p>
    </div>
  </div>
</div>`;
};

window.initCallsheet = function () {
    document.getElementById('cs-print-btn')?.addEventListener('click', () => {
        window.Utils?.triggerHaptic('Light');
        window.print();
    });

    document.getElementById('cs-share-btn')?.addEventListener('click', () => {
        window.Utils?.triggerHaptic('Success');
        const mockUrl = `https://prodos.app/shared/${window.Utils?.uid() || 'demo'}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(mockUrl).then(() => {
                window.showToast('🔗 閲覧用URLをコピーしました！', 'success');
            }).catch(() => {
                window.showToast('🔗 ' + mockUrl, 'success');
            });
        } else {
            window.showToast('🔗 共有URL発行(β)に成功しました', 'success');
        }
    });

    document.getElementById('cs-em-add')?.addEventListener('click', () => {
        window.Utils?.triggerHaptic('Light');
        const label = document.getElementById('cs-em-label')?.value.trim();
        const number = document.getElementById('cs-em-number')?.value.trim();
        if (!label || !number) { window.showToast('ラベルと番号を入力してください', 'error'); return; }
        const list = [...Store.emergency, { label, number }];
        Store.setEmergency(list);
        window.showToast('✓ 緊急連絡先を追加しました', 'success');
        window.navigateTo('callsheet');
    });
};
