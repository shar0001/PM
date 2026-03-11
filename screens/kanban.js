/* =============================================================
   AI Kanban Generator Screen V2
   ============================================================= */
window.renderKanban = function () {
    const kanban = Store.kanban;

    function blockRow(b) {
        if (b.type === 'travel') {
            return `<tr class="travel-row">
        <td colspan="5" class="text-muted italic py-2">
          <span class="material-symbols-outlined text-[11px] align-middle">directions_car</span>
          ${b.label} (${Utils.minToTime(b.startMin)} → ${Utils.minToTime(b.endMin)})
        </td>
      </tr>`;
        }
        if (b.type === 'break') {
            return `<tr style="background:rgba(113,113,122,.08)">
        <td colspan="5" class="text-muted text-center py-2 font-display font-bold uppercase text-[10px] tracking-wider">
          ─── ${b.label} ───
        </td>
      </tr>`;
        }
        const s = b.shot;
        return `<tr>
      <td class="font-display font-bold text-xs text-primary">${b.startTime}</td>
      <td class="font-display font-bold text-xs">${s.number}</td>
      <td>
        <div class="font-bold text-xs">${s.title}</div>
        <div class="text-[10px] text-muted">${s.type} / ${s.lens || '—'}</div>
      </td>
      <td class="text-xs">${(s.cast || []).join(', ') || '—'}</td>
      <td class="text-xs text-muted">${s.duration}分<br>${s.location}</td>
    </tr>`;
    }

    return `
<div id="screen-kanban" class="screen flex-col h-full">
  <header class="safe-top shrink-0 flex items-center justify-between bg-background-dark border-b border-border-col px-4 py-3">
    <div>
      <h1 class="font-display font-bold text-lg">AI 香盤ジェネレーター</h1>
      <p class="text-muted text-[10px] font-display">${Store.project.title}</p>
    </div>
    ${kanban ? `
    <button id="kanban-print-btn" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-background-dark text-[11px] font-display font-bold hover:opacity-90 transition-opacity">
      <span class="material-symbols-outlined text-sm">print</span>PDF出力
    </button>` : ''}
  </header>

  <div class="flex-1 overflow-y-auto pb-4">
    ${!kanban ? `
    <!-- Generation Form -->
    <div class="p-4 space-y-5">
      <div class="bg-surface border border-border-col rounded-xl p-5 space-y-1">
        <div class="flex items-center gap-2 mb-3">
          <span class="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
          <div>
            <h2 class="font-display font-bold text-base">スケジュールを自動生成</h2>
            <p class="text-xs text-muted">Shot Listのデータから最適な撮影順を自動生成します</p>
          </div>
        </div>
        <div class="bg-background-dark border border-border-col rounded-lg p-4 space-y-2 text-xs text-muted">
          <div class="flex justify-between"><span>未撮影カット数</span><span class="text-text-main font-bold">${Store.orderedShots.filter(s => s.status !== 'completed').length}カット</span></div>
          <div class="flex justify-between"><span>撮影開始予定</span><span class="text-text-main font-bold">${Store.project.startTime}</span></div>
          <div class="flex justify-between"><span>ロケーション数</span><span class="text-text-main font-bold">${[...new Set(Store.shots.map(s => s.location).filter(Boolean))].length}箇所</span></div>
        </div>
      </div>

      <div class="space-y-3">
        <p class="section-header">生成設定</p>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="field-label">撮影開始時刻</label>
            <input id="kanban-start" class="field-input" type="time" value="${Store.project.startTime}"/>
          </div>
          <div>
            <label class="field-label">平均移動時間 (分)</label>
            <input id="kanban-travel" class="field-input" type="number" value="30" min="0" max="120"/>
          </div>
        </div>
        <div>
          <label class="field-label">最適化優先</label>
          <select id="kanban-priority" class="field-input">
            <option value="location">ロケ効率（移動コスト最小）</option>
            <option value="cast">キャスト拘束（出演者の連続性）</option>
          </select>
        </div>
      </div>

      <button id="kanban-generate-btn" class="w-full bg-primary text-background-dark font-display font-bold py-4 rounded-xl uppercase tracking-widest text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
        <span class="material-symbols-outlined">auto_awesome</span>
        香盤を AI 生成
      </button>
    </div>` : `

    <!-- Generated Kanban -->
    <div class="p-4 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-muted">生成日時: ${new Date(kanban.generatedAt).toLocaleString('ja-JP')}</p>
          <p class="text-xs text-primary font-display font-bold">推定終了: ${kanban.estimatedEnd} / ${kanban.totalShots}カット</p>
        </div>
        <button id="kanban-regen-btn" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-col text-muted text-[11px] font-display font-bold hover:border-primary hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-sm">refresh</span>再生成
        </button>
      </div>

      <div class="overflow-x-auto rounded-xl border border-border-col">
        <table class="kanban-table">
          <thead>
            <tr>
              <th>時刻</th><th>カット</th><th>内容</th><th>出演者</th><th>時間・場所</th>
            </tr>
          </thead>
          <tbody>
            ${kanban.blocks.map(blockRow).join('')}
          </tbody>
        </table>
      </div>
    </div>`}
  </div>
</div>`;
};

window.initKanban = function () {
    document.getElementById('kanban-generate-btn')?.addEventListener('click', () => {
        const btn = document.getElementById('kanban-generate-btn');
        if (btn) btn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> 生成中...';

        setTimeout(() => {
            const start = document.getElementById('kanban-start')?.value || Store.project.startTime;
            const travel = parseInt(document.getElementById('kanban-travel')?.value) || 30;
            const kanban = Utils.generateKanban(Store.orderedShots, Store.crew, Store.locations, { startTime: start, travelMinutes: travel });
            Store.setKanban(kanban);
            window.showToast('✓ 香盤を生成しました', 'success');
            window.navigateTo('kanban');
        }, 800); // Slight delay for UX
    });

    document.getElementById('kanban-regen-btn')?.addEventListener('click', () => {
        Store.setKanban(null);
        window.navigateTo('kanban');
    });

    document.getElementById('kanban-print-btn')?.addEventListener('click', () => {
        window.print();
    });
};
