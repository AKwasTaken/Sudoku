/* Game logic, timer, controls. Wires everything together. */
(function (S) {
  const $ = (id) => document.getElementById(id);
  let st,
    noteMode = false;

  const fmt = (t) => {
    const h = (t / 3600) | 0,
      m = ((t % 3600) / 60) | 0,
      s = t % 60,
      p = (n) => String(n).padStart(2, "0");
    return (h ? h + ":" : "") + p(m) + ":" + p(s);
  };

  function sync() {
    S.board.render(st);
    $("time").textContent = fmt(st.t);
    S.url.write(st);
  }

  // Result is only shown once every cell is filled.
  function check() {
    const el = $("status"),
      was = st.done;
    if (st.g.every((v) => v)) {
      st.done = st.g.every((v, i) => v === st.sol[i]);
      el.textContent = st.done ? "Correct" : "Incorrect";
      el.className = "status " + (st.done ? "ok" : "bad");
    } else {
      st.done = false;
      el.textContent = "";
      el.className = "status";
    }
    if (st.done && !was) {
      const s = st; // short beat so the last digit is seen landing
      setTimeout(() => st === s && S.win.show(s), 500);
    }
  }

  function load(id, diff, saved) {
    S.win.hide();
    const puzzle = S.generate(id, diff);
    st = {
      id,
      diff,
      puzzle,
      sol: S.solve(puzzle),
      given: puzzle.map((v) => v > 0),
      g: puzzle.slice(),
      notes: Array(81).fill(0),
      sel: -1,
      t: 0,
      done: false,
    };
    if (saved) {
      try {
        S.codec.restore(saved, st);
      } catch (e) {
        /* corrupt progress: start fresh */
      }
    }
    $("diff").value = diff;
    $("id").textContent = "#" + id;
    check();
    sync();
    S.board.intro();
  }

  function newGame() {
    load(Math.floor(Math.random() * 1e6), $("diff").value);
  }

  function apply(i, v) {
    if (i < 0 || st.given[i] || st.done) return;
    if (v === 0) {
      st.g[i] = 0;
      st.notes[i] = 0;
    } else if (noteMode) {
      if (st.g[i]) return;
      st.notes[i] ^= 1 << (v - 1);
    } else {
      st.g[i] = v;
      st.notes[i] = 0;
    }
    check();
    sync();
  }

  function setNotes(on) {
    noteMode = on;
    $("notes").setAttribute("aria-pressed", on);
  }

  function init() {
    S.board.build($("board"));
    const d = S.glyphs
      .run("sudoku", 1, 0.2, 0, 0)
      .map((c) => c.join(" "))
      .join(" "); // wordmark, same glyphs as the print sheet
    $("logo").innerHTML =
      `<path d="${d}" fill="none" stroke="currentColor" stroke-width=".09" stroke-linecap="round" stroke-linejoin="round"/>`;
    S.win.init({ onNew: newGame, fmt });
    S.ring.init($("board"), {
      select: (i) => {
        st.sel = i;
        sync();
      },
      canEdit: (i) => !st.given[i] && !st.done,
      apply,
    });
    $("new").onclick = newGame;
    $("erase").onclick = () => apply(st.sel, 0);
    $("notes").onclick = () => setNotes(!noteMode);

    $("save").onclick = () => S.exporter.pdf(st);
    $("status").onclick = () => st.done && S.win.show(st); // reopen the completion screen

    addEventListener("keydown", (e) => {
      if (e.target.tagName === "SELECT" || e.metaKey || e.ctrlKey) return;
      if (/^[1-9]$/.test(e.key)) apply(st.sel, +e.key);
      else if (e.key === "0" || e.key === "Backspace" || e.key === "Delete")
        apply(st.sel, 0);
      else if (e.key === "n" || e.key === "N") setNotes(!noteMode);
      else if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const s = st.sel < 0 ? 40 : st.sel,
          r = (s / 9) | 0,
          c = s % 9;
        const nr = Math.min(
          8,
          Math.max(0, r + (e.key === "ArrowDown") - (e.key === "ArrowUp")),
        );
        const nc = Math.min(
          8,
          Math.max(0, c + (e.key === "ArrowRight") - (e.key === "ArrowLeft")),
        );
        st.sel = nr * 9 + nc;
        sync();
      }
    });

    setInterval(() => {
      if (st.done || document.hidden) return;
      st.t++;
      $("time").textContent = fmt(st.t);
      S.url.write(st);
    }, 1000);

    const s = S.url.read(),
      h = S.codec.header(s);
    if (h) load(h.id, h.diff, s);
    else newGame();

    addEventListener("pointerdown", (e) => {
      if (st.sel < 0) return;
      if (e.target.closest(".cell, button, select, .ring")) return;
      st.sel = -1;
      sync();
    });
  }

  init();
})(window.Sudoku);