import { $, $$, createEngine, leave, rise } from "./kit.js";
import { FILMS } from "./films.js";

const root = document.documentElement;
const params = new URLSearchParams(location.search);
// Embedded on the application's end card: only the player shows, and closing hands back.
const embed = params.has("embed") && window.parent !== window;
root.classList.toggle("embed", embed);
const player = $("#player");
const film = $("#film");
const stage = $("#stage");
const cursor = $(".cursor", film);
const endcard = $("#endcard");
const progress = $("#progress");

const lines = Object.fromEntries(FILMS.flatMap((item) => Object.entries(item.lines).map(([key, text]) => [`${item.id}-${key}`, text])));
const engine = createEngine({ caption: $("#caption"), lines });

/* ---------- Directory ---------- */
$("#films").innerHTML = FILMS.map(
  (item, index) => `
  <button class="film-card" type="button" data-film="${index}" style="--a:${item.colors[0]};--b:${item.colors[1]};--ink:${item.colors[2] || "#fff"}">
    <span class="poster">
      <span class="poster-no">${String(index + 1).padStart(2, "0")}</span>
      <span class="poster-name">${item.name}</span>
      <span class="poster-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>
    </span>
    <span class="card-body">
      <span class="card-kind">${item.kind}</span>
      <span class="card-sum">${item.summary}</span>
      <span class="card-meta">${item.status}</span>
    </span>
  </button>`,
).join("");

progress.innerHTML = FILMS.map(() => "<i></i>").join("");

/* ---------- Player ---------- */
function layout() {
  const portrait = innerWidth / innerHeight < 0.8;
  root.classList.toggle("portrait", portrait);
  const width = portrait ? 760 : 1280;
  const height = portrait ? 1180 : 720;
  root.style.setProperty("--s", String(Math.min(innerWidth / width, (innerHeight - 96) / height)));
}
layout();
addEventListener("resize", layout);

let current = 0;
let playAll = false;
let opener = null;

async function show(index, auto = false) {
  current = (index + FILMS.length) % FILMS.length;
  const item = FILMS[current];
  playAll = auto;
  endcard.hidden = true;
  stage.innerHTML = "";
  stage.className = `stage film-${item.id}`;
  stage.getAnimations().forEach((animation) => animation.cancel());
  cursor.style.opacity = "0";
  cursor.getAnimations().forEach((animation) => animation.cancel());
  delete cursor.dataset.at;
  $("#playerTitle").textContent = `${String(current + 1).padStart(2, "0")} · ${item.name}`;
  $$("i", progress).forEach((dot, at) => dot.classList.toggle("on", at === current));

  const finished = await engine.run(async (ctx) => {
    const say = (key) => ctx.say(`${item.id}-${key}`);
    const narrate = (key) => ctx.narrate(`${item.id}-${key}`);
    engine.setLevel(1);
    await item.run({ ...ctx, say, narrate, level: engine.setLevel }, stage);
    await ctx.anim(stage, leave, { duration: 420, easing: "ease-in" });
  });
  if (!finished) return;

  stage.innerHTML = "";
  $("#caption").textContent = "";
  cursor.style.opacity = "0";
  cursor.getAnimations().forEach((animation) => animation.cancel());
  engine.setLevel(0);
  const next = FILMS[(current + 1) % FILMS.length];
  $("#endKicker").textContent = item.kind;
  $("#endName").textContent = item.name;
  $("#endSum").textContent = item.summary;
  const link = $("#endLink");
  link.hidden = !item.url;
  if (item.url) {
    link.href = item.url;
    link.textContent = `${item.cta || "Open it"} ↗`;
  }
  $("#endNext").textContent = `Next: ${next.name} →`;
  endcard.hidden = false;
  endcard.animate(rise, { duration: 500, easing: "cubic-bezier(.22, 1, .36, 1)" });

  if (playAll && current < FILMS.length - 1) {
    await new Promise((resolve) => setTimeout(resolve, 1700));
    if (!player.hidden && !endcard.hidden && playAll) show(current + 1, true);
  }
}

function openPlayer(index, auto = false) {
  opener = document.activeElement;
  player.hidden = false;
  document.body.classList.add("playing");
  $("#close").focus();
  show(index, auto);
}

function closePlayer() {
  playAll = false;
  if (embed) {
    engine.dispose();
    window.parent.postMessage({ type: "film-close" }, location.origin);
    return;
  }
  engine.stop(1.5);
  player.hidden = true;
  document.body.classList.remove("playing");
  stage.innerHTML = "";
  opener?.focus();
}

$("#films").addEventListener("click", (event) => {
  const card = event.target.closest("[data-film]");
  if (card) openPlayer(Number(card.dataset.film));
});
$("#playAll").addEventListener("click", () => openPlayer(0, true));
$("#close").addEventListener("click", closePlayer);
$("#endNext").addEventListener("click", () => show(current + 1, playAll));
$("#endReplay").addEventListener("click", () => show(current, false));
$("#mute").addEventListener("click", (event) => {
  const muted = event.currentTarget.getAttribute("aria-pressed") !== "true";
  event.currentTarget.setAttribute("aria-pressed", String(muted));
  event.currentTarget.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
  engine.setMuted(muted);
});
addEventListener("keydown", (event) => {
  if (player.hidden) return;
  if (event.key === "Escape") closePlayer();
  if (event.key === "ArrowRight") show(current + 1, playAll);
  if (event.key === "ArrowLeft") show(current - 1, playAll);
});

// Deep link: ?film=capacity opens that film (sound starts after the first click).
if (params.has("muted")) $("#mute").click();
const wanted = params.get("film");
const found = FILMS.findIndex((item) => item.id === wanted);
if (found >= 0) openPlayer(found);
