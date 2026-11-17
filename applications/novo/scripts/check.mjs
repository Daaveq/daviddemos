// Static sanity check: every local file the page references exists, modules parse,
// and every narration line has a unique id.
import { existsSync, readFileSync } from "node:fs";
import { LINES } from "../narration.js";

const html = readFileSync("index.html", "utf8");
if (!/^<!doctype html>/i.test(html.trimStart())) throw new Error("index.html: missing doctype");
const refs = [...html.matchAll(/(?:src|href)=["']([^"'#][^"']*)["']/g)].map((m) => m[1]).filter((r) => !/^(https?:|data:|mailto:)/.test(r));
for (const ref of refs) if (!existsSync(ref.split(/[?#]/)[0])) throw new Error(`index.html: missing ${ref}`);
await import("../orb.js");
await import("../music.js");
const ids = new Set(LINES.map((line) => line.id));
if (ids.size !== LINES.length) throw new Error("narration.js: duplicate ids");
const manifest = JSON.parse(readFileSync("audio/manifest.json", "utf8"));
const voiced = LINES.filter((line) => manifest.clips?.[line.id] && existsSync(`audio/${manifest.clips[line.id].file}`)).length;
console.log(`OK: ${refs.length} local reference(s), ${LINES.length} narration line(s), ${voiced} voiced.`);
