// Film kit: the timeline engine and the small animation helpers every film uses.

import { createMusic } from "./music.js";

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
export const EASE = "cubic-bezier(.22, 1, .36, 1)";
export const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const TEMPO = 0.72; // Scales scripted pauses and animations. Lower is faster.
const VERSION = new URL(import.meta.url).search;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class Cancelled extends Error {}

export function createEngine({ caption, lines }) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ac = AudioCtx ? new AudioCtx() : null;
  const buffers = {};
  let master = null;
  let music = null;
  let currentSource = null;
  let muted = false;
  let token = 0;

  if (ac) {
    master = ac.createGain();
    master.connect(ac.destination);
    music = createMusic(ac, master);
  }

  const voiceReady = (async () => {
    if (!ac) return;
    try {
      const manifest = await (await fetch(`audio/manifest.json${VERSION}`, { cache: "no-cache" })).json();
      await Promise.all(
        Object.entries(manifest.clips || {}).map(async ([id, clip]) => {
          const data = await (await fetch(`audio/${clip.file}?v=${clip.hash}`)).arrayBuffer();
          buffers[id] = await ac.decodeAudioData(data);
        }),
      );
    } catch {
      // No generated voice: films run on timed captions.
    }
  })();

  function sfx(kind) {
    if (!ac || muted || ac.state !== "running") return;
    const now = ac.currentTime;
    const gain = ac.createGain();
    gain.connect(master);
    const osc = ac.createOscillator();
    osc.connect(gain);
    const shapes = {
      tick: ["triangle", 1500, 700, 0.03, 0.035, 0.05],
      pop: ["sine", 420, 900, 0.09, 0.07, 0.16],
      whoosh: ["sine", 220, 660, 0.5, 0.05, 0.6],
      done: ["sine", 660, 990, 0.12, 0.07, 0.4],
    };
    const [type, from, to, glide, peak, length] = shapes[kind] || shapes.tick;
    osc.type = type;
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(to, now + glide);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
    osc.start(now);
    osc.stop(now + length + 0.02);
  }

  function makeCtx(mine) {
    const guard = () => {
      if (mine !== token) throw new Cancelled();
    };
    const ctx = {
      sfx,
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
      async type(el, text, perChar = 22) {
        for (let index = 1; index <= text.length; index += 1) {
          el.textContent = text.slice(0, index);
          if (index % 3 === 0) sfx("tick");
          await ctx.wait(perChar);
        }
      },
      // Speaks a line and resolves when it ends.
      async say(id) {
        const text = lines[id];
        const words = text.split(" ");
        caption.innerHTML = words.map((word) => `<span>${word}</span>`).join(" ");
        const spans = [...caption.children];
        await Promise.race([voiceReady, sleep(1200)]);
        guard();
        let duration = words.length * 300 + 400;
        const buffer = buffers[id];
        if (buffer && ac.state === "running") {
          const source = ac.createBufferSource();
          source.buffer = buffer;
          source.connect(master);
          source.start();
          currentSource = source;
          duration = buffer.duration * 1000;
        }
        music?.duck(true);
        const weights = words.map((word) => word.length + (/[.,:]$/.test(word) ? 5 : 2));
        const total = weights.reduce((sum, weight) => sum + weight, 0);
        const started = performance.now();
        let elapsed = 0;
        for (let index = 0; index < words.length; index += 1) {
          await ctx.until(started + (duration * 0.94 * elapsed) / total);
          spans[index].classList.add("said");
          elapsed += weights[index];
        }
        await ctx.until(started + duration);
        music?.duck(false);
        await sleep(120);
        guard();
      },
      // Starts a line that runs alongside the animation; await the result later.
      narrate(id) {
        const voice = ctx.say(id);
        voice.catch(() => {});
        return voice;
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
    music?.duck(false);
    caption.textContent = "";
  }

  return {
    // Runs an async film function; resolves true if it played to the end.
    async run(film) {
      halt();
      const ctx = makeCtx(token);
      if (ac && ac.state !== "running") await ac.resume().catch(() => {});
      if (ac?.state === "running") music?.start();
      try {
        await film(ctx);
        return true;
      } catch (error) {
        if (error instanceof Cancelled) return false;
        throw error;
      }
    },
    stop(fade = 2) {
      halt();
      music?.fadeOut(fade);
    },
    setLevel(level) {
      music?.setLevel(level);
    },
    setMuted(value) {
      muted = value;
      if (master) master.gain.value = value ? 0 : 1;
    },
  };
}

/* ---------- Helpers shared by the films ---------- */

export function setFlip(ctx, el, value, silent = false) {
  const text = String(value);
  if (el.children.length !== text.length) el.innerHTML = [...text].map((digit) => `<b>${digit}</b>`).join("");
  [...text].forEach((digit, index) => {
    const cell = el.children[index];
    if (cell.textContent === digit) return;
    cell.textContent = digit;
    if (!reduced) cell.animate([{ transform: "rotateX(-80deg)", filter: "brightness(1.6)" }, { transform: "none", filter: "none" }], { duration: 200, easing: "ease-out" });
  });
  if (!silent) ctx.sfx("tick");
}

export async function roll(ctx, el, text) {
  await ctx.anim(el, [{ opacity: 1, transform: "none", filter: "blur(0)" }, { opacity: 0, transform: "translateY(-.45em)", filter: "blur(6px)" }], { duration: 240, easing: "ease-in" });
  el.textContent = text;
  await ctx.anim(el, [{ opacity: 0, transform: "translateY(.45em)", filter: "blur(6px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }], { duration: 400 });
}

export const rise = [
  { opacity: 0, transform: "translateY(16px)", filter: "blur(6px)" },
  { opacity: 1, transform: "none", filter: "blur(0)" },
];
export const pop = [
  { opacity: 0, transform: "scale(.5)", filter: "blur(8px)" },
  { opacity: 1, transform: "scale(1)", filter: "blur(0)" },
];
export const leave = [
  { opacity: 1, transform: "none", filter: "blur(0)" },
  { opacity: 0, transform: "scale(.94)", filter: "blur(8px)" },
];

// Staggers an entrance over a list of elements without waiting for each.
export function stagger(ctx, nodes, keyframes = rise, gap = 70, duration = 520) {
  return Promise.all(nodes.map((node, index) => ctx.anim(node, keyframes, { duration, delay: index * gap * 0.72 })));
}

// Moves the fake pointer to an element inside the stage and clicks it.
export async function click(ctx, stage, target, duration = 650) {
  const cursor = $(".cursor", stage.parentElement);
  const frame = stage.getBoundingClientRect();
  const box = target.getBoundingClientRect();
  const unit = frame.width / stage.offsetWidth;
  const x = (box.left + box.width * 0.55 - frame.left) / unit;
  const y = (box.top + box.height * 0.55 - frame.top) / unit;
  const from = cursor.dataset.at || `translate(${x + 160}px, ${y + 140}px)`;
  const to = `translate(${x}px, ${y}px)`;
  await ctx.anim(cursor, [{ opacity: cursor.dataset.at ? 1 : 0, transform: from }, { opacity: 1, transform: to }], { duration });
  cursor.dataset.at = to;
  ctx.sfx("tick");
  target.classList.add("pressed");
  await ctx.wait(140);
  target.classList.remove("pressed");
}
