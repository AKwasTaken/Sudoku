/* Download the current puzzle (blank, no progress) as PDF or PNG. */
(function (S) {
  function download(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
  // Link to the blank puzzle (no progress): used by the QR code and by "Share".
  function link(st) {
    const cfg = S.config.siteUrl,
      base = cfg.includes("your-domain.com")
        ? location.href.split(/[?#]/)[0]
        : cfg;
    const token = S.codec.encode({
      ...st,
      g: st.puzzle,
      notes: Array(81).fill(0),
      t: 0,
    });
    return base + "?" + token;
  }
  function build(st) {
    return {
      sheet: S.sheet(st, link(st)),
      name: `sudoku-${st.diff}-${st.id}`,
    };
  }
  S.exporter = {
    link,
    pdf(st) {
      const b = build(st);
      download(S.toPdf(b.sheet), b.name + ".pdf");
    },
    png(st) {
      const b = build(st);
      S.toCanvas(b.sheet).toBlob((blob) => download(blob, b.name + ".png"));
    },
  };
})((window.Sudoku = window.Sudoku || {}));