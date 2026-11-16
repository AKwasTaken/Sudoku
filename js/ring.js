/* Tap-and-hold number ring. Hold a cell, slide to a number, release. Or release early and tap one. */
(function (S) {
  const R = 88, HOLD = 380;
  S.ring = {
    init(board, h) {
      const el = document.createElement('div'); el.className = 'ring'; el.hidden = true;
      const items = [];
      for (let n = 0; n <= 9; n++) {           // 0 = erase (centre)
        const d = document.createElement('div'); d.className = 'ring-n'; d.textContent = n || '✕';
        const a = (n - 1) / 9 * 2 * Math.PI - Math.PI / 2;
        if (n) d.style.transform = `translate(${Math.cos(a) * R}px,${Math.sin(a) * R}px)`;
        el.append(d); items.push(d);
      }
      document.body.append(el);

      let open = false, held = false, moved = false, cell = -1, cx = 0, cy = 0, sx = 0, sy = 0, timer = 0, hover = null;

      const hit = (x, y) => {
        const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy);
        if (d < 28) return 0;
        if (d > R + 60) return null;
        let a = Math.atan2(dy, dx) + Math.PI / 2;
        a = (a + 4 * Math.PI) % (2 * Math.PI);
        return Math.round(a / (2 * Math.PI / 9)) % 9 + 1;
      };
      const mark = (v) => {
        if (v === hover) return;
        hover = v; items.forEach((d, n) => d.classList.toggle('on', n === v));
      };
      const close = () => { open = false; el.hidden = true; mark(null); };
      const show = (i) => {
        const r = board.children[i].getBoundingClientRect(), m = R + 34;
        cx = Math.min(innerWidth - m, Math.max(m, r.left + r.width / 2));
        cy = Math.min(innerHeight - m, Math.max(m, r.top + r.height / 2));
        el.style.left = cx + 'px'; el.style.top = cy + 'px';
        el.hidden = false; open = true; moved = false;
        if (navigator.vibrate) navigator.vibrate(8);
      };

      board.addEventListener('pointerdown', (e) => {
        if (open) return;
        const c = e.target.closest('.cell'); if (!c) return;
        cell = +c.dataset.i; sx = e.clientX; sy = e.clientY; held = true;
        h.select(cell); clearTimeout(timer);
        if (h.canEdit(cell)) timer = setTimeout(() => show(cell), HOLD);
      });
      addEventListener('pointerdown', (e) => {   // tap-mode: pick from an open ring
        if (!open) return;
        const v = hit(e.clientX, e.clientY); close();
        if (v !== null) h.apply(cell, v);
      });
      addEventListener('pointermove', (e) => {
        if (!held && !open) return;
        if (Math.hypot(e.clientX - sx, e.clientY - sy) > 14) {
          if (open) moved = true; else clearTimeout(timer);
        }
        if (open && (moved || !held)) mark(hit(e.clientX, e.clientY));
      });
      addEventListener('pointerup', (e) => {
        const wasHeld = held; held = false; clearTimeout(timer);
        if (open && wasHeld && moved) {
          const v = hit(e.clientX, e.clientY); close();
          if (v !== null) h.apply(cell, v);
        }
      });
      addEventListener('pointercancel', () => { held = false; clearTimeout(timer); close(); });
      board.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  };
})(window.Sudoku = window.Sudoku || {});
