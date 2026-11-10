import { chromium, devices } from "@playwright/test";
const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"] }); const p = await c.newPage();
await p.goto("http://127.0.0.1:4332/kodilo/tools/random-generator/"); await p.waitForTimeout(800);
console.log(await p.evaluate(() => { const w = document.documentElement.clientWidth; return [...document.querySelectorAll("main *")].filter(e => e.getBoundingClientRect().right > w + 1).slice(0, 6).map(e => e.tagName + "." + e.className + "#" + e.id + " " + Math.round(e.getBoundingClientRect().right) + " vs " + w); }));
await b.close();
