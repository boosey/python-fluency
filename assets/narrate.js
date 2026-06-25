/* narrate.js — reusable voice-over for course lessons.
 *
 * Uses the browser's built-in Web Speech API (speechSynthesis). No install, no
 * network, works offline in any modern browser.
 *
 * Usage in a lesson:
 *   1. Add a hidden narration script:
 *        <div id="narration" hidden>
 *          First sentence of the voice-over. Second sentence. ...
 *        </div>
 *      Split narration into sentences ending in . ! or ? — each becomes one
 *      utterance so pause/stop are responsive and Chrome's long-utterance bug
 *      (it silently stops after ~15s) is avoided.
 *   2. Include this script: <script src="../assets/narrate.js" defer></script>
 *
 * The control bar (Play / Pause / Stop, speed, voice) is injected automatically.
 */
(function () {
  "use strict";

  if (!("speechSynthesis" in window)) {
    document.addEventListener("DOMContentLoaded", function () {
      var bar = document.createElement("div");
      bar.className = "narrator-bar";
      bar.style.cssText = barCss() + ";color:#b23b3b";
      bar.textContent = "Voice-over unavailable: this browser has no speech synthesis.";
      document.body.appendChild(bar);
    });
    return;
  }

  var synth = window.speechSynthesis;
  var chunks = [];      // sentences to speak
  var idx = 0;          // current sentence index
  var playing = false;
  var paused = false;
  var voices = [];
  var chosenVoice = null;
  var rate = 1.0;
  var els = {};

  function barCss() {
    return [
      "position:fixed", "top:0", "left:0", "right:0", "z-index:1000",
      "display:flex", "gap:.5rem", "align-items:center",
      "padding:.5rem .9rem",
      "background:rgba(253,252,249,.92)", "backdrop-filter:blur(6px)",
      "border-bottom:1px solid #e3e0d8",
      "font-family:ui-sans-serif,system-ui,sans-serif", "font-size:.85rem"
    ].join(";");
  }

  function btn(label, title) {
    var b = document.createElement("button");
    b.textContent = label;
    b.title = title || label;
    b.style.cssText =
      "font:inherit;cursor:pointer;border:1px solid #cfcabb;background:#fff;" +
      "border-radius:6px;padding:.25rem .6rem;color:#1a1a1a";
    return b;
  }

  function loadNarration() {
    var src = document.getElementById("narration");
    if (!src) return [];
    var text = src.textContent.replace(/\s+/g, " ").trim();
    if (!text) return [];
    // Split into sentences, keeping the terminal punctuation.
    var parts = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [text];
    return parts.map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function pickDefaultVoice() {
    if (!voices.length) return null;
    // Prefer an English voice; fall back to the first available.
    var en = voices.filter(function (v) { return /^en(-|_|$)/i.test(v.lang); });
    var pool = en.length ? en : voices;
    var google = pool.find(function (v) { return /google/i.test(v.name); });
    return google || pool[0];
  }

  function speakFrom(i) {
    if (i >= chunks.length) { stop(); return; }
    idx = i;
    var u = new SpeechSynthesisUtterance(chunks[i]);
    if (chosenVoice) u.voice = chosenVoice;
    u.rate = rate;
    u.onend = function () {
      if (playing && !paused) speakFrom(idx + 1);
    };
    u.onerror = function () { /* skip a failed chunk */ if (playing) speakFrom(idx + 1); };
    synth.speak(u);
  }

  function play() {
    if (!chunks.length) return;
    if (paused) { synth.resume(); paused = false; setState(); return; }
    if (playing) return;
    synth.cancel();
    playing = true; paused = false;
    speakFrom(idx >= chunks.length ? 0 : idx);
    setState();
  }
  function pause() {
    if (!playing || paused) return;
    synth.pause(); paused = true; setState();
  }
  function stop() {
    synth.cancel(); playing = false; paused = false; idx = 0; setState();
  }

  function setState() {
    els.play.textContent = paused ? "▶ Resume" : (playing ? "❚❚ Pause" : "▶ Play narration");
    els.play.onclick = (playing && !paused) ? pause : play;
    els.stop.disabled = !playing;
    els.stop.style.opacity = playing ? "1" : ".5";
  }

  function buildBar() {
    chunks = loadNarration();

    var bar = document.createElement("div");
    bar.className = "narrator-bar";
    bar.style.cssText = barCss();

    var label = document.createElement("strong");
    label.textContent = "🔊 Voice-over";
    label.style.cssText = "color:#3a5a78;margin-right:.3rem";

    els.play = btn("▶ Play narration");
    els.stop = btn("■ Stop");
    els.stop.onclick = stop;

    // Speed control
    var speedWrap = document.createElement("label");
    speedWrap.style.cssText = "display:flex;align-items:center;gap:.3rem;color:#6b6b6b";
    speedWrap.append("speed");
    var speed = document.createElement("input");
    speed.type = "range"; speed.min = "0.7"; speed.max = "1.4"; speed.step = "0.1"; speed.value = "1";
    speed.style.width = "70px";
    var speedVal = document.createElement("span");
    speedVal.textContent = "1.0×"; speedVal.style.minWidth = "2.4em";
    speed.oninput = function () {
      rate = parseFloat(speed.value); speedVal.textContent = rate.toFixed(1) + "×";
      if (playing && !paused) { var resumeAt = idx; stop(); idx = resumeAt; play(); }
    };
    speedWrap.append(speed, speedVal);

    // Voice selector
    var voiceSel = document.createElement("select");
    voiceSel.style.cssText = "font:inherit;max-width:11rem;border:1px solid #cfcabb;border-radius:6px;padding:.2rem";
    voiceSel.title = "Narration voice";
    voiceSel.onchange = function () {
      chosenVoice = voices[parseInt(voiceSel.value, 10)] || null;
      if (playing) { var at = idx; stop(); idx = at; play(); }
    };
    els.voiceSel = voiceSel;

    var spacer = document.createElement("span");
    spacer.style.flex = "1";

    bar.append(label, els.play, els.stop, speedWrap, spacer, voiceSel);
    document.body.appendChild(bar);

    // Push page content down so the fixed bar doesn't cover the title.
    document.body.style.paddingTop = "2.6rem";

    setState();
    refreshVoices();
  }

  function refreshVoices() {
    voices = synth.getVoices();
    if (!els.voiceSel) return;
    els.voiceSel.innerHTML = "";
    voices.forEach(function (v, i) {
      var o = document.createElement("option");
      o.value = i; o.textContent = v.name + " (" + v.lang + ")";
      els.voiceSel.appendChild(o);
    });
    if (!chosenVoice) chosenVoice = pickDefaultVoice();
    if (chosenVoice) els.voiceSel.value = String(voices.indexOf(chosenVoice));
  }

  // Voices load asynchronously in most browsers.
  if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = refreshVoices;

  // Stop narration when leaving the page (otherwise it keeps talking).
  window.addEventListener("beforeunload", function () { synth.cancel(); });

  document.addEventListener("DOMContentLoaded", buildBar);
})();
