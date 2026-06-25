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
  var watchdog = null;   // fallback timer for voices that never fire `onend`
  var heartbeat = null;  // periodic resume() to defeat Chrome's ~15s stall

  function clearTimers() {
    if (watchdog) { clearTimeout(watchdog); watchdog = null; }
    if (heartbeat) { clearInterval(heartbeat); heartbeat = null; }
  }

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
    // Prefer a LOCAL (on-device) voice. Chrome's remote "Google …" voices
    // fire `onend` unreliably — usually not at all between back-to-back
    // utterances — which stalls the sentence-by-sentence chain after the first
    // line. Local voices fire it dependably, so use them first.
    var local = pool.filter(function (v) { return v.localService; });
    return local[0] || pool[0];
  }

  function startHeartbeat() {
    if (heartbeat) clearInterval(heartbeat);
    // Chrome silently pauses synthesis after ~15s; a periodic resume() keeps
    // long sentences (and the queue) alive.
    heartbeat = setInterval(function () {
      if (playing && !paused && synth.speaking) synth.resume();
    }, 10000);
  }

  function speakFrom(i) {
    if (i >= chunks.length) { stop(); return; }
    idx = i;
    var advanced = false;            // guard: advance to the next chunk once
    function next() {
      if (advanced) return;
      advanced = true;
      if (watchdog) { clearTimeout(watchdog); watchdog = null; }
      if (playing && !paused) speakFrom(idx + 1);
    }

    var u = new SpeechSynthesisUtterance(chunks[i]);
    if (chosenVoice) u.voice = chosenVoice;
    u.rate = rate;
    u.onend = next;                  // fast path: advance the moment it ends
    u.onerror = next;                // a failed/cancelled chunk: skip ahead
    var started = false;
    u.onstart = function () { started = true; };
    synth.speak(u);

    // Fallback for voices that never fire `onend` (notably Chrome's remote
    // Google voices): poll `speaking` every 250ms and advance as soon as the
    // engine has spoken and gone quiet, so the gap between lines stays short
    // instead of stalling. A per-line hard cap covers an engine that never
    // starts at all.
    var words = chunks[i].split(/\s+/).length;
    var hardCapMs = (words / 2.0) * 1000 + 8000;
    var elapsed = 0, step = 250;
    function poll() {
      if (advanced) return;
      if (paused) { watchdog = setTimeout(poll, step); return; }
      if (synth.speaking) started = true;
      elapsed += step;
      if (!playing || (started && !synth.speaking) || elapsed >= hardCapMs) { next(); return; }
      watchdog = setTimeout(poll, step);
    }
    watchdog = setTimeout(poll, step);
  }

  function play() {
    if (!chunks.length) return;
    if (paused) { synth.resume(); paused = false; setState(); return; }
    if (playing) return;
    synth.cancel();
    playing = true; paused = false;
    startHeartbeat();
    speakFrom(idx >= chunks.length ? 0 : idx);
    setState();
  }
  function pause() {
    if (!playing || paused) return;
    synth.pause(); paused = true; setState();
  }
  function stop() {
    // Set state BEFORE cancel(): cancelling can synchronously fire the current
    // utterance's onend/onerror, and if `playing` were still true that handler
    // would speak the next sentence — the "press Stop, hear the next line" bug.
    playing = false; paused = false; idx = 0;
    clearTimers();
    synth.cancel();
    setState();
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
