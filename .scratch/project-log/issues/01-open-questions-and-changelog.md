# 01: Открытые вопросы и журнал изменений LYMPHODOOM

**What to build:** перенесено дословно из `AGENTS.md` (разделы `### Open questions` и `### Changelog`) 2026-11-15, чтобы `AGENTS.md` не хранил журнал (спека `workspace-layout`, история 33). Открытые вопросы ждут владельца; журнал — история проекта.

**Blocked by:** None

**Status:** needs-info

### Open questions

- Not checked: speed in a real browser with a GPU, sound and music by ear, `.htaccess` on the
  hosting, a full playthrough without cheats (pace of the BODY drain).
- The owner once saw the menu not respond in his browser; the cause is unknown (headless was
  fine), and the start menu was removed. Waiting for the browser name and the `idrate` value.
- The GitHub repository has no description, website or topics yet (the owner sets them).

### Changelog

- **2026-10-19** — GitHub account renamed to `kostachernyshov`; repository: `kostachernyshov/lymphodoom`.

- **2026-10-16** — Public repository `kosta-blackshow/lymphodoom`. README and these notes
  rewritten in English; Doom-box-style poster (`art/poster.py`) used in the README and as the
  page's `og.png`; engine patch notes moved to `docs/engine-patch.md`.
- **2026-10-16** — Own cells: 8 per level, wander, run from enemies, burst from one hit.
  Organism health BODY replaces the ARMS panel (15 / 9 minutes, +1 % per enemy, +10 % boss,
  −5 % per own cell; at 0 % "THE BODY DIED" and back to E1M1; T-cell death restarts the level
  with the level-start BODY). BODY in the intermission stats and the finale. The E1M2 key island
  lowered to +24 so it can be climbed. Checked natively: cell kill −5 %, body death and restart,
  BODY on the stats and finale screens; page in headless Chromium without errors.
- **2026-10-16** — The game starts straight from the page: two difficulty buttons
  (COMMON COLD / METASTASIS), in-game menu has only New Game, no save/load/options/readme/quit;
  a controls guide on the start screen and a pixel-art guide below the game instead of text.
- **2026-10-16** — First version: Dwasm engine in WebAssembly (about 1.5 MB gzipped with data),
  three levels, all enemies, weapons, items and HUD, body-map intermission, "CLEAR!" finale,
  sound effects and six MIDI tracks, EN/RU page.
