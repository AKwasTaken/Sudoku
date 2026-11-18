/* Completion screen: mosaic of the solved grid, time, stats, confetti, new puzzle / share. */
(function (S) {
  const $ = (id) => document.getElementById(id);
  let dlg,
    cur,
    fmt,
    flashTimer,
    fx = 0;
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  function timeGlyphs(str) {
    // big time, drawn with the same line glyphs as the wordmark
    const w = S.glyphs.width(str, 1, 0.25),
      svg = $("win-time");
    const d = S.glyphs
      .run(str, 1, 0.25, 0, 0)
      .map((c) => c.join(" "))
      .join(" ");
    svg.setAttribute("viewBox", `-0.06 -0.06 ${w + 0.12} 1.12`);
    svg.setAttribute("aria-label", str);
    svg.innerHTML = `<path d="${d}" fill="none" stroke="currentColor" stroke-width=".09" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  function mosaic(st) {
    // the puzzle itself: dark = given clues, light = cells you solved
    const g = $("win-grid");
    g.innerHTML = "";
    const boxes = Array.from({ length: 9 }, () =>
      g.appendChild(document.createElement("div")),
    );
    st.sol.forEach((v, i) => {
      const r = (i / 9) | 0,
        c = i % 9,
        t = document.createElement("i");
      if (st.given[i]) t.className = "given";
      t.style.setProperty("--d", (r + c) * 40 + "ms");
      boxes[((r / 3) | 0) * 3 + ((c / 3) | 0)].append(t);
    });
  }

  function confetti() {
    const cv = $("win-confetti"),
      ctx = cv.getContext && cv.getContext("2d");
    if (
      !ctx ||
      (window.matchMedia &&
        matchMedia("(prefers-reduced-motion: reduce)").matches)
    )
      return;
    const dpr = devicePixelRatio || 1,
      W = (cv.width = innerWidth * dpr),
      H = (cv.height = innerHeight * dpr);
    const css = getComputedStyle(document.documentElement);
    const cols = ["--accent", "--ink", "--mute", "--accent"].map(
      (v) => css.getPropertyValue(v).trim() || "#3f5bd8",
    );
    const P = Array.from({ length: 110 }, (_, i) => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.2,
      y: H * 0.36,
      vx: (Math.random() - 0.5) * 14 * dpr,
      vy: (-4 - Math.random() * 13) * dpr,
      s: (4 + Math.random() * 5) * dpr,
      w: 0.4 + Math.random() * 0.6,
      r: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.4,
      c: cols[i % cols.length],
    }));
    const id = ++fx,
      t0 = performance.now();
    (function tick(now) {
      if (id !== fx) return;
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of P) {
        p.vy += 0.32 * dpr;
        p.vx *= 0.992;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        if (p.y < H + 20) alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - (now - t0) / 3200);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, (-p.s * p.w) / 2, p.s, p.s * p.w);
        ctx.restore();
      }
      if (alive && now - t0 < 3400) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    })(t0);
  }

  async function share() {
    const url = S.exporter.link(cur),
      btn = $("win-share");
    const text = `I solved sudoku #${cur.id} (${cap(cur.diff)}) in ${fmt(cur.t)}. Think you can beat it?`;
    try {
      if (navigator.share) await navigator.share({ text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        btn.textContent = "Copied";
        clearTimeout(flashTimer);
        flashTimer = setTimeout(() => (btn.textContent = "Share"), 1600);
      }
    } catch (e) {
      /* share sheet dismissed */
    }
  }

  S.win = {
    init(o) {
      dlg = $("win");
      fmt = o.fmt;
      $("win-logo").innerHTML = $("logo").innerHTML;
      $("win-new").onclick = () => {
        S.win.hide();
        o.onNew();
      };
      $("win-share").onclick = share;
      $("win-close").onclick = () => S.win.hide();
      dlg.addEventListener("click", (e) => {
        if (e.target === dlg) S.win.hide();
      }); // tap outside the card
      dlg.addEventListener("close", () => {
        fx++;
      });
    },
    show(st) {
      cur = st;
      const free = st.given.filter((g) => !g).length;
      timeGlyphs(fmt(st.t));
      mosaic(st);
      $("win-diff").textContent = cap(st.diff);
      $("win-id").textContent = "#" + st.id;
      $("win-pace").textContent = (st.t / free).toFixed(1) + "s";
      if (!dlg.open) {
        if (dlg.showModal) dlg.showModal();
        else dlg.setAttribute("open", "");
      }
      confetti();
    },
    hide() {
      fx++;
      if (dlg && dlg.open) {
        if (dlg.close) dlg.close();
        else dlg.removeAttribute("open");
      }
    },
  };
})((window.Sudoku = window.Sudoku || {}));
