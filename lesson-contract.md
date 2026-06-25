# Lesson authoring contract

Every lesson in `lessons/` MUST follow this contract so the course reads as one
consistent whole. The gold reference is `lessons/0001-comprehensions.html` — read
it before authoring. Match its structure, tone, and HTML classes exactly.

## Audience & tone
- The learner is an **experienced programmer** new to Python idiom. Teach the
  **delta**, not fundamentals. Never explain what a loop/variable/function is.
- Teach by **contrast**: "in many languages you'd do X; the Pythonic way is Y,
  because Z." Use the `.contrast` two-column block for this where it fits.
- Mission = general fluency: reading and writing idiomatic Python comfortably.
- Short. One tightly-scoped topic, one tangible win. Respect working memory.

## Required file structure (in order)
1. `<!DOCTYPE html>` + `<head>` with `<meta charset>`, viewport, `<title>` of the
   form `Lesson NN — Topic · Idiomatic Python`, and
   `<link rel="stylesheet" href="../assets/course.css">`.
2. A hidden narration block:
   `<div id="narration" hidden> ... </div>` — the voice-over script, **one
   sentence per line, each ending in . ! or ?** (the narrator splits on
   sentence punctuation). 15–25 sentences. Conversational; it should stand alone
   as spoken audio. Open by naming the lesson; close by inviting the learner to
   take the quiz and to ask the teacher follow-up questions.
3. `<main>` containing, in order:
   - `<div class="kicker">Lesson NN · Idiomatic Python</div>`
   - `<h1>Topic</h1>`
   - `<p class="lede">…</p>` — one or two sentences on the payoff.
   - Body: `<h2>` sections, `<pre><code>…</code></pre>` examples, `.note` and
     `.contrast` callouts. Use the syntax-highlight spans from course.css where
     helpful: `.c-com .c-kw .c-str .c-fn .c-num`. Escape `<`, `>`, `&` in code.
   - A quiz: an `<h2>Quick checks</h2>` then **2–3** `.quiz` blocks (see below).
   - `<hr>` then a **Primary source** paragraph: recommend the single best
     high-trust resource (prefer ones already in `RESOURCES.md`; official docs
     links are always welcome) and link the official docs page for the topic.
   - `<div class="ask-teacher">…</div>` reminding the learner to ask the teacher
     follow-up questions, with 2–3 concrete example questions for THIS topic.
   - `<div class="lesson-nav"><span>← Prev</span><span>Next →</span></div>` using
     the exact prev/next titles given to you.
4. Inline `<script>` implementing quiz feedback (copy the pattern from lesson 01:
   per-quiz `msgs` object keyed by quiz id with `ok`/`no` strings, disable options
   on click, mark `.correct`/`.wrong`, set `.fb`). Keep it valid JS.
5. `<script src="../assets/narrate.js" defer></script>` as the LAST element.

## Quiz rules
- Each `.quiz` has a unique `id`, a `.q` question, 3 `.opt` buttons, one `.fb`.
- Exactly ONE `.opt` per quiz has `data-correct="1"`.
- **Answer options should be close to equal length** (similar word/character
  count) so formatting leaks no clue. Test recall of the idiom, not trivia.
- Feedback must explain WHY, briefly — both the right answer and the trap.

## Accuracy
- Code must be correct, runnable Python 3.10+ idiom. Verify mentally.
- Cite official docs (docs.python.org) or PEPs for non-obvious claims.
- Do not invent APIs. When unsure, prefer the conservative, well-known form.

## Do NOT
- Do not edit `assets/course.css` or `assets/narrate.js` (shared, already built).
- Do not add external CSS/JS or web fonts. Everything links the shared assets.
- Do not exceed the scope you were given — one idiom per lesson.
