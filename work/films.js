// One short film per project. Every interface here is a simplified recreation
// with invented sample content: no real clients, people, prices or figures.

import { $, $$, click, leave, pop, rise, roll, stagger } from "./kit.js";

// Shared three-act shape: the problem, the tool at work, the payoff.
async function film(ctx, stage, { problem, top, mock, play, payoff }) {
  stage.innerHTML = `<h2 class="f-line">${problem}</h2>`;
  const first = ctx.narrate("a");
  await ctx.anim($(".f-line", stage), rise, { duration: 600 });
  await first;
  await ctx.anim($(".f-line", stage), leave, { duration: 300, easing: "ease-in" });

  stage.innerHTML = `<h2 class="f-top">${top}</h2><div class="win">${mock}</div>`;
  const win = $(".win", stage);
  ctx.level(2);
  const second = ctx.narrate("b");
  await Promise.all([
    ctx.anim($(".f-top", stage), rise, { duration: 500 }),
    ctx.anim(win, [{ opacity: 0, transform: "translateY(50px) scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 800 }),
  ]);
  await play(win);
  await second;
  await ctx.wait(350);
  const pointer = $(".cursor", stage.parentElement);
  pointer.animate([{ opacity: 0 }], { duration: 200, fill: "forwards" });
  delete pointer.dataset.at;
  await Promise.all([ctx.anim(win, leave, { duration: 320, easing: "ease-in" }), ctx.anim($(".f-top", stage), leave, { duration: 320, easing: "ease-in" })]);

  stage.innerHTML = `<h2 class="f-line big">${payoff}</h2>`;
  ctx.level(1);
  const third = ctx.narrate("c");
  ctx.sfx("pop");
  await ctx.anim($(".f-line", stage), pop, { duration: 650 });
  await third;
  await ctx.wait(450);
}

const days = (count, marks = {}) => Array.from({ length: count }, (_, index) => `<i class="${marks[index + 1] || ""}">${index + 1}</i>`).join("");

export const FILMS = [
  {
    id: "stay",
    name: "Stay a little",
    kind: "Apartment sharing",
    summary: "A friends-only way to see when two apartments are free, request dates, and wait for both hosts to say yes.",
    status: "Live · friends code required",
    url: "https://stayalittle.daviddemos.com",
    cta: "Open the booking demo",
    colors: ["#c4d2b0", "#efdaa1", "#333d35"],
    lines: {
      a: "Two apartments. One friend group. Far too many messages.",
      b: "Friends pick their dates, and both hosts have to say yes.",
      c: "No fees. Just friends.",
    },
    run: (ctx, stage) =>
      film(ctx, stage, {
        problem: "Two homes.<br>One group chat.",
        top: "Pick the nights. <em>Both hosts approve.</em>",
        mock: `
          <div class="px-bar"><b>⌂ stay a little</b><span>CHOOSE YOUR NEXT SIDE QUEST</span></div>
          <div class="px-cals">
            <div class="px-cal"><header style="background:#c4d2b0">DAVID.HOME</header><p>A spare key to Stockholm.</p><div class="px-grid" id="calA">${days(28, { 3: "busy", 4: "busy", 20: "busy", 21: "busy", 22: "busy" })}</div></div>
            <div class="px-cal"><header style="background:#d8c5b2">SOPHIE.HOME</header><p>Your little Amsterdam base.</p><div class="px-grid">${days(28, { 8: "busy", 9: "busy", 10: "busy", 25: "busy", 26: "busy" })}</div></div>
          </div>
          <div class="px-foot"><span class="px-host" id="hostA">DAVID …</span><span class="px-host" id="hostB">SOPHIE …</span><span class="px-toast" id="toast"></span></div>`,
        async play(win) {
          const cells = $$("#calA i", win);
          await ctx.wait(500);
          await click(ctx, stage, cells[11]);
          cells[11].classList.add("pick");
          await click(ctx, stage, cells[14], 450);
          for (const cell of cells.slice(11, 15)) {
            cell.className = "pending";
            ctx.sfx("tick");
            await ctx.wait(110);
          }
          $("#toast", win).textContent = "Dates held. Waiting for David and Sophie.";
          await ctx.wait(900);
          for (const id of ["#hostA", "#hostB"]) {
            const host = $(id, win);
            host.textContent = host.textContent.replace("…", "✓");
            host.classList.add("yes");
            ctx.sfx("pop");
            await ctx.wait(520);
          }
          cells.slice(11, 15).forEach((cell) => (cell.className = "booked"));
          $("#toast", win).textContent = "BOTH HOSTS ACCEPTED";
          $("#toast", win).classList.add("ok");
          ctx.sfx("done");
          await ctx.wait(900);
        },
        payoff: "No fees.<br><em>Just friends.</em>",
      }),
  },
  {
    id: "claims",
    name: "Claims Copilot",
    kind: "Insurance claims",
    summary: "An AI-assisted claims workspace that reviews synthetic phone-damage cases, finds evidence gaps, drafts follow-up, and keeps decisions with the handler.",
    status: "Live · synthetic cases",
    url: "https://co-pilot-ai.daviddemos.com",
    cta: "Open Claims Copilot",
    colors: ["#b51f35", "#5b1020"],
    lines: {
      a: "Claims handlers spend the morning preparing cases, not deciding them.",
      b: "An agent reads the evidence, finds the gaps, and drafts the follow-up. It also catches a hidden instruction.",
      c: "The decision stays with the handler.",
    },
    run: (ctx, stage) =>
      film(ctx, stage, {
        problem: "Sixteen open claims.<br>One handler.",
        top: "The agent prepares. <em>The handler decides.</em>",
        mock: `
          <div class="cl-left">
            <header><b>Claims Copilot</b><span>Claims workspace</span></header>
            <h3>Good morning, Tobias</h3>
            <div class="cl-rows">
              ${[
                ["CL-1042 · Lina Berg", "Dropped mobile phone · missing evidence"],
                ["CL-1043 · Jonas Ek", "Cracked screen · receipt attached"],
                ["CL-1044 · Mira Sand", "Water damage · photos attached"],
                ["CL-1045 · Otto Lind", "Stolen phone · police report"],
              ]
                .map(([who, what]) => `<div class="cl-row"><b>${who}</b><span>${what}</span><em>New</em></div>`)
                .join("")}
            </div>
          </div>
          <div class="cl-right"><header>Agent workspace · execution trace</header><div class="cl-trace" id="trace"><p class="idle">No claim agent loaded</p></div></div>`,
        async play(win) {
          const rows = $$(".cl-row", win);
          const trace = $("#trace", win);
          const log = async (text, kind = "") => {
            const line = document.createElement("p");
            line.className = kind;
            line.textContent = text;
            trace.append(line);
            line.animate(rise, { duration: 260 });
            ctx.sfx("tick");
            await ctx.wait(430);
          };
          await ctx.wait(400);
          await click(ctx, stage, rows[0]);
          rows[0].classList.add("open");
          trace.innerHTML = "";
          await log("09:41:02  Loading claim form, photos, policy");
          await log("09:41:05  Checking each source");
          await log("09:41:09  Evidence gaps identified: purchase receipt");
          await log("09:41:12  Follow-up drafted · waiting for handler", "ok");
          $("em", rows[0]).textContent = "Ready for handler review";
          $("em", rows[0]).className = "ok";
          await ctx.wait(500);
          await click(ctx, stage, rows[1], 450);
          rows[1].classList.add("open");
          await log("09:42:20  Reading attached receipt");
          await log("09:42:23  Hidden text detected here", "bad");
          $("em", rows[1]).textContent = "Malicious attempt · handler attention";
          $("em", rows[1]).className = "bad";
          ctx.sfx("done");
          await ctx.wait(900);
        },
        payoff: "Agents prepare.<br><em>People decide.</em>",
      }),
  },
  {
    id: "storia",
    name: "Storia",
    kind: "Writing workspace",
    summary: "An AI writing workspace for developing ideas, generating drafts, and revising text with focused voice and review agents.",
    status: "Live · access code required",
    url: "https://writer.daviddemos.com",
    cta: "Open Writer MVP",
    colors: ["#27272a", "#09090b"],
    lines: {
      a: "The blank page is the hardest part of writing.",
      b: "Storia walks you from an idea, to an outline, to a first draft, one step at a time.",
      c: "Structure first. The words stay yours.",
    },
    run: (ctx, stage) =>
      film(ctx, stage, {
        problem: "A blank page.<br>A blinking cursor.",
        top: "Brainstorm. Outline. <em>First draft.</em>",
        mock: `
          <aside class="st-side"><b>STORIA</b><small>Steps</small><span class="on" data-step>1 · Find the idea</span><span data-step>2 · Shape the sections</span><span data-step>3 · Write and play around</span><small>Voice</small><span>Wait But Why</span></aside>
          <main class="st-main"><h3 id="stTitle">Brainstorm</h3><div id="stBody" class="st-body"></div><button class="st-btn" id="stBtn">Refine outline</button></main>
          <aside class="st-chat"><small>Assistant</small><div id="stChat"></div><p class="st-input" id="stInput">Message the assistant...</p></aside>`,
        async play(win) {
          const steps = $$("[data-step]", win);
          const body = $("#stBody", win);
          const chat = $("#stChat", win);
          const input = $("#stInput", win);
          const go = (index, title) => {
            steps.forEach((step, at) => step.classList.toggle("on", at === index));
            $("#stTitle", win).textContent = title;
            ctx.sfx("pop");
          };
          await ctx.type(input, "Why do meetings feel longer than they are?", 16);
          chat.innerHTML = `<p class="me">${input.textContent}</p>`;
          input.textContent = "Message the assistant...";
          await ctx.wait(300);
          chat.insertAdjacentHTML("beforeend", "<p>Good one. What changed your mind about it?</p>");
          chat.lastChild.animate(rise, { duration: 300 });
          await ctx.wait(700);
          go(1, "Outline");
          body.innerHTML = ["The hour that felt like three", "What the clock leaves out", "A meeting worth its length"].map((text) => `<div class="st-sec"><b>${text}</b><i></i><i></i></div>`).join("");
          await stagger(ctx, $$(".st-sec", body));
          await click(ctx, stage, $("#stBtn", win));
          await roll(ctx, $("b", $$(".st-sec", body)[1]), "Attention, not minutes");
          await ctx.wait(350);
          go(2, "First draft");
          $("#stBtn", win).textContent = "Draft with AI";
          for (const bar of $$(".st-sec i", body)) {
            bar.classList.add("fill");
            await ctx.wait(140);
          }
          ctx.sfx("done");
          await ctx.wait(700);
        },
        payoff: "Structure first.<br><em>Your words.</em>",
      }),
  },
  {
    id: "dora",
    name: "Dora",
    kind: "AI search visibility",
    summary: "A dashboard for exploring how brands appear in AI-generated answers, including visibility, sentiment, placement, competitors, and cited sources.",
    status: "Not public yet",
    colors: ["#3b82f6", "#0a0a0a"],
    lines: {
      a: "People now ask an AI what to buy. Is your brand in the answer?",
      b: "Dora asks the questions blind, then scores who shows up.",
      c: "See how AI sees you.",
    },
    run: (ctx, stage) =>
      film(ctx, stage, {
        problem: "“Which one<br>should I buy?”",
        top: "Ask the AI. <em>Score the answers.</em>",
        mock: `
          <header class="do-head"><b>◉ Dora the AI Explorer</b><span>Sign out</span></header>
          <div class="do-col">
            <div class="do-card">
              <div class="do-brand"><i>F</i><b>Fjord Mobile</b><em id="doStage">Asking the AI</em></div>
              <div class="do-bar"><u id="doBar"></u></div>
              <div class="do-stats"><div><b id="doVis">0%</b><span>Visibility</span></div><div><b id="doSen">–</b><span>Sentiment</span></div><div><b id="doSov">0%</b><span>SoV</span></div></div>
            </div>
            <div class="do-table" id="doTable"><small>Here's who's showing up across AI search</small></div>
          </div>`,
        async play(win) {
          const bar = $("#doBar", win);
          const label = $("#doStage", win);
          for (const [text, width] of [["Asking the AI", 34], ["Scoring answers", 68], ["Writing insights", 100]]) {
            label.textContent = text;
            bar.style.width = `${width}%`;
            ctx.sfx("tick");
            await ctx.wait(850);
          }
          label.textContent = "Done";
          label.classList.add("ok");
          for (let step = 1; step <= 7; step += 1) {
            $("#doVis", win).textContent = `${step * 6}%`;
            $("#doSov", win).textContent = `${step * 3}%`;
            await ctx.wait(70);
          }
          $("#doSen", win).textContent = "Positive";
          const table = $("#doTable", win);
          for (const [rank, name, share, mine] of [[1, "Northline", 78, ""], [2, "Fjord Mobile", 42, "mine"], [3, "Telvo", 31, ""], [4, "Kite", 12, ""]]) {
            table.insertAdjacentHTML("beforeend", `<div class="do-row ${mine}"><span>${rank}</span><b>${name}</b><i><u style="width:${share}%"></u></i><em>${share}%</em></div>`);
            table.lastChild.animate(rise, { duration: 300 });
            ctx.sfx("tick");
            await ctx.wait(240);
          }
          ctx.sfx("done");
          await ctx.wait(800);
        },
        payoff: "See how<br><em>AI sees you.</em>",
      }),
  },
  {
    id: "glossary",
    name: "AI Glossary",
    kind: "Workshop tool",
    summary: "A searchable English and Swedish AI glossary where workshop participants can choose terms and create a practical A4 handout.",
    status: "Live",
    url: "https://glossary.daviddemos.com",
    cta: "Open the AI Glossary",
    colors: ["#c87d4d", "#050505"],
    lines: {
      a: "Every AI workshop hits the same wall: the words.",
      b: "Search seventy-two concepts in English or Swedish, and pick the ones your room needs.",
      c: "Then hand them out on one page.",
    },
    run: (ctx, stage) =>
      film(ctx, stage, {
        problem: "“Sorry, what’s<br>a token?”",
        top: "Understanding starts <em>with a word.</em>",
        mock: `
          <header class="gl-mast"><b>ai<br>explained<i>.</i></b><span>A SHARED LANGUAGE FOR AI</span><em>EN / SV</em></header>
          <div class="gl-lib">
            <div class="gl-tools"><p class="gl-search" id="glSearch">Search a concept in English or Swedish</p><button class="gl-btn" id="glBtn">A4 handout (<span id="glCount">0</span>)</button></div>
            <div class="gl-grid" id="glGrid">
              ${[
                ["AI ESSENTIALS", "Token", "A small piece of text a model reads or writes.", "tok"],
                ["AI ESSENTIALS", "Prompt", "The instruction you give the model.", ""],
                ["HOW IT WORKS", "Context window", "How many tokens a model can consider at once.", "tok"],
                ["HOW IT WORKS", "Training", "How a model learns patterns from data.", ""],
                ["AT WORK", "Agent", "A model that plans and uses tools to finish a task.", ""],
                ["RISKS", "Hallucination", "A confident answer that is not true.", ""],
              ]
                .map(([pillar, term, text, tag]) => `<div class="gl-card ${tag}"><small>${pillar}</small><b>${term}<i>.</i></b><p>${text}</p></div>`)
                .join("")}
            </div>
          </div>
          <div class="gl-a4" id="glA4"><small>YOUR A4 HANDOUT</small><b>Unlocking AI<i>.</i></b><div id="glChips"></div><u></u><u></u><u></u></div>`,
        async play(win) {
          const search = $("#glSearch", win);
          await ctx.wait(300);
          await ctx.type(search, "token", 60);
          search.classList.add("typed");
          for (const card of $$(".gl-card:not(.tok)", win)) card.classList.add("out");
          await ctx.wait(700);
          for (const card of $$(".gl-card.tok", win)) {
            await click(ctx, stage, card, 420);
            card.classList.add("picked");
            $("#glCount", win).textContent = String(Number($("#glCount", win).textContent) + 1);
            ctx.sfx("pop");
          }
          await click(ctx, stage, $("#glBtn", win), 420);
          $("#glA4", win).classList.add("in");
          ctx.sfx("whoosh");
          await ctx.wait(500);
          for (const term of ["Token", "Context window"]) {
            $("#glChips", win).insertAdjacentHTML("beforeend", `<span>${term} ×</span>`);
            ctx.sfx("tick");
            await ctx.wait(260);
          }
          ctx.sfx("done");
          await ctx.wait(800);
        },
        payoff: "A shared<br>language<em>.</em>",
      }),
  },
  {
    id: "campus",
    name: "AI Agent Campus",
    kind: "Interactive concept",
    summary: "An interactive 3D vision of a campus where personal AI agents meet, collaborate across roles, and keep people in control of the next step.",
    status: "Live · in Swedish",
    url: "https://campus.daviddemos.com",
    cta: "Explore the agent campus",
    colors: ["#6639d8", "#08070d"],
    lines: {
      a: "What if everyone on campus had a personal AI agent?",
      b: "Agents find each other across buildings, and work out the next step together.",
      c: "Then the people approve it.",
    },
    run: (ctx, stage) =>
      film(ctx, stage, {
        problem: "One campus.<br>Thousands of people.",
        top: "Ideas meet. <em>Agents collaborate.</em>",
        mock: `
          <div class="ca-map" id="caMap">
            ${[[90, 250, 150, 120], [280, 180, 120, 170], [440, 260, 170, 110], [250, 60, 140, 90], [470, 90, 110, 130]].map(([x, y, w, h]) => `<i class="ca-b" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></i>`).join("")}
            ${[[150, 290], [330, 230], [520, 300], [310, 95], [520, 140], [200, 340]].map(([x, y], index) => `<b class="ca-pin" data-pin="${index}" style="left:${x}px;top:${y}px"></b>`).join("")}
            <svg class="ca-link" viewBox="0 0 660 500"><path id="caPath" d="M158 298 Q330 120 528 148" pathLength="1"/></svg>
            <span class="ca-label">CAMPUS · EN TOLKNING I 3D</span>
          </div>
          <aside class="ca-panel" id="caPanel"><small>MÖT DINA NYA KOLLEGOR</small><h3>Välj en agent på campus.</h3></aside>`,
        async play(win) {
          const pins = $$(".ca-pin", win);
          const panel = $("#caPanel", win);
          await ctx.wait(500);
          await click(ctx, stage, pins[0]);
          pins[0].classList.add("active");
          ctx.sfx("pop");
          pins.forEach((pin, index) => index !== 0 && index !== 4 && pin.classList.add("dim"));
          $("#caPath", win).classList.add("draw");
          await ctx.wait(650);
          pins[4].classList.add("partner");
          ctx.sfx("pop");
          panel.innerHTML = `<small>SAMARBETE I FOKUS</small><h3>🤖 Forskare ↔ 🤖 Labbkoordinator</h3><p class="ca-task">Två agenter. En gemensam uppgift.</p><div id="caTalk"></div>`;
          panel.animate(rise, { duration: 320 });
          const talk = $("#caTalk", panel);
          for (const [side, text] of [["a", "Finns det labbtid på torsdag?"], ["b", "Ja, 13–15. Jag preliminärbokar."], ["a", "Perfekt. Jag frågar min människa."]]) {
            talk.insertAdjacentHTML("beforeend", `<p class="${side}">${text}</p>`);
            talk.lastChild.animate(rise, { duration: 280 });
            ctx.sfx("tick");
            await ctx.wait(620);
          }
          talk.insertAdjacentHTML("afterend", `<em class="ca-ok">✓ Människorna godkänner nästa steg</em>`);
          ctx.sfx("done");
          await ctx.wait(900);
        },
        payoff: "Agents propose.<br><em>People approve.</em>",
      }),
  },
  {
    id: "capacity",
    name: "Capacity",
    kind: "Time planning",
    summary: "A weekly board that shows how full each day is against an 8-hour day, spreads hours across days as you drag work, syncs to Notion, and lets Claude plan the week.",
    status: "Live · password required",
    url: "https://capacity.daviddemos.com",
    cta: "Open Capacity",
    colors: ["#6d5ce8", "#1f1f24"],
    lines: {
      a: "My week looked fine. Until I added it up.",
      b: "Drag work onto a day, and Capacity shows the moment it stops fitting.",
      c: "Plan the week you can actually do.",
    },
    run: (ctx, stage) =>
      film(ctx, stage, {
        problem: "“Sure, I can<br>do that this week.”",
        top: "8 h day · 40 h week. <em>No more, honestly.</em>",
        mock: `
          <aside class="cp-side"><b><i></i>Capacity</b><small>Planning</small><span class="on">Week</span><span>Actuals</span><span>Projects</span><span>Analytics</span></aside>
          <main class="cp-main">
            <div class="cp-tiles"><div><b id="cpBooked">31 h</b><span>Booked Mon–Fri</span></div><div class="warn"><b id="cpOver">0</b><span>Overbooked days</span></div><div><b id="cpFree">9 h</b><span>Free this week</span></div></div>
            <div class="cp-board">
              ${["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, index) => `<div class="cp-day" data-day="${index}"><header>${day}<em>${[7, 8, 6, 4, 6][index]} h</em></header><div class="cp-col"></div></div>`).join("")}
            </div>
          </main>`,
        async play(win) {
          const cols = $$(".cp-col", win);
          const heads = $$(".cp-day em", win);
          const plan = [
            [["Workshop prep", 4, "#6d5ce8"], ["Writing", 3, "#2a9a7f"]],
            [["Client Alpha", 5, "#e07b25"], ["Admin", 3, "#d4566a"]],
            [["Client Beta", 6, "#2a9a7f"]],
            [["Writing", 4, "#6d5ce8"]],
            [["Client Alpha", 6, "#e07b25"]],
          ];
          plan.forEach((blocks, day) => {
            cols[day].innerHTML = blocks.map(([name, hours, color]) => `<div class="cp-block" style="--c:${color};height:${hours * 30}px"><b>${name}</b><span>${hours} h</span></div>`).join("");
          });
          await stagger(ctx, $$(".cp-block", win), rise, 50, 400);
          await ctx.wait(300);
          const extra = document.createElement("div");
          extra.className = "cp-block new";
          extra.style.cssText = "--c:#d4566a;height:105px";
          extra.innerHTML = "<b>Proposal deadline</b><span>3.5 h</span>";
          cols[2].append(extra);
          ctx.sfx("whoosh");
          await ctx.anim(extra, [{ opacity: 0, transform: "translate(-220px,-160px) scale(1.1) rotate(-4deg)" }, { opacity: 1, transform: "none" }], { duration: 800 });
          heads[2].textContent = "9.5 h";
          heads[2].classList.add("over");
          $("#cpOver", win).textContent = "1";
          $("#cpBooked", win).textContent = "34.5 h";
          $("#cpFree", win).textContent = "5.5 h";
          $(".cp-tiles .warn", win).classList.add("on");
          ctx.sfx("pop");
          await ctx.wait(1100);
          const from = extra.getBoundingClientRect();
          cols[3].append(extra);
          const to = extra.getBoundingClientRect();
          const unit = stage.getBoundingClientRect().width / stage.offsetWidth;
          await ctx.anim(extra, [{ transform: `translate(${(from.left - to.left) / unit}px, ${(from.top - to.top) / unit}px)` }, { transform: "none" }], { duration: 700 });
          heads[2].textContent = "6 h";
          heads[2].classList.remove("over");
          heads[3].textContent = "7.5 h";
          $("#cpOver", win).textContent = "0";
          $(".cp-tiles .warn", win).classList.remove("on");
          ctx.sfx("done");
          await ctx.wait(800);
        },
        payoff: "The week you can<br><em>actually do.</em>",
      }),
  },
  {
    id: "budget",
    name: "Budget",
    kind: "Personal finance",
    summary: "A monthly budget where you forecast in lines, upload the bank statement, and see what was actually spent against each line.",
    status: "Private tool",
    colors: ["#1d5c43", "#1baf7a"],
    lines: {
      a: "A budget is a guess. The bank statement is what happened.",
      b: "Upload the statement, and every transaction finds its line.",
      c: "Forecast, meet reality.",
    },
    run: (ctx, stage) =>
      film(ctx, stage, {
        problem: "“Where did<br>it all go?”",
        top: "Forecast on the left. <em>Reality on the right.</em>",
        mock: `
          <aside class="bu-side"><b><i></i>Budget</b><span>Forecast</span><span class="on">Actualisation</span><span>Insights</span><span>What the app knows</span></aside>
          <main class="bu-main">
            <header><h3>Actualisation · March</h3><button class="bu-up" id="buUp">↑ Upload statement</button></header>
            <div class="bu-card" style="--c:#eb6834"><h4><i>2</i>Fixed costs</h4>
              <div class="bu-line"><b>Rent</b><span>9 000</span><span data-actual>–</span><span data-left>9 000</span></div>
              <div class="bu-line"><b>Streaming</b><span>250</span><span data-actual>–</span><span data-left>250</span></div></div>
            <div class="bu-card" style="--c:#e87ba4"><h4><i>3</i>Flexible spending</h4>
              <div class="bu-line"><b>Groceries</b><span>4 000</span><span data-actual>–</span><span data-left>4 000</span></div>
              <div class="bu-line"><b>Eating out</b><span>1 200</span><span data-actual>–</span><span data-left>1 200</span></div></div>
            <div class="bu-chip" id="buChip">Probably <b>Groceries</b> · Corner Market · Make it a rule</div>
          </main>`,
        async play(win) {
          const lines = $$(".bu-line", win);
          const fill = async (index, actual, left, over = false) => {
            $("[data-actual]", lines[index]).textContent = actual;
            const cell = $("[data-left]", lines[index]);
            cell.textContent = left;
            cell.classList.toggle("over", over);
            lines[index].animate([{ background: "#d6e7dd" }, { background: "transparent" }], { duration: 600 });
            ctx.sfx("tick");
            await ctx.wait(420);
          };
          await ctx.wait(400);
          await click(ctx, stage, $("#buUp", win));
          $("#buUp", win).textContent = "✓ 42 transactions";
          ctx.sfx("whoosh");
          await ctx.wait(500);
          await fill(0, "9 000", "0");
          await fill(1, "250", "0");
          const chip = $("#buChip", win);
          chip.classList.add("in");
          ctx.sfx("pop");
          await ctx.wait(700);
          await click(ctx, stage, chip, 420);
          chip.classList.remove("in");
          await fill(2, "3 640", "360");
          await fill(3, "1 580", "−380", true);
          ctx.sfx("done");
          await ctx.wait(800);
        },
        payoff: "Forecast,<br><em>meet reality.</em>",
      }),
  },
  {
    id: "newslens",
    name: "NewsLens",
    kind: "News relevance",
    summary: "Type a company and NewsLens gathers the week's AI news, researches the company, and scores every story for how much it matters to them.",
    status: "Prototype",
    colors: ["#0997ff", "#0348b7"],
    lines: {
      a: "There is too much AI news. Almost none of it is about you.",
      b: "Type a company. NewsLens reads the week, and scores every story for relevance.",
      c: "Only the news that matters.",
    },
    run: (ctx, stage) =>
      film(ctx, stage, {
        problem: "412 headlines.<br>This week alone.",
        top: "One company. <em>Every story scored.</em>",
        mock: `
          <div class="nl-title"><b>N</b>NewsLens — Document1<span>_ ▢ ✕</span></div>
          <div class="nl-menu">File  Edit  View  Insert  Format  Tools  Help<em>All</em><em>40+</em><em id="nl70">70+</em></div>
          <div class="nl-body">
            <div class="nl-doc"><div class="nl-page"><p class="nl-dear">Dear reader,</p><h4>Relevancy feed</h4><div id="nlFeed"></div></div></div>
            <aside class="nl-pane"><header>NewsLens Search</header><p class="nl-input" id="nlInput">Company name or website…</p><button id="nlGo">Search</button><header>Previous companies</header><span>Acme Robotics</span></aside>
          </div>
          <div class="nl-help" id="nlHelp"><i>📎</i><p></p></div>
          <div class="nl-status">Page 1 · Sec 1 · 1/1 · <span id="nlState">Ready</span></div>`,
        async play(win) {
          const help = $("#nlHelp", win);
          const say = async (text) => {
            $("p", help).textContent = text;
            help.classList.add("in");
            ctx.sfx("pop");
            await ctx.wait(900);
          };
          await ctx.type($("#nlInput", win), "Acme Robotics", 36);
          await click(ctx, stage, $("#nlGo", win), 420);
          $("#nlState", win).textContent = "Working";
          await say("It looks like you're searching for AI news for Acme Robotics!");
          await say("I'm reading every news site on my list!");
          await say("Now scoring every story through Acme's glasses…");
          help.classList.remove("in");
          const feed = $("#nlFeed", win);
          for (const [score, grade, title, why] of [[91, "hi", "New robot-vision model released", "Directly affects their core product."], [74, "hi", "EU publishes AI safety guidance", "Applies to machines they ship."], [38, "lo", "Chatbot adds a shopping mode", "Little overlap with robotics."]]) {
            feed.insertAdjacentHTML("beforeend", `<div class="nl-story ${grade}"><em>${score}</em><b>${title}</b><span>Why it matters: ${why}</span></div>`);
            feed.lastChild.animate(rise, { duration: 300 });
            ctx.sfx("tick");
            await ctx.wait(330);
          }
          await click(ctx, stage, $("#nl70", win), 420);
          $("#nl70", win).classList.add("on");
          $(".nl-story.lo", win).classList.add("out");
          $("#nlState", win).textContent = "Ready";
          ctx.sfx("done");
          await ctx.wait(800);
        },
        payoff: "Only the news<br><em>that matters.</em>",
      }),
  },
  {
    id: "travel",
    name: "Travel Planner",
    kind: "Group trips",
    summary: "Pick who is coming and see the dates when the whole group is free, on one shared timeline.",
    status: "Prototype · sample calendars",
    colors: ["#60a5fa", "#0c0e14"],
    lines: {
      a: "Planning a trip with friends usually dies in the group chat.",
      b: "Tap who is coming, and watch the free dates narrow down.",
      c: "Five nights. Everyone free.",
    },
    run: (ctx, stage) =>
      film(ctx, stage, {
        problem: "“When is<br>everyone free?”",
        top: "Pick your travel buddies. <em>See the overlap.</em>",
        mock: `
          <div class="tr-wrap">
            <h3>🧳 Travel Planner</h3>
            <div class="tr-card"><small>Who's coming?</small><div class="tr-chips">${[["🦊", "Alex", "#a78bfa"], ["🐻", "Sam", "#f472b6"], ["🦉", "Mika", "#fbbf24"], ["🐬", "Noor", "#2dd4bf"]].map(([icon, name, color]) => `<button class="tr-chip" style="--c:${color}">${icon} ${name}</button>`).join("")}</div></div>
            <div class="tr-card tr-time" id="trTime">
              <div class="tr-row"><span>🙂 You</span><div><u style="left:6%;width:14%;--c:#60a5fa"></u><u style="left:62%;width:10%;--c:#60a5fa"></u></div></div>
              <div class="tr-row free"><span>✨ Free together</span><div><u id="trFreeA" style="left:20%;width:42%"></u><u id="trFreeB" style="left:72%;width:28%"></u></div></div>
            </div>
            <p class="tr-result" id="trResult">Your free windows · <b>Jun 9 – Jul 2 · 23 nights</b></p>
          </div>`,
        async play(win) {
          const chips = $$(".tr-chip", win);
          const time = $("#trTime", win);
          const freeRow = $(".tr-row.free", win);
          const steps = [
            ["🦊 Alex", "#a78bfa", [[24, 16]], ["40%", "22%"], ["72%", "28%"], "Jun 20 – Jul 2 · 12 nights"],
            ["🐻 Sam", "#f472b6", [[70, 22]], ["40%", "22%"], ["92%", "8%"], "Jun 20 – Jul 2 · 12 nights"],
            ["🦉 Mika", "#fbbf24", [[36, 12]], ["48%", "14%"], ["92%", "8%"], "Jun 26 – Jul 3 · 7 nights"],
            ["🐬 Noor", "#2dd4bf", [[58, 6]], ["48%", "10%"], ["92%", "8%"], "Jul 3 – Jul 8 · 5 nights"],
          ];
          await ctx.wait(400);
          for (const [index, [name, color, busy, a, b, result]] of steps.entries()) {
            await click(ctx, stage, chips[index], 380);
            chips[index].classList.add("on");
            ctx.sfx("pop");
            const row = document.createElement("div");
            row.className = "tr-row";
            row.innerHTML = `<span>${name}</span><div>${busy.map(([left, width]) => `<u style="left:${left}%;width:${width}%;--c:${color}"></u>`).join("")}</div>`;
            time.insertBefore(row, freeRow);
            row.animate(rise, { duration: 300 });
            $("#trFreeA", win).style.left = a[0];
            $("#trFreeA", win).style.width = a[1];
            $("#trFreeB", win).style.left = b[0];
            $("#trFreeB", win).style.width = b[1];
            $("#trResult b", win).textContent = result;
            await ctx.wait(430);
          }
          $("#trResult", win).classList.add("ok");
          ctx.sfx("done");
          await ctx.wait(800);
        },
        payoff: "Five nights.<br><em>Everyone free.</em>",
      }),
  },
  {
    id: "proposals",
    name: "Proposals",
    kind: "Sales proposals",
    summary: "Turns meeting notes into a first draft of on-brand proposal slides that you edit in the browser and export to PowerPoint.",
    status: "Internal tool",
    colors: ["#e48d27", "#4f2da8"],
    lines: {
      a: "The meeting took an hour. The proposal takes the whole afternoon.",
      b: "Paste the notes, and the slides draft themselves from the master deck.",
      c: "Edit. Export. Send.",
    },
    run: (ctx, stage) =>
      film(ctx, stage, {
        problem: "Good meeting.<br>Now, the deck.",
        top: "From notes <em>to slides.</em>",
        mock: `
          <header class="pr-bar"><b>✦ Proposals</b><span id="prState">New proposal</span><button id="prExport">Export</button></header>
          <div class="pr-grid">
            <aside class="pr-thumbs" id="prThumbs"></aside>
            <main class="pr-stage"><div class="pr-slide" id="prSlide"><small>PROPOSAL</small><h3></h3><p></p><i></i><i></i><i></i></div></main>
            <aside class="pr-chat"><small>Chat about this proposal</small><p class="pr-notes" id="prNotes"></p></aside>
          </div>`,
        async play(win) {
          const state = $("#prState", win);
          await ctx.type($("#prNotes", win), "Notes: leadership team of 12, wants hands-on AI skills, two half-days in spring.", 13);
          state.textContent = "Reading your notes…";
          await ctx.wait(650);
          state.textContent = "Drafting your proposal";
          const thumbs = $("#prThumbs", win);
          const slide = $("#prSlide", win);
          for (const [title, text] of [["Example Client × Us", "A programme proposal"], ["What we heard", "Twelve leaders. Hands-on skills."], ["The programme", "Two half-days in spring"], ["Outcomes", "Skills people keep using"], ["Next steps", "Dates, people, kickoff"]]) {
            thumbs.insertAdjacentHTML("beforeend", `<div class="pr-thumb"><b>${title}</b></div>`);
            thumbs.lastChild.animate(rise, { duration: 280 });
            $$(".pr-thumb", thumbs).forEach((thumb) => thumb.classList.remove("on"));
            thumbs.lastChild.classList.add("on");
            $("h3", slide).textContent = title;
            $("p", slide).textContent = text;
            slide.animate([{ opacity: 0.3, transform: "scale(.98)" }, { opacity: 1, transform: "none" }], { duration: 260 });
            ctx.sfx("tick");
            await ctx.wait(420);
          }
          state.textContent = "Everything looks complete.";
          await click(ctx, stage, $("#prExport", win), 450);
          $("#prExport", win).textContent = "✓ .pptx";
          ctx.sfx("done");
          await ctx.wait(800);
        },
        payoff: "Edit. Export.<br><em>Send.</em>",
      }),
  },
  {
    id: "memory",
    name: "The Body’s Memory",
    kind: "Science explainer",
    summary: "A playable guide to immune memory: watch an invader arrive, the first responders swarm, the specialists take over, and the memory that stays.",
    status: "Interactive explainer",
    colors: ["#e12d84", "#7642da"],
    lines: {
      a: "Your body remembers every virus it ever met.",
      b: "A playable guide shows the invasion, the swarm, the specialists, and the memory left behind.",
      c: "Science you can play.",
    },
    run: (ctx, stage) =>
      film(ctx, stage, {
        problem: "How does a body<br>remember?",
        top: "Watch your body <em>fight off an invader.</em>",
        mock: `
          <header class="bm-bar"><b><i></i>The Body's Memory</b><span>The fight · The cast · The map · Quiz</span></header>
          <div class="bm-sim" id="bmSim"></div>
          <div class="bm-steps">${["1 · Invade", "2 · Innate swarm", "3 · Specialists", "4 · Memory"].map((text) => `<span>${text}</span>`).join("")}<button id="bmPlay">▶ Auto-play</button></div>`,
        async play(win) {
          const sim = $("#bmSim", win);
          const steps = $$(".bm-steps span", win);
          const step = (index) => {
            steps.forEach((node, at) => node.classList.toggle("on", at === index));
            ctx.sfx("pop");
          };
          const spawn = (kind, count, area) => {
            for (let index = 0; index < count; index += 1) {
              const dot = document.createElement("i");
              dot.className = kind;
              dot.style.left = `${area[0] + Math.random() * area[1]}%`;
              dot.style.top = `${12 + Math.random() * 70}%`;
              sim.append(dot);
              dot.animate(pop, { duration: 420, delay: index * 40, fill: "backwards" });
            }
          };
          await click(ctx, stage, $("#bmPlay", win));
          step(0);
          spawn("virus", 9, [4, 26]);
          await ctx.wait(900);
          step(1);
          spawn("innate", 12, [30, 40]);
          await ctx.wait(900);
          step(2);
          spawn("tcell", 7, [20, 50]);
          for (const virus of $$(".virus", sim)) {
            virus.classList.add("gone");
            await ctx.wait(70);
          }
          await ctx.wait(500);
          step(3);
          $$(".innate, .tcell", sim).forEach((dot, index) => index % 5 !== 0 && dot.classList.add("gone"));
          $$(".tcell:not(.gone)", sim).forEach((dot) => dot.classList.add("memory"));
          ctx.sfx("done");
          await ctx.wait(1000);
        },
        payoff: "Science you<br><em>can play.</em>",
      }),
  },
];
