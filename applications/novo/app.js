import { LINES } from "./narration.js";
import { createOrb } from "./orb.js";
import { createMusic } from "./music.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE = "cubic-bezier(.22, 1, .36, 1)";
// The publish script stamps a ?v= onto this module's URL; reuse it to get past CDN caches.
const VERSION = new URL(import.meta.url).search;
const TEMPO = 0.7; // Scales every scripted pause and animation. Lower is faster.

const intro = $("#intro");
const world = $("#world");
const caption = $("#caption");
const orbCanvas = $("#orb");
const orb = createOrb(orbCanvas);

/* ---------- Layout: a fixed design canvas scaled to the viewport ---------- */
function layout() {
  const portrait = innerWidth / innerHeight < 0.8;
  root.classList.toggle("portrait", portrait);
  const width = portrait ? 760 : 1280;
  const height = portrait ? 1240 : 720;
  root.style.setProperty("--s", String(Math.min(innerWidth / width, (innerHeight - 52) / height)));
}
layout();
addEventListener("resize", layout);

/* ---------- Audio: narrator clips, amplitude, small interface sounds ---------- */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const ac = AudioCtx ? new AudioCtx() : null;
const buffers = {};
let analyser = null;
let master = null;
let currentSource = null;
let speaking = null;
let muted = false;

if (ac) {
  master = ac.createGain();
  master.connect(ac.destination);
  analyser = ac.createAnalyser();
  analyser.fftSize = 1024;
  analyser.connect(master);
}
const music = ac ? createMusic(ac, master) : null;
// Which layers of the score play in each chapter: 0 pad, 1 + arpeggio, 2 + rhythm.
const SCORE = [0, 1, 1, 2, 2, 2, 2, 2, 1];

const voiceReady = (async () => {
  if (!ac) return;
  try {
    const manifest = await (await fetch(`audio/manifest.json${VERSION}`, { cache: "no-cache" })).json();
    const jobs = Object.entries(manifest.clips || {}).map(async ([id, clip]) => {
      const data = await (await fetch(`audio/${clip.file}?v=${clip.hash}`)).arrayBuffer();
      buffers[id] = await ac.decodeAudioData(data);
    });
    if (manifest.music) {
      jobs.push(
        (async () => {
          const data = await (await fetch(`audio/${manifest.music}`)).arrayBuffer();
          music.useTrack(await ac.decodeAudioData(data));
        })(),
      );
    }
    await Promise.all(jobs);
  } catch {
    // No generated voice yet: the film runs on timed captions instead.
  }
})();

function sfx(kind) {
  if (!ac || muted || ac.state !== "running") return;
  const now = ac.currentTime;
  const gain = ac.createGain();
  gain.connect(master);
  const osc = ac.createOscillator();
  osc.connect(gain);
  if (kind === "tick") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1500, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.03);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.06);
  } else if (kind === "pop") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.09);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    osc.start(now);
    osc.stop(now + 0.18);
  } else {
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.5);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    osc.start(now);
    osc.stop(now + 0.62);
  }
}

const samples = new Uint8Array(1024);
function meter() {
  let level = 0.04;
  if (speaking === "real" && analyser) {
    analyser.getByteTimeDomainData(samples);
    let sum = 0;
    for (const value of samples) sum += ((value - 128) / 128) ** 2;
    level = Math.min(1, Math.sqrt(sum / samples.length) * 5.5);
  } else if (speaking === "timed") {
    const t = performance.now() / 1000;
    level = 0.18 + 0.42 * Math.abs(Math.sin(t * 8.3) * Math.sin(t * 2.9 + 1));
  }
  orb.setAmp(level);
  requestAnimationFrame(meter);
}
requestAnimationFrame(meter);

/* ---------- Timeline engine ---------- */
class Cancelled extends Error {}
let token = 0;
let current = 0;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function makeCtx(mine) {
  const alive = () => mine === token;
  const guard = () => {
    if (!alive()) throw new Cancelled();
  };
  const ctx = {
    alive,
    async wait(ms) {
      await sleep(ms * TEMPO);
      guard();
    },
    async until(time) {
      await sleep(Math.max(0, time - performance.now()));
      guard();
    },
    async anim(el, keyframes, options = {}) {
      guard();
      if (!el) return;
      const animation = el.animate(keyframes, { easing: EASE, fill: "both", ...options, duration: (options.duration ?? 600) * TEMPO });
      if (reduced) animation.finish();
      await animation.finished.catch(() => {});
      guard();
    },
    async type(el, text, perChar = 26) {
      for (let index = 1; index <= text.length; index += 1) {
        el.textContent = text.slice(0, index);
        await ctx.wait(perChar);
      }
    },
    async say(id, gap = 160) {
      const words = LINES.find((line) => line.id === id).text.split(" ");
      caption.innerHTML = words.map((word) => `<span>${word}</span>`).join(" ");
      const spans = [...caption.children];
      await Promise.race([voiceReady, sleep(1500)]);
      guard();

      let duration = words.length * 330 + 450;
      const buffer = buffers[id];
      if (buffer && ac.state === "running") {
        const source = ac.createBufferSource();
        source.buffer = buffer;
        source.connect(analyser);
        source.start();
        currentSource = source;
        duration = buffer.duration * 1000;
        speaking = "real";
      } else {
        speaking = "timed";
      }
      music?.duck(true);

      const weights = words.map((word) => word.length + (/[.,]$/.test(word) ? 5 : 2));
      const total = weights.reduce((sum, weight) => sum + weight, 0);
      const started = performance.now();
      let elapsed = 0;
      for (let index = 0; index < words.length; index += 1) {
        await ctx.until(started + (duration * 0.94 * elapsed) / total);
        spans[index].classList.add("said");
        elapsed += weights[index];
      }
      await ctx.until(started + duration);
      speaking = null;
      music?.duck(false);
      await sleep(gap);
      guard();
    },
  };
  return ctx;
}

function halt() {
  token += 1;
  try {
    currentSource?.stop();
  } catch {
    // Already finished.
  }
  currentSource = null;
  speaking = null;
  music?.duck(false);
  caption.textContent = "";
}

const templates = new Map();
for (const scene of $$(".scene")) templates.set(scene.id, scene.innerHTML);

function enter(id) {
  for (const scene of $$(".scene")) scene.classList.remove("on", "ended");
  const scene = document.getElementById(id);
  scene.innerHTML = templates.get(id);
  scene.classList.add("on");
  caption.textContent = "";
  return scene;
}

function orbState(state) {
  orbCanvas.classList.toggle("on", state !== "off");
  orbCanvas.classList.toggle("small", state === "small");
  if (state === "off") setTimeout(() => !orbCanvas.classList.contains("on") && orb.stop(), 700);
  else orb.start();
}

/* ---------- Shared pieces ---------- */
const TOOLS = [
  { key: "Co", name: "Copilot", color: "linear-gradient(135deg,#2a7de1,#8a5cf6 60%,#e0529c)" },
  { key: "GPT", name: "ChatGPT", color: "#111418", small: true },
  { key: "T", name: "Teams", color: "#4f52b2" },
  { key: "W", name: "Word", color: "#2b579a" },
  { key: "X", name: "Excel", color: "#1e7145" },
  { key: "P", name: "PowerPoint", color: "#c43e1c" },
  { key: "O", name: "Outlook", color: "#0f6cbd" },
];
const tile = (tool, style = "") =>
  `<div class="tile" title="${tool.name}" style="--c:${tool.color};${tool.small ? "font-size:.62em;" : ""}${style}"><span>${tool.key}</span></div>`;

function setFlip(el, value, silent = false) {
  const text = String(value);
  if (el.children.length !== text.length) el.innerHTML = [...text].map((digit) => `<b>${digit}</b>`).join("");
  [...text].forEach((digit, index) => {
    const cell = el.children[index];
    if (cell.textContent === digit) return;
    cell.textContent = digit;
    if (!reduced) cell.animate([{ transform: "rotateX(-80deg)", filter: "brightness(1.6)" }, { transform: "none", filter: "none" }], { duration: 220, easing: "ease-out" });
  });
  if (!silent) sfx("tick");
}

async function roll(ctx, el, text) {
  await ctx.anim(el, [{ opacity: 1, transform: "none", filter: "blur(0)" }, { opacity: 0, transform: "translateY(-.45em)", filter: "blur(6px)" }], { duration: 260, easing: "ease-in" });
  el.textContent = text;
  await ctx.anim(el, [{ opacity: 0, transform: "translateY(.45em)", filter: "blur(6px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }], { duration: 420 });
}

// Starts a narration line that runs alongside the scene's animation.
function narrate(ctx, id) {
  const voice = ctx.say(id, 0);
  voice.catch(() => {});
  return voice;
}

const popIn = [
  { opacity: 0, transform: "scale(.4)", filter: "blur(8px)" },
  { opacity: 1, transform: "scale(1)", filter: "blur(0)" },
];

/* ---------- Scenes ---------- */
const scenes = [
  {
    name: "Gate",
    async run(ctx) {
      const el = enter("s-gate");
      orbState("off");
      await ctx.wait(1250);
      const dots = $(".gate-dots", el);
      for (let index = 0; index < 13; index += 1) {
        dots.textContent += "•";
        sfx("tick");
        await ctx.wait(62);
      }
      await ctx.wait(160);
      $(".gate-pill", el).classList.add("ok");
      sfx("pop");
      await ctx.wait(650);
      await ctx.anim(el, [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(.55)" }], { duration: 420, easing: "ease-in", fill: "none" });
    },
  },
  {
    name: "Hello",
    async run(ctx) {
      enter("s-hello");
      orbState("on");
      await ctx.wait(900);
      await ctx.say("a1", 220);
      await ctx.say("a2", 240);
      await ctx.say("a3", 160);
    },
  },
  {
    name: "Story",
    async run(ctx) {
      const el = enter("s-story");
      orbState("off");
      const seats = $(".story-seats", el);
      seats.innerHTML = "<i></i>".repeat(96);
      const all = $$("i", seats);
      const title = $(".story-label b", el);
      const sub = $(".story-label span", el);
      const left = $(".story-left", el);
      const card = $(".story-card", el);
      const label = (a, b, c) => {
        title.textContent = a;
        sub.textContent = b;
        left.textContent = c;
      };
      const shuffled = [...all].sort(() => Math.random() - 0.5);

      label("Monday", "Licences assigned", "Day 1");
      await ctx.anim(card, [{ opacity: 0, transform: "scale(.92) translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 700 });
      await Promise.all([
        ctx.say("b1"),
        (async () => {
          for (const [index, seat] of all.entries()) {
            seat.classList.add("lit");
            if (index % 4 === 0) await ctx.wait(70);
          }
        })(),
      ]);

      label("Launch week", "Everybody tries it", "Day 5");
      await Promise.all([
        ctx.say("b2"),
        (async () => {
          for (let round = 0; round < 26; round += 1) {
            const seat = all[Math.floor(Math.random() * all.length)];
            seat.classList.add("hot");
            setTimeout(() => seat.classList.remove("hot"), 420);
            await ctx.wait(150);
          }
        })(),
      ]);

      label("Six weeks later", "Back to before", "Week 6");
      await Promise.all([
        ctx.say("b3"),
        (async () => {
          for (const [index, seat] of shuffled.slice(0, 88).entries()) {
            seat.classList.remove("lit");
            if (index % 3 === 0) await ctx.wait(85);
          }
        })(),
      ]);

      label("The habit never formed", "Tools: fine", "Week 6");
      await ctx.say("b4", 200);
      await ctx.anim(el, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.9)" }], { duration: 420, easing: "ease-in" });
      orbState("on");
      await ctx.wait(650);
      await ctx.say("b5", 250);
      orbState("off");
      await ctx.wait(350);
    },
  },
  {
    name: "Week six",
    async run(ctx) {
      const el = enter("s-widget");
      orbState("off");
      const spots = [[96, 6, -8], [128, 52, 6], [44, 44, -4], [0, 60, 8], [150, 0, 10], [58, 0, 4], [164, 62, -6]];
      $(".w-tiles", el).innerHTML = TOOLS.map((tool, index) => tile(tool, `left:${spots[index][0]}px;top:${spots[index][1]}px;rotate:${spots[index][2]}deg;`)).join("");
      const letters = $(".w-letters", el);
      letters.innerHTML = [..."TRIED ONCE"].map((char) => (char === " " ? '<b class="gap"></b>' : `<b>${char}</b>`)).join("");
      const flips = Object.fromEntries($$("[data-flip]", el).map((node) => [node.dataset.flip, node]));
      setFlip(flips.days, "08", true);
      setFlip(flips.prompts, "23", true);
      setFlip(flips.habits, "00", true);
      const widget = $(".widget", el);
      const voice = narrate(ctx, "d1");

      await ctx.anim(widget, [{ opacity: 0, transform: "scale(.82) translateY(30px)" }, { opacity: 1, transform: "none" }], { duration: 800 });
      const cells = $$("b:not(.gap)", letters);
      const days = [8, 12, 17, 21, 26, 30, 34, 38, 42];
      const prompts = [23, 19, 14, 11, 8, 5, 3, 2, 1];
      for (let step = 0; step < days.length; step += 1) {
        setFlip(flips.days, String(days[step]).padStart(2, "0"));
        setFlip(flips.prompts, String(prompts[step]).padStart(2, "0"), true);
        cells.forEach((cell) => cell.classList.remove("hi"));
        cells[step % cells.length].classList.add("hi");
        await ctx.wait(330);
      }
      await ctx.anim(flips.habits, [{ transform: "translateX(0)" }, { transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "translateX(0)" }], { duration: 300, easing: "ease-in-out", fill: "none" });
      await ctx.wait(700);
      await voice;

      // Pull back: the tools drift past, the colleague's week shrinks to a dot.
      const floaters = $(".floaters", el);
      const film = { w: floaters.clientWidth, h: floaters.clientHeight };
      const places = [[0.1, 0.12], [0.62, 0.04], [0.86, 0.3], [0.06, 0.6], [0.3, 0.82], [0.8, 0.74], [0.42, 0.1]];
      floaters.innerHTML = TOOLS.map((tool, index) => tile(tool, `left:${places[index][0] * film.w}px;top:${places[index][1] * film.h}px;`)).join("");
      sfx("whoosh");
      $$(".tile", floaters).forEach((node, index) => {
        node.animate(
          [
            { opacity: 0, transform: "scale(2.6)", filter: "blur(14px)" },
            { opacity: 1, transform: "scale(1)", filter: "blur(0)", offset: 0.55 },
            { opacity: 0, transform: "scale(.5)", filter: "blur(2px)" },
          ],
          { duration: 1900, delay: index * 70, easing: "ease-out", fill: "both" },
        );
      });
      await ctx.anim(widget, [{ transform: "none", opacity: 1 }, { transform: "scale(.16)", opacity: 0 }], { duration: 1700, easing: "cubic-bezier(.6,0,.3,1)" });
      await ctx.wait(300);
    },
  },
  {
    name: "Not a habit",
    async run(ctx) {
      const el = enter("s-type");
      orbState("off");
      const line = $(".type-line", el);
      const word = $(".roll b", el);
      const voice = narrate(ctx, "e1");
      await ctx.anim(line, [{ opacity: 0, transform: "translateY(18px)", filter: "blur(8px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }], { duration: 600 });
      await ctx.wait(650);
      for (const next of ["keynote", "demo", "prompt list"]) {
        await roll(ctx, word, next);
        await ctx.wait(520);
      }
      await ctx.anim(line, [{ opacity: 1 }, { opacity: 0, filter: "blur(6px)" }], { duration: 260 });
      line.textContent = "and the habit is";
      await ctx.anim(line, [{ opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0)" }], { duration: 380 });
      await ctx.wait(800);

      const orbit = $(".orbit", el);
      const size = { w: orbit.clientWidth, h: orbit.clientHeight };
      const ring = [[0.5, 0.2], [0.72, 0.3], [0.78, 0.6], [0.6, 0.8], [0.4, 0.8], [0.22, 0.6], [0.28, 0.3]];
      orbit.innerHTML = TOOLS.map((tool, index) => tile(tool, `left:${ring[index][0] * size.w - 30}px;top:${ring[index][1] * size.h - 30}px;`)).join("");
      line.textContent = "the job";
      line.classList.add("big");
      sfx("pop");
      $$(".tile", orbit).forEach((node, index) => node.animate(popIn, { duration: 700, delay: index * 60, easing: EASE, fill: "both" }));
      await ctx.anim(line, [{ opacity: 0, transform: "scale(.7)", filter: "blur(10px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }], { duration: 700 });
      await ctx.wait(1500);
      await voice;
      await ctx.anim(el, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.5)", filter: "blur(8px)" }], { duration: 520, easing: "ease-in" });
    },
  },
  {
    name: "In your shoes",
    async run(ctx) {
      const el = enter("s-mock");
      orbState("off");
      const app = $("#app", el);
      const fit = $(".fit", el);
      const body = $("#reqBody", el);
      const log = $("#chatLog", el);
      const counts = Object.fromEntries($$("[data-count]", el).map((node) => [node.dataset.count, node]));
      const narrow = root.classList.contains("portrait");
      const view = (transform, duration = 1100) => ctx.anim(app, [{ transform }], { duration, easing: "cubic-bezier(.65,0,.2,1)" });

      app.style.transform = "translate(-576px, 200px) scale(1.75)";
      let voice = narrate(ctx, "f1");
      const requests = [
        { who: "Finance leadership team", initials: "FL", color: "#0f6c5c", time: "9:41", text: "Can we get a hands-on AI session before quarter close?", bump: ["unread", "lead"] },
        { who: "Global AI event · production", initials: "EV", color: "#6b4fd8", time: "9:42", text: "Re: follow-up — what happens after the broadcast ends?", bump: ["unread", "events"] },
        { who: "#ai-champions", initials: "#", color: "#c2571a", time: "9:43", text: "People keep asking which tools are approved.", bump: ["unread"] },
      ];
      for (const request of requests) {
        const row = document.createElement("div");
        row.className = "req";
        row.innerHTML = `<span class="av" style="--c:${request.color}">${request.initials}</span><b>${request.who}</b><time>${request.time}</time><p></p>`;
        body.prepend(row);
        sfx("pop");
        for (const key of request.bump) counts[key].textContent = String(Number(counts[key].textContent) + 1);
        ctx.anim(row, [{ opacity: 0, transform: "translateY(-10px)" }, { opacity: 1, transform: "none" }], { duration: 350 }).catch(() => {});
        await ctx.type($("p", row), request.text, 17);
        await ctx.wait(260);
      }

      const badges = $("#badges", el);
      [["3", 780, 44, 40], ["12", 838, 14, 32], ["9+", 874, 72, 28], ["1", 812, 104, 24]].forEach(([text, x, y, size], index) => {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = text;
        badge.style.cssText = `left:${x}px;top:${y}px;height:${size}px;min-width:${size}px;font-size:${size * 0.45}px`;
        badges.append(badge);
        setTimeout(() => sfx("tick"), index * 110);
        badge.animate([{ transform: "scale(0)" }, { transform: "scale(1.2)", offset: 0.6 }, { transform: "scale(1)" }], { duration: 420, delay: index * 110, easing: "ease-out", fill: "both" });
      });
      await ctx.wait(1500);
      $$(".badge", badges).forEach((badge, index) => badge.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translate(${40 + index * 14}px,-50px) scale(.4)` }], { duration: 500, delay: 300 + index * 40, fill: "forwards" }));

      // Pull back to the whole desk, then lean in to the conversation.
      await voice;
      app.classList.add("shell");
      await view("translate(0px, 0px) scale(1)", 1200);
      await ctx.wait(250);
      view(narrow ? "translate(150px, 40px) scale(1.2)" : "translate(215px, 130px) scale(1.45)", 1100).catch(() => {});

      const bubble = (className, html) => {
        const node = document.createElement("div");
        node.className = className;
        node.innerHTML = html;
        log.append(node);
        node.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: EASE });
        return node;
      };
      voice = narrate(ctx, "f2");
      const ask = bubble("bubble me", "");
      await ctx.type(ask, "Turn Finance’s request into a 45-minute hands-on session with approved tools.", 20);
      await ctx.wait(450);
      bubble("bubble", "On it, from the Finance thread and the approved-use guidance.");
      const working = bubble("working", "Working… <span>1s</span>");
      await ctx.wait(500);
      const parts = bubble(
        "parts",
        [
          ["A · Demo", "Explain a variance with Copilot in Excel", "10 min"],
          ["B · Hands-on", "Draft the commentary, then check every number", "25 min"],
          ["C · Follow-up", "One-page guide and a two-week check-in", "10 min"],
        ]
          .map(([kicker, text, time]) => `<div class="part"><u>${kicker}</u><p>${text}</p><em>${time}</em></div>`)
          .join(""),
      );
      const cards = $$(".part", parts);
      const stamps = ["4s", "48s", "1m 16s", "1m 43s", "2m 9s"];
      for (let step = 0; step < stamps.length; step += 1) {
        $("span", working).textContent = stamps[step];
        cards.forEach((card, index) => {
          const progress = Math.max(0, Math.min(1, (step + 1 - index * 0.6) / 3.2));
          card.style.setProperty("--p", String(progress));
          if (progress > 0.3) card.classList.add("filled");
        });
        await ctx.wait(520);
      }
      for (const card of cards) {
        card.style.setProperty("--p", "1");
        card.classList.add("filled", "done");
        sfx("tick");
        await ctx.wait(160);
      }
      await ctx.wait(500);
      working.remove();
      bubble("bubble", "<b>45 minutes in three parts</b>, with success measures and a feedback form. Examples use approved, non-sensitive data. Your reply to Finance is drafted.");

      await voice;
      body.innerHTML = `
        <div class="thread-head"><span class="av">FL</span>Finance leadership team</div>
        <div class="thread-msg">Can we get a hands-on AI session before quarter close?</div>
        <div class="draft">
          <small><b>●</b> Drafted for you. Read it, change it, then press Send.</small>
          Yes. 45 minutes, three parts: A, B and C. Agenda attached.
          <div class="mini"><i>A · DEMO</i><i>B · HANDS-ON</i><i>C · FOLLOW-UP</i></div>
          <footer><span>Reply as David</span><span class="send">Send</span></footer>
        </div>`;
      await view("translate(0px, 0px) scale(1)", 1000);
      await ctx.wait(500);
      voice = narrate(ctx, "f3");
      await view(narrow ? "translate(-420px, -200px) scale(1.45)" : "translate(-640px, -350px) scale(1.85)", 1100);

      const send = $(".send", el);
      const cursor = $("#cursor", el);
      const frame = fit.getBoundingClientRect();
      const target = send.getBoundingClientRect();
      const unit = frame.width / 1040;
      const x = (target.left + target.width * 0.6 - frame.left) / unit;
      const y = (target.top + target.height * 0.55 - frame.top) / unit;
      await ctx.anim(cursor, [{ opacity: 0, transform: `translate(${x - 180}px, ${y - 150}px)` }, { opacity: 1, transform: `translate(${x}px, ${y}px)` }], { duration: 800 });
      send.classList.add("pressed");
      sfx("tick");
      await ctx.wait(160);
      send.classList.remove("pressed");
      send.classList.add("sending");
      send.textContent = "Sending…";
      sfx("whoosh");
      await ctx.wait(800);
      send.classList.replace("sending", "sent");
      send.textContent = "Sent ✓";
      await ctx.wait(900);
      await voice;
      await ctx.anim(el, [{ opacity: 1, filter: "blur(0)" }, { opacity: 0, filter: "blur(10px)" }], { duration: 450, easing: "ease-in" });
    },
  },
  {
    name: "Every audience",
    async run(ctx) {
      const el = enter("s-aud");
      orbState("off");
      const audiences = [
        { name: "Finance.", c1: "#0a63d8", c2: "#001965", who: "Finance leadership team", ask: "Can it explain this variance?", rows: [["Format", "45 min · hands-on"], ["Tool", "Microsoft 365 Copilot in Excel"], ["Exercise", "Draft the commentary, then check every number"], ["Leaves behind", "Prompt card and a checking routine"]] },
        { name: "R&D.", c1: "#0f8a7a", c2: "#07423f", who: "Research scientists", ask: "Thirty papers by Friday. Where do I start?", rows: [["Format", "60 min · lab"], ["Tool", "ChatGPT Enterprise"], ["Exercise", "Summarise, then trace every claim to its source"], ["Leaves behind", "Literature-review template"]] },
        { name: "Production.", c1: "#c2571a", c2: "#5e2408", who: "Site team leads", ask: "Can it tidy my shift handover?", rows: [["Format", "30 min · on site"], ["Tool", "Microsoft 365 Copilot in Teams"], ["Exercise", "Turn rough notes into a clear handover"], ["Leaves behind", "Handover prompt and a do / don’t list"]] },
        { name: "Legal.", c1: "#6b4fd8", c2: "#2a1a6b", who: "Legal & Compliance", ask: "What may I paste, and what never?", rows: [["Format", "30 min · clinic"], ["Tool", "Approved-use guidance"], ["Exercise", "Sort ten examples: fine, careful, never"], ["Leaves behind", "One-page decision guide"]] },
        { name: "Leadership.", c1: "#2b3242", c2: "#0b0d12", who: "Senior leadership team", ask: "Where does AI change our plan?", rows: [["Format", "90 min · working session"], ["Tool", "Both, live, no slides"], ["Exercise", "One real decision, prepared with and without AI"], ["Leaves behind", "Three commitments and a 30-day check-in"]] },
      ];
      const plan = $("#plan", el);
      const word = $(".roll b", el);
      const render = (audience) => {
        plan.innerHTML = `
          <div class="plan-bar"><i></i><i></i><i></i><span>Session plan · ${audience.name.replace(".", "")}</span></div>
          <div class="plan-main">
            <div class="plan-ask" style="--c1:${audience.c1};--c2:${audience.c2}"><u>They ask</u><q>${audience.ask}</q><span>${audience.who}</span></div>
            <div class="plan-rows">${audience.rows.map(([key, value]) => `<div><u>${key}</u><span>${value}</span></div>`).join("")}</div>
          </div>`;
      };
      render(audiences[0]);
      const voice = narrate(ctx, "g1");
      await Promise.all([
        ctx.anim($(".headline", el), [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 500 }),
        ctx.anim(plan, [{ opacity: 0, transform: "translateY(60px) scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 800 }),
      ]);
      await ctx.wait(1500);
      for (const audience of audiences.slice(1)) {
        sfx("whoosh");
        roll(ctx, word, audience.name).catch(() => {});
        await ctx.anim(plan, [{ opacity: 1, transform: "none", filter: "blur(0)" }, { opacity: 0, transform: "translateX(-140px)", filter: "blur(12px)" }], { duration: 300, easing: "ease-in" });
        render(audience);
        await ctx.anim(plan, [{ opacity: 0, transform: "translateX(140px)", filter: "blur(12px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }], { duration: 480 });
        await ctx.wait(1250);
      }
      await voice;
      await ctx.anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 380 });
    },
  },
  {
    name: "Leaves behind",
    async run(ctx) {
      const el = enter("s-assets");
      orbState("off");
      const assets = [
        ["Agenda template", "M6 4h12v16H6z M9 8h6 M9 12h6 M9 16h3"],
        ["Demo script", "M5 6h14v9H10l-4 4v-4H5z"],
        ["Prompt cards", "M4 8h12v11H4z M8 8V5h12v11h-4"],
        ["One-page guide", "M7 3h7l4 4v14H7z M14 3v4h4"],
        ["Recording", "M4 7h11v10H4z M15 10l5-3v10l-5-3"],
        ["Feedback form", "M4 7l2 2 3-3 M4 15l2 2 3-3 M12 8h8 M12 16h8"],
        ["Success measures", "M5 20V10 M10 20V5 M15 20v-7 M20 20V8"],
        ["Playbook", "M4 6c3-1 5-1 8 1v12c-3-2-5-2-8-1z M20 6c-3-1-5-1-8 1v12c3-2 5-2 8-1z"],
      ];
      const dock = $("#dock", el);
      dock.innerHTML = assets.map(([name, path]) => `<div class="slot"><div class="tile light"><svg viewBox="0 0 24 24"><path d="${path}"/></svg></div><span>${name}</span></div>`).join("");
      const slots = $$(".slot", dock);
      const counter = $("[data-flip]", el);
      setFlip(counter, "000", true);
      const voice = narrate(ctx, "h1");
      await Promise.all([
        ctx.anim($(".headline", el), [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 500 }),
        ctx.anim(dock, [{ opacity: 0, translate: "0 24px" }, { opacity: 1, translate: "0 0" }], { duration: 600 }),
        ctx.anim(counter, [{ opacity: 0 }, { opacity: 1 }], { duration: 600 }),
      ]);
      let count = 0;
      for (const slot of slots) {
        slots.forEach((other) => other.classList.remove("hi"));
        slot.classList.add("hi");
        count += 1;
        setFlip(counter, String(count).padStart(3, "0"));
        await ctx.wait(430);
      }
      roll(ctx, $(".swap-line", el), "So the next one starts ahead.").catch(() => {});
      for (let lap = 0; lap < 10; lap += 1) {
        slots.forEach((other) => other.classList.remove("hi"));
        slots[(lap * 3) % slots.length].classList.add("hi");
        count += 1;
        setFlip(counter, String(count).padStart(3, "0"));
        await ctx.wait(190);
      }
      slots.forEach((other) => other.classList.remove("hi"));
      await ctx.wait(900);
      await voice;
      await ctx.anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 380 });
    },
  },
  {
    name: "The ask",
    async run(ctx) {
      const el = enter("s-finale");
      orbState("off");
      const row = $("#toolRow", el);
      row.innerHTML = TOOLS.map((tool) => tile(tool)).join("");
      const tiles = $$(".tile", row);
      const headline = $(".headline", el);
      const line = $(".swap-line", el);
      const icon = $("#appIcon", el);
      const end = $("#endcard", el);

      const voice = narrate(ctx, "c1");
      await ctx.anim(headline, [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 500 });
      for (const node of tiles) {
        sfx("tick");
        node.animate(popIn, { duration: 520, easing: EASE, fill: "both" });
        await ctx.wait(190);
      }
      await ctx.wait(500);
      await roll(ctx, line, "I’d love to help make them a habit.");
      const center = row.getBoundingClientRect();
      tiles.forEach((node) => {
        const box = node.getBoundingClientRect();
        const dx = (center.left + center.width / 2 - (box.left + box.width / 2)) / (box.width / 72);
        node.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${dx}px) scale(.5)` }], { duration: 650, easing: "cubic-bezier(.6,0,.3,1)", fill: "forwards" });
      });
      await ctx.wait(380);
      sfx("pop");
      await ctx.anim(icon, [{ opacity: 0, scale: ".5", filter: "blur(10px)" }, { opacity: 1, scale: "1", filter: "blur(0)" }], { duration: 700 });
      await voice;
      await ctx.wait(500);

      caption.textContent = "";
      await ctx.anim(headline, [{ opacity: 1 }, { opacity: 0 }], { duration: 350 });
      await ctx.anim(icon, [{ top: "50%", scale: "1" }, { top: "25%", scale: ".6" }], { duration: 800 });
      end.classList.add("on");
      await ctx.anim(end, [{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }], { duration: 700 });
    },
  },
];

/* ---------- Transport ---------- */
const dots = $("#dots");
dots.innerHTML = scenes.map((scene, index) => `<button type="button" role="tab" aria-label="${index + 1}. ${scene.name}"></button>`).join("");
const dotButtons = $$("button", dots);
dotButtons.forEach((button, index) => button.addEventListener("click", () => play(index)));

function mark(index) {
  current = index;
  dotButtons.forEach((button, at) => {
    button.setAttribute("aria-selected", String(at === index));
    button.classList.toggle("seen", at < index);
  });
}

async function play(from) {
  halt();
  const mine = token;
  const ctx = makeCtx(mine);
  if (ac?.state === "running") music?.start();
  try {
    for (let index = Math.max(0, Math.min(from, scenes.length - 1)); index < scenes.length; index += 1) {
      mark(index);
      music?.setLevel(SCORE[index]);
      await scenes[index].run(ctx);
    }
    music?.fadeOut(8);
  } catch (error) {
    if (!(error instanceof Cancelled)) throw error;
  }
}

$("#next").addEventListener("click", () => play(current + 1));
$("#prev").addEventListener("click", () => play(current - 1));
$("#mute").addEventListener("click", (event) => {
  muted = !muted;
  event.currentTarget.setAttribute("aria-pressed", String(muted));
  event.currentTarget.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
  if (master) master.gain.value = muted ? 0 : 1;
});
world.addEventListener("click", (event) => {
  if (event.target.closest("#replay")) play(0);
});
addEventListener("keydown", (event) => {
  if (!world.classList.contains("open")) return;
  if (event.key === "ArrowRight") play(current + 1);
  if (event.key === "ArrowLeft") play(current - 1);
  if (event.key.toLowerCase() === "m") $("#mute").click();
});

/* ---------- Opening: the touch, the spark, the portal ---------- */
let opened = false;
async function open() {
  if (opened) return;
  opened = true;
  ac?.resume().then(() => music?.start()).catch(() => {});
  intro.classList.add("touch");
  const spark = $("#spark");
  const ring = $("#portalRing");
  const radius = Math.hypot(innerWidth, innerHeight) * 0.62;

  if (!reduced) {
    await sleep(850);
    sfx("whoosh");
    await spark.animate(
      [
        { opacity: 0, transform: "scale(.2)" },
        { opacity: 1, transform: "scale(1.6)", offset: 0.35 },
        { opacity: 1, transform: "scale(1.1)", offset: 0.6 },
        { opacity: 1, transform: "scale(5)" },
      ],
      { duration: 1250, easing: "ease-in-out", fill: "forwards" },
    ).finished;
    const timing = { duration: 1500, easing: "cubic-bezier(.7,0,.25,1)", fill: "forwards" };
    ring.animate([{ opacity: 1, transform: "scale(.5)" }, { opacity: 1, transform: `scale(${(radius * 2) / 100})` }], timing);
    await world.animate([{ clipPath: "circle(25px at 50% 49.5%)" }, { clipPath: `circle(${radius}px at 50% 49.5%)` }], timing).finished;
  }
  world.classList.add("open");
  world.getAnimations().forEach((animation) => animation.cancel());
  ring.remove();
  intro.remove();
  play(0);
}
$("#start").addEventListener("click", open);
intro.addEventListener("click", open);

// Deep link for review: ?scene=5 opens straight on a chapter.
const jump = new URLSearchParams(location.search).get("scene");
if (jump !== null) {
  opened = true;
  world.classList.add("open");
  $("#portalRing").remove();
  intro.remove();
  play(Number(jump) - 1 || 0);
}
