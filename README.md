# Creovelo website

Independent performance creative studio site. Plain HTML, CSS, and JavaScript — no build step. Site files live at the repository root so Cloudflare can serve `index.html` at `/`.

## Get form emails

The contact form emails **creovelo719@gmail.com** through FormSubmit. No API keys, Worker secrets, or Resend setup.

1. Redeploy from current `main`.
2. Send one test inquiry on the live site.
3. Open **creovelo719@gmail.com** and click **Confirm** once.

After that, every inquiry arrives in that Gmail. Reply as usual.

hello@creovelo.com on the site stays the public address. If you also want people who email hello@ directly to reach you, turn on Cloudflare Email Routing and forward that address to the same Gmail.

## Deploy

In the Cloudflare project settings:

- Framework preset: **None**
- Build command: leave empty
- Output directory: `/` or `.`

After deploy, https://creovelo.com/ should load.

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

## Editing notes

- Change page copy and pricing in `index.html`.
- The Serein, Mora, and Onda concept copy also lives in the `projects` object in `app.js`.
- Instrument Serif and Instrument Sans load from Google Fonts.
- Serein, Mora, and Onda are fictional studio concepts, not client work or performance evidence.
- Motion follows the device's reduced-motion preference.
