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
      <div class="project-card rounded-xl overflow-hidden border ${isCurrent ? 'border-primary' : 'border-border'} ${isCurrent ? 'bg-primary-t' : 'bg-surface'} transition-all slide-up-enter"
           data-prj-id="${prj.id}">
        <div class="p-4 flex items-start gap-3">
          <div class="w-10 h-10 rounded-lg ${isCurrent ? 'bg-primary' : 'bg-surface2'} flex items-center justify-center shrink-0 mt-0.5">
            <span class="material-symbols-outlined text-xl ${isCurrent ? 'text-bg' : 'text-muted'}" style="${isCurrent ? 'color:var(--bg)' : ''}">movie</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              ${isCurrent ? '<span class="status-pill status-shooting">進行中</span>' : ''}
              <h3 class="font-display font-bold text-sm truncate" style="${isCurrent ? 'color:var(--primary)' : ''}">${prj.title}</h3>
            </div>
            <p class="text-xs" style="color:var(--muted)">${prj.client || '—'}</p>
            <p class="text-xs" style="color:var(--muted)">${prj.shootDate}</p>
            <!-- Dashboard Stats -->
            <div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap">
              <div style="display:flex;align-items:center;gap:4px">
                <span class="material-symbols-outlined" style="font-size:13px;color:${progressColor}">movie</span>
                <span style="font-family:var(--font-display);font-size:11px;font-weight:700;color:${progressColor}">${stats.done}/${stats.total}</span>
                <span style="font-size:10px;color:var(--muted)">カット</span>
              </div>
              <div style="display:flex;align-items:center;gap:4px">
                <span class="material-symbols-outlined" style="font-size:13px;color:${budgetColor}">account_balance_wallet</span>
                <span style="font-family:var(--font-display);font-size:11px;font-weight:700;color:${budgetColor}">${budgetPct}%</span>
                <span style="font-size:10px;color:var(--muted)">予算</span>
              </div>
              <div style="display:flex;align-items:center;gap:4px">
                <span class="material-symbols-outlined" style="font-size:13px;color:var(--muted)">groups</span>
                <span style="font-family:var(--font-display);font-size:11px;font-weight:700;color:var(--text)">${crewCount}</span>
                <span style="font-size:10px;color:var(--muted)">名</span>
              </div>
              <div style="display:flex;align-items:center;gap:4px">
                <span class="material-symbols-outlined" style="font-size:13px;color:var(--muted)">location_on</span>
                <span style="font-family:var(--font-display);font-size:11px;font-weight:700;color:var(--text)">${locCount}</span>
                <span style="font-size:10px;color:var(--muted)">箇所</span>
              </div>
            </div>
            <!-- Progress Bar -->
            ${stats.total > 0 ? `<div style="margin-top:6px;height:4px;background:var(--border);border-radius:4px;overflow:hidden">
              <div style="height:100%;width:${stats.pct}%;background:${progressColor};border-radius:4px;transition:width .6s"></div>
            </div>` : ''}
          </div>
          <div class="flex gap-1.5 shrink-0">
            ${isCurrent ? '' : `
            <button class="prj-switch-btn w-8 h-8 flex items-center justify-center rounded-lg border border-border btn-ghost" data-switch-id="${prj.id}" title="切り替え">
              <span class="material-symbols-outlined" style="font-size:16px">swap_horiz</span>
            </button>`}
            <button class="prj-dup-btn w-8 h-8 flex items-center justify-center rounded-lg border border-border btn-ghost" data-dup-id="${prj.id}" title="複製">
              <span class="material-symbols-outlined" style="font-size:16px">content_copy</span>
            </button>
            <button class="prj-edit-btn w-8 h-8 flex items-center justify-center rounded-lg border border-border btn-ghost" data-edit-id="${prj.id}" title="編集">
              <span class="material-symbols-outlined" style="font-size:16px">edit</span>
            </button>
            ${projects.length > 1 ? `
            <button class="prj-del-btn w-8 h-8 flex items-center justify-center rounded-lg border border-border btn-ghost" data-del-id="${prj.id}" title="削除">
              <span class="material-symbols-outlined" style="font-size:16px;color:var(--accent)">delete</span>
            </button>` : ''}
          </div>
        </div>
      </div>`;
    }

    return `
<div id="screen-projects" class="screen flex-col h-full" style="background:var(--bg)">
  <header style="background:var(--bg);border-bottom:1px solid var(--border)" class="shrink-0 flex items-center justify-between px-4 py-3">
    <div>
      <h1 class="font-display font-bold text-lg" style="color:var(--text)">案件管理</h1>
      <p style="color:var(--muted);font-size:11px;font-family:var(--font-display)">${projects.length}件の案件</p>
    </div>
    <button id="prj-add-btn" class="flex items-center gap-1.5 px-3 py-2 rounded-lg" style="background:var(--primary);color:var(--bg);font-family:var(--font-display);font-weight:700;font-size:11px;border:none;cursor:pointer">
      <span class="material-symbols-outlined" style="font-size:16px">add</span>新規案件
    </button>
  </header>

  <div class="flex-1 overflow-y-auto p-4 space-y-3">
    ${projects.map(projectCard).join('')}
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
