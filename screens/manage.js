/* =============================================================
   Unified Management Hub V9 — Project Integrated
   ============================================================= */
window.renderManage = function () {
    const projects = Store.allProjects || [];
    const currentPrjId = Store.currentProjectId;

    // Premium Color Palette
    const colors = {
        project: '#8B5CF6',    // Purple/Indigo
        crew: '#3B82F6',       // Blue
        performers: '#F43F5E', // Rose/Pink
        equipment: '#F97316',  // Orange
        budget: '#10B981',     // Emerald
        logistics: '#06B6D4',  // Cyan/Teal
        callsheet: '#64748B'   // Slate
    };

    function projectChip(p) {
        const isActive = p.id === currentPrjId;
        return `
        <div class="prj-chip shrink-0 snap-center transition-all ${isActive ? 'active shadow-lg' : 'opacity-40'}" data-id="${p.id}">
            <div class="p-4 rounded-3xl border w-40 min-h-[100px] flex flex-col justify-between" 
                 style="background:${isActive ? colors.project + '11' : 'var(--surface)'}; 
                        border-color:${isActive ? colors.project : 'var(--border)'}">
                <div class="flex justify-between items-start">
                    <span class="material-symbols-outlined text-lg" style="color:${isActive ? colors.project : 'var(--muted)'}">
                        ${isActive ? 'check_circle' : 'work_outline'}
                    </span>
                </div>
                <div>
                   <h3 class="font-bold text-xs truncate leading-tight">${p.info.title || 'Untitled'}</h3>
                   <p class="text-[9px] text-muted">${p.info.shootDate || 'No date'}</p>
                </div>
            </div>
        </div>`;
    }

    return `
<div id="screen-manage" class="screen flex-col h-full bg-bg">
  <header class="safe-top shrink-0 px-5 pt-4 pb-2">
    <h1 class="font-display font-bold text-2xl mb-1 text-text">管理ハブ</h1>
    <p class="text-muted text-[11px] font-display uppercase tracking-widest">Master Control Panel</p>
  </header>

  <div class="flex-1 overflow-y-auto pb-24">
    
    <!-- SECTION: PROJECT SELECTION -->
    <div class="mb-8">
        <div class="px-5 flex justify-between items-center mb-4">
            <p class="text-[10px] font-display font-black text-muted uppercase tracking-widest">Active Projects</p>
            <button id="manage-new-prj" class="text-[10px] font-bold text-primary flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">add_circle</span> 新規作成
            </button>
        </div>
        <div class="flex gap-3 px-5 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-2">
            ${projects.map(projectChip).join('')}
        </div>
    </div>

    <!-- MAIN GRID -->
    <div class="px-5 grid grid-cols-2 gap-4">
        
        <!-- Crew Management (BLUE) -->
        <button class="manage-tile" data-screen="crew" style="--tile-color: ${colors.crew}">
            <div class="tile-icon"><span class="material-symbols-outlined">group</span></div>
            <div class="tile-content">
                <span class="title">スタッフ協力</span>
                <span class="desc">名簿・入り時間</span>
            </div>
        </button>

        <!-- Performers (ROSE) -->
        <button class="manage-tile" data-screen="crew" style="--tile-color: ${colors.performers}">
            <div class="tile-icon"><span class="material-symbols-outlined">person_pin</span></div>
            <div class="tile-content">
                <span class="title">出演者・メイク</span>
                <span class="desc">支度・衣装管理</span>
            </div>
        </button>

        <!-- Equipment (ORANGE) -->
        <button class="manage-tile" data-screen="equipment" style="--tile-color: ${colors.equipment}">
            <div class="tile-icon"><span class="material-symbols-outlined">videocam_auto</span></div>
            <div class="tile-content">
                <span class="title">機材チェック</span>
                <span class="desc">搬入・撤収・電池</span>
            </div>
        </button>

        <!-- Budget (EMERALD) -->
        <button class="manage-tile" data-screen="budget" style="--tile-color: ${colors.budget}">
            <div class="tile-icon"><span class="material-symbols-outlined">payments</span></div>
            <div class="tile-content">
                <span class="title">予算・経費</span>
                <span class="desc">実費・残金管理</span>
            </div>
        </button>

        <!-- Logistics (CYAN) -->
        <button class="manage-tile" data-screen="logistics" style="--tile-color: ${colors.logistics}">
            <div class="tile-icon"><span class="material-symbols-outlined">cloud_sync</span></div>
            <div class="tile-content">
                <span class="title">ロケ地・天気</span>
                <span class="desc">地図・気象情報</span>
            </div>
        </button>

        <!-- Callsheet (SLATE) -->
        <button class="manage-tile" data-screen="callsheet" style="--tile-color: ${colors.callsheet}">
            <div class="tile-icon"><span class="material-symbols-outlined">description</span></div>
            <div class="tile-content">
                <span class="title">香盤表・PDF</span>
                <span class="desc">配布・印刷用</span>
            </div>
        </button>
    </div>

    <!-- ADDITIONAL TOOLS -->
    <div class="px-5 mt-10">
        <p class="text-[10px] font-display font-black text-muted uppercase tracking-widest mb-4">System Tools</p>
        <div class="flex flex-col gap-2">
            <button id="manage-settings-btn" class="w-full bg-surface border border-border rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98] transition-transform">
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-muted group-hover:text-primary transition-colors">settings</span>
                    <span class="text-[11px] font-bold text-text">アプリ設定・バックアップ</span>
                </div>
                <span class="material-symbols-outlined text-muted text-sm">arrow_forward_ios</span>
            </button>
        </div>
    </div>
  </div>
</div>`;
};

window.initManage = function () {
    // Project switcher
    document.querySelectorAll('.prj-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const id = chip.dataset.id;
            if (id !== Store.currentProjectId) {
                Store.switchProject(id);
                window.showToast(`✓ 「${Store.project.title}」に切り替えました`, 'success');
                window.navigateTo('manage');
            }
        });
    });

    // Navigation Tiles
    document.querySelectorAll('.manage-tile').forEach(tile => {
        tile.addEventListener('click', () => {
            window.navigateTo(tile.dataset.screen);
        });
    });

    // New Project
    document.getElementById('manage-new-prj')?.addEventListener('click', () => {
        if (confirm('新しい制作プロジェクトを開始しますか？')) {
            const id = Store.newProject({ title: 'New Production' });
            Store.switchProject(id);
            window.navigateTo('project-edit');
        }
    });

    // Settings
    document.getElementById('manage-settings-btn')?.addEventListener('click', () => {
        const overlay = document.getElementById('drawer-overlay');
        if (overlay) {
            overlay.classList.add('show');
        }
    });
};
