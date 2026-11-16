/* Solver + deterministic puzzle generator. Grids are arrays of 81 ints (0 = empty). */
(function (S) {
  const CLUES = { easy: 40, medium: 32, hard: 27 };
  const bit = (m) => { let n = 0; while (m) { m &= m - 1; n++; } return n; };

  function shuffle(a, rand) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Backtracking with most-constrained-cell heuristic. Returns up to `limit` solutions.
  function solve(grid, limit, rand) {
    const g = grid.slice(), R = Array(9).fill(0), C = Array(9).fill(0), B = Array(9).fill(0);
    const box = (i) => ((i / 27) | 0) * 3 + (((i % 9) / 3) | 0);
    for (let i = 0; i < 81; i++) if (g[i]) {
      const m = 1 << (g[i] - 1); R[(i / 9) | 0] |= m; C[i % 9] |= m; B[box(i)] |= m;
    }
    const out = [];
    (function rec() {
      let best = -1, bm = 0, bc = 10;
      for (let i = 0; i < 81 && bc > 1; i++) if (!g[i]) {
        const m = ~(R[(i / 9) | 0] | C[i % 9] | B[box(i)]) & 511, n = bit(m);
        if (n < bc) { best = i; bm = m; bc = n; }
      }
      if (best < 0) { out.push(g.slice()); return out.length >= limit; }
      if (!bc) return false;
      let ds = [];
      for (let d = 0; d < 9; d++) if (bm >> d & 1) ds.push(d);
      if (rand) shuffle(ds, rand);
      const r = (best / 9) | 0, c = best % 9, b = box(best);
      for (const d of ds) {
        const m = 1 << d;
        g[best] = d + 1; R[r] |= m; C[c] |= m; B[b] |= m;
        if (rec()) return true;
        g[best] = 0; R[r] &= ~m; C[c] &= ~m; B[b] &= ~m;
      }
      return false;
    })();
    return out;
  }

  S.DIFFS = Object.keys(CLUES);
  S.solve = (grid) => solve(grid, 1)[0];

  // Same (seed, difficulty) always yields the same puzzle.
  S.generate = function (seed, diff) {
    const rand = S.rng(seed);
    const p = solve(Array(81).fill(0), 1, rand)[0];
    const target = CLUES[diff] || CLUES.medium;
    let clues = 81;
    for (const i of shuffle([...Array(81).keys()], rand)) {
      if (clues <= target) break;
      const v = p[i]; p[i] = 0;
      if (solve(p, 2).length > 1) p[i] = v; else clues--;
    }
    return p;
  };
})(window.Sudoku = window.Sudoku || {});
