# Decks

A full-screen app that displays multiple **decks** of **cards**. Each deck is a stack of four colored cards: the first (leftmost) card is **yellow**, the second is **red**, then **green**, then **blue**. Cards can be fanned, reordered, and expanded. Built with `index.html` and `index.css` (the main page and its styles; shared script in `shared.js`).

## Views

The app has three views:

- **Project view**  
  Overview of all decks in a grid. Each deck appears as a small card with its title. Click a deck to open it in Deck view.

- **Deck view**  
  One deck at a time. The four cards are shown in a fanned stack (yellow first/leftmost, then red, green, blue). You can switch decks (click the deck title or go back to Project view), reorder cards (click a card or its tab to bring that color to the front), and expand to Expanded view (black square button).

- **Expanded view**  
  The same deck with all four cards visible in a 2×2 grid. Use the black square button again to collapse back to the fanned stack (Deck view).

## What it does

- **Cards**  
  Each card has a tab, optional title, optional image (from the `png/` folder), and a bullet list. Clicking card images opens them in a lightbox.

- **State**  
  The current view, active deck, card order per deck, and expand state are stored in `localStorage` so they persist across reloads.

## Files

- **index.html** — Markup and script: deck data, card layers, view switching, expand/collapse, card reorder, lightbox, and localStorage.
- **index.css** — All styles for the app: card layers, line numbers, deck dimensions, project-view/deck-view/expanded-view, expand toggle, responsive scaling (single file paired with `index.html`).
- **png/** — Images used by cards (e.g. deck cover and card content images).

## Running it

1. Open `index.html` in a browser (e.g. Chrome).
2. You start in Project view. Click a deck to open it in Deck view.
3. Click the black square button to expand the deck to a 2×2 grid; click again to collapse.
4. Click a card (or its tab) to bring that card to the front of the stack.

No server required for local use. For deployment (e.g. GitHub Pages), serve the repo root so `index.html`, `index.css`, `shared.js`, and `png/` are available.
