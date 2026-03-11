/* =============================================================
   Projects Screen V4 — 案件リスト・ダッシュボード・複製機能
   ============================================================= */
window.renderProjects = function () {
    const projects = Store.allProjects;
    const current = Store.currentProjectId;

    function projectCard(prj) {
        const isCurrent = prj.id === current;

        // ダッシュボード情報の収集
        const savedCurrent = Store._data.currentProjectId;
        Store._data.currentProjectId = prj.id; // 一時切替
        const stats = Store.getStats();
        const budget = Store.budget;
        const spent = Store.getTotalSpent();
        const budgetPct = budget.total > 0 ? Math.round(spent / budget.total * 100) : 0;
        const crewCount = Store.crew.length;
        const locCount = Store.locations.length;
        Store._data.currentProjectId = savedCurrent; // 戻す

        const progressColor = stats.pct >= 100 ? 'var(--success)' : stats.pct > 0 ? 'var(--primary)' : 'var(--muted)';
        const budgetColor = budgetPct >= 90 ? 'var(--accent)' : budgetPct > 0 ? 'var(--primary)' : 'var(--muted)';

        return `
      <div class="project-card rounded-2xl overflow-hidden border ${isCurrent ? 'border-primary' : 'border-border'} ${isCurrent ? 'bg-primary-t' : 'bg-surface'} transition-all slide-up-enter"
           data-prj-id="${prj.id}" style="padding:18px; display:flex; flex-direction:column; gap:16px">
        
        <!-- Header: Title & Actions -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px">
          <div style="flex:1; min-width:0">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px">
              ${isCurrent ? '<span class="status-pill status-shooting">進行中</span>' : ''}
              <h3 class="font-display font-bold text-base truncate" style="${isCurrent ? 'color:var(--primary)' : 'color:var(--text)'}; letter-spacing:-0.02em; line-height:1.2">${prj.title}</h3>
            </div>
            <p style="font-family:var(--font-display); font-size:10px; font-weight:800; color:var(--muted); text-transform:uppercase; letter-spacing:0.08em; display:flex; align-items:center; gap:4px">
              <span class="material-symbols-outlined" style="font-size:12px">business</span>${prj.client || 'CLIENT 未設定'}
            </p>
          </div>
          <div style="display:flex; gap:6px; flex-shrink:0">
            ${isCurrent ? '' : `
            <button class="prj-switch-btn w-9 h-9 flex items-center justify-center rounded-xl border border-border btn-ghost" data-switch-id="${prj.id}" title="切り替え">
              <span class="material-symbols-outlined" style="font-size:18px">swap_horiz</span>
            </button>`}
            <button class="prj-dup-btn w-9 h-9 flex items-center justify-center rounded-xl border border-border btn-ghost" data-dup-id="${prj.id}" title="複製">
              <span class="material-symbols-outlined" style="font-size:18px">content_copy</span>
            </button>
            <button class="prj-edit-btn w-9 h-9 flex items-center justify-center rounded-xl border border-border btn-ghost" data-edit-id="${prj.id}" title="編集">
              <span class="material-symbols-outlined" style="font-size:18px">edit</span>
            </button>
            ${projects.length > 1 ? `
            <button class="prj-del-btn w-9 h-9 flex items-center justify-center rounded-xl border border-border btn-ghost" data-del-id="${prj.id}" title="削除">
              <span class="material-symbols-outlined" style="font-size:18px;color:var(--accent)">delete</span>
            </button>` : ''}
          </div>
        </div>

        <!-- Info Box (Date, Time, Stats) -->
        <div style="background:var(--surface2); border:1px solid var(--border2); border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:12px">
          <!-- Date & Time -->
          <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap">
            <div style="display:flex; align-items:center; gap:6px">
              <span class="material-symbols-outlined" style="font-size:16px; color:var(--primary)">calendar_today</span>
              <span style="font-family:var(--font-display); font-weight:700; font-size:13px; color:var(--text)">${prj.shootDate}</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px">
              <span class="material-symbols-outlined" style="font-size:16px; color:var(--primary)">schedule</span>
              <span style="font-family:var(--font-display); font-weight:700; font-size:13px; color:var(--text)">${prj.startTime || '08:00'} 開始</span>
            </div>
          </div>
          
          <div style="height:1px; background:var(--border); width:100%"></div>
          
          <!-- 4 Stats -->
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px">
            <div style="display:flex; flex-direction:column; gap:2px">
               <span style="font-size:9px; color:var(--muted); font-family:var(--font-display); font-weight:700; letter-spacing:0.04em">CUTS</span>
               <div style="display:flex; align-items:center; gap:3px">
                 <span class="material-symbols-outlined" style="font-size:14px; color:${progressColor}">movie</span>
                 <span style="font-family:var(--font-display); font-weight:800; font-size:13px; color:${progressColor}">${stats.done}/${stats.total}</span>
               </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:2px">
               <span style="font-size:9px; color:var(--muted); font-family:var(--font-display); font-weight:700; letter-spacing:0.04em">BUDGET</span>
               <div style="display:flex; align-items:center; gap:3px">
                 <span class="material-symbols-outlined" style="font-size:14px; color:${budgetColor}">account_balance_wallet</span>
                 <span style="font-family:var(--font-display); font-weight:800; font-size:13px; color:${budgetColor}">${budgetPct}%</span>
               </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:2px">
               <span style="font-size:9px; color:var(--muted); font-family:var(--font-display); font-weight:700; letter-spacing:0.04em">CREW</span>
               <div style="display:flex; align-items:center; gap:3px">
                 <span class="material-symbols-outlined" style="font-size:14px; color:var(--muted)">groups</span>
                 <span style="font-family:var(--font-display); font-weight:800; font-size:13px; color:var(--text)">${crewCount}</span>
               </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:2px">
               <span style="font-size:9px; color:var(--muted); font-family:var(--font-display); font-weight:700; letter-spacing:0.04em">LOC</span>
               <div style="display:flex; align-items:center; gap:3px">
                 <span class="material-symbols-outlined" style="font-size:14px; color:var(--muted)">location_on</span>
                 <span style="font-family:var(--font-display); font-weight:800; font-size:13px; color:var(--text)">${locCount}</span>
               </div>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        ${stats.total > 0 ? `
        <div style="display:flex; align-items:center; gap:10px">
          <div style="flex:1; height:6px; background:var(--border); border-radius:6px; overflow:hidden">
            <div style="height:100%; width:${stats.pct}%; background:${progressColor}; border-radius:6px; transition:width .6s"></div>
          </div>
          <span style="font-family:var(--font-display); font-size:11px; font-weight:800; color:${progressColor}">${stats.pct}%</span>
        </div>` : ''}

      </div>`;
    }

    return `
<div id="screen-projects" class="screen flex-col h-full" style="background:var(--bg)">
  <header class="safe-top" style="background:var(--bg);border-bottom:1px solid var(--border)" class="shrink-0 flex items-center justify-between px-4 py-3">
    <div>
      <h1 class="font-display font-bold text-lg" style="color:var(--text)">案件管理</h1>
      <p style="color:var(--muted);font-size:11px;font-family:var(--font-display)">${projects.length}件の案件</p>
    </div>
    <button id="prj-add-btn" class="flex items-center gap-1.5 px-3 py-2 rounded-lg" style="background:var(--primary);color:var(--bg);font-family:var(--font-display);font-weight:700;font-size:11px;border:none;cursor:pointer">
      <span class="material-symbols-outlined" style="font-size:16px">add</span>新規案件
    </button>
  </header>

  <div class="flex-1 overflow-y-auto p-4 space-y-3">
    ${projects.length > 0 
      ? projects.map(projectCard).join('') 
      : `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:300px;text-align:center;color:var(--muted);padding:40px 20px">
          <div style="width:64px;height:64px;border-radius:18px;background:var(--surface2);display:flex;align-items:center;justify-content:center;margin-bottom:16px">
            <span class="material-symbols-outlined" style="font-size:32px;color:var(--border2)">movie</span>
          </div>
          <h3 style="font-family:var(--font-display);font-weight:700;font-size:15px;color:var(--text);margin-bottom:8px">案件がありません</h3>
          <p style="font-size:12px;line-height:1.6;max-width:260px;margin:0 auto">右上の「新規案件」ボタンから新しいプロジェクトを作成して、進行管理を始めましょう。</p>
        </div>`
    }
  </div>
</div>`;
};

window.initProjects = function () {
    document.querySelectorAll('.prj-switch-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            Store.switchProject(btn.dataset.switchId);
            window.showToast('✓ 案件を切り替えました', 'success');
            window.navigateTo('timeline');
        });
    });

    document.querySelectorAll('.prj-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            Store.switchProject(btn.dataset.editId);
            window.navigateTo('project-edit');
        });
    });

    document.querySelectorAll('.prj-del-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('この案件を削除しますか？データは完全に削除されます。')) {
                const ok = Store.deleteProject(btn.dataset.delId);
                if (ok) { window.showToast('案件を削除しました'); window.navigateTo('projects'); }
                else window.showToast('最後の案件は削除できません', 'error');
            }
        });
    });

    // 複製ボタン
    document.querySelectorAll('.prj-dup-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const newId = Store.duplicateProject(btn.dataset.dupId);
            if (newId) {
                window.showToast('✓ 案件を複製しました', 'success');
                window.navigateTo('projects');
            } else {
                window.showToast('複製に失敗しました', 'error');
            }
        });
    });

    document.getElementById('prj-add-btn')?.addEventListener('click', () => {
        Store.addProject();
        window.showToast('✓ 新規案件を作成しました', 'success');
        window.navigateTo('project-edit');
    });
};
