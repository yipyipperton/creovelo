# Creovelo website

Independent performance creative studio site. Plain HTML, CSS, and JavaScript — no build step. Site files live at the repository root so Cloudflare Pages can serve `index.html` at `/`.

## Deploy on Cloudflare Pages

In the Pages project settings:

- Framework preset: **None**
- Build command: leave empty
- Output directory: `/` or `.`

The same site is published at `/` and `/creovelo-github/` so either Cloudflare output setting works. After deploy, https://creovelo.com/ should load.

## Preview locally

```sh
python3 -m http.server 8080
```

Then visit http://localhost:8080.

## Files

- `index.html`: page content and structure
- `style.css`: the full design system
- `app.js`: navigation, creative showcase, inquiry dialog, and scroll interactions
- `favicon.svg`: site icon
- Four `.webp` images: optimized assets used on the site
- `original-images/`: full-resolution source images for future editing
- `.nojekyll`: allows straightforward static publishing with GitHub Pages

## Editing notes

- Change page copy and pricing in `index.html`.
- The Serein, Mora, and Onda concept copy also lives in the `projects` object in `app.js`.
- The contact workflow uses `mailto:hello@creovelo.com`. It opens the visitor's email app and does not save leads on a server.
- Instrument Serif and Instrument Sans load from Google Fonts. An internet connection is needed for those fonts.
- Serein, Mora, and Onda are fictional studio concepts, not client work or performance evidence.
- Motion follows the device's reduced-motion preference. Tickers pause on hover.
