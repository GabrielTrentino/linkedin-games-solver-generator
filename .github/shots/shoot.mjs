import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = "http://localhost:4173/";
const OUT = "shots";
mkdirSync(OUT, { recursive: true });
const log = [];

async function newPage(browser, { scheme = "light", width = 1280, height = 900 } = {}) {
  const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") log.push(`[${scheme} ${width}] console.${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => log.push(`[${scheme} ${width}] pageerror: ${e.message}`));
  return { ctx, page };
}

async function shot(page, name) {
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  log.push(`shot ${name}`);
}

async function generate(page, gameName, boardSel) {
  await page.goto(BASE + "#/mesa");
  await page.locator(".tile", { hasText: gameName }).click();
  await page.getByRole("button", { name: "Abrir fase" }).click();
  await page.waitForSelector(boardSel, { timeout: 60000 });
}

async function clickCell(page, sel, i) {
  const box = await page.locator(sel).nth(i).boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

const browser = await chromium.launch();
try {
  for (const scheme of ["light", "dark"]) {
    const { ctx, page } = await newPage(browser, { scheme });
    await page.goto(BASE);
    await page.waitForSelector(".marks");
    await shot(page, `${scheme}-01-marcas`);
    await page.goto(BASE + "#/mesa");
    await page.waitForSelector(".tiles");
    await shot(page, `${scheme}-02-mesa`);

    await generate(page, "Queens", ".qboard");
    await clickCell(page, ".qcell", 0);
    await clickCell(page, ".qcell", 0);
    await clickCell(page, ".qcell", 1);
    await clickCell(page, ".qcell", 1);
    await shot(page, `${scheme}-03-queens-conflito`);

    await generate(page, "Tango", ".tboard");
    const tEmpty = page.locator(".tcell:not(.is-given)");
    for (let i = 0; i < 3; i++) await tEmpty.nth(i).click();
    await page.waitForTimeout(1800);
    await shot(page, `${scheme}-04-tango`);

    await generate(page, "Mini Sudoku", ".sboard");
    const sEmpty = page.locator('.scell:not([aria-disabled="true"])');
    await sEmpty.nth(0).click();
    await sEmpty.nth(1).click();
    await shot(page, `${scheme}-05-sudoku`);

    await generate(page, "Zip", ".zboard");
    await shot(page, `${scheme}-06-zip`);

    await generate(page, "Patches", ".pboard");
    await shot(page, `${scheme}-07-patches`);

    await page.goto(BASE + "#/settings");
    await page.waitForSelector(".settings");
    await shot(page, `${scheme}-08-ajustes`);

    await page.goto(BASE);
    await page.waitForSelector(".marks");
    await shot(page, `${scheme}-09-marcas-com-dados`);
    await ctx.close();
  }

  // Teclado: Tab até o tabuleiro e setas.
  {
    const { ctx, page } = await newPage(browser, {});
    await generate(page, "Queens", ".qboard");
    await page.locator(".qcell").first().focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowDown");
    const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
    log.push(`keyboard focus after →→↓: ${focused}`);
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await shot(page, "light-10-queens-teclado");

    await generate(page, "Mini Sudoku", ".sboard");
    await page.locator(".scell").first().focus();
    for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowRight");
    const sFocused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
    log.push(`sudoku focus after →x4: ${sFocused}`);
    await shot(page, "light-11-sudoku-teclado");

    // Import inválido
    await page.goto(BASE + "#/settings");
    await page.waitForSelector(".settings");
    await page.locator('input[type="file"]').setInputFiles({
      name: "ruim.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ meta: { schemaVersion: 9 }, puzzles: [{ id: "x", game: "chess" }] })),
    });
    await page.waitForSelector(".banner--err");
    await shot(page, "light-12-import-invalido");

    // Recarregar rota profunda (HashRouter)
    await page.goto(BASE + "#/game/queens/tempos");
    await page.reload();
    await page.waitForSelector(".subnav");
    log.push(`deep link url: ${page.url()} title: ${await page.locator("h2").first().textContent()}`);
    await ctx.close();
  }

  // Celular
  for (const scheme of ["light", "dark"]) {
    const { ctx, page } = await newPage(browser, { scheme, width: 360, height: 760 });
    await page.goto(BASE);
    await page.waitForSelector(".marks");
    await shot(page, `mobile-${scheme}-01-marcas`);
    await generate(page, "Queens", ".qboard");
    await shot(page, `mobile-${scheme}-02-queens`);
    await generate(page, "Mini Sudoku", ".sboard");
    await shot(page, `mobile-${scheme}-03-sudoku`);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    log.push(`mobile ${scheme} scrollWidth: ${sw}`);
    await ctx.close();
  }
} catch (e) {
  log.push(`FATAL: ${e.stack}`);
} finally {
  await browser.close();
  writeFileSync(`${OUT}/log.txt`, log.join("\n") + "\n");
}
