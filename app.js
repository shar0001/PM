/* =============================================================
   Production OS V8 — App Router & Boot
   ============================================================= */
(function () {
    'use strict';

    // Screen registry
    const SCREENS = {
        projects: { render: window.renderProjects, init: window.initProjects },
        'project-edit': { render: window.renderProjectEdit, init: window.initProjectEdit },
        timeline: { render: window.renderTimeline, init: window.initTimeline },
        shots: { render: window.renderShots, init: window.initShots },
        logistics: { render: window.renderLogistics, init: window.initLogistics },
        budget: { render: window.renderBudget, init: window.initBudget },
        kanban: { render: window.renderKanban, init: window.initKanban },
        crew: { render: window.renderCrew, init: window.initCrew },
        callsheet: { render: window.renderCallsheet, init: window.initCallsheet },
        live: { render: window.renderLive, init: window.initLive },
        manage: { render: window.renderManage, init: window.initManage },
        equipment: { render: window.renderEquipment, init: window.initEquipment },
    };

    // Screens that hide bottom nav
    const HIDE_NAV = new Set(['simulator', 'callsheet', 'project-edit']);

    let currentScreen = null;

    // ── Navigate ──────────────────────────────────────────
    window.navigateTo = function (screenId) {
        if (!SCREENS[screenId]) { console.warn('Unknown screen:', screenId); return; }

        const container = document.getElementById('screen-container');
        if (!container) return;

        // Render
        container.innerHTML = SCREENS[screenId].render();
        currentScreen = screenId;

        // Ensure .screen element is visible
        const screenEl = container.querySelector('.screen');
        if (screenEl) {
            screenEl.style.cssText += 'display:flex !important; flex-direction:column; height:100%; overflow:hidden;';
        }

        // Init interactions
        try { SCREENS[screenId].init?.(); } catch (e) { console.error('Screen init error:', e); }

        // Update nav
        updateNav(screenId);

        // Show/hide bottom nav
        const nav = document.getElementById('bottom-nav');
        if (nav) nav.style.display = HIDE_NAV.has(screenId) ? 'none' : 'flex';
    };

    // ── Update Bottom Nav ──────────────────────────────────
    const NAV_MAP = {
        live: 'live',
        timeline: 'timeline',
        manage: 'manage',
        shots: 'timeline',
        budget: 'manage',
        crew: 'manage',
        logistics: 'manage',
        equipment: 'manage',
        kanban: 'manage',
        callsheet: 'manage',
        projects: 'manage',
        'project-edit': 'manage'
    };

    function updateNav(screenId) {
        const activeKey = NAV_MAP[screenId] || screenId;
        document.querySelectorAll('.nav-btn').forEach(btn => {
            const isMore = activeKey === 'more' && btn.id === 'more-btn';
            btn.classList.toggle('active', (btn.dataset.screen === activeKey) || isMore);
        });
    }

    // ── Bottom nav clicks ──────────────────────────────────
    document.querySelectorAll('.nav-btn[data-screen]').forEach(btn => {
        btn.addEventListener('click', () => { closeDrawer(); window.navigateTo(btn.dataset.screen); });
    });

    // ── More button (drawer) ───────────────────────────────
    const overlay = document.getElementById('drawer-overlay');

    function openDrawer() {
        if (!overlay) return;
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
        overlay.classList.add('show');
    }
    function closeDrawer() {
        if (!overlay) return;
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        overlay.classList.remove('show');
    }

    document.getElementById('more-btn')?.addEventListener('click', () => {
        if (overlay?.classList.contains('show')) {
            closeDrawer();
        } else {
            openDrawer();
        }
    });

    overlay?.addEventListener('click', e => {
        if (e.target === overlay) closeDrawer();
    });

    document.querySelectorAll('.drawer-btn[data-screen]').forEach(btn => {
        btn.addEventListener('click', () => {
            closeDrawer();
            window.navigateTo(btn.dataset.screen);
        });
    });

    // ── Reset button ───────────────────────────────────────
    document.getElementById('reset-btn')?.addEventListener('click', () => {
        closeDrawer();
        if (confirm('すべての関連データをリセットしますか？\n（この操作は元に戻せません）')) {
            Store.reset();
            window.showToast('データを初期化しました');
            window.navigateTo('projects');
        }
    });

    // ── Export button ──────────────────────────────────────
    document.getElementById('export-btn')?.addEventListener('click', () => {
        closeDrawer();
        const data = Store.exportProject();
        if (!data) { window.showToast('エクスポートに失敗しました', 'error'); return; }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `POS_${(data.info.title || 'project').replace(/[^\w\u3000-\u9FFF]/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        window.showToast('✓ 案件データをエクスポートしました', 'success');
    });

    // ── Import button ─────────────────────────────────────
    const fileInput = document.getElementById('import-file-input');
    document.getElementById('import-btn')?.addEventListener('click', () => {
        fileInput?.click();
    });
    fileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target.result);
                if (!json.info || !json.shots) throw new Error('Invalid format');
                Store.importProject(json);
                closeDrawer();
                window.showToast('✓ 案件をインポートしました', 'success');
                window.navigateTo('projects');
            } catch (err) {
                window.showToast('JSONの読み込みに失敗しました', 'error');
                console.error('Import error:', err);
            }
        };
        reader.readAsText(file);
        fileInput.value = ''; // Reset for re-import
    });

    // ── Theme Toggle (Light / Dark) ───────────────────────
    function applyTheme(mode) {
        if (mode === 'light') {
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
        }
        const icon = document.getElementById('theme-icon');
        const label = document.getElementById('theme-label');
        if (icon) icon.textContent = mode === 'light' ? 'dark_mode' : 'light_mode';
        if (label) label.textContent = mode === 'light' ? 'ダークモード' : 'ライトモード';
        localStorage.setItem('pos_theme', mode);
    }

    // Load saved theme on boot
    const savedTheme = localStorage.getItem('pos_theme') || 'dark';
    applyTheme(savedTheme);

    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
        const current = document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        applyTheme(next);
        window.showToast(next === 'light' ? '☀️ ライトモードに切替' : '🌙 ダークモードに切替');
    });

    // ── Toast notification ─────────────────────────────────
    let toastTimer = null;
    const toastEl = document.createElement('div');
    toastEl.id = 'toast';
    document.body.appendChild(toastEl);

    window.showToast = function (msg, type = '') {
        toastEl.textContent = msg;
        toastEl.className = type ? `show ${type}` : 'show';
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toastEl.className = type || ''; }, 2500);
    };

    // ── Boot Splash ────────────────────────────────────────
    function boot() {
        const container = document.getElementById('screen-container');
        container.innerHTML = `
      <div style="display:flex; flex-direction:column; height:100%; align-items:center; justify-content:center; gap:24px; background:var(--bg);">
        <div style="text-align:center;">
          <div style="font-family:var(--font-display); font-weight:900; font-size:32px; color:var(--primary); letter-spacing:-.02em;">Production OS</div>
          <p style="color:var(--text-2); font-size:12px; font-family:var(--font-body); margin-top:4px;">映像制作 進行管理システム v8</p>
        </div>
        <div style="width:200px; height:4px; background:var(--border); border-radius:99px; overflow:hidden;">
          <div id="boot-bar" style="height:100%; background:var(--primary); border-radius:99px; width:0%; transition:width .4s ease;"></div>
        </div>
        <p id="boot-label" style="color:var(--muted); font-size:10px; font-family:var(--font-display); text-transform:uppercase; letter-spacing:.12em;">起動中...</p>
      </div>`;

        const bar = document.getElementById('boot-bar');
        const label = document.getElementById('boot-label');
        const steps = [
            [20, 'ワークスペースをロード中...'],
            [45, 'カットリストを同期中...'],
            [70, 'ロケーションデータを構築...'],
            [100, '準備完了'],
        ];
        let i = 0;
        function step() {
            if (i >= steps.length) { setTimeout(() => window.navigateTo('live'), 250); return; }
            const [pct, txt] = steps[i++];
            if (bar) bar.style.width = pct + '%';
            if (label) label.textContent = txt;
            setTimeout(step, 350);
        }
        step();
    }

    // ── Service Worker 登録 ─────────────────────────────────
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(r => console.log('SW registered:', r.scope))
            .catch(e => console.warn('SW registration failed:', e));
    }

    boot();
})();
