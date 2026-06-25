# Idiomatic Python

A short course in **idiomatic Python for experienced programmers** — the
distinctive syntax, idioms, control structures, and best practices that make
Python *Python*, taught as the delta from other languages.

Each lesson is a single self-contained HTML page with:

- an **embedded voice-over** (a “▶ Play narration” button using your browser's
  built-in speech engine — no install, works offline),
- worked, contrast-with-other-languages examples, and
- a short **quiz** with immediate feedback.

## Start here

This repo is ready for **GitHub Pages**. Once it's pushed to GitHub, enable Pages
(*Settings → Pages → Deploy from a branch → `main` / root*) and open:

```
https://boosey.github.io/python-fluency/
```

Two ways to read the course — both fully working with voice-over and quizzes:

- [`index.html`](./index.html) — the whole course in **one self-contained page**
  (a lesson picker switches between lessons). This is the Pages entry point and
  works as a single file, even offline.
- [`contents.html`](./contents.html) — a **table of contents** linking each
  lesson as its own page under [`lessons/`](./lessons), if you prefer separate,
  printable pages and deep links.

To preview locally, serve the folder with `python3 -m http.server` and visit
<http://localhost:8000>.

## Curriculum

| # | Lesson | # | Lesson |
|---|--------|---|--------|
| 01 | Comprehensions | 10 | The data model & dunder methods |
| 02 | Unpacking & multiple assignment | 11 | Decorators |
| 03 | Truthiness & boolean idioms | 12 | Generators & yield |
| 04 | Slicing | 13 | Dataclasses & named tuples |
| 05 | Iteration & its built-ins | 14 | Exceptions & EAFP |
| 06 | Strings & f-strings | 15 | Type hints |
| 07 | Dictionary idioms | 16 | Structural pattern matching |
| 08 | Function arguments | 17 | The Zen of Python, applied |
| 09 | Context managers | | |

## Layout

This repository is a **teaching workspace** in the style of the
[`teach` skill](https://github.com/mattpocock/skills) — a stateful directory
that grows as the learning progresses:

- `lessons/` — the lessons (`NNNN-slug.html`), the primary unit of teaching.
- `assets/` — shared, reusable components: `course.css` (the stylesheet every
  lesson links) and `narrate.js` (the voice-over module).
- `index.html` — the course table of contents.
- `MISSION.md` — *why* this course exists; grounds every lesson.
- `RESOURCES.md` — curated, high-trust sources (official docs, PEPs, talks).
- `learning-records/` — what's been learned, used to decide what to teach next.
- `NOTES.md`, `lesson-contract.md` — teaching preferences and the authoring spec.

## License

Course content © the author. Reuse the format freely.
