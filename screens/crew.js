/* =============================================================
   Crew Portal Screen V7 — スタッフ管理・並び替え・入り時間可視化
   ============================================================= */
window.renderCrew = function () {
  const crew = [...Store.crew].sort((a, b) => {
    const deptOrder = ['Direction', 'Camera', 'Electric', 'Audio', 'Art', 'HMU', 'Cast', 'Production', 'その他'];
    const ai = deptOrder.indexOf(a.dept); const bi = deptOrder.indexOf(b.dept);
    const deptCmp = (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    if (deptCmp !== 0) return deptCmp;
    return (a.callTime || '').localeCompare(b.callTime || '');
  });
  const depts = [...new Set(crew.map(c => c.dept))].sort((a, b) => {
    const order = ['Direction', 'Camera', 'Electric', 'Audio', 'Art', 'HMU', 'Cast', 'Production', 'その他'];
    return (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b));
  });

  // Build timeline rows sorted by callTime
  const timelineCrew = [...crew].sort((a, b) => (a.callTime || '00:00').localeCompare(b.callTime || '00:00'));
  const deptColors = {
    'Direction': '#E8A832', 'Camera': '#4F91FF', 'Electric': '#F7C948',
    'Audio': '#A78BFA', 'Art': '#34D399', 'HMU': '#F472B6',
    'Cast': '#EF4565', 'Production': '#60A5FA', 'その他': '#7A7670'
  };

  function crewCard(c) {
    const color = deptColors[c.dept] || '#7A7670';
    return `
      <div class="slide-up-enter crew-card" data-crew-id="${c.id}" draggable="true" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border);cursor:grab;transition:background .2s" onmouseenter="this.style.background='rgba(255,255,255,0.03)'" onmouseleave="this.style.background='transparent'">
        <span class="material-symbols-outlined" style="font-size:16px;color:var(--border2);cursor:grab;flex-shrink:0">drag_indicator</span>
        <div style="width:40px;height:40px;border-radius:50%;background:${color}22;border:2px solid ${color};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:var(--font-display);font-weight:900;font-size:14px;color:${color}">
          ${c.name.charAt(0)}
        </div>
        <div style="flex:1;min-width:0">
          <p style="font-family:var(--font-display);font-weight:700;font-size:14px;color:var(--text);margin-bottom:2px">${c.name}</p>
          <p style="font-size:11px;color:var(--muted)">${c.role}</p>
          ${c.phone ? `<a href="tel:${c.phone}" style="font-size:10px;color:var(--primary);display:flex;align-items:center;gap:3px;margin-top:2px"><span class="material-symbols-outlined" style="font-size:11px">phone</span>${c.phone}</a>` : ''}
        </div>
        <div style="text-align:right;flex-shrink:0">
          <p style="font-size:8px;color:var(--muted);margin-bottom:2px">集合</p>
          <p style="font-family:var(--font-display);font-weight:900;font-size:20px;color:${color};letter-spacing:-.02em;line-height:1">${c.callTime || '--:--'}</p>
          <span style="display:inline-block;margin-top:4px;background:${color}22;border:1px solid ${color}44;border-radius:4px;padding:2px 6px;font-size:9px;font-weight:700;color:${color};white-space:nowrap">${c.dept}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
          <button class="crew-edit-btn" data-crew-edit="${c.id}" style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--border);background:var(--bg);cursor:pointer;color:var(--muted);transition:all .2s">
            <span class="material-symbols-outlined" style="font-size:14px">edit</span>
          </button>
          <button class="crew-del-btn" data-crew-del="${c.id}" style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--border);background:var(--bg);cursor:pointer;color:var(--muted);transition:all .2s">
            <span class="material-symbols-outlined" style="font-size:14px">delete</span>
          </button>
        </div>
      </div>`;
  }

  // Timeline visualization
  const timelineHtml = timelineCrew.length > 0 ? `
      <div style="padding:16px;overflow-x:auto" class="hide-scrollbar">
        <p style="font-family:var(--font-display);font-size:10px;font-weight:700;letter-spacing:.1em;color:var(--muted);margin-bottom:12px">入り時間タイムライン</p>
        <div style="display:flex;flex-direction:column;gap:6px;min-width:0">
          ${timelineCrew.map(c => {
    const color = deptColors[c.dept] || '#7A7670';
    const [h, m] = (c.callTime || '09:00').split(':').map(Number);
    const startMin = 6 * 60; const totalMin = 20 * 60;
    const cur = h * 60 + m;
    const pct = Math.max(0, Math.min(100, ((cur - startMin) / totalMin) * 100));
    return `<div style="display:flex;align-items:center;gap:8px">
              <span style="font-family:var(--font-display);font-size:10px;font-weight:700;color:${color};width:36px;flex-shrink:0;text-align:right">${c.callTime || '--'}</span>
              <div style="flex:1;height:24px;border-radius:6px;background:var(--surface2);position:relative;overflow:hidden">
                <div style="position:absolute;left:${pct}%;top:0;height:100%;display:flex;align-items:center;transform:translateX(-50%)">
                  <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;border:2px solid var(--bg);box-shadow:0 0 8px ${color}80"></div>
                </div>
                <div style="position:absolute;left:0;top:0;height:100%;width:${pct}%;background:linear-gradient(90deg, ${color}11, ${color}22);border-right:2px solid ${color}44"></div>
              </div>
              <span style="font-size:10px;color:var(--text);font-family:var(--font-display);font-weight:600;width:70px;flex-shrink:0;truncate;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.name}</span>
            </div>`;
  }).join('')}
        </div>
      </div>` : '';

  const mainLoc = Store.locations.find(l => l.status === 'current');

  return `
<div id="screen-crew" class="screen fade-enter" style="flex-direction:column">
  <header class="safe-top" style="flex-shrink:0;display:flex;align-items:center;justify-content:space-between;background:var(--surface);border-bottom:1px solid var(--border);padding:14px 16px">
    <div>
      <h1 style="font-family:var(--font-display);font-weight:900;font-size:20px;color:var(--text);letter-spacing:-.02em">クルー</h1>
      <p style="color:var(--primary);font-size:10px;font-family:var(--font-display);font-weight:700">${crew.length} 名登録済み</p>
    </div>
    <div style="display:flex;gap:8px">
      <button id="crew-cs-btn" style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--muted);font-family:var(--font-display);font-weight:700;font-size:11px;cursor:pointer">
        <span class="material-symbols-outlined" style="font-size:14px">description</span>CS
      </button>
      <button id="crew-add-btn" style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:var(--primary);border:none;cursor:pointer">
        <span class="material-symbols-outlined" style="font-size:20px;color:var(--bg)">person_add</span>
      </button>
    </div>
  </header>

  <div class="hide-scrollbar" style="flex:1;overflow-y:auto;padding-bottom:90px">
    <!-- Today Info -->
    <div class="scale-in" style="margin:16px;background:linear-gradient(145deg, var(--surface2), var(--surface));border:1px solid var(--border2);border-radius:16px;padding:16px">
      <p style="font-family:var(--font-display);font-size:10px;font-weight:700;letter-spacing:.1em;color:var(--muted);margin-bottom:12px">本日の撮影情報</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
        <div style="background:var(--bg);border-radius:10px;padding:10px">
          <p style="font-size:9px;color:var(--muted);margin-bottom:4px">撮影日</p>
          <p style="font-family:var(--font-display);font-weight:700;font-size:13px;color:var(--text)">${Store.project.shootDate || '未設定'}</p>
          <p style="font-size:10px;color:var(--primary);margin-top:2px">${Store.project.shootDay || ''}</p>
        </div>
        <div style="background:var(--bg);border-radius:10px;padding:10px">
          <p style="font-size:9px;color:var(--muted);margin-bottom:4px">メインロケ</p>
          <p style="font-family:var(--font-display);font-weight:700;font-size:13px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${mainLoc?.name || '未設定'}</p>
          <p style="font-size:10px;color:var(--muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${mainLoc?.address || '住所未設定'}</p>
        </div>
        <div style="background:var(--bg);border-radius:10px;padding:10px">
          <p style="font-size:9px;color:var(--muted);margin-bottom:4px">撮影開始</p>
          <p style="font-family:var(--font-display);font-weight:900;font-size:18px;color:var(--primary)">${Store.project.startTime || '--:--'}</p>
        </div>
        <div style="background:var(--bg);border-radius:10px;padding:10px">
          <p style="font-size:9px;color:var(--muted);margin-bottom:4px">終了予定</p>
          <p style="font-family:var(--font-display);font-weight:900;font-size:18px;color:var(--text)">${Store.project.wrapTime || '--:--'}</p>
        </div>
      </div>
      ${mainLoc?.parking ? `<div style="background:var(--bg);border-radius:8px;padding:8px 12px;font-size:11px;color:var(--text)"><span style="color:var(--muted);font-size:10px">🚗 駐車場：</span>${mainLoc.parking}</div>` : ''}
    </div>

    <!-- Timeline Visualization -->
    ${timelineCrew.length > 0 ? `
    <div class="scale-in" style="margin:0 16px 16px;background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden">
      ${timelineHtml}
    </div>` : ''}

    <!-- Crew by Dept -->
    ${depts.length > 0 ? depts.map(dept => `
    <div style="margin:0 16px 16px">
      <p style="font-family:var(--font-display);font-size:10px;font-weight:700;letter-spacing:.12em;color:${deptColors[dept] || 'var(--muted)'};margin-bottom:8px;padding-left:4px">${dept.toUpperCase()}</p>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden" id="crew-dept-${dept.replace(/\s/g, '_')}">
        ${crew.filter(c => c.dept === dept).map((c, i) => crewCard(c)).join('')}
      </div>
    </div>`).join('') : `
    <div style="margin:32px 16px;text-align:center">
      <span class="material-symbols-outlined" style="font-size:48px;color:var(--border2);display:block;margin-bottom:12px">group_add</span>
      <p style="font-family:var(--font-display);font-weight:700;color:var(--muted);margin-bottom:4px">スタッフ未登録</p>
      <p style="font-size:12px;color:var(--border2)">「＋」ボタンから追加してください</p>
    </div>`}

    <!-- Emergency Contacts -->
    <div style="margin:0 16px 16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <p style="font-family:var(--font-display);font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--muted);padding-left:4px">緊急連絡先</p>
        <button id="em-add-btn" style="background:none;border:none;cursor:pointer;color:var(--primary);font-size:11px;display:flex;align-items:center;gap:4px">
          <span class="material-symbols-outlined" style="font-size:14px">add</span>追加
        </button>
      </div>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:4px 16px">
        ${Store.emergency.map((e, i) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);${i === Store.emergency.length - 1 ? 'border-bottom:none' : ''}">
          <span style="font-family:var(--font-display);font-weight:700;font-size:13px;color:var(--text)">${e.label}</span>
          <div style="display:flex;align-items:center;gap:8px">
            <a href="tel:${e.number}" style="font-family:var(--font-display);font-weight:700;font-size:13px;color:var(--primary);display:flex;align-items:center;gap:4px;text-decoration:none">
              <span class="material-symbols-outlined" style="font-size:14px">phone</span>${e.number}
            </a>
            ${i > 1 ? `<button class="em-del-btn" data-em-idx="${i}" style="background:none;border:none;cursor:pointer;color:var(--muted)"><span class="material-symbols-outlined" style="font-size:14px">delete</span></button>` : ''}
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Add/Edit Crew Modal -->
  <div id="crew-modal" class="modal-overlay">
    <div class="modal-sheet">
      <div class="modal-drag"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h3 id="crew-modal-title" style="margin-bottom:0">スタッフを追加</h3>
        <button id="crew-modal-close" style="background:none;border:none;cursor:pointer;color:var(--muted)"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <input type="hidden" id="crew-edit-id"/>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><label class="field-label">名前 *</label><input id="crew-name" class="field-input" type="text" placeholder="山田 花子"/></div>
          <div><label class="field-label">役職</label><input id="crew-role" class="field-input" type="text" placeholder="2nd AC"/></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <label class="field-label">部署</label>
            <select id="crew-dept" class="field-input">
              <option>Direction</option><option>Camera</option><option>Electric</option>
              <option>Audio</option><option>Art</option><option>HMU</option>
              <option>Cast</option><option>Production</option><option>その他</option>
            </select>
          </div>
          <div><label class="field-label">集合時間</label><input id="crew-calltime" class="field-input" type="time" value="09:00"/></div>
        </div>
        <div><label class="field-label">電話番号</label><input id="crew-phone" class="field-input" type="tel" placeholder="090-0000-0000"/></div>
        <button id="crew-save-btn" class="btn-primary">保存する</button>
        <button id="crew-delete-btn" style="display:none;width:100%;background:none;border:1.5px solid var(--accent);border-radius:12px;color:var(--accent);font-family:var(--font-display);font-weight:700;font-size:13px;padding:12px;cursor:pointer">このスタッフを削除</button>
      </div>
    </div>
  </div>

  <!-- Emergency Add Modal -->
  <div id="em-modal" class="modal-overlay">
    <div class="modal-sheet">
      <div class="modal-drag"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h3 style="margin-bottom:0">緊急連絡先を追加</h3>
        <button id="em-modal-close" style="background:none;border:none;cursor:pointer;color:var(--muted)"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div><label class="field-label">名称</label><input id="em-label" class="field-input" type="text" placeholder="病院、担当者名など"/></div>
        <div><label class="field-label">電話番号</label><input id="em-number" class="field-input" type="tel" placeholder="03-0000-0000"/></div>
        <button id="em-save-btn" class="btn-primary">追加する</button>
      </div>
    </div>
  </div>
</div>`;
};

window.initCrew = function () {
  document.getElementById('crew-cs-btn')?.addEventListener('click', () => window.navigateTo('callsheet'));
  document.getElementById('crew-add-btn')?.addEventListener('click', () => openCrewModal(null));

  // delete crew
  document.querySelectorAll('.crew-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('このスタッフを削除しますか？')) {
        Store.deleteCrew(btn.dataset.crewDel);
        window.showToast('スタッフを削除しました');
        window.navigateTo('crew');
      }
    });
  });

  // edit crew
  document.querySelectorAll('.crew-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = Store.crew.find(x => x.id === btn.dataset.crewEdit);
      if (c) openCrewModal(c);
    });
  });

  // emergency
  document.getElementById('em-add-btn')?.addEventListener('click', () => {
    document.getElementById('em-label').value = '';
    document.getElementById('em-number').value = '';
    document.getElementById('em-modal')?.classList.add('show');
  });
  document.getElementById('em-modal-close')?.addEventListener('click', () => document.getElementById('em-modal')?.classList.remove('show'));
  document.getElementById('em-save-btn')?.addEventListener('click', () => {
    const label = document.getElementById('em-label')?.value.trim();
    const number = document.getElementById('em-number')?.value.trim();
    if (!label || !number) { window.showToast('名称と電話番号を入力してください', 'error'); return; }
    Store.addEmergency({ label, number });
    document.getElementById('em-modal')?.classList.remove('show');
    window.navigateTo('crew');
  });
  document.getElementById('em-modal')?.addEventListener('click', e => { if (e.target.id === 'em-modal') e.target.classList.remove('show'); });

  document.querySelectorAll('.em-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      Store.deleteEmergency(parseInt(btn.dataset.emIdx));
      window.navigateTo('crew');
    });
  });

  // modal open/close
  const crewModal = document.getElementById('crew-modal');
  document.getElementById('crew-modal-close')?.addEventListener('click', () => crewModal?.classList.remove('show'));
  crewModal?.addEventListener('click', e => { if (e.target === crewModal) crewModal.classList.remove('show'); });

  // save
  document.getElementById('crew-save-btn')?.addEventListener('click', () => {
    const editId = document.getElementById('crew-edit-id')?.value;
    const data = {
      name: document.getElementById('crew-name')?.value.trim() || '',
      role: document.getElementById('crew-role')?.value.trim() || '',
      dept: document.getElementById('crew-dept')?.value || 'その他',
      callTime: document.getElementById('crew-calltime')?.value || '09:00',
      phone: document.getElementById('crew-phone')?.value.trim() || '',
    };
    if (!data.name) { window.showToast('名前を入力してください', 'error'); return; }
    if (editId) {
      Store.updateCrew(editId, data);
      window.showToast('✓ スタッフを更新しました', 'success');
    } else {
      Store.addCrew(data);
      window.showToast('✓ スタッフを追加しました', 'success');
    }
    crewModal?.classList.remove('show');
    window.navigateTo('crew');
  });

  // delete from modal
  document.getElementById('crew-delete-btn')?.addEventListener('click', () => {
    const editId = document.getElementById('crew-edit-id')?.value;
    if (editId && confirm('このスタッフを削除しますか？')) {
      Store.deleteCrew(editId);
      crewModal?.classList.remove('show');
      window.navigateTo('crew');
    }
  });
};

function openCrewModal(c) {
  const modal = document.getElementById('crew-modal');
  document.getElementById('crew-modal-title').textContent = c ? 'スタッフを編集' : 'スタッフを追加';
  document.getElementById('crew-edit-id').value = c?.id || '';
  document.getElementById('crew-name').value = c?.name || '';
  document.getElementById('crew-role').value = c?.role || '';
  document.getElementById('crew-calltime').value = c?.callTime || '09:00';
  document.getElementById('crew-phone').value = c?.phone || '';
  const deptEl = document.getElementById('crew-dept');
  if (deptEl && c?.dept) deptEl.value = c.dept;
  document.getElementById('crew-delete-btn').style.display = c ? 'block' : 'none';
  modal?.classList.add('show');
}
