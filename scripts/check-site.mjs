import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import vm from "node:vm";

const pages = ["index.html", "demos.html", "ai-compass.html"];

for (const page of pages) {
  const html = readFileSync(page, "utf8");

  if (!/^<!doctype html>/i.test(html.trimStart())) {
    throw new Error(`${page}: missing HTML doctype`);
  }

  const inlineScripts = [
    ...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi),
  ];

  for (const [index, match] of inlineScripts.entries()) {
    new vm.Script(match[1], { filename: `${page}:inline-script-${index + 1}` });
  }

  const localReferences = [
    ...html.matchAll(/(?:src|href)=["']([^"']+)["']/gi),
  ]
    .map((match) => match[1])
    .filter(
      (reference) =>
        !/^(?:https?:|data:|mailto:|tel:|#|javascript:)/i.test(reference),
    );

  for (const reference of localReferences) {
    const path = resolve(dirname(page), reference.split(/[?#]/, 1)[0]);
    if (!existsSync(path)) {
      throw new Error(`${page}: missing local asset ${reference}`);
    }
  }

  console.log(
    `Checked ${page}: ${inlineScripts.length} inline script(s), ${localReferences.length} local reference(s).`,
  );
}
