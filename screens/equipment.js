/* =============================================================
   Equipment Screen V2 — 機材CRUD・状態管理・紐付け
   ============================================================= */
window.renderEquipment = function () {
  const eq = Store.equipment;
  const depts = ['camera', 'lighting', 'grip', 'audio'];
  const deptLabel = { camera: 'カメラ', lighting: '照明', grip: 'グリップ', audio: '音響' };
  const deptIcon = { camera: 'videocam', lighting: 'lightbulb', grip: 'build', audio: 'mic' };

  function eqItem(item) {
    const isInUse = item.status === 'in-use';
    const battWarn = item.battery != null && item.battery < 20;
    const mediaWarn = item.media != null && item.media > 85;

    function resBar(val, icon, warn) {
      if (val == null) return '';
      const col = warn ? 'bg-accent' : 'bg-primary';
      const tc = warn ? 'text-accent' : 'text-primary';
      return `<div class="mt-2">
        <div class="flex justify-between text-[10px] mb-1 font-display">
          <span class="text-muted flex items-center gap-1"><span class="material-symbols-outlined text-[11px]">${icon}</span></span>
          <span class="${tc} font-bold">${val}%</span>
        </div>
        <div class="h-1 w-full bg-background-dark rounded-full overflow-hidden">
          <div class="${col} h-full shimmer-bar" style="width:${val}%"></div>
        </div>
      </div>`;
    }

    return `
      <div class="bg-surface border border-border-col rounded-lg p-4 eq-item" data-eq-id="${item.id}">
        <div class="flex justify-between items-start gap-2">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="status-pill status-${isInUse ? 'in-use' : 'standby'}">${isInUse ? '使用中' : 'スタンバイ'}</span>
            </div>
            <h3 class="font-display font-bold text-sm mt-0.5 leading-snug">${item.name}</h3>
            <p class="text-[10px] text-muted">${item.id} • S/N: ${item.serial}</p>
            <p class="text-[11px] text-text-main mt-1 flex items-center gap-1"><span class="material-symbols-outlined text-[12px] text-muted">location_on</span>${item.location}</p>
          </div>
          <div class="flex flex-col items-end gap-2 shrink-0">
            <div class="toggle-switch ${isInUse ? 'on' : ''}" data-toggle-id="${item.id}"><div class="toggle-knob"></div></div>
            <div class="flex gap-1">
              <button class="eq-edit-btn w-7 h-7 flex items-center justify-center rounded border border-border-col text-muted hover:text-primary hover:border-primary transition-colors text-[12px]" data-eq-edit="${item.id}">
                <span class="material-symbols-outlined" style="font-size:14px">edit</span>
              </button>
              <button class="eq-del-btn w-7 h-7 flex items-center justify-center rounded border border-border-col text-muted hover:text-accent hover:border-accent transition-colors" data-eq-del="${item.id}">
                <span class="material-symbols-outlined" style="font-size:14px">delete</span>
              </button>
            </div>
          </div>
        </div>
        ${battWarn || mediaWarn ? '<div class="mt-2 text-[10px] text-accent flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">warning</span>要注意</div>' : ''}
        ${resBar(item.battery, 'battery_5_bar', battWarn)}
        ${resBar(item.media, 'sd_card', mediaWarn)}
        ${item.notes ? `<p class="text-[10px] text-muted mt-2">※ ${item.notes}</p>` : ''}
      </div>`;
  }

  return `
<div id="screen-equipment" class="screen flex-col h-full">
  <header class="shrink-0 bg-background-dark border-b border-border-col">
    <div class="flex items-center justify-between px-4 py-3">
      <h1 class="font-display font-bold text-lg">機材管理</h1>
      <button id="eq-add-btn" class="w-9 h-9 flex items-center justify-center rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors">
        <span class="material-symbols-outlined text-base">add</span>
      </button>
    </div>
    <div id="eq-dept-tabs" class="flex border-b border-border-col overflow-x-auto hide-scrollbar">
      ${depts.map((d, i) => `
        <button class="eq-dept-tab flex flex-col items-center py-2.5 px-4 min-w-[80px] border-b-2 transition-colors ${i === 0 ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-text-main'}" data-dept="${d}">
          <span class="material-symbols-outlined text-lg mb-0.5 ${i === 0 ? 'text-primary' : ''}">${deptIcon[d]}</span>
          <span class="text-[10px] font-display font-bold">${deptLabel[d]}</span>
          <span class="text-[9px] text-muted">${eq.filter(e => e.category === d).length}点</span>
        </button>`).join('')}
    </div>
  </header>

  <div id="eq-content" class="flex-1 overflow-y-auto pb-4">
    ${depts.map((d, i) => `
      <section id="eq-dept-${d}" class="${i === 0 ? '' : 'hidden'} p-4 space-y-3">
        <p class="section-header">${deptLabel[d]} — ${eq.filter(e => e.category === d).length}点</p>
        ${eq.filter(e => e.category === d).length === 0
      ? '<p class="text-xs text-muted text-center py-8">機材が登録されていません</p>'
      : eq.filter(e => e.category === d).map(eqItem).join('')}
      </section>`).join('')}
  </div>

  <!-- Add/Edit Modal -->
  <div id="eq-modal" class="absolute inset-0 bg-background-dark/90 backdrop-blur-sm z-20 hidden flex-col justify-end">
    <div class="bg-surface border-t border-border-col rounded-t-2xl px-5 pt-5 pb-8 slide-up overflow-y-auto max-h-[80vh]">
      <div class="flex justify-between items-center mb-5">
        <h3 id="eq-modal-title" class="font-display font-bold text-lg">機材を追加</h3>
        <button id="eq-modal-close" class="text-muted hover:text-text-main"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div class="space-y-4">
        <input type="hidden" id="eq-edit-id"/>
        <div>
          <label class="field-label">機材名</label>
          <input id="eq-name" class="field-input" type="text" placeholder="ARRI Alexa Mini LF"/>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="field-label">カテゴリ</label>
            <select id="eq-category" class="field-input">
              ${Object.entries(deptLabel).map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="field-label">シリアル番号</label>
            <input id="eq-serial" class="field-input" type="text" placeholder="ABC-1234"/>
          </div>
        </div>
        <div>
          <label class="field-label">保管場所・現在位置</label>
          <input id="eq-location" class="field-input" type="text" placeholder="A-Cam Cart"/>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="field-label">バッテリー (%)</label>
            <input id="eq-battery" class="field-input" type="number" min="0" max="100" placeholder="—"/>
          </div>
          <div>
            <label class="field-label">メディア残量 (%)</label>
            <input id="eq-media" class="field-input" type="number" min="0" max="100" placeholder="—"/>
          </div>
        </div>
        <div>
          <label class="field-label">メモ</label>
          <input id="eq-notes" class="field-input" type="text" placeholder="注意事項など"/>
        </div>
        <button id="eq-save-btn" class="w-full bg-primary text-background-dark font-display font-bold py-3.5 rounded-xl uppercase tracking-widest text-sm hover:opacity-90 transition-opacity">保存</button>
      </div>
    </div>
  </div>
</div>`;
};

window.initEquipment = function () {
  // Dept tabs
  document.querySelectorAll('.eq-dept-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.eq-dept-tab').forEach(b => {
        b.classList.remove('border-primary', 'text-primary');
        b.classList.add('border-transparent', 'text-muted');
        b.querySelector('.material-symbols-outlined')?.classList.remove('text-primary');
      });
      btn.classList.add('border-primary', 'text-primary');
      btn.querySelector('.material-symbols-outlined')?.classList.add('text-primary');
      document.querySelectorAll('[id^="eq-dept-"]').forEach(s => s.classList.add('hidden'));
      document.getElementById(`eq-dept-${btn.dataset.dept}`)?.classList.remove('hidden');
    });
  });

  // Toggle status
  document.querySelectorAll('.toggle-switch').forEach(sw => {
    sw.addEventListener('click', () => {
      sw.classList.toggle('on');
      const newStatus = sw.classList.contains('on') ? 'in-use' : 'standby';
      Store.updateEquipment(sw.dataset.toggleId, { status: newStatus });
      // Update pill text without full re-render
      const pill = sw.closest('.eq-item')?.querySelector('.status-pill');
      if (pill) {
        pill.textContent = newStatus === 'in-use' ? '使用中' : 'スタンバイ';
        pill.className = `status-pill status-${newStatus}`;
      }
    });
  });

  // Delete
  document.querySelectorAll('.eq-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('この機材を削除しますか？')) {
        Store.deleteEquipment(btn.dataset.eqDel);
        window.showToast('機材を削除しました');
        window.navigateTo('equipment');
      }
    });
  });

  // Edit
  document.querySelectorAll('.eq-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = Store.equipment.find(e => e.id === btn.dataset.eqEdit);
      if (item) openEqModal(item);
    });
  });

  // Modal
  const modal = document.getElementById('eq-modal');
  const addBtn = document.getElementById('eq-add-btn');
  const closeBtn = document.getElementById('eq-modal-close');
  const saveBtn = document.getElementById('eq-save-btn');

  addBtn?.addEventListener('click', () => openEqModal(null));
  closeBtn?.addEventListener('click', () => modal?.classList.add('hidden'));
  modal?.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

  saveBtn?.addEventListener('click', () => {
    const editId = document.getElementById('eq-edit-id')?.value;
    const data = {
      name: document.getElementById('eq-name')?.value.trim() || '',
      category: document.getElementById('eq-category')?.value || 'camera',
      serial: document.getElementById('eq-serial')?.value.trim() || '',
      location: document.getElementById('eq-location')?.value.trim() || '',
      battery: document.getElementById('eq-battery')?.value !== '' ? parseInt(document.getElementById('eq-battery').value) : null,
      media: document.getElementById('eq-media')?.value !== '' ? parseInt(document.getElementById('eq-media').value) : null,
      notes: document.getElementById('eq-notes')?.value.trim() || '',
      status: 'standby',
    };
    if (!data.name) { window.showToast('機材名を入力してください', 'error'); return; }
    if (editId) { Store.updateEquipment(editId, data); window.showToast('✓ 機材を更新しました', 'success'); }
    else { Store.addEquipment(data); window.showToast('✓ 機材を追加しました', 'success'); }
    modal?.classList.add('hidden');
    window.navigateTo('equipment');
  });
};

function openEqModal(item) {
  const modal = document.getElementById('eq-modal');
  const title = document.getElementById('eq-modal-title');
  if (title) title.textContent = item ? '機材を編集' : '機材を追加';
  const fields = {
    'eq-edit-id': item?.id || '',
    'eq-name': item?.name || '',
    'eq-serial': item?.serial || '',
    'eq-location': item?.location || '',
    'eq-battery': item?.battery != null ? item.battery : '',
    'eq-media': item?.media != null ? item.media : '',
    'eq-notes': item?.notes || '',
  };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
  if (item?.category) { const sel = document.getElementById('eq-category'); if (sel) sel.value = item.category; }
  modal?.classList.remove('hidden');
}
