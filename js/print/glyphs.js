/* Monoline geometric glyphs (digits + the "sudoku" wordmark), drawn as stroked paths.
 * Coordinates: x across, y down; 0 = top (ascender / digit top), 1 = baseline. Same look in PDF and PNG, no font files. */
(function (S) {
  const G = {
    '0': [.6, 'M.3 0 C.46 0 .56 .2 .56 .5 C.56 .8 .46 1 .3 1 C.14 1 .04 .8 .04 .5 C.04 .2 .14 0 .3 0'],
    '1': [.6, 'M.1 .22 L.3 0 L.3 1'],
    '2': [.6, 'M.05 .3 C.05 -.1 .55 -.1 .55 .3 C.55 .6 .2 .75 .05 1 L.58 1'],
    '3': [.6, 'M.05 .08 C.2 -.03 .55 0 .55 .25 C.55 .42 .4 .48 .25 .5 C.45 .5 .58 .6 .58 .75 C.58 1.02 .2 1.05 .04 .92'],
    '4': [.6, 'M.45 1 L.45 0 L.02 .68 L.6 .68'],
    '5': [.6, 'M.52 0 L.1 0 L.06 .45 C.2 .35 .58 .35 .58 .7 C.58 1.05 .2 1.05 .03 .9'],
    '6': [.6, 'M.5 .02 C.2 .08 .05 .4 .05 .7 C.05 .86 .16 .98 .31 .98 C.46 .98 .57 .86 .57 .7 C.57 .55 .46 .43 .31 .43 C.17 .43 .07 .53 .05 .68'],
    '7': [.6, 'M.03 0 L.58 0 L.2 1'],
    '8': [.6, 'M.3 .47 C.14 .47 .1 .38 .1 .25 C.1 .1 .2 0 .3 0 C.4 0 .5 .1 .5 .25 C.5 .38 .46 .47 .3 .47 C.12 .47 .04 .58 .04 .73 C.04 .9 .15 1 .3 1 C.45 1 .56 .9 .56 .73 C.56 .58 .48 .47 .3 .47'],
    '9': [.6, 'M.12 .98 C.42 .92 .57 .6 .57 .3 C.57 .14 .46 .02 .31 .02 C.16 .02 .05 .14 .05 .3 C.05 .45 .16 .57 .31 .57 C.45 .57 .55 .47 .57 .32'],
    s: [.5, 'M.46 .46 C.4 .36 .1 .32 .06 .52 C.03 .7 .46 .64 .46 .82 C.46 1 .1 1.03 .04 .9'],
    u: [.6, 'M.06 .34 L.06 .68 C.06 .9 .18 1 .3 1 C.42 1 .54 .9 .54 .68 M.54 .34 L.54 1'],
    d: [.7, 'M.66 0 L.66 1 M.66 .67 C.66 .49 .51 .34 .33 .34 C.15 .34 0 .49 0 .67 C0 .85 .15 1 .33 1 C.51 1 .66 .85 .66 .67'],
    o: [.66, 'M0 .67 C0 .49 .15 .34 .33 .34 C.51 .34 .66 .49 .66 .67 C.66 .85 .51 1 .33 1 C.15 1 0 .85 0 .67'],
    k: [.6, 'M.06 0 L.06 1 M.54 .34 L.06 .74 M.2 .63 L.58 1']
  };

  function parse(d, ox, oy, h) {                    // "M x y C ..." -> [['M', X, Y], ...] scaled by h and offset
    const out = []; let cur;
    d.match(/[MLC]|-?[\d.]+/g).forEach((t) => {
      if (/[MLC]/.test(t)) out.push(cur = [t]);
      else cur.push(+t * h + (cur.length % 2 ? ox : oy));
    });
    return out;
  }
  const width = (str, h, gap) => [...str].reduce((w, ch) => w + (G[ch][0] + gap) * h, -gap * h);

  S.glyphs = {
    width,
    run(str, h, gap, ox, oy) {                      // returns path commands for str with its top-left at (ox, oy)
      const cmds = []; let x = ox;
      for (const ch of str) { cmds.push(...parse(G[ch][1], x, oy, h)); x += (G[ch][0] + gap) * h; }
      return cmds;
    }
  };
})(window.Sudoku = window.Sudoku || {});