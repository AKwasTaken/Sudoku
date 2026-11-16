/* Board DOM: build once, render from state. */
(function (S) {
  const cells = [];
  S.board = {
    el: null,
    build(el) {
      this.el = el;
      for (let i = 0; i < 81; i++) {
        const c = document.createElement('div');
        c.className = 'cell'; c.dataset.i = i;
        c.innerHTML = '<b class="v"></b><div class="notes">' + '<i></i>'.repeat(9) + '</div>';
        el.append(c); cells.push(c);
      }
    },
    render(st) {
      const has = st.sel >= 0, sr = has ? (st.sel / 9) | 0 : -1, sc = has ? st.sel % 9 : -1;
      const sv = has ? st.g[st.sel] : 0;
      cells.forEach((c, i) => {
        const v = st.g[i];
        let cls = 'cell' + (st.given[i] ? ' given' : '');
        if (i === st.sel) cls += ' sel';
        else if (sv && v === sv) cls += ' same';
        else if (has && (((i / 9) | 0) === sr || i % 9 === sc)) cls += ' peer';
        c.className = cls;
        c.firstChild.textContent = v || '';
        const ns = c.lastChild.children;
        for (let k = 0; k < 9; k++) ns[k].textContent = !v && (st.notes[i] >> k & 1) ? k + 1 : '';
      });
    }
  };
})(window.Sudoku = window.Sudoku || {});
