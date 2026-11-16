<p align="center">
  <img src="assets/logo.png" alt="Logo" width="128" height="128">
</p>



<div align='center'>
<h1>Sudoku</h1>
<img src='https://img.shields.io/badge/Claude-AI-orange'></img>
<img src='https://img.shields.io/badge/License-MIT-yellow'></img>
<br><br><br>
</div>


This is a ***vibe coded*** sudoku web app designed specifically for mobiles. Main feature is that you can save the url somewhere, even send it to your friends, and anyone can continue your progress (even with the notes!). No data is being saved anywhere, this is a totally static standalone app, designed for simplicity. 

---

## Features

- **Every puzzle has an id.** Open the same link and you get the exact same grid, on any device.
- **The link is your save file.** Your entries, notes and elapsed time are all encoded into the URL. Copy it, bookmark it, send it to a friend, and the game resumes exactly where you left off.
- **Tap and hold to enter numbers.** Hold a cell and a ring of 1-9 appears around your finger. Slide to a number and release, or release early and tap one. The center erases.
- **Highlights.** Selecting a cell highlights its row and column, and every other cell with the same number.
- **Notes.** Toggle pencil marks per cell. They are saved in the link too.
- **No spoilers.** The grid only says *Correct* or *Incorrect* once every cell is filled, never before.
- **Print it.** Download the current puzzle as an A4 PDF, with a QR code that opens the same puzzle online.

## Controls

| Action | Touch | Keyboard / mouse |
|---|---|---|
| Select a cell | Tap | Click, or arrow keys |
| Enter a number | Hold the cell, pick from the ring | `1`-`9` |
| Erase | Center of the ring, or **Erase** | `0`, `Backspace`, `Delete` |
| Toggle notes | **Notes** button | `N` |

Holding the mouse button on a cell opens the ring on desktop too.

---

## Credits

- Claude AI
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) by Kazuhiko Arase (MIT), used for the QR codes on printed sheets


---

## License

MIT