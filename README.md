# Creovelo website

Independent performance creative studio site. Plain HTML, CSS, and JavaScript — no build step. Site files live at the repository root so Cloudflare can serve `index.html` at `/`.

The contact form backend also lives here, on the **same Cloudflare project**. You do not need a separate server, VPS, or another host.

## Receive email at hello@creovelo.com

This is domain email, not a website server. In Cloudflare:

1. Open **creovelo.com** → **Email** → **Email Routing**.
2. Enable Email Routing. Cloudflare will add the MX records for you.
3. Under **Destination addresses**, add your personal inbox (Gmail is fine) and click the verification email.
4. Under **Routing rules**, create `hello@creovelo.com` → **Send to** that personal inbox.

After that, anyone who emails hello@creovelo.com reaches you. Repeat the rule for other addresses if you want them.

## Make the website form email you

The form posts to `/api/contact` on this same Cloudflare project. After Email Routing is on:

1. Open the **creovelo** Worker / Pages project → **Settings** → **Variables and Secrets**.
2. Add a secret named `CONTACT_INBOX` with the same personal inbox you verified above.
3. Redeploy the project from current `main`.

`CONTACT_FROM` is already set to `hello@creovelo.com`. Replies from you still come from your personal inbox; visitors can be replied to with Reply in Gmail because the form sets Reply-To to their address.

Optional fallback if Cloudflare sending is not available: create a [Resend](https://resend.com) API key, add it as the `RESEND_API_KEY` secret, and verify creovelo.com there.

If your Cloudflare project is a **Worker** instead of Pages, set `main = "worker.js"` and add `binding = "ASSETS"` plus `run_worker_first = ["/api/*"]` under `[assets]` in `wrangler.toml`.

## Deploy

In the Cloudflare project settings:

- Framework preset: **None**
- Build command: leave empty
- Output directory: `/` or `.`

The same site is published at `/` and `/creovelo-github/` so either output setting works. After deploy, https://creovelo.com/ should load.

## Preview locally

```sh
python3 -m http.server 8080
```

The static site will load. The contact API needs Wrangler or the local preview script:

```sh
node scripts/preview.mjs
```

Then visit http://127.0.0.1:8788. Submissions are accepted and printed in the terminal unless you add a `.dev.vars` file.

## Files

- `index.html`: page content and structure
- `style.css`: the full design system
- `app.js`: navigation, creative showcase, inquiry dialog, and scroll interactions
- `functions/api/contact.js`: Cloudflare Pages Function for form submissions
- `functions/_lib/contact.js`: shared validation and email sending
- `worker.js`: Worker entry if the project is deployed as a Worker
- `favicon.svg`: site icon
- Four `.webp` images: optimized assets used on the site
- `original-images/`: full-resolution source images for future editing
- `.nojekyll`: allows straightforward static publishing with GitHub Pages

## Editing notes

- Change page copy and pricing in `index.html`.
- The Serein, Mora, and Onda concept copy also lives in the `projects` object in `app.js`.
- The contact form sends to `/api/contact`. hello@creovelo.com stays as the public address.
- Instrument Serif and Instrument Sans load from Google Fonts. An internet connection is needed for those fonts.
- Serein, Mora, and Onda are fictional studio concepts, not client work or performance evidence.
- Motion follows the device's reduced-motion preference.
