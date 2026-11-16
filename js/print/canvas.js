/* Sheet -> canvas (for PNG). Default 300 dpi. */
(function (S) {
  const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif';
  const FONT = { bold: "700 ", sans: "400 ", serif: "400 " };
  const FAMILY = {
    bold: SANS,
    sans: SANS,
    serif: '"Times New Roman", Times, serif',
  };

  S.toCanvas = function (sheet, ppm = 300 / 25.4) {
    const cv = document.createElement("canvas");
    cv.width = Math.round(sheet.w * ppm);
    cv.height = Math.round(sheet.h * ppm);
    const g = cv.getContext("2d");
    g.fillStyle = "#fff";
    g.fillRect(0, 0, cv.width, cv.height);
    g.fillStyle = "#000";
    for (const o of sheet.ops) {
      if (o.t === "rect") {
        // snap to pixels so lines stay crisp and gap-free
        const x = Math.round(o.x * ppm),
          y = Math.round(o.y * ppm);
        g.fillRect(
          x,
          y,
          Math.max(1, Math.round((o.x + o.w) * ppm) - x),
          Math.max(1, Math.round((o.y + o.h) * ppm) - y),
        );
      } else {
        g.font = `${FONT[o.font]}${o.size * ppm}px ${FAMILY[o.font]}`;
        g.textAlign = o.mid ? "center" : "left";
        g.fillText(o.s, o.x * ppm, o.y * ppm);
      }
    }
    return cv;
  };
})((window.Sudoku = window.Sudoku || {}));
