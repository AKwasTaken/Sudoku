/* Reads/writes the save token in the address bar: domain.com/?<token> */
(function (S) {
  S.url = {
    read() {
      return location.search.slice(1);
    },
    write(st) {
      try {
        history.replaceState(null, "", "?" + S.codec.encode(st));
      } catch (e) {
        /* e.g. opened from file:// where browsers block it: the game still works, just isn't saved */
      }
    },
  };
})((window.Sudoku = window.Sudoku || {}));
