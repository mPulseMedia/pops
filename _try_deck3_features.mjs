#!/usr/bin/env node
/** Try out features on deck 3 (Title). No edits to items. */
import { firefox } from "playwright";

const url = "file:///Users/pauldsmith/Desktop/pops/index.html";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await firefox.launch({ headless: false });
const page = await browser.newPage();
await page.goto(url);
await page.waitForSelector(".deck", { timeout: 5000 });
await page.waitForSelector("#cardRectOverlay.is-active", { timeout: 3000 });

// Deck 3 = "Title" (deckIndex 2). Use JS to open deck (bypass overlay interception).
await page.evaluate(() => {
  const deck = document.querySelector('.deck[data-deck="third"]');
  if (deck) deck.dispatchEvent(new MouseEvent("click", { bubbles: true, view: window }));
});
await delay(800);

// Ensure we're in deck view
await page.waitForSelector("body.deck-view", { timeout: 3000 });

// 1. Promote red card (click red tab)
const redTab = page.locator('.card-rect[data-deck-index="2"][data-index="1"] .tab');
await redTab.click();
await delay(600);

// 2. Promote green card (click green tab)
const greenTab = page.locator('.card-rect[data-deck-index="2"][data-index="2"] .tab');
await greenTab.click();
await delay(600);

// 3. Promote yellow card back (click yellow tab)
const yellowTab = page.locator('.card-rect[data-deck-index="2"][data-index="0"] .tab');
await yellowTab.click();
await delay(600);

// 4. Expand to expanded view (black square)
const expandBtn = page.locator("#titleRowExpandBtn");
await expandBtn.click();
await delay(1000);

// 5. In expanded view: click green tab to promote and collapse to deck view
const greenTabExpanded = page.locator('.card-rect[data-deck-index="2"][data-index="2"] .tab');
await greenTabExpanded.click();
await delay(1200);

// 6. Back to project view
const backBtn = page.locator("#titleRowBackBtn");
await backBtn.click();
await delay(800);

// 7. Re-enter deck 3
await page.evaluate(() => {
  const deck = document.querySelector('.deck[data-deck="third"]');
  if (deck) deck.dispatchEvent(new MouseEvent("click", { bubbles: true, view: window }));
});
await delay(1000);

// 8. Expand again, then collapse with expand button
await expandBtn.click();
await delay(800);
await expandBtn.click();
await delay(800);

// 9. Back to project
await backBtn.click();
await delay(500);

await browser.close();
