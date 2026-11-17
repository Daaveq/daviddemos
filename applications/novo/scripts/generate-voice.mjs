// Generates the narrator's voice with the OpenAI text-to-speech API.
//   npm run voice            only lines that are new or changed
//   npm run voice -- --force every line
// The key is read from the environment or a local .env file. It is used here,
// at build time, and is never shipped to the browser.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LINES, VOICE } from "../narration.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const audioDir = join(root, "audio");
const manifestPath = join(audioDir, "manifest.json");
const force = process.argv.includes("--force");

const envPath = join(root, ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !line.trimStart().startsWith("#") && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

const key = process.env.OPENAI_API_KEY;
if (!key) {
  console.error("OPENAI_API_KEY is not set. Copy .env.example to .env and add your key.");
  process.exit(1);
}

const model = process.env.OPENAI_TTS_MODEL || VOICE.model;
const voice = process.env.OPENAI_TTS_VOICE || VOICE.voice;

mkdirSync(audioDir, { recursive: true });
let manifest = { clips: {} };
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.clips ||= {};
} catch {
  // Start from an empty manifest.
}

const fingerprint = (text) =>
  createHash("sha256").update([model, voice, VOICE.instructions, text].join("\n")).digest("hex").slice(0, 16);

let made = 0;
for (const { id, text } of LINES) {
  const file = `${id}.mp3`;
  const hash = fingerprint(text);
  if (!force && manifest.clips[id]?.hash === hash && existsSync(join(audioDir, file))) {
    console.log(`= ${id} unchanged`);
    continue;
  }

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      voice,
      input: text,
      instructions: VOICE.instructions,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    console.error(`x ${id}: HTTP ${response.status} ${(await response.text()).slice(0, 300)}`);
    process.exit(1);
  }

  writeFileSync(join(audioDir, file), Buffer.from(await response.arrayBuffer()));
  manifest.clips[id] = { file, hash };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  made += 1;
  console.log(`+ ${id} "${text}"`);
}

for (const id of Object.keys(manifest.clips)) {
  if (!LINES.some((line) => line.id === id)) delete manifest.clips[id];
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Done. ${made} clip(s) generated with ${model} / ${voice}.`);
