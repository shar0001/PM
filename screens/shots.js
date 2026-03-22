/* =============================================================
   Shot List Screen V3 — CRUD・完了トグル・改善されたモーダルUI
   ============================================================= */
window.renderShots = function () {
  const shots = Store.orderedShots;
  const done = shots.filter(s => s.status === 'completed').length;

  function shotItem(shot) {
    const isC = shot.status === 'completed', isS = shot.status === 'shooting', isP = shot.status === 'pending';
    const cast = (shot.cast || []).join(', ') || '—';
    const highlightClass = isS ? 'highlight-shooting' : isC ? 'highlight-completed' : isP ? 'highlight-pending' : '';
    const statusPillClass = isP ? 'status-pending' : isS ? 'status-shooting' : isC ? 'status-completed' : 'status-upcoming';
    const statusText = isP ? 'NG/保留' : isS ? '撮影中' : isC ? '完了' : '未撮影';
    
    return `
      <div class="shot-item ${highlightClass}" data-shot-id="${shot.id}" style="background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;transition:all 0.3s">
        <div style="padding:14px;display:flex;gap:10px;align-items:flex-start">
          <button class="complete-btn ${isC ? 'done' : ''}" data-complete-id="${shot.id}" title="${isC ? 'タップで元に戻す' : '完了にする'}">
            <span class="material-symbols-outlined" style="font-size:16px">${isC ? 'check' : 'radio_button_unchecked'}</span>
          </button>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
              <div>
                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:3px">
                  <span class="badge badge-${isS ? 'primary' : isP ? 'accent' : isC ? 'success' : 'muted'}">${shot.number}</span>
                  <span class="status-pill ${statusPillClass}">${statusText}</span>
                </div>
                <p style="font-family:var(--font-display);font-weight:700;font-size:14px;${isC ? 'text-decoration:line-through;color:var(--muted)' : ''}">${shot.title}</p>
              </div>
              <div style="display:flex;gap:4px;flex-shrink:0">
                <button class="shot-pending-btn" data-pending-id="${shot.id}" title="NG/保留にする" style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--border);background:none;cursor:pointer;color:${isP ? 'var(--accent)' : 'var(--muted)'}">
                  <span class="material-symbols-outlined" style="font-size:14px">warning</span>
                </button>
                <button class="shot-edit-btn" data-edit-id="${shot.id}" style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--border);background:none;cursor:pointer;color:var(--muted)">
                  <span class="material-symbols-outlined" style="font-size:14px">edit</span>
                </button>
                <button class="shot-del-btn" data-del-id="${shot.id}" style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--border);background:none;cursor:pointer;color:var(--muted)">
                  <span class="material-symbols-outlined" style="font-size:14px">delete</span>
                </button>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;margin-top:8px">
              <div style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--muted)"><span class="material-symbols-outlined" style="font-size:12px;color:var(--primary)">camera_roll</span>${shot.lens || '—'}</div>
              <div style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--muted);overflow:hidden"><span class="material-symbols-outlined" style="font-size:12px;color:var(--primary)">group</span><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${cast}</span></div>
              <div style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--muted);overflow:hidden"><span class="material-symbols-outlined" style="font-size:12px;color:var(--primary)">location_on</span><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${shot.location || '—'}</span></div>
              <button class="shot-inline-dur-btn no-print" data-shot-id="${shot.id}" style="display:flex;align-items:center;justify-content:flex-start;gap:4px;font-size:11px;color:var(--primary);font-weight:700;font-family:var(--font-display);background:var(--primary-t);border:1px solid transparent;border-radius:6px;padding:2px 6px;cursor:pointer;margin-left:-6px;transition:all .2s">
                <span class="material-symbols-outlined" style="font-size:12px">timer</span>${shot.duration}分
              </button>
            </div>
            ${shot.notes ? `<p style="font-size:10px;color:var(--primary);margin-top:5px">※ ${shot.notes}</p>` : ''}
            ${isC ? `<p style="font-size:10px;color:var(--success);margin-top:4px;display:flex;align-items:center;gap:3px"><span class="material-symbols-outlined" style="font-size:11px">verified</span>完了 ${shot.completedAt} · タップで取り消し</p>` : ''}
          </div>
        </div>
      </div>`;
  }

  return `
<div id="screen-shots" class="screen" style="flex-direction:column;background:var(--bg)">
  <header class="safe-top" style="flex-shrink:0;background:var(--bg);border-bottom:1px solid var(--border)">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px">
      <h1 style="font-family:var(--font-display);font-weight:700;font-size:20px;color:var(--text)">カット管理</h1>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:11px;color:var(--muted);font-family:var(--font-display)">${done}/${shots.length}完了</span>
        <button id="shots-search-toggle" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:10px;border:1px solid var(--border);background:none;cursor:pointer;color:var(--muted)">
          <span class="material-symbols-outlined" style="font-size:18px">search</span>
        </button>
      </div>
    </div>
    <div id="shots-search-bar" style="padding:0 16px 10px;display:none">
      <div style="display:flex;align-items:center;gap:8px;background:var(--surface2);border:1.5px solid var(--border2);border-radius:10px;padding:8px 12px">
        <span class="material-symbols-outlined" style="color:var(--muted);font-size:18px">search</span>
        <input id="shots-search-input" type="text" placeholder="タイトル・カット番号・キャストで検索..."
          style="flex:1;background:transparent;font-size:13px;color:var(--text);outline:none;border:none;font-family:var(--font-body)"/>
      </div>
    </div>
    <div style="display:flex;border-bottom:1px solid var(--border)">
      <button class="shots-tab" data-filter="all" style="flex:1;padding:10px 0;font-family:var(--font-display);font-weight:700;font-size:11px;border:none;border-bottom:2px solid var(--primary);color:var(--primary);background:none;cursor:pointer">全て (${shots.length})</button>
      <button class="shots-tab" data-filter="upcoming" style="flex:1;padding:10px 0;font-family:var(--font-display);font-weight:600;font-size:11px;border:none;border-bottom:2px solid transparent;color:var(--muted);background:none;cursor:pointer">未撮影 (${shots.filter(s => s.status !== 'completed').length})</button>
      <button class="shots-tab" data-filter="completed" style="flex:1;padding:10px 0;font-family:var(--font-display);font-weight:600;font-size:11px;border:none;border-bottom:2px solid transparent;color:var(--muted);background:none;cursor:pointer">完了 (${done})</button>
    </div>
  </header>

  <div id="shots-list" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;padding-bottom:90px">
    ${shots.map(shotItem).join('')}
  </div>

  <button id="shots-add-btn" class="fab no-print">
    <span class="material-symbols-outlined">add</span>
  </button>

  <!-- Modal -->
  <div id="shots-modal" class="modal-overlay">
    <div class="modal-sheet">
      <div class="modal-drag"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h3 id="shots-modal-title">カットを追加</h3>
        <button id="shots-modal-close" style="background:none;border:none;cursor:pointer;color:var(--muted)"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <input type="hidden" id="shot-edit-id"/>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><label class="field-label">カット番号</label><input id="shot-number" class="field-input" type="text" placeholder="C49"/></div>
          <div><label class="field-label">シーン</label><input id="shot-scene" class="field-input" type="number" placeholder="12" min="1"/></div>
        </div>
        <div><label class="field-label">タイトル</label><input id="shot-title" class="field-input" type="text" placeholder="佐藤のアップ"/></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><label class="field-label">ショットタイプ <span style="text-transform:none;opacity:0.6">(1 Tap)</span></label>
            <div class="chips-container" id="chips-type" data-target="shot-type"></div>
            <input type="hidden" id="shot-type"/>
          </div>
          <div><label class="field-label">所要時間 (分)</label><input id="shot-duration" class="field-input" type="number" placeholder="30" min="5" max="240"/></div>
        </div>
        <div><label class="field-label">レンズ <span style="text-transform:none;opacity:0.6">(1 Tap)</span></label>
          <div class="chips-container" id="chips-lens" data-target="shot-lens"></div>
          <input type="hidden" id="shot-lens"/>
        </div>
        <div><label class="field-label">出演者 <span style="text-transform:none;opacity:0.6">(Multi Tap)</span></label>
          <div class="chips-container" id="chips-cast" data-target="shot-cast"></div>
          <input type="hidden" id="shot-cast"/>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div style="grid-column: span 2"><label class="field-label">ロケ地 <span style="text-transform:none;opacity:0.6">(1 Tap)</span></label>
            <div class="chips-container" id="chips-loc" data-target="shot-location"></div>
            <input type="hidden" id="shot-location"/>
          </div>
          <div style="display:none;"><label class="field-label">現地の住所</label><input id="shot-loc-address" class="field-input" type="text" placeholder="住所不要"/></div>
        </div>
        <div><label class="field-label">メモ・注意事項</label><input id="shot-notes" class="field-input" type="text" placeholder="特記事項など"/></div>
        <button id="shots-save-btn" class="btn-primary" style="margin-top:8px">保存する</button>
      </div>
    </div>
  </div>
</div>`;
};

window.initShots = function () {
  // Tabs
  document.querySelectorAll('.shots-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.shots-tab').forEach(b => {
        b.style.borderBottomColor = 'transparent'; b.style.color = 'var(--muted)'; b.style.fontWeight = '600';
      });
      btn.style.borderBottomColor = 'var(--primary)'; btn.style.color = 'var(--primary)'; btn.style.fontWeight = '700';
      const f = btn.dataset.filter;
      document.querySelectorAll('.shot-item').forEach(el => {
        const s = Store.shots.find(x => x.id === el.dataset.shotId);
        if (!s) return;
        if (f === 'all') el.style.display = '';
        else if (f === 'completed') el.style.display = s.status === 'completed' ? '' : 'none';
        else el.style.display = s.status !== 'completed' ? '' : 'none';
      });
    });
  });

  // Search toggle
  document.getElementById('shots-search-toggle')?.addEventListener('click', () => {
    const bar = document.getElementById('shots-search-bar');
    if (bar) { bar.style.display = bar.style.display === 'none' ? 'block' : 'none'; if (bar.style.display === 'block') document.getElementById('shots-search-input')?.focus(); }
  });
  document.getElementById('shots-search-input')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.shot-item').forEach(el => {
      const s = Store.shots.find(x => x.id === el.dataset.shotId);
      if (!s) return;
      const m = s.title.toLowerCase().includes(q) || s.number.toLowerCase().includes(q) || (s.cast || []).some(c => c.toLowerCase().includes(q)) || (s.location || '').toLowerCase().includes(q);
      el.style.display = m ? '' : 'none';
    });
  });

  // Complete toggle
  document.querySelectorAll('[data-complete-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.Utils?.triggerHaptic('Light');
      const id = btn.dataset.completeId;
      const shot = Store.shots.find(s => s.id === id);
      const msg = shot?.status === 'completed' ? '撮影完了を取り消しました' : '✓ 撮影完了を記録しました';
      Store.completeShot(id);
      window.showToast(msg, shot?.status === 'completed' ? '' : 'success');
      window.navigateTo('shots');
    });
  });

  // Pending toggle
  document.querySelectorAll('[data-pending-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.Utils?.triggerHaptic('Heavy');
      const id = btn.dataset.pendingId;
      Store.markPending(id);
      window.showToast('❗ カットを NG/保留 にしました', 'error');
      window.navigateTo('shots');
    });
  });

  // Edit Shot Duration inline
  document.querySelectorAll('.shot-inline-dur-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const id = btn.dataset.shotId;
      const shot = Store.shots.find(s => s.id === id);
      if (!shot) return;
      const newDur = prompt(`「${shot.title}」の所要時間を入力 (分)`, shot.duration);
      if (newDur && !isNaN(parseInt(newDur, 10))) {
        shot.duration = parseInt(newDur, 10);
        Store.save();
        window.navigateTo('shots');
      }
    });
  });

  // Delete
  document.querySelectorAll('.shot-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('このカットを削除しますか？')) { Store.deleteShot(btn.dataset.delId); window.showToast('カットを削除しました'); window.navigateTo('shots'); }
    });
  });

  // Edit
  document.querySelectorAll('.shot-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => { 
      window.Utils?.triggerHaptic('Light');
      const s = Store.shots.find(x => x.id === btn.dataset.editId); 
      if (s) openShotModal(s); 
    });
  });

  // Modal events
  const modal = document.getElementById('shots-modal'), addBtn = document.getElementById('shots-add-btn'),
    closeBtn = document.getElementById('shots-modal-close'), saveBtn = document.getElementById('shots-save-btn');

  function closeShotsModal() {
    if (modal) {
      modal.style.opacity = '0';
      modal.style.pointerEvents = 'none';
      modal.classList.remove('show');
    }
  }

  addBtn?.addEventListener('click', () => {
    window.Utils?.triggerHaptic('Light');
    window.openShotModal(null);
  });
  closeBtn?.addEventListener('click', closeShotsModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeShotsModal(); });

  saveBtn?.addEventListener('click', () => {
    const editId = document.getElementById('shot-edit-id')?.value;
    const data = {
      number: document.getElementById('shot-number')?.value.trim() || '',
      scene: parseInt(document.getElementById('shot-scene')?.value) || 1,
      title: document.getElementById('shot-title')?.value.trim() || '無題カット',
      type: document.getElementById('shot-type')?.value || '',
      duration: parseInt(document.getElementById('shot-duration')?.value) || 30,
      lens: document.getElementById('shot-lens')?.value.trim() || '',
      cast: document.getElementById('shot-cast')?.value.split(',').map(s => s.trim()).filter(Boolean),
      location: document.getElementById('shot-location')?.value.trim() || '',
      props: document.getElementById('shot-props')?.value.split(',').map(s => s.trim()).filter(Boolean),
      notes: document.getElementById('shot-notes')?.value.trim() || '',
    };

    // V6: Auto-register location if not exists
    const address = document.getElementById('shot-loc-address')?.value.trim();
    if (data.location && !Store.locations.some(l => l.name === data.location)) {
      Store.addLocation({
        name: data.location,
        address: address || '',
        status: 'upcoming',
        callTime: '08:00', // Default
        lat: 35.6812, // Default Tokyo (needs geocoding strictly, using default fallback)
        lng: 139.7671,
        type: '外観',
        notes: data.title + ' の登録時に自動生成'
      });
      window.showToast('ロケ地 (' + data.location + ') を自動登録しました');
    }

    if (editId) { Store.updateShot(editId, data); window.Utils?.triggerHaptic('Success'); window.showToast('✓ カットを更新しました', 'success'); }
    else { Store.addShot(data); window.Utils?.triggerHaptic('Success'); window.showToast('✓ カットを追加しました', 'success'); }
    closeShotsModal();
    window.navigateTo('shots');
  });

  // Cross-screen edit request check
  if (window._editShotTarget) {
    const targetShot = Store.shots.find(x => x.id === window._editShotTarget);
    if (targetShot) {
      setTimeout(() => window.openShotModal(targetShot), 50);
    }
    window._editShotTarget = null;
  }
};

window.openShotModal = function (shot) {
  const modal = document.getElementById('shots-modal');
  const title = document.getElementById('shots-modal-title');
  if (title) title.textContent = shot ? 'カットを編集' : 'カットを追加';
  const f = { 'shot-edit-id': shot?.id || '', 'shot-number': shot?.number || '', 'shot-scene': shot?.scene || '', 'shot-title': shot?.title || '', 'shot-duration': shot?.duration || 30, 'shot-lens': shot?.lens || '', 'shot-cast': (shot?.cast || []).join(', '), 'shot-location': shot?.location || '', 'shot-loc-address': '', 'shot-props': (shot?.props || []).join(', '), 'shot-notes': shot?.notes || '' };

  // Try to prefill address if location exists
  if (shot?.location) {
    const locObj = Store.locations.find(l => l.name === shot.location);
    if (locObj && locObj.address) f['shot-loc-address'] = locObj.address;
  }

  Object.entries(f).forEach(([id, v]) => { const el = document.getElementById(id); if (el) el.value = v; });

  // 1-Tap Chips Binding Logic
  function bindChips(containerId, options, isMulti = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const targetInput = document.getElementById(container.dataset.target);
    const renderChips = () => {
      let currentVal = targetInput.value;
      let values = isMulti ? currentVal.split(',').map(s=>s.trim()).filter(Boolean) : [currentVal];
      
      container.innerHTML = options.map(opt => {
        const active = values.includes(opt);
        return `<button type="button" class="chip-btn ${active ? 'active' : ''}" data-val="${opt}">${opt}</button>`;
      }).join('');
      
      container.querySelectorAll('.chip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          window.Utils?.triggerHaptic('Light');
          const val = btn.dataset.val;
          if (isMulti) {
            if (values.includes(val)) values = values.filter(v => v !== val);
            else values.push(val);
            targetInput.value = values.join(', ');
          } else {
            targetInput.value = targetInput.value === val ? '' : val;
          }
          renderChips();
        });
      });
    };
    renderChips();
  }

  // Populate Master Data for Chips
  const typeOpts = ['Close-up', 'Wide Shot', 'OTS', 'Insert', 'Follow Shot', 'Long Shot', 'ドローン', 'その他'];
  const lensOpts = ['14-24mm', '24-70mm', '70-200mm', '35mm', '50mm', '85mm', 'Macro'];
  
  // Aggregate unique Cast names from crew or fallback
  let castOpts = Store.crew.filter(c => c.dept === 'Cast' || c.dept === '出演者').map(c => c.name);
  if (castOpts.length === 0) castOpts = ['主人公', 'ヒロイン', 'エキストラ']; // fallback
  
  // Aggregate unique Locations
  let locOpts = Store.locations.map(l => l.name);
  if (locOpts.length === 0) locOpts = ['スタジオ', '外観', 'ハウススタジオ', 'オフィス']; // fallback

  bindChips('chips-type', typeOpts, false);
  bindChips('chips-lens', lensOpts, false);
  bindChips('chips-cast', castOpts, true); // Multiple tap allowed
  bindChips('chips-loc', locOpts, false);

  if (modal) {
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
    modal.classList.add('show');
    window.Utils?.triggerHaptic('Light');
  }
};
