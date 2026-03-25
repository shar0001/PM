/* =============================================================
   Unified Management Hub V10.0 — Project Integrated
   ============================================================= */
window.renderManage = function () {
    const projects = Store.allProjects || [];
    const currentPrjId = Store.currentProjectId;

    // Premium Color Palette
    const colors = {
        project: '#6366F1',    // Indigo (More vibrant)
        crew: '#3B82F6',       // Blue
        performers: '#F43F5E', // Rose/Pink
        equipment: '#F97316',  // Orange
        budget: '#10B981',     // Emerald
        logistics: '#06B6D4',  // Cyan/Teal
        callsheet: '#64748B',  // Slate
        master: '#8B5CF6'      // Violet
    };

    function projectChip(p) {
        const isActive = p.id === currentPrjId;
        return `
        <div class="prj-chip shrink-0 snap-center transition-all ${isActive ? 'active scale-105 z-10' : 'opacity-40 scale-95'}" data-id="${p.id}">
            <div class="p-4 rounded-3xl border w-44 min-h-[120px] flex flex-col justify-between transition-all" 
                 style="background:${isActive ? `linear-gradient(135deg, ${colors.project}33 0%, ${colors.project}11 100%)` : 'var(--surface)'}; 
                        border-color:${isActive ? colors.project : 'var(--border)'};
                        box-shadow: ${isActive ? `0 10px 30px -10px ${colors.project}66` : 'none'};
                        border-width: ${isActive ? '2px' : '1px'}">
                <div class="flex justify-between items-start">
                    <span class="material-symbols-outlined text-lg" style="color:${isActive ? colors.project : 'var(--muted)'}">
                        ${isActive ? 'stars' : 'work_outline'}
                    </span>
                    <div class="flex gap-1">
                        ${isActive ? `<button class="manage-edit-prj p-1 -mr-1 text-primary hover:scale-110 transition-transform"><span class="material-symbols-outlined text-sm">edit_square</span></button>` : ''}
                        ${!isActive ? `<button class="manage-del-prj p-1 -mr-1 text-muted hover:text-accent transition-colors" data-id="${p.id}"><span class="material-symbols-outlined text-sm">delete</span></button>` : ''}
                    </div>
                </div>
                <div>
                   <h3 class="font-bold text-[11px] truncate leading-tight ${isActive ? 'text-text' : 'text-muted'}">${p.title || 'Untitled'}</h3>
                   <p class="text-[9px] ${isActive ? 'text-primary font-bold' : 'text-muted'}">${p.shootDate || 'No date'}</p>
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
    <div class="px-5 grid grid-cols-2 gap-6">
        
        <!-- Crew Management (BLUE) -->
        <button class="manage-tile" data-screen="crew" style="--tile-color: ${colors.crew}">
            <div class="tile-icon"><span class="material-symbols-outlined">group</span></div>
            <div class="tile-content">
                <span class="title">スタッフ協力</span>
                <span class="desc">名簿・入り時間</span>
            </div>
        </button>

        <!-- Performers (ROSE) -->
        <button class="manage-tile" data-screen="crew" data-mode="cast" style="--tile-color: ${colors.performers}">
            <div class="tile-icon"><span class="material-symbols-outlined">person_pin</span></div>
            <div class="tile-content">
                <span class="title">出演者・メイク</span>
                <span class="desc">支度・衣装管理</span>
            </div>
        </button>

        <!-- Equipment (ORANGE) -->
        <button class="manage-tile" data-screen="equipment" style="--tile-color: ${colors.equipment}">
            <div class="tile-icon"><span class="material-symbols-outlined">videocam</span></div>
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

        <!-- Master Data (VIOLET) -->
        <button class="manage-tile" id="open-master-modal" style="--tile-color: ${colors.master}">
            <div class="tile-icon"><span class="material-symbols-outlined">dataset</span></div>
            <div class="tile-content">
                <span class="title">選択肢の編集</span>
                <span class="desc">マスター項目</span>
            </div>
        </button>
    </div>

    <!-- ADDITIONAL TOOLS (Requirement: Prominent Settings) -->
    <div class="px-5 mt-10">
        <p class="text-[10px] font-display font-black text-muted uppercase tracking-widest mb-4">System Settings <span class="text-primary">•</span> システム設定</p>
        <div class="grid grid-cols-1 gap-3">
            <!-- Theme Toggle -->
            <button id="manage-theme-btn" class="w-full bg-surface border border-border rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98] transition-transform">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-bg border border-border flex items-center justify-center text-muted">
                        <span id="manage-theme-icon" class="material-symbols-outlined">light_mode</span>
                    </div>
                    <div>
                        <p class="text-[11px] font-bold text-text">表示テーマの切り替え</p>
                        <p id="manage-theme-label" class="text-[9px] text-muted">現在はダークモードです</p>
                    </div>
                </div>
                <span class="material-symbols-outlined text-muted text-sm italic">sync</span>
            </button>

            <!-- Export / Import Grid -->
            <div class="grid grid-cols-2 gap-3">
                <button id="manage-export-btn" class="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-3 active:scale-[0.98] transition-all">
                    <div class="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                        <span class="material-symbols-outlined">download</span>
                    </div>
                    <div>
                        <p class="text-[11px] font-bold text-text">バックアップ</p>
                        <p class="text-[9px] text-muted">案件を出力</p>
                    </div>
                </button>
                <button id="manage-import-btn" class="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-3 active:scale-[0.98] transition-all">
                    <div class="w-10 h-10 rounded-xl bg-accent/5 text-accent flex items-center justify-center">
                        <span class="material-symbols-outlined">upload</span>
                    </div>
                    <div>
                        <p class="text-[11px] font-bold text-text">復元・読込</p>
                        <p class="text-[9px] text-muted">データを入力</p>
                    </div>
                </button>
            </div>
        </div>
        
        <button id="manage-reset-btn" class="w-full mt-6 py-4 text-[10px] font-bold text-accent/40 hover:text-accent transition-colors">
            全てをリセット
        </button>
    </div>
  </div>

  <!-- Master Settings Modal -->
  <div id="master-modal" class="modal-overlay">
      <div class="modal-sheet !pb-8 !px-5" style="height: 85vh; display:flex; flex-direction:column;">
          <div class="modal-drag"></div>
          <div class="flex items-center justify-between mb-5 shrink-0">
              <div>
                  <h3 class="!mb-0">選択肢のカスタマイズ</h3>
                  <p class="text-[10px] text-muted font-display mt-1">Master Data Editor</p>
              </div>
              <button id="master-modal-close" class="btn-ghost !border-none !p-1 !text-muted"><span class="material-symbols-outlined">close</span></button>
          </div>
          
          <div class="flex-1 overflow-y-auto pb-10 flex flex-col gap-8 hide-scrollbar">
              <!-- Shot Types -->
              <div>
                 <h4 class="text-[12px] font-bold text-text mb-3 flex items-center gap-2"><span class="material-symbols-outlined text-[16px] text-primary">movie</span>ショットタイプ</h4>
                 <div class="flex flex-wrap gap-2 mb-3" id="master-chips-shotTypes"></div>
                 <div class="master-add-row">
                     <input type="text" id="master-input-shotTypes" class="field-input master-add-input" placeholder="新しいタイプ (例: POV)">
                     <button class="btn-primary master-add-btn" data-key="shotTypes">追加</button>
                 </div>
              </div>

              <!-- Lenses -->
              <div>
                 <h4 class="text-[12px] font-bold text-text mb-3 flex items-center gap-2"><span class="material-symbols-outlined text-[16px] text-primary">camera</span>レンズ</h4>
                 <div class="flex flex-wrap gap-2 mb-3" id="master-chips-lenses"></div>
                 <div class="master-add-row">
                     <input type="text" id="master-input-lenses" class="field-input master-add-input" placeholder="新しいレンズ (例: 100mm)">
                     <button class="btn-primary master-add-btn" data-key="lenses">追加</button>
                 </div>
              </div>

              <!-- Locations -->
              <div>
                 <h4 class="text-[12px] font-bold text-text mb-3 flex items-center gap-2"><span class="material-symbols-outlined text-[16px] text-primary">location_on</span>ロケ地種類</h4>
                 <div class="flex flex-wrap gap-2 mb-3" id="master-chips-locations"></div>
                 <div class="master-add-row">
                     <input type="text" id="master-input-locations" class="field-input master-add-input" placeholder="新しいカテゴリ (例: オフィス)">
                     <button class="btn-primary master-add-btn" data-key="locations">追加</button>
                 </div>
              </div>
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
                // 再描画
                window.navigateTo('manage');
            }
        });
    });

    // Edit current project
    document.querySelectorAll('.manage-edit-prj').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            window._prevScreen = 'manage';
            window.navigateTo('project-edit');
        });
    });

    // Delete project from chip
    document.querySelectorAll('.manage-del-prj').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (confirm('この制作案件を削除してもよろしいですか？')) {
                if (Store.deleteProject(id)) {
                    window.showToast('✓ 案件を削除しました', 'success');
                    window.navigateTo('manage');
                } else {
                    window.showToast('最後の1件は削除できません', 'error');
                }
            }
        });
    });

    // Navigation Tiles
    document.querySelectorAll('.manage-tile').forEach(tile => {
        tile.addEventListener('click', () => {
            const screen = tile.dataset.screen;
            const mode = tile.dataset.mode;
            // crew.js 側で mode: 'cast' を拾えるようにグローバルか Store に一時保存するなどの工夫が可能
            // ここではシンプルに遷移
            if (mode === 'cast') {
                // 将来的に crew.js 側でキャストタブをデフォルト表示するなどの処理を追加可能
                window.navigateTo('crew');
            } else {
                window.navigateTo(screen);
            }
        });
    });

    // New Project
    document.getElementById('manage-new-prj')?.addEventListener('click', () => {
        if (confirm('新しい制作プロジェクトを開始しますか？')) {
            const id = Store.addProject(); // Fix: newProject -> addProject
            Store.switchProject(id);
            window.navigateTo('project-edit');
        }
    });

    // Theme Toggle Integrated
    const themeBtn = document.getElementById('manage-theme-btn');
    const updateThemeUI = () => {
        const isLight = document.documentElement.classList.contains('light-mode');
        const icon = document.getElementById('manage-theme-icon');
        const label = document.getElementById('manage-theme-label');
        if (icon) icon.textContent = isLight ? 'dark_mode' : 'light_mode';
        if (label) label.textContent = isLight ? '現在はライトモードです' : '現在はダークモードです';
    };
    updateThemeUI();

    themeBtn?.addEventListener('click', () => {
        const toggleBtn = document.getElementById('theme-toggle-btn');
        if (toggleBtn) {
            toggleBtn.click(); // Trigger app.js logic
            updateThemeUI();
        }
    });

    // Integrated Export / Import
    document.getElementById('manage-export-btn')?.addEventListener('click', () => {
        document.getElementById('export-btn')?.click();
    });
    document.getElementById('manage-import-btn')?.addEventListener('click', () => {
        document.getElementById('import-btn')?.click();
    });

    // Reset
    document.getElementById('manage-reset-btn')?.addEventListener('click', () => {
        if (Object.keys(Store._data.projects).length > 1 || confirm('全データが削除されます。本当によろしいですか？')) {
            document.getElementById('reset-btn')?.click();
        }
    });

    // ── Master Settings Modal ──
    const masterModal = document.getElementById('master-modal');
    document.getElementById('open-master-modal')?.addEventListener('click', () => {
        if (masterModal) {
            masterModal.classList.add('show');
            masterModal.style.opacity = '1';
            masterModal.style.pointerEvents = 'auto';
            renderMasterChips();
        }
    });
    
    document.getElementById('master-modal-close')?.addEventListener('click', () => {
        if (masterModal) {
            masterModal.classList.remove('show');
            masterModal.style.opacity = '0';
            masterModal.style.pointerEvents = 'none';
        }
    });

    function renderMasterChips() {
        const md = Store.masterData;
        ['shotTypes', 'lenses', 'locations'].forEach(key => {
            const container = document.getElementById(`master-chips-${key}`);
            if (!container) return;
            container.innerHTML = md[key].map((item, index) => `
                <div class="flex items-center gap-2 bg-surface border border-border rounded-full pl-4 pr-1.5 py-1.5 shadow-sm">
                    <span class="text-[12px] text-text font-display">${item}</span>
                    <button class="master-del-btn bg-surface2 text-muted hover:text-bg hover:bg-accent w-6 h-6 flex items-center justify-center rounded-full transition-colors" data-key="${key}" data-idx="${index}">
                        <span class="material-symbols-outlined text-[14px]">close</span>
                    </button>
                </div>
            `).join('');
        });

        // Delete binds
        document.querySelectorAll('.master-del-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const key = btn.dataset.key;
                const idx = parseInt(btn.dataset.idx, 10);
                const list = [...Store.masterData[key]];
                list.splice(idx, 1);
                Store.setMasterData(key, list);
                renderMasterChips();
            });
        });
    }

    // Add binds
    document.querySelectorAll('.master-add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.key;
            const input = document.getElementById(`master-input-${key}`);
            const val = input?.value.trim();
            if (val) {
                const list = [...Store.masterData[key]];
                if (!list.includes(val)) {
                    list.push(val);
                    Store.setMasterData(key, list);
                    input.value = '';
                    renderMasterChips();
                    window.Utils?.triggerHaptic('Light');
                } else {
                    window.showToast('すでに登録されています', 'error');
                }
            }
        });
    });
};
