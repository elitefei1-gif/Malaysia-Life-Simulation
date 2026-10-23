# Malaysian Life Simulator

A year-by-year life simulation game set in Malaysia. It is a static web game with no build step and no
framework. GitHub Pages serves the repository root from `main`, at
https://elitefei1-gif.github.io/Malaysia-Life-Simulation/. Whatever is merged to `main` goes live.

The owner is not a programmer. Explain changes in plain words, in terms of what the player sees.

## Layout

```
index.html        Page markup, GAME_VERSION, and the <script> tags that load js/ in order
css/style.css     All styling
js/*.js           Game code: plain scripts (not modules) that share one global scope
sw.js             Service worker: offline play and caching
img/  music/      Pictures (.webp) and music
tests/smoke.mjs   Play-test: plays random lives in headless Chromium and fails on any error
tools/bump-version.mjs   Sets the release version everywhere
```

The JS files load in the order `index.html` lists them:

| File | What's in it |
|---|---|
| `core.js` | Helpers (`$`, `R`, `RI`, `pick`, `clamp`, `chance`, `esc`, `fmt`), data tables (towns, cultures, names, jobs...), real history events |
| `icons.js` | `ICON_IMG` (key → picture file), inline SVG icons, `ico()`, `icoSrc()` |
| `state.js` | `S` (the whole saved game), `freshState`, `age()`, `log()`, `bump()`, money helpers, world engine, pop-up queue (`q`, `qFront`, `showNext`, `drawModal`, `choose`) |
| `life.js` | `ACTS` (yearly activities), love & family, education |
| `money.js` | Businesses, luxury, investments, careers, finance, yearly ticks |
| `events.js` | Festivals, `EV` random events, life-stage events, achievements, death |
| `politics.js` | Parties, elections, scandals |
| `titles.js` | Honour titles (Dato', Tan Sri, Tun) |
| `year.js` | `nextYear()`: calls every yearly system in order. Auto-play |
| `travel.js` | Moving abroad, travel, assets, dynasty |
| `spouses.js` | Multiple spouses, affairs, partner preference |
| `health.js` | Illness, hospitals, continuing as an heir |
| `render.js` | Drawing every screen and tab |
| `fx.js` | Toast, save/load, motion effects, auto-update check |
| `input.js` | `ACT`: every `data-act="..."` button handler, plus the click and keyboard listeners |
| `sound.js` | Sound effects (Web Audio), background music, and the music page player (`TRACKS`) |
| `boot.js` | Start-up. Must stay last |

## Rules for the code

- **Shared global scope, load order matters.** Every file sees every other file's top-level `const`, `let`
  and `function`. Code that runs at load time (top-level statements, not function bodies) may only use
  things from the same or earlier files. A new file needs a `<script>` tag in `index.html` in the right
  place, with the same `?v=` as the others. Start each file with `'use strict';` and a one-line comment.
- **No build step, no npm packages in the game.** Everything must run as plain files on GitHub Pages.
  `package.json` exists only for the play-test.
- **Match the existing style.** The code is dense (short names, one-line functions, template strings for
  HTML). Keep that style. Escape player-visible names with `esc()` when putting them in HTML.
- **Buttons:** add `data-act="name"` (and `data-arg="..."` if needed) in `render.js`, then a handler
  `name(arg){...}` in `ACT` in `input.js`. Call `render()` and `save()` after changing state.
- **Pop-ups:** `q({title, icon, tag, text, choices:[[label, fn, enabledFn?, hint?], ...]})`. A choice
  function returns the result text (or `false` / `'keep'`). The stat and money changes are shown
  automatically.
- **Random events** go in `EV` in `events.js`: `{id, c: age => condition, t: title, x: text, ch: [...]}`.
- **Old saves must keep working.** Players' games are in localStorage (`SAVE_KEY`). Any new field on `S`
  must work when it's missing. Create it lazily, the way `spouses()` and `TT()` do (`S.x = S.x || ...`), or
  use `??` defaults. Never rename or remove existing fields.
- **Malaysian realism** is part of the game: culture-specific details (Malay, Chinese, Indian, Iban, Kadazan,
  and foreign partners), real institutions (SPM, PTPTN, EPF, MACC), RM amounts scaled with `infl()`.

## Pictures

Pictures are `.webp` files in `img/`, registered in `ICON_IMG` in `icons.js`. Culture variants use
`name__culture.webp` on disk and the key `'name@culture'`. Name prefixes: `ev_` event scenes, `a_`
activities, `m_` milestones, `av_` player avatars, `c_` cars, `h_` houses, `p_` pets, `b_` businesses,
`i_` investments, `l_` luxury, `d_` destinations, `s_` stats, `t_` tabs, `f_` festivals, `w_` world events.
File names are case-sensitive on GitHub Pages. The play-test fails if the code names a file that doesn't exist.

## Releasing a change

1. Make the change.
2. `node tools/bump-version.mjs`. This sets `GAME_VERSION` (date + release number; players see `vNN`) and
   the `?v=` on every js/css link, so phones and the offline copy pick up the new files. Do this for every
   release, including ones that only change code.
3. `npm install` (first time in a session), then `npm test`. It plays 6 random lives across 3 generations and
   checks offline play. Fix every error it reports. To replay a failing life: `node tests/smoke.mjs --seed=N --lives=1`.
4. If the change is visual, also look at it: `npm run serve` and open http://localhost:8080, or take a
   Playwright screenshot.
5. Commit message format used so far: `Update game to vNN (short player-facing summary of what changed)`.

## Music

- Background music: `music/menu-hangat.mp3`, quiet and looping, follows the mute button (`bgm()` in `sound.js`).
- Music page: the Music tab in a game, and the 🎵 Music button on the title screen. It plays the songs in
  `TRACKS` (`sound.js`) in full and pauses the background music while one plays. To add a song, convert it to
  MP3 (Opus `.m4a` doesn't play on older iPhones), for example
  `ffmpeg -i in.m4a -map 0:a -c:a libmp3lame -b:a 160k -ar 44100 -map_metadata -1 music/songs/NN-name.mp3`,
  then add a line to `TRACKS` with its length in seconds (`len`).

## Offline support (`sw.js`)

`index.html` and the `js/` and `css/` files load from the network first, with the saved copy used when
offline. Pictures and background music are saved on the first visit. Music page songs (`music/songs/`)
are saved only once played, so a first visit stays light. The service worker finds which pictures to
save by scanning `index.html` and the code files for `img/...` and `music/...` paths. So write picture
paths out in full (as in `ICON_IMG`), not built from pieces at runtime. Bump the cache names in `sw.js`
only if the caching scheme itself changes.

## Leftover from the claude.ai version

The game was first built as a single-file claude.ai artifact. `boot.js` still calls `window.claude?.hot`
(hot reload in that environment). It does nothing on GitHub Pages and is harmless.
