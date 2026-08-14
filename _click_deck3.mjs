#!/usr/bin/env node
/** One-time script: open page, click deck 3 only. No edits. */
import { firefox } from "playwright";

const url = "file:///Users/pauldsmith/Desktop/pops/index.html";

const browser = await firefox.launch({ headless: false });
const page = await browser.newPage();
await page.goto(url);
await page.waitForSelector(".deck", { timeout: 5000 });

// Deck 3 = third deck in project view (data-deck="third", title "Title")
const deck3 = page.locator('.deck[data-deck="third"]');
await deck3.click();

// Keep browser open briefly so user can see result
await page.waitForTimeout(2000);
await browser.close();
