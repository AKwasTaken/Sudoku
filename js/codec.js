/* Compact save-state codec: adaptive binary arithmetic coding, then base64url.
 *
 * One function (walk) describes the whole state and runs in both directions, so the
 * encoder and decoder can never drift apart. Every yes/no decision is coded with an
 * adaptive probability, so common outcomes cost a fraction of a bit.
 *
 *   seed 20 bits | difficulty 2 bits (stored as-is) | time (5-bit length + bits)
 *   per non-given cell: filled? -> correct? -> (wrong digit, 3 bits)
 *   per empty cell:     notes? -> all candidates? -> subset of candidates? -> 1 bit per candidate | raw 9 bits
 *
 * A 0 symbol keeps the low end of the coding interval, so an untouched puzzle encodes to
 * trailing zero bits, which are dropped (the decoder reads missing bits as 0).
 */
(function (S) {
  const ALPHA =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

  const toBits = (str) => {
    const b = [];
    for (const ch of str) {
      const v = ALPHA.indexOf(ch);
      if (v < 0) throw new Error("bad char");
      for (let j = 5; j >= 0; j--) b.push((v >> j) & 1);
    }
    return b;
  };
  const toStr = (b) => {
    let s = "";
    for (let i = 0; i < b.length; i += 6) {
      let v = 0;
      for (let j = 0; j < 6; j++) v = (v << 1) | (b[i + j] || 0);
      s += ALPHA[v];
    }
    return s.replace(/A+$/, "") || "A";
  };

  // Carry-less 32-bit binary arithmetic coder. Pass bits to decode, nothing to encode.
  function coder(inBits) {
    const dec = !!inBits,
      out = [];
    let x1 = 0,
      x2 = 0xffffffff,
      x = 0,
      pos = 0;
    const next = () => {
      let v = 0;
      for (let j = 0; j < 8; j++) v = v * 2 + (inBits[pos++] || 0);
      return v;
    };
    let ready = false;

    const code = (p0, y) => {
      // p0 = P(bit 0), 12-bit
      if (!ready) {
        ready = true;
        if (dec) for (let k = 0; k < 4; k++) x = ((x << 8) | next()) >>> 0;
      }
      const mid = x1 + ((x2 - x1) >>> 12) * p0;
      if (dec) y = x <= mid ? 0 : 1;
      if (y) x1 = mid + 1;
      else x2 = mid;
      while (((x1 ^ x2) & 0xff000000) === 0) {
        if (dec) x = ((x << 8) | next()) >>> 0;
        else for (let j = 7; j >= 0; j--) out.push((x2 >>> (24 + j)) & 1);
        x1 = (x1 << 8) >>> 0;
        x2 = ((x2 << 8) | 255) >>> 0;
      }
      return y;
    };
    const io = {
      head(n, v) {
        // header bits bypass the coder so an untouched puzzle stays tiny
        if (!dec) {
          for (let k = n - 1; k >= 0; k--) out.push((v >> k) & 1);
          return v;
        }
        let r = 0;
        for (let k = 0; k < n; k++) r = r * 2 + (inBits[pos++] || 0);
        return r;
      },
      bit(c, y) {
        // c = adaptive context [n0, n1], or null for 50/50
        const p0 = c
          ? Math.min(
              4095,
              Math.max(1, Math.round((4096 * c[0]) / (c[0] + c[1]))),
            )
          : 2048;
        y = code(p0, y);
        if (c) c[y]++;
        return y;
      },
      raw(n, v) {
        let r = 0;
        for (let k = n - 1; k >= 0; k--) r = r * 2 + io.bit(null, (v >> k) & 1);
        return r;
      },
      finish() {
        // fewest bits that land inside the final interval
        for (let b = 0; b <= 32; b++) {
          const u = 2 ** (32 - b),
            v = Math.ceil(x1 / u) * u;
          if (v <= x2) {
            for (let j = 0; j < b; j++)
              out.push(Math.floor(v / 2 ** (31 - j)) % 2);
            break;
          }
        }
        return out;
      },
    };
    return io;
  }

  const bitOf = (v) => (v ? 1 << (v - 1) : 0);
  function candMask(g, i) {
    // digits unused in the cell's row, column and box
    const r = (i / 9) | 0,
      c = i % 9,
      br = r - (r % 3),
      bc = c - (c % 3);
    let m = 0;
    for (let k = 0; k < 9; k++)
      m |=
        bitOf(g[r * 9 + k]) |
        bitOf(g[k * 9 + c]) |
        bitOf(g[(br + ((k / 3) | 0)) * 9 + bc + (k % 3)]);
    return ~m & 511;
  }

  function walk(io, st) {
    const free = [...Array(81).keys()].filter((i) => !st.given[i]);
    const g = st.g.slice(),
      notes = st.notes.slice();
    const cF = [1, 1],
      cOK = [0.3, 3],
      cN = [1, 1],
      cA = [1, 1],
      cS = [0.3, 3],
      cD = [1, 1];

    io.head(22, st.id * 4 + S.DIFFS.indexOf(st.diff));
    const L = io.raw(5, 32 - Math.clz32(st.t)),
      t = io.raw(L, st.t);

    for (const i of free) {
      if (!io.bit(cF, g[i] ? 1 : 0)) continue;
      const c = st.sol[i];
      if (io.bit(cOK, g[i] === c ? 1 : 0)) g[i] = c;
      else {
        const k = io.raw(3, g[i] < c ? g[i] - 1 : g[i] - 2);
        g[i] = k + 1 < c ? k + 1 : k + 2;
      }
    }
    for (const i of free) {
      if (g[i] || !io.bit(cN, notes[i] ? 1 : 0)) continue;
      const m = notes[i],
        cand = candMask(g, i);
      if (io.bit(cA, m === cand ? 1 : 0)) notes[i] = cand;
      else if (io.bit(cS, !(m & ~cand) ? 1 : 0)) {
        let r = 0;
        for (let d = 0; d < 9; d++)
          if ((cand >> d) & 1) r |= io.bit(cD, (m >> d) & 1) << d;
        notes[i] = r;
      } else notes[i] = io.raw(9, m);
    }
    return { t, g, notes };
  }

  S.codec = {
    candMask,
    encode(st) {
      const io = coder();
      walk(io, st);
      return toStr(io.finish());
    },
    restore(str, st) {
      Object.assign(st, walk(coder(toBits(str)), st));
    }, // st must hold the puzzle for this seed
    header(str) {
      if (!str) return null;
      try {
        const io = coder(toBits(str)),
          h = io.head(22),
          id = h >>> 2,
          diff = S.DIFFS[h & 3];
        return diff ? { id, diff } : null;
      } catch (e) {
        return null;
      }
    },
  };
})((window.Sudoku = window.Sudoku || {}));
