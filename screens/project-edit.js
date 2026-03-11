/* =============================================================
   Project Edit Screen V4 — 実務向け項目最適化＆アニメーション
   ============================================================= */
window.renderProjectEdit = function () {
  const p = Store.project;

  const field = (label, id, type = 'text', val = '', placeholder = '', extra = '') => `
    <div>
      <label class="field-label" for="${id}">${label}</label>
      <input id="${id}" class="field-input" type="${type}" value="${val}" placeholder="${placeholder}" ${extra}/>
    </div>`;

  const fieldArea = (label, id, val = '', placeholder = '') => `
    <div>
      <label class="field-label" for="${id}">${label}</label>
      <textarea id="${id}" class="field-input" placeholder="${placeholder}">${val}</textarea>
    </div>`;

  const fieldSelect = (label, id, options, val) => `
    <div>
      <label class="field-label" for="${id}">${label}</label>
      <select id="${id}" class="field-input">
        ${options.map(o => `<option value="${o.v}" ${o.v === val ? 'selected' : ''}>${o.l}</option>`).join('')}
      </select>
    </div>`;

  return `
<div id="screen-project-edit" class="screen flex-col h-full fade-enter" style="background:var(--bg)">
  <header style="background:var(--bg);border-bottom:1px solid var(--border);flex-shrink:0" class="flex items-center gap-2 px-4 py-3">
    <button id="pe-back-btn" class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface transition-colors" style="background:transparent;border:none;cursor:pointer;color:var(--text)">
      <span class="material-symbols-outlined">arrow_back</span>
    </button>
    <div>
      <h1 class="font-display font-bold text-lg" style="color:var(--text)">案件情報を編集</h1>
      <p style="color:var(--primary);font-family:var(--font-display);font-size:10px;text-transform:uppercase;letter-spacing:.08em">${p.prNumber || 'プロジェクト設定'}</p>
    </div>
    <button id="pe-save-btn" class="ml-auto px-4 py-2 rounded-lg font-display font-bold text-sm" style="background:var(--primary);color:var(--bg);border:none;cursor:pointer;transition:transform .2s">
      保存
    </button>
  </header>

  <div class="flex-1 overflow-y-auto pb-8">
    <!-- Project Identity -->
    <div class="m-4 p-5 rounded-2xl slide-up-enter" style="background:var(--surface);border:1px solid var(--border);animation-delay:0s">
      <p class="section-header">基本情報</p>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          ${field('案件番号 / Pr#', 'pe-prNumber', 'text', p.prNumber || '', 'PRJ-2024-001')}
          ${field('CM秒数', 'pe-cm_length', 'text', p.cm_length || '30s', '30s / 15s')}
        </div>
        ${field('案件タイトル', 'pe-title', 'text', p.title || '', '商品名 — CM 30s')}
        <div class="grid grid-cols-2 gap-3">
          ${field('クライアント', 'pe-client', 'text', p.client || '', 'APEX Motors')}
          ${field('代理店', 'pe-agency', 'text', p.agency || '', 'TBWA\\HAKUHODO')}
        </div>
        ${field('制作会社', 'pe-productionCo', 'text', p.productionCo || '', 'アンチグラビティ')}
      </div>
    </div>

    <!-- Staff -->
    <div class="mx-4 mb-4 p-5 rounded-2xl slide-up-enter" style="background:var(--surface);border:1px solid var(--border);animation-delay:0.05s">
      <p class="section-header">制作スタッフ</p>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          ${field('監督 (Director)', 'pe-director', 'text', p.director || '', '中村 清志')}
          ${field('プロデューサー', 'pe-producer', 'text', p.producer || '', '田中 美咲')}
        </div>
      </div>
    </div>

    <!-- Schedule -->
    <div class="mx-4 mb-4 p-5 rounded-2xl slide-up-enter" style="background:var(--surface);border:1px solid var(--border);animation-delay:0.1s">
      <p class="section-header">スケジュール</p>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          ${field('撮影日', 'pe-shootDate', 'date', p.shootDate || '', '')}
          ${field('撮影総日数', 'pe-shootDays', 'number', p.shootDays || 1, '1', 'min="1" max="30"')}
        </div>
        <div class="grid grid-cols-2 gap-3">
          ${field('撮影開始 (Call)', 'pe-startTime', 'time', p.startTime || '09:00', '')}
          ${field('終了予定 (Wrap)', 'pe-wrapTime', 'time', p.wrapTime || '20:00', '')}
        </div>
        ${field('本編集 (Online)', 'pe-deadline', 'date', p.deadline || '', '')}
      </div>
    </div>

    <!-- Technical / Delivery (V4 optimized) -->
    <div class="mx-4 mb-4 p-5 rounded-2xl slide-up-enter" style="background:var(--surface);border:1px solid var(--border);animation-delay:0.15s">
      <p class="section-header">納品仕様・テクニカル</p>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          ${fieldSelect('撮影フォーマット', 'pe-format', [
    { v: '4K / ARRI RAW', l: '4K / ARRI RAW' }, { v: '4K / ProRes 4444', l: '4K / ProRes 4444' },
    { v: '6K / BRAW', l: '6K / BRAW' }, { v: '8K / R3D', l: '8K / R3D' },
    { v: 'FHD / H.264', l: 'FHD / H.264' }, { v: 'その他', l: 'その他' },
  ], p.format || '4K / ARRI RAW')}
          ${fieldSelect('フレームレート', 'pe-fps', [
    { v: 23.976, l: '23.976fps' }, { v: 24, l: '24fps' }, { v: 25, l: '25fps' },
    { v: 29.97, l: '29.97fps' }, { v: 30, l: '30fps' }, { v: 60, l: '60fps' },
  ], p.fps || 24)}
        </div>
        <div class="grid grid-cols-2 gap-3">
          ${fieldSelect('納品データ形式', 'pe-deliveryFormat', [
    { v: 'ProRes 4444', l: 'ProRes 4444' }, { v: 'ProRes 422 HQ', l: 'ProRes 422 HQ' },
    { v: 'H.264 (MP4)', l: 'H.264 (MP4)' }, { v: 'H.265 (HEVC)', l: 'H.265 (HEVC)' },
    { v: 'DPX Sequence', l: 'DPX Sequence' }, { v: 'その他', l: 'その他' }
  ], p.deliveryFormat || 'ProRes 4444')}
          ${fieldSelect('アスペクト比', 'pe-aspectRatio', [
    { v: '16:9', l: '16:9 (Standard)' }, { v: '2.35:1', l: '2.35:1 (Cinema)' },
    { v: '2.39:1', l: '2.39:1 (Scope)' }, { v: '4:3', l: '4:3 (Traditional)' },
    { v: '1:1', l: '1:1 (Square)' }, { v: '9:16', l: '9:16 (Vertical)' }
  ], p.aspectRatio || '16:9')}
        </div>
        ${fieldSelect('カラー要件', 'pe-colorProfile', [
    { v: 'Rec.709', l: 'Rec.709' }, { v: 'LogC3', l: 'LogC3' }, { v: 'LogC4', l: 'LogC4' },
    { v: 'S-Log3', l: 'S-Log3' }, { v: 'V-Log', l: 'V-Log' }, { v: 'HDR (PQ)', l: 'HDR (PQ)' }
  ], p.colorProfile || 'Rec.709')}
      </div>
    </div>

    <!-- Others -->
    <div class="mx-4 mb-4 p-5 rounded-2xl slide-up-enter" style="background:var(--surface);border:1px solid var(--border);animation-delay:0.2s">
      <p class="section-header">その他・備考</p>
      <div class="space-y-3">
        ${fieldArea('自由に記入できる特記事項や案件メモ', 'pe-notes', p.notes || '', '注意事項、納品先アドレス、など...')}
      </div>
    </div>
  </div>
</div>`;
};

window.initProjectEdit = function () {
  const container = document.getElementById('screen-project-edit');

  document.getElementById('pe-back-btn')?.addEventListener('click', () => {
    container.classList.replace('fade-enter', 'fade-exit');
    setTimeout(() => {
      const prev = window._prevScreen || 'timeline';
      window.navigateTo(prev);
    }, 280);
  });

  document.getElementById('pe-save-btn')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => btn.style.transform = 'scale(1)', 150);

    const lat = parseFloat(document.getElementById('pe-lat')?.value) || 35.658;
    const lng = parseFloat(document.getElementById('pe-lng')?.value) || 139.701;
    const data = {
      prNumber: document.getElementById('pe-prNumber')?.value.trim() || '',
      cm_length: document.getElementById('pe-cm_length')?.value.trim() || '30s',
      title: document.getElementById('pe-title')?.value.trim() || '新規案件',
      client: document.getElementById('pe-client')?.value.trim() || '',
      agency: document.getElementById('pe-agency')?.value.trim() || '',
      productionCo: document.getElementById('pe-productionCo')?.value.trim() || '',
      director: document.getElementById('pe-director')?.value.trim() || '',
      producer: document.getElementById('pe-producer')?.value.trim() || '',
      shootDate: document.getElementById('pe-shootDate')?.value || '',
      shootDays: parseInt(document.getElementById('pe-shootDays')?.value) || 1,
      shootDay: document.getElementById('pe-shootDay')?.value.trim() || 'DAY 1 / 1',
      startTime: document.getElementById('pe-startTime')?.value || '09:00',
      wrapTime: document.getElementById('pe-wrapTime')?.value || '20:00',
      deadline: document.getElementById('pe-deadline')?.value || '',
      format: document.getElementById('pe-format')?.value || '4K',
      fps: parseFloat(document.getElementById('pe-fps')?.value) || 24,
      deliveryFormat: document.getElementById('pe-deliveryFormat')?.value || 'ProRes 4444',
      aspectRatio: document.getElementById('pe-aspectRatio')?.value || '16:9',
      colorProfile: document.getElementById('pe-colorProfile')?.value || 'Rec.709',
      notes: document.getElementById('pe-notes')?.value.trim() || ''
    };

    Store.setProject(data);
    window.showToast('✓ 案件情報を保存しました', 'success');

    container.classList.replace('fade-enter', 'fade-exit');
    setTimeout(() => {
      window.navigateTo('timeline');
    }, 280);
  });
};
