/* Builds a printable A4 sheet as drawing ops in millimetres (rect / path / text).
 * Renderers (png / pdf) just replay them. Greys are 0 (black) .. 1 (white). */
(function (S) {
  const W = 210, H = 297, M = 20, G = 170, GY = 58, C = G / 9, QR = 24;
  const INK = 0.08, MUTE = 0.5, HAIR = 0.62;

  const circle = (x, y, r) => { const k = 0.5523 * r; return [['M', x + r, y],
    ['C', x + r, y + k, x + k, y + r, x, y + r], ['C', x - k, y + r, x - r, y + k, x - r, y],
    ['C', x - r, y - k, x - k, y - r, x, y - r], ['C', x + k, y - r, x + r, y - k, x + r, y]]; };

  S.sheet = function (st, url) {
    const ops = [];
    const rect = (x, y, w, h, c = INK) => ops.push({ t: 'rect', x, y, w, h, c });
    const path = (cmds, w, c = INK, fill = false) => ops.push({ t: 'path', cmds, w, c, fill });
    const text = (x, y, size, s, c) => ops.push({ t: 'text', x, y, size, s, c });

    // Header: wordmark left; difficulty dots + id right
    path(S.glyphs.run('sudoku', 12, 0.2, M, 28), 1.05);
    const level = S.DIFFS.indexOf(st.diff) + 1;
    for (let k = 0; k < 3; k++) path(circle(W - M - 1.3 - (2 - k) * 4.2, 29.3, 1.3), 0.35, INK, k < level);
    const id = String(st.id), iw = S.glyphs.width(id, 5, 0.32);
    path(S.glyphs.run(id, 5, 0.32, W - M - iw, 35), 0.42);

    // Grid: hairlines inside boxes, firm lines on box edges
    for (let k = 0; k <= 9; k++) {
      const b = k % 3 === 0, w = b ? 0.6 : 0.2, c = b ? INK : HAIR;
      rect(M + k * C - w / 2, GY - (b ? 0.3 : 0), w, G + (b ? 0.6 : 0), c);
      rect(M - (b ? 0.3 : 0), GY + k * C - w / 2, G + (b ? 0.6 : 0), w, c);
    }
    const h = 7;
    st.puzzle.forEach((v, i) => {
      if (v) path(S.glyphs.run(String(v), h, 0, M + ((i % 9) + 0.5) * C - 0.3 * h, GY + (((i / 9) | 0) + 0.5) * C - h / 2), 0.085 * h);
    });

    // Footer: caption left, QR right
    const qy = GY + G + 14, qx = W - M - QR;
    text(M, qy + QR, 3.2, 'Scan to play online', MUTE);
    const q = qrcode(0, 'M'); q.addData(url); q.make();
    const n = q.getModuleCount(), s = QR / n;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (!q.isDark(r, c)) continue;
        let e = c; while (e + 1 < n && q.isDark(r, e + 1)) e++;   // merge horizontal runs
        rect(qx + c * s, qy + r * s, (e - c + 1) * s, s);
        c = e;
      }
    }
    return { w: W, h: H, ops };
  };
})(window.Sudoku = window.Sudoku || {});