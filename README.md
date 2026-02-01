# Live Voice Page

Minimal, full-screen webpage that listens to speech, shows a live transcript,
and can optionally post text to a webhook. Designed to be hosted on GitHub Pages.

## Quick start (local)

1. Edit `config.js` to set optional values.
2. Open `index.html` in Chrome.
3. Click **Start Listening** and allow microphone access.

## GitHub Pages deployment

1. Push this repo to GitHub.
2. In GitHub: **Settings → Pages → Build and deployment → Source**
3. Choose **Deploy from a branch**, select `main` and `/ (root)`.
4. Your page will be live at `https://<username>.github.io/<repo>/`.

## Updating the live page

To force the page to reload on viewers' devices, update `status.json` with a new
timestamp and commit it. The client polls this file and reloads automatically.

## Optional webhook

Set `WEBHOOK_URL` in `config.js` to receive transcripts. The client sends:

```
{ "text": "<recognized speech>", "timestamp": "<ISO string>" }
```

If the webhook returns JSON with `response` or `text`, it will show in the
Assistant Response panel.
