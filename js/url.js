/* Reads/writes the save token in the address bar: domain.com/?<token> */
(function (S) {
  S.url = {
    read() { return location.search.slice(1); },
    write(st) { history.replaceState(null, '', '?' + S.codec.encode(st)); }
  };
})(window.Sudoku = window.Sudoku || {});
