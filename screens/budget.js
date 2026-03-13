/* =============================================================
   Budget Screen V8 — 全カテゴリ詳細常時展開・色分け円グラフ・レスポンシブ
   ============================================================= */
window.renderBudget = function () {
  const bud = Store.budget;
  const total = bud.total;
  const spent = Store.getTotalSpent();
  const rem = total - spent;
  const pct = total > 0 ? Math.round(spent / total * 100) : 0;

  // カテゴリ別カラー
  const catColors = ['#E8A832', '#4F91FF', '#EF4565', '#34D399', '#A78BFA', '#F472B6', '#F7C948', '#60A5FA', '#7A7670'];

  // 円グラフセグメント生成（カテゴリ別）
  function buildConicGradient() {
    const segments = [];
    let angle = 0;
    bud.categories.forEach((cat, i) => {
      const cs = Store.getCategoryTotal(cat.id);
      if (cs <= 0 || spent <= 0) return;
      const deg = (cs / spent) * 360;
      segments.push(`${catColors[i % catColors.length]} ${angle}deg ${angle + deg}deg`);
      angle += deg;
    });
    if (segments.length === 0) return 'conic-gradient(var(--border2) 0deg 360deg)';
    if (angle < 360) segments.push(`var(--border2) ${angle}deg 360deg`);
    return `conic-gradient(${segments.join(', ')})`;
  }

  // シンプル使用率円グラフ
  function buildSimplePie() {
    const color = pct >= 90 ? 'var(--accent)' : 'var(--primary)';
    return `conic-gradient(${color} ${Math.min(pct, 100)}%, var(--border2) ${Math.min(pct, 100)}%)`;
  }

  // カテゴリカードHTML（詳細は最初から全て表示）
  function catCard(cat, idx) {
    const cs = Store.getCategoryTotal(cat.id);
    const cp = cat.budget > 0 ? Math.round(cs / cat.budget * 100) : 0;
    const risk = cp >= 100;
    const warn = cp >= 80 && !risk;
    const exps = bud.expenses.filter(e => e.cat === cat.id);
    const color = catColors[idx % catColors.length];

    return `
      <div class="budget-cat-card slide-up-enter" style="background:var(--surface);border:1px solid ${risk ? 'var(--accent)' : warn ? color + '66' : 'var(--border)'};border-radius:16px;overflow:hidden;animation-delay:${idx * 0.04}s;margin-bottom:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15)">
        <!-- Header -->
        <div style="padding:16px;border-bottom:1px solid var(--border)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:36px;height:36px;border-radius:10px;background:${color}22;display:flex;align-items:center;justify-content:center">
                <span class="material-symbols-outlined" style="font-size:20px;color:${color}">${cat.icon}</span>
              </div>
              <div>
                <span style="font-family:var(--font-display);font-weight:700;font-size:15px;color:var(--text);display:block">${cat.label}</span>
                <span style="font-size:10px;color:var(--muted)">${exps.length} 件の支出</span>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              ${risk ? '<span style="background:var(--accent);color:var(--bg);font-size:9px;font-weight:800;padding:3px 8px;border-radius:6px">予算超過</span>' : warn ? `<span style="background:${color};color:var(--bg);font-size:9px;font-weight:800;padding:3px 8px;border-radius:6px">要注意</span>` : ''}
              <button class="cat-edit-btn no-print" data-cat-id="${cat.id}" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--border);background:var(--bg);cursor:pointer;color:var(--muted)">
                <span class="material-symbols-outlined" style="font-size:14px">edit</span>
              </button>
            </div>
          </div>
          <!-- Amount + Bar -->
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:6px">
            <span style="font-family:var(--font-display);font-weight:900;font-size:18px;color:${risk ? 'var(--accent)' : color};letter-spacing:-.02em">${Utils.fmtYen(cs)}</span>
            <span style="font-family:var(--font-display);font-size:11px;font-weight:700;color:var(--muted)">/ ${Utils.fmtYen(cat.budget)}</span>
          </div>
          <div class="chart-bar-bg">
            <div class="chart-bar-fill ${risk ? 'danger' : warn ? 'warning' : ''}" style="width:0%;background:${risk ? 'var(--accent)' : color}" data-target-width="${Math.min(cp, 100)}"></div>
          </div>
        </div>
        <!-- Expense Details (常に表示) -->
        <div style="padding:12px 16px;background:var(--bg);display:flex;flex-direction:column;gap:6px">
          ${exps.length === 0 ? '<div style="padding:16px;text-align:center;background:var(--surface2);border-radius:10px;border:1px dashed var(--border2)"><p style="font-size:12px;color:var(--muted)">このカテゴリの支出はまだありません</p></div>' :
        exps.map(e => `
            <div style="display:flex;justify-content:space-between;align-items:center;background:var(--surface);border:1px solid var(--border);border-left:3px solid ${color};border-radius:10px;padding:10px 14px">
              <div style="flex:1;min-width:0;margin-right:12px">
                <p style="font-size:13px;font-weight:700;color:var(--text);line-height:1.3;margin-bottom:2px">${e.label}</p>
                <div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--muted)">
                  <span class="material-symbols-outlined" style="font-size:11px">calendar_today</span>${e.date || '日付なし'}
                  ${e.note ? `<span style="opacity:.5">|</span>${e.note}` : ''}
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:10px;flex-shrink:0">
                <span style="font-family:var(--font-display);font-weight:900;font-size:15px;color:var(--text)">${Utils.fmtYen(e.amount)}</span>
                <button class="exp-del-btn no-print" data-exp-id="${e.id}" style="background:none;border:none;cursor:pointer;color:var(--muted);display:flex;align-items:center" title="削除">
                  <span class="material-symbols-outlined" style="font-size:16px">delete</span>
                </button>
              </div>
            </div>`).join('')}
          <button class="exp-add-cat-btn no-print" data-cat-id="${cat.id}" style="width:100%;margin-top:4px;padding:10px;border:1px dashed ${color};border-radius:10px;background:${color}11;color:${color};font-family:var(--font-display);font-weight:700;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px">
            <span class="material-symbols-outlined" style="font-size:15px">add_circle</span>経費を追加
          </button>
        </div>
      </div>`;
  }

  // カテゴリ凡例 + 内訳表示
  const legendHtml = bud.categories.map((c, i) => {
    const cs = Store.getCategoryTotal(c.id);
    const hasBreakdown = c.breakdown && c.breakdown.length > 0;
    return `
    <div style="display:flex;flex-direction:column;gap:4px">
      <div style="display:flex;align-items:center;gap:6px;font-size:11px">
        <div style="width:10px;height:10px;border-radius:3px;background:${catColors[i % catColors.length]};flex-shrink:0"></div>
        <span style="color:var(--muted);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.label}</span>
        <span style="font-family:var(--font-display);font-weight:700;color:var(--text)">${Utils.fmtYen(cs)}</span>
      </div>
      ${hasBreakdown ? `
      <div style="margin-left:16px;display:flex;flex-wrap:wrap;gap:4px">
        ${c.breakdown.map(b => `<span style="font-size:8px;background:var(--surface2);color:var(--muted);padding:1px 5px;border-radius:4px;border:1px solid var(--border2)">${b.label}: ${Utils.fmtYen(parseInt(b.amount))}</span>`).join('')}
      </div>` : ''}
    </div>`;
  }).join('');

  // 総予算の内訳サマリー
  const totalBreakdownHtml = (bud.totalBreakdown || []).map(b => `
    <div style="background:var(--bg);padding:6px 12px;border-radius:8px;border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:10px;color:var(--muted);font-weight:700">${b.label}</span>
      <span style="font-family:var(--font-display);font-size:11px;font-weight:900;color:var(--primary)">${Utils.fmtYen(parseInt(b.amount))}</span>
    </div>
  `).join('');

  return `
<div id="screen-budget" class="screen fade-enter" style="flex-direction:column;background:var(--bg)">
  <header class="safe-top" style="flex-shrink:0;display:flex;align-items:center;gap:16px;background:var(--bg);border-bottom:1px solid var(--border);padding:12px 16px">
    <button id="budget-back" class="back-btn">
      <span class="material-symbols-outlined">arrow_back</span>
    </button>
    <h1 style="font-family:var(--font-display);font-weight:900;font-size:20px;color:var(--text);letter-spacing:-.02em;flex:1">予算トラッカー</h1>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button id="budget-edit-total-btn" style="padding:6px 12px;border:1px solid var(--border);border-radius:8px;background:var(--surface2);cursor:pointer;color:var(--muted);font-family:var(--font-display);font-size:11px;font-weight:700">予算編集</button>
      <button id="budget-add-new-cat" style="padding:6px 12px;border:1px solid var(--primary);border-radius:8px;background:var(--primary-t);cursor:pointer;color:var(--primary);font-family:var(--font-display);font-size:11px;font-weight:700">カテゴリ追加</button>
    </div>
  </header>

  <div style="flex:1;overflow-y:auto;padding-bottom:90px" class="hide-scrollbar">
    <!-- Dashboard Summary -->
    <div class="scale-in" style="margin:16px;background:linear-gradient(145deg, var(--surface2), var(--surface));border:1px solid var(--border2);border-radius:20px;padding:20px;box-shadow:0 8px 24px rgba(0,0,0,0.3)">
      <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
        <!-- Pie Chart -->
        <div style="position:relative;flex-shrink:0">
          <div id="budget-pie-chart" data-pct="${Math.min(pct, 100)}" style="width:110px;height:110px;border-radius:50%;position:relative">
            <div id="pie-segment" style="position:absolute;inset:0;border-radius:50%;transition:background 1.2s"></div>
            <div style="position:absolute;inset:8px;border-radius:50%;background:var(--surface);display:flex;flex-direction:column;align-items:center;justify-content:center">
              <span id="pie-pct-text" style="font-family:var(--font-display);font-weight:900;font-size:22px;color:${pct >= 90 ? 'var(--accent)' : 'var(--text)'}"><span id="pie-pct-val">${pct}</span><span style="font-size:11px;color:var(--muted)">%</span></span>
              <span style="font-size:8px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:2px">Spent</span>
            </div>
          </div>
          <button id="pie-toggle-btn" style="position:absolute;bottom:-6px;right:-6px;width:28px;height:28px;border-radius:50%;background:var(--surface2);border:1px solid var(--border);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:11px" title="グラフ切替">
            <span class="material-symbols-outlined" style="font-size:16px">swap_horiz</span>
          </button>
        </div>

        <!-- Stats -->
        <div style="flex:1;min-width:180px">
          <p style="font-family:var(--font-display);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:6px">利用可能残高</p>
          <p style="font-family:var(--font-display);font-weight:900;font-size:28px;color:${pct >= 90 ? 'var(--accent)' : rem >= 0 ? 'var(--success)' : 'var(--accent)'};letter-spacing:-.02em;line-height:1;margin-bottom:14px">${Utils.fmtYen(rem)}</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
            <div style="display:flex;flex-direction:column;justify-content:center;background:var(--bg);padding:8px 12px;border-radius:10px;border:1px solid var(--border)">
              <span style="font-family:var(--font-display);font-size:9px;font-weight:700;color:var(--muted);margin-bottom:2px">総予算額</span>
              <span style="font-family:var(--font-display);font-size:12px;font-weight:900;color:var(--text)">${Utils.fmtYen(total)}</span>
            </div>
            <div style="display:flex;flex-direction:column;justify-content:center;background:var(--bg);padding:8px 12px;border-radius:10px;border:1px solid var(--border)">
              <span style="font-family:var(--font-display);font-size:9px;font-weight:700;color:var(--muted);margin-bottom:2px">支出合計</span>
              <span style="font-family:var(--font-display);font-size:12px;font-weight:900;color:${pct >= 90 ? 'var(--accent)' : 'var(--primary)'}">${Utils.fmtYen(spent)}</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px">
            ${totalBreakdownHtml}
          </div>
        </div>
      </div>
      <!-- Category Legend -->
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:6px">
        ${legendHtml}
      </div>
    </div>

    <!-- Category Cards (all details always visible) -->
    <div style="padding:0 16px;display:flex;flex-direction:column">
      <p style="font-family:var(--font-display);font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--muted);margin-bottom:12px;padding-left:4px">カテゴリー別内訳</p>
      ${bud.categories.map((c, i) => catCard(c, i)).join('')}
    </div>
  </div>

  <button id="budget-add-btn" class="fab no-print"><span class="material-symbols-outlined">add</span></button>

  <!-- Add Expense Modal -->
  <div id="budget-modal" class="modal-overlay">
    <div class="modal-sheet">
      <div class="modal-drag"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h3>経費を追加</h3>
        <button id="budget-modal-close" style="background:none;border:none;cursor:pointer;color:var(--muted)"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div><label class="field-label">カテゴリ</label>
          <select id="exp-cat" class="field-input">${bud.categories.map(c => `<option value="${c.id}">${c.label}</option>`).join('')}</select>
        </div>
        <div><label class="field-label">内容</label><input id="exp-label" class="field-input" type="text" placeholder="例: メイク用品追加購入"/></div>
        <div><label class="field-label">金額 (¥)</label><input id="exp-amount" class="field-input" type="number" placeholder="50000" min="0"/></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><label class="field-label">日付</label><input id="exp-date" class="field-input" type="date" value="${new Date().toISOString().slice(0, 10)}"/></div>
          <div><label class="field-label">メモ</label><input id="exp-note" class="field-input" type="text" placeholder="領収書#123"/></div>
        </div>
        <button id="budget-save-btn" class="btn-primary">経費を登録</button>
      </div>
    </div>
  </div>

  <!-- Edit Total Modal -->
  <div id="budget-total-modal" class="modal-overlay">
    <div class="modal-sheet">
      <div class="modal-drag"></div>
      <h3>総予算編集</h3>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div><label class="field-label">総予算プール (¥)</label><input id="total-budget-input" class="field-input" type="number" value="${total}" min="0"/></div>
        
        <div style="margin-top:10px">
          <label class="field-label" style="display:flex;justify-content:space-between;align-items:center">
            予算の内訳（どこからいくら）
            <button id="add-total-breakdown-btn" style="background:var(--primary-t);color:var(--primary);border:none;border-radius:4px;padding:2px 6px;font-size:9px;font-weight:800;cursor:pointer">+ 追加</button>
          </label>
          <div id="total-breakdown-container" style="display:flex;flex-direction:column;gap:8px;margin-top:8px;max-height:200px;overflow-y:auto">
            ${(bud.totalBreakdown || []).map((b, i) => `
              <div class="breakdown-row" style="display:grid;grid-template-columns:1fr 100px 30px;gap:8px;align-items:center">
                <input class="field-input b-label" style="padding:8px;font-size:12px" type="text" placeholder="例: クライアントA" value="${b.label}"/>
                <input class="field-input b-amount" style="padding:8px;font-size:11px" type="number" placeholder="金額" value="${b.amount}"/>
                <button class="b-del-btn" style="background:none;border:none;color:var(--muted);cursor:pointer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
              </div>
            `).join('')}
            ${(!bud.totalBreakdown || bud.totalBreakdown.length === 0) ? '<p class="text-muted" style="font-size:10px;text-align:center;padding:10px">内訳はまだ登録されていません</p>' : ''}
          </div>
        </div>

        <p style="font-size:11px;color:var(--muted);line-height:1.5;background:var(--surface2);padding:10px;border-radius:8px;margin-top:10px">※ 各カテゴリの予算額は、それぞれのカテゴリ右上の「編集」から変更してください。</p>
        <button id="budget-total-save-btn" class="btn-primary">保存する</button>
        <button id="budget-total-close" style="width:100%;background:none;border:1.5px solid var(--border2);border-radius:12px;color:var(--muted);font-family:var(--font-display);font-weight:700;font-size:13px;padding:12px;cursor:pointer">キャンセル</button>
      </div>
    </div>
  </div>

  <!-- Category Edit Modal -->
  <div id="cat-edit-modal" class="modal-overlay">
    <div class="modal-sheet">
      <div class="modal-drag"></div>
      <h3 id="cat-edit-modal-title">カテゴリ設定</h3>
      <div style="display:flex;flex-direction:column;gap:14px">
        <input type="hidden" id="cat-edit-id" />
        <div style="display:grid;grid-template-columns:80px 1fr;gap:12px">
          <div><label class="field-label">アイコン</label><input id="cat-edit-icon" class="field-input" type="text" placeholder="groups" /></div>
          <div><label class="field-label">カテゴリ名</label><input id="cat-edit-label" class="field-input" type="text" placeholder="美術費など" /></div>
        </div>
        <div><label class="field-label">予算割当 (¥)</label><input id="cat-edit-budget" class="field-input" type="number" min="0" placeholder="100000" /></div>
        
        <div style="border-top:1px solid var(--border);padding-top:14px">
          <label class="field-label" style="display:flex;justify-content:space-between;align-items:center">
            予算詳細（内訳）
            <button id="add-cat-breakdown-btn" style="background:var(--primary-t);color:var(--primary);border:none;border-radius:4px;padding:2px 6px;font-size:9px;font-weight:800;cursor:pointer">+ 詳細追加</button>
          </label>
          <div id="cat-breakdown-container" style="display:flex;flex-direction:column;gap:8px;margin-top:8px;max-height:160px;overflow-y:auto">
            <!-- Dynamic Category Breakdown Rows -->
          </div>
        </div>

        <button id="cat-edit-save" class="btn-primary" style="margin-top:10px">保存</button>
        <button id="cat-edit-del" style="width:100%;background:none;border:1.5px solid var(--accent);border-radius:12px;color:var(--accent);font-family:var(--font-display);font-weight:700;font-size:13px;padding:12px;cursor:pointer">このカテゴリを削除</button>
      </div>
    </div>
  </div>
</div>`;
};

window.initBudget = function () {
  document.getElementById('budget-back')?.addEventListener('click', () => window.navigateTo('manage'));

  const catColors = ['#E8A832', '#4F91FF', '#EF4565', '#34D399', '#A78BFA', '#F472B6', '#F7C948', '#60A5FA', '#7A7670'];

  function openModal(id) {
    const el = document.getElementById(id);
    if (el) { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; el.classList.add('show'); }
  }
  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; el.classList.remove('show'); }
  }

  // Pie chart animation + mode toggle
  let pieMode = 'category'; // 'category' or 'simple'
  function updatePie() {
    const segment = document.getElementById('pie-segment');
    if (!segment) return;
    const bud = Store.budget;
    const total = bud.total;
    const spent = Store.getTotalSpent();
    const pct = total > 0 ? Math.round(spent / total * 100) : 0;

    if (pieMode === 'category') {
      const segments = [];
      let angle = 0;
      bud.categories.forEach((cat, i) => {
        const cs = Store.getCategoryTotal(cat.id);
        if (cs <= 0 || spent <= 0) return;
        const deg = (cs / spent) * 360;
        segments.push(`${catColors[i % catColors.length]} ${angle}deg ${angle + deg}deg`);
        angle += deg;
      });
      if (segments.length === 0) { segment.style.background = 'conic-gradient(var(--border2) 0deg 360deg)'; return; }
      if (angle < 360) segments.push(`var(--border2) ${angle}deg 360deg`);
      segment.style.background = `conic-gradient(${segments.join(', ')})`;
    } else {
      const color = pct >= 90 ? 'var(--accent)' : 'var(--primary)';
      segment.style.background = `conic-gradient(${color} ${Math.min(pct, 100)}%, var(--border2) ${Math.min(pct, 100)}%)`;
    }
  }

  setTimeout(() => {
    updatePie();
    document.querySelectorAll('.chart-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.targetWidth + '%';
    });
  }, 100);

  document.getElementById('pie-toggle-btn')?.addEventListener('click', () => {
    pieMode = pieMode === 'category' ? 'simple' : 'category';
    updatePie();
    window.showToast(pieMode === 'category' ? 'カテゴリ別表示' : 'シンプル表示');
  });

  // Breakdown UI Helper
  function createBreakdownRow(label = '', amount = '') {
    const div = document.createElement('div');
    div.className = 'breakdown-row';
    div.style.display = 'grid';
    div.style.gridTemplateColumns = '1fr 100px 30px';
    div.style.gap = '8px';
    div.style.alignItems = 'center';
    div.innerHTML = `
      <input class="field-input b-label" style="padding:8px;font-size:12px" type="text" placeholder="項目名" value="${label}"/>
      <input class="field-input b-amount" style="padding:8px;font-size:11px" type="number" placeholder="金額" value="${amount}"/>
      <button class="b-del-btn" style="background:none;border:none;color:var(--muted);cursor:pointer"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
    `;
    div.querySelector('.b-del-btn').addEventListener('click', () => div.remove());
    return div;
  }

  // Edit / Add Category
  document.querySelectorAll('.cat-edit-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const cat = Store.budget.categories.find(c => c.id === btn.dataset.catId);
      if (!cat) return;
      document.getElementById('cat-edit-modal-title').textContent = 'カテゴリを編集';
      document.getElementById('cat-edit-id').value = cat.id;
      document.getElementById('cat-edit-label').value = cat.label;
      document.getElementById('cat-edit-budget').value = cat.budget;
      document.getElementById('cat-edit-icon').value = cat.icon || 'folder';
      document.getElementById('cat-edit-del').style.display = 'block';

      const container = document.getElementById('cat-breakdown-container');
      container.innerHTML = '';
      (cat.breakdown || []).forEach(b => container.appendChild(createBreakdownRow(b.label, b.amount)));
      if (!cat.breakdown || cat.breakdown.length === 0) container.innerHTML = '<p class="text-muted empty-msg" style="font-size:10px;text-align:center;padding:10px">内訳はまだ登録されていません</p>';

      openModal('cat-edit-modal');
    });
  });

  document.getElementById('add-cat-breakdown-btn')?.addEventListener('click', () => {
    const container = document.getElementById('cat-breakdown-container');
    const empty = container.querySelector('.empty-msg');
    if (empty) empty.remove();
    container.appendChild(createBreakdownRow());
  });

  document.getElementById('add-total-breakdown-btn')?.addEventListener('click', () => {
    const container = document.getElementById('total-breakdown-container');
    const empty = container.querySelector('p');
    if (empty && empty.textContent.includes('登録されていません')) empty.remove();
    container.appendChild(createBreakdownRow());
  });

  document.querySelectorAll('.b-del-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.breakdown-row').remove());
  });

  document.getElementById('budget-add-new-cat')?.addEventListener('click', () => {
    document.getElementById('cat-edit-modal-title').textContent = '新規カテゴリを追加';
    document.getElementById('cat-edit-id').value = '';
    document.getElementById('cat-edit-label').value = '';
    document.getElementById('cat-edit-budget').value = 0;
    document.getElementById('cat-edit-icon').value = 'folder';
    document.getElementById('cat-edit-del').style.display = 'none';
    document.getElementById('cat-breakdown-container').innerHTML = '<p class="text-muted empty-msg" style="font-size:10px;text-align:center;padding:10px">詳細項目を追加できます</p>';
    openModal('cat-edit-modal');
  });

  document.getElementById('cat-edit-save')?.addEventListener('click', () => {
    const id = document.getElementById('cat-edit-id')?.value;
    const label = document.getElementById('cat-edit-label')?.value.trim();
    const budget = parseInt(document.getElementById('cat-edit-budget')?.value) || 0;
    const icon = document.getElementById('cat-edit-icon')?.value.trim() || 'folder';
    
    // Collect breakdown
    const breakdown = [];
    document.querySelectorAll('#cat-breakdown-container .breakdown-row').forEach(row => {
      const l = row.querySelector('.b-label').value.trim();
      const a = row.querySelector('.b-amount').value;
      if (l) breakdown.push({ label: l, amount: a });
    });

    if (!label) { window.showToast('カテゴリ名を入力してください', 'error'); return; }
    if (id) {
      Store.updateBudgetCategory(id, { label, budget, icon, breakdown });
      window.showToast('✓ カテゴリを更新しました', 'success');
    } else {
      Store.addBudgetCategory({ label, budget, icon, breakdown });
      window.showToast('✓ 新規カテゴリを追加しました', 'success');
    }
    closeModal('cat-edit-modal');
    setTimeout(() => window.navigateTo('budget'), 150);
  });

  document.getElementById('cat-edit-del')?.addEventListener('click', () => {
    const id = document.getElementById('cat-edit-id')?.value;
    if (!id) return;
    if (confirm('このカテゴリと関連支出を全て削除しますか？')) {
      Store.deleteBudgetCategory(id);
      window.showToast('カテゴリを削除しました');
      closeModal('cat-edit-modal');
      setTimeout(() => window.navigateTo('budget'), 150);
    }
  });

  // Close modals on overlay click
  ['budget-modal', 'budget-total-modal', 'cat-edit-modal'].forEach(id => {
    const m = document.getElementById(id);
    m?.addEventListener('click', e => { if (e.target === m) closeModal(id); });
  });

  // Expense delete
  document.querySelectorAll('.exp-del-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (confirm('この支出を削除しますか？')) {
        Store.deleteExpense(btn.dataset.expId);
        window.showToast('支出を削除しました');
        window.navigateTo('budget');
      }
    });
  });

  // Category shortcut add
  document.querySelectorAll('.exp-add-cat-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      document.getElementById('exp-cat').value = btn.dataset.catId;
      document.getElementById('exp-label').value = '';
      document.getElementById('exp-amount').value = '';
      document.getElementById('exp-note').value = '';
      openModal('budget-modal');
    });
  });

  // Add Expense FAB + modal
  document.getElementById('budget-add-btn')?.addEventListener('click', () => openModal('budget-modal'));
  document.getElementById('budget-modal-close')?.addEventListener('click', () => closeModal('budget-modal'));

  document.getElementById('budget-save-btn')?.addEventListener('click', () => {
    const cat = document.getElementById('exp-cat')?.value;
    const label = document.getElementById('exp-label')?.value.trim();
    const amount = parseInt(document.getElementById('exp-amount')?.value) || 0;
    const date = document.getElementById('exp-date')?.value;
    const note = document.getElementById('exp-note')?.value.trim();
    if (!label || amount <= 0) { window.showToast('内容と金額(1以上)を入力してください', 'error'); return; }
    Store.addExpense({ cat, label, amount, date, note });
    window.showToast('✓ 経費を登録しました', 'success');
    closeModal('budget-modal');
    setTimeout(() => window.navigateTo('budget'), 150);
  });

  // Total edit
  document.getElementById('budget-edit-total-btn')?.addEventListener('click', () => openModal('budget-total-modal'));
  document.getElementById('budget-total-close')?.addEventListener('click', () => closeModal('budget-total-modal'));
  document.getElementById('budget-total-save-btn')?.addEventListener('click', () => {
    const total = parseInt(document.getElementById('total-budget-input')?.value) || 0;
    
    // Collect breakdown
    const breakdown = [];
    document.querySelectorAll('#total-breakdown-container .breakdown-row').forEach(row => {
      const l = row.querySelector('.b-label').value.trim();
      const a = row.querySelector('.b-amount').value;
      if (l) breakdown.push({ label: l, amount: a });
    });

    Store.updateBudgetTotal(total, breakdown);
    window.showToast('✓ 総予算を更新しました', 'success');
    closeModal('budget-total-modal');
    setTimeout(() => window.navigateTo('budget'), 150);
  });
};
