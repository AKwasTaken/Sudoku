/* Sheet -> vector PDF (no libraries; built-in Helvetica for the one caption). Returns a Blob. */
(function (S) {
  const K = 72 / 25.4, f = (n) => +n.toFixed(3);

  S.toPdf = function (sheet) {
    const X = (v) => f(v * K), Y = (v) => f((sheet.h - v) * K);
    let c = '1 J 1 j\n';
    for (const o of sheet.ops) {
      c += `${o.c} g ${o.c} G\n`;
      if (o.t === 'rect') c += `${X(o.x)} ${Y(o.y + o.h)} ${X(o.w)} ${X(o.h)} re f\n`;
      else if (o.t === 'path') {
        c += `${f(o.w * K)} w\n`;
        for (const [k, ...p] of o.cmds) c += p.map((v, i) => (i % 2 ? Y(v) : X(v))).join(' ') + ' ' + k.toLowerCase() + '\n';
        c += o.fill ? 'f\n' : 'S\n';
      } else c += `BT /F1 ${f(o.size * K)} Tf ${X(o.x)} ${Y(o.y)} Td (${o.s.replace(/[()\\]/g, '\\$&')}) Tj ET\n`;
    }
    const objs = [
      '<</Type/Catalog/Pages 2 0 R>>',
      '<</Type/Pages/Kids[3 0 R]/Count 1>>',
      `<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${f(sheet.w * K)} ${f(sheet.h * K)}]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>`,
      `<</Length ${c.length}>>\nstream\n${c}endstream`,
      '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>'
    ];
    let out = '%PDF-1.4\n'; const offs = [];
    objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` +
      offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('') +
      `trailer\n<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF`;
    return new Blob([out], { type: 'application/pdf' });
  };
})(window.Sudoku = window.Sudoku || {});