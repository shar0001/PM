/* =============================================================
   Timeline Screen V4 — スナップライン対応・アニメーション・完了トグル
   ============================================================= */
window.renderTimeline = function () {
  const shots = Store.orderedShots;
  const p = Store.project;
  const stats = Store.getStats();
  const delay = Utils.calcDelay(shots, p.startTime);
  const refLoc = Store.locations[0] || { lat: 35.6812, lng: 139.7671 };
  const sunset = Store.sunsetOverride || Utils.calcSunset(refLoc.lat, refLoc.lng, p.shootDate);
  const sunsetMin = Utils.timeToMin(sunset);
  const nowM = Utils.nowMin();
  const remMin = sunsetMin - nowM;
  const sunsetAlert = remMin < 90;

  const delayStr = delay === 0 ? '定刻' : Utils.fmtDiff(delay);
  const delayColor = delay > 0 ? 'var(--accent)' : delay < 0 ? 'var(--success)' : 'var(--muted)';

  const sunsetStr = remMin < 0 ? '日没済み'
    : remMin < 60 ? `残り${remMin}分`
      : `残り${Math.floor(remMin / 60)}時間${remMin % 60}分`;

  function shotCard(shot, idx) {
    const isCompleted = shot.status === 'completed';
    const isShooting = shot.status === 'shooting';
    const endMin = Utils.timeToMin(shot.startTime) + (shot.duration || 0);
    const isAfterSun = endMin > sunsetMin && !isCompleted;
    const castStr = (shot.cast || []).join(', ') || '—';

    let border = '1px solid var(--border)';
    let bg = 'var(--surface)';
    let opacity = '';
    if (isShooting) { border = '2px solid var(--primary)'; bg = 'var(--primary-t)'; }
    if (isCompleted) { opacity = 'opacity:.45'; }
    if (isAfterSun && !isCompleted) border = '1px solid var(--accent)';

    return `
      <div class="flex gap-3 items-start shot-card-tl slide-up-enter" style="animation-delay:${idx * 0.04}s" draggable="${!isCompleted}" data-shot-id="${shot.id}" data-shot-status="${shot.status}">
        <div style="width:44px;text-align:right;padding-top:6px;flex-shrink:0">
          <span style="font-family:var(--font-display);font-size:10px;font-weight:700;color:${isAfterSun ? 'var(--accent)' : 'var(--muted)'};transition:color .3s">${shot.startTime}</span>
        </div>
        <div class="shot-card-inner" style="border:${border};background:${bg};${opacity};border-radius:14px;padding:14px;flex:1;min-width:0;position:relative;transition:all .3s cubic-bezier(0.2,0.8,0.2,1)">
          ${isAfterSun ? '<span class="material-symbols-outlined" style="position:absolute;top:10px;right:10px;color:var(--accent);font-size:16px">wb_twilight</span>' : ''}
          <div style="display:flex;align-items:flex-start;gap:10px">
            ${!isCompleted ? '<span class="material-symbols-outlined drag-handle" style="color:var(--muted);font-size:18px;flex-shrink:0;margin-top:2px;cursor:grab">drag_indicator</span>' : ''}
            <button class="complete-btn ${isCompleted ? 'done' : ''} no-print" data-complete-id="${shot.id}" title="${isCompleted ? 'クリックで元に戻す' : '完了にする'}">
              <span class="material-symbols-outlined" style="font-size:16px">${isCompleted ? 'check' : 'radio_button_unchecked'}</span>
            </button>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px">
                <span class="badge badge-${isShooting ? 'primary' : isCompleted ? 'success' : 'muted'} transition-colors">${shot.number}</span>
                <span class="status-pill status-${shot.status} transition-colors">${isShooting ? '撮影中' : isCompleted ? '完了' : '未撮影'}</span>
                ${isShooting ? '<span style="font-family:var(--font-display);font-size:10px;font-weight:900;color:var(--primary)" class="animate-pulse">● REC</span>' : ''}
              </div>
              <p style="font-family:var(--font-display);font-weight:700;font-size:14px;${isCompleted ? 'text-decoration:line-through;color:var(--muted)' : ''};line-height:1.2;transition:color .3s">${shot.title}</p>
              <p style="font-size:11px;color:var(--muted);margin-top:4px">${shot.lens ? shot.lens + ' /' : ''} ${castStr} / ${shot.location}</p>
              ${shot.notes ? `<p style="font-size:10px;color:var(--primary);margin-top:3px">※ ${shot.notes}</p>` : ''}
              ${isCompleted ? `<p style="font-size:10px;color:var(--success);margin-top:3px;display:flex;align-items:center;gap:3px"><span class="material-symbols-outlined" style="font-size:12px">verified</span>完了 ${shot.completedAt} · タップで取り消し</p>` : ''}
              <div style="display:flex;gap:8px;margin-top:6px">
                <span style="font-size:10px;color:var(--muted);display:flex;align-items:center;gap:2px"><span class="material-symbols-outlined" style="font-size:11px">timer</span>${shot.duration}分</span>
                ${shot.scene ? `<span style="font-size:10px;color:var(--muted)">Scene ${shot.scene}</span>` : ''}
              </div>
            </div>
            <button class="tl-shot-edit-btn no-print" data-shot-id="${shot.id}" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--border);background:var(--bg);cursor:pointer;color:var(--muted);flex-shrink:0;transition:all .2s">
               <span class="material-symbols-outlined" style="font-size:14px">edit</span>
            </button>
          </div>
        </div>
      </div>`;
  }

  return `
<div id="screen-timeline" class="screen fade-enter" style="flex-direction:column;background:var(--bg)">
  <!-- Project banner -->
  <div style="background:var(--surface);border-bottom:1px solid var(--border);padding:10px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;z-index:2">
    <div style="min-width:0;flex:1">
      <p style="font-family:var(--font-display);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">${p.shootDay} · ${p.shootDate}</p>
      <p style="font-family:var(--font-display);font-weight:700;font-size:13px;color:var(--primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.title}</p>
    </div>
    <div style="display:flex;gap:6px;flex-shrink:0;margin-left:8px">
      <button onclick="document.getElementById('screen-timeline').classList.replace('fade-enter','fade-exit');setTimeout(()=>window.navigateTo('projects'),250)" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--border);background:var(--surface2);cursor:pointer;color:var(--muted);transition:all .2s">
        <span class="material-symbols-outlined" style="font-size:16px">folder</span>
      </button>
      <button onclick="window._prevScreen='timeline'; document.getElementById('screen-timeline').classList.replace('fade-enter','fade-exit');setTimeout(()=>window.navigateTo('project-edit'),250)" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--border);background:var(--surface2);cursor:pointer;color:var(--muted);transition:all .2s">
        <span class="material-symbols-outlined" style="font-size:16px">edit</span>
      </button>
    </div>
  </div>

  <!-- Header -->
  <header style="flex-shrink:0;background:var(--bg);border-bottom:1px solid var(--border);z-index:2">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px">
      <div>
        <p style="font-family:var(--font-display);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)">現在時刻</p>
        <p id="tl-clock" style="font-family:var(--font-display);font-weight:900;font-size:40px;color:var(--primary);line-height:1;letter-spacing:-.02em">${Utils.nowStr()}</p>
      </div>
      <div style="text-align:right">
        <div style="display:flex;gap:8px">
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:8px 12px;transition:all .3s">
            <p style="font-family:var(--font-display);font-size:9px;font-weight:700;text-transform:uppercase;color:var(--muted)">進行</p>
            <p style="font-family:var(--font-display);font-weight:700;font-size:15px;color:${delayColor}">${delayStr}${delay !== 0 ? (delay > 0 ? ' 押し' : ' 巻き') : ''}</p>
          </div>
          <button id="tl-goto-sim" style="background:${sunsetAlert ? 'var(--accent)' : 'var(--surface)'};border:1px solid ${sunsetAlert ? 'var(--accent)' : 'var(--border)'};border-radius:10px;padding:8px 12px;cursor:pointer;text-align:left;transition:all .3s">
            <p style="font-family:var(--font-display);font-size:9px;font-weight:700;text-transform:uppercase;color:${sunsetAlert ? 'rgba(255,255,255,.8)' : 'var(--muted)'};margin-bottom:1px">日没</p>
            <p style="font-family:var(--font-display);font-weight:700;font-size:13px;color:${sunsetAlert ? 'white' : 'var(--text)'}">${sunsetStr}</p>
          </button>
        </div>
      </div>
    </div>
    <!-- Progress -->
    <div style="padding:0 16px 12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-family:var(--font-display);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">撮影進捗</span>
        <span style="font-family:var(--font-display);font-size:10px;font-weight:700;color:var(--primary)">${stats.done}/${stats.total}カット (${stats.pct}%)</span>
      </div>
      <div class="prog-bar">
        <div class="prog-bar-fill" style="width:${stats.pct}%;transition:width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)"></div>
      </div>
    </div>
  </header>

  <!-- Timeline Body -->
  <main id="tl-body" class="timeline-grid hide-scrollbar" style="flex:1;overflow-y:auto;padding:16px;gap:12px;position:relative">
    ${shots.map((s, i) => shotCard(s, i)).join('')}
    <!-- Sunset marker -->
    <div class="slide-up-enter" style="display:flex;gap:12px;align-items:center;opacity:.7;animation-delay:${shots.length * 0.04}s">
      <div style="width:44px;text-align:right;flex-shrink:0">
        <span style="font-family:var(--font-display);font-size:10px;font-weight:700;color:var(--accent)">${sunset}</span>
      </div>
      <div style="flex:1;border:1.5px dashed var(--accent);border-radius:12px;padding:10px 14px;display:flex;align-items:center;gap:8px;color:var(--accent)">
        <span class="material-symbols-outlined" style="font-size:18px">wb_twilight</span>
        <span style="font-family:var(--font-display);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em">日没 — Magic Hour</span>
      </div>
    </div>
  </main>
</div>`;
};

window.initTimeline = function () {
  const clockEl = document.getElementById('tl-clock');
  let clockTimer;
  if (clockEl) clockTimer = setInterval(() => { if (document.getElementById('tl-clock')) document.getElementById('tl-clock').textContent = Utils.nowStr(); else clearInterval(clockTimer); }, 10000);

  document.getElementById('tl-goto-sim')?.addEventListener('click', () => {
    document.getElementById('screen-timeline').classList.replace('fade-enter', 'fade-exit');
    setTimeout(() => window.navigateTo('simulator'), 250);
  });

  // Complete toggle
  document.querySelectorAll('[data-complete-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.completeId;
      const shot = Store.shots.find(s => s.id === id);
      const msg = shot?.status === 'completed' ? '撮影完了を取り消しました' : '✓ 撮影完了を記録しました';
      const type = shot?.status === 'completed' ? '' : 'success';
      Store.completeShot(id);
      window.showToast(msg, type);
      // Fast re-render without exit animation
      window.navigateTo('timeline');
    });
  });

  // Cross-screen Edit action
  document.querySelectorAll('.tl-shot-edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window._editShotTarget = btn.dataset.shotId;
      window.navigateTo('shots');
    });
  });

  // Drag reorder with snap line
  const body = document.getElementById('tl-body');
  if (!body) return;
  let dragId = null;
  let currentDropTarget = null;

  function clearSnapLines() {
    body.querySelectorAll('.shot-card-inner').forEach(el => {
      el.classList.remove('drag-snap-line', 'drag-snap-line-bottom');
    });
  }

  body.querySelectorAll('[draggable="true"]').forEach(card => {
    const inner = card.querySelector('.shot-card-inner');
    const handle = card.querySelector('.drag-handle');

    // Allow dragging only from handle
    card.addEventListener('dragstart', e => {
      dragId = card.dataset.shotId;
      setTimeout(() => { card.style.opacity = '.4'; card.style.transform = 'scale(0.98)'; }, 0);
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', window._onDragEnd = () => {
      card.style.opacity = ''; card.style.transform = '';
      clearSnapLines();
      dragId = null;
    });

    card.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (!dragId || dragId === card.dataset.shotId) return;

      clearSnapLines();
      const rect = card.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const isBottom = e.clientY > mid;

      if (isBottom) {
        inner.classList.add('drag-snap-line-bottom');
      } else {
        inner.classList.add('drag-snap-line');
      }
      currentDropTarget = { id: card.dataset.shotId, isBottom };
    });

    card.addEventListener('dragleave', e => {
      inner.classList.remove('drag-snap-line', 'drag-snap-line-bottom');
    });

    card.addEventListener('drop', e => {
      e.preventDefault();
      clearSnapLines();
      if (!dragId || !currentDropTarget) return;

      const targetId = currentDropTarget.id;
      if (dragId === targetId) return;

      const order = [...Store.shotOrder];
      const fromIdx = order.indexOf(dragId);
      let toIdx = order.indexOf(targetId);

      if (fromIdx < 0 || toIdx < 0) return;

      // Remove from original
      order.splice(fromIdx, 1);

      // Re-calculate toIdx because array shifted
      toIdx = order.indexOf(targetId);

      // Insert at new position
      if (currentDropTarget.isBottom) {
        order.splice(toIdx + 1, 0, dragId);
      } else {
        order.splice(toIdx, 0, dragId);
      }

      Store.reorderShots(order);
      window.showToast('順序を変更しました', 'success');
      window.navigateTo('timeline');
    });
  });
};
