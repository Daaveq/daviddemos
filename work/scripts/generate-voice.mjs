// Generates narration for the work films with OpenAI text-to-speech.
//   npm run voice:work            only new or changed lines
//   npm run voice:work -- --force every line
// The key comes from the environment, work/.env, or applications/novo/.env.
// It is used at build time only and never reaches the browser.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VOICE } from "../../applications/novo/narration.js";
import { FILMS } from "../films.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const audioDir = join(root, "audio");
const manifestPath = join(audioDir, "manifest.json");
const force = process.argv.includes("--force");

for (const envPath of [join(root, ".env"), join(root, "..", "applications", "novo", ".env")]) {
  if (!existsSync(envPath)) continue;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !line.trimStart().startsWith("#") && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

const key = process.env.OPENAI_API_KEY;
if (!key) {
  console.error("OPENAI_API_KEY is not set. Add it to work/.env or applications/novo/.env.");
  process.exit(1);
}

const model = process.env.OPENAI_TTS_MODEL || VOICE.model;
const voice = process.env.OPENAI_TTS_VOICE || VOICE.voice;
const lines = FILMS.flatMap((film) => Object.entries(film.lines).map(([part, text]) => ({ id: `${film.id}-${part}`, text })));

mkdirSync(audioDir, { recursive: true });
let manifest = { clips: {} };
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.clips ||= {};
} catch {
  // Start from an empty manifest.
}

const fingerprint = (text) => createHash("sha256").update([model, voice, VOICE.instructions, text].join("\n")).digest("hex").slice(0, 16);

let made = 0;
for (const { id, text } of lines) {
  const file = `${id}.mp3`;
  const hash = fingerprint(text);
  if (!force && manifest.clips[id]?.hash === hash && existsSync(join(audioDir, file))) continue;
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, voice, input: text, instructions: VOICE.instructions, response_format: "mp3" }),
  });
  if (!response.ok) {
    console.error(`x ${id}: HTTP ${response.status} ${(await response.text()).slice(0, 300)}`);
    process.exit(1);
  }
  writeFileSync(join(audioDir, file), Buffer.from(await response.arrayBuffer()));
  manifest.clips[id] = { file, hash };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  made += 1;
  console.log(`+ ${id}`);
}
for (const id of Object.keys(manifest.clips)) if (!lines.some((line) => line.id === id)) delete manifest.clips[id];
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Done. ${made} new clip(s); ${lines.length} line(s) across ${FILMS.length} films.`);
