# Creovelo website

Independent performance creative studio site. Plain HTML, CSS, and JavaScript — no build step. Site files live at the repository root so Cloudflare can serve `index.html` at `/`.

The contact form backend also lives here, on the **same Cloudflare project**. You do not need a separate server, VPS, or another host.

## Receive email at hello@creovelo.com

This is domain email, not a website server. In Cloudflare:

1. Open **creovelo.com** → **Email** → **Email Routing**.
2. Enable Email Routing. Cloudflare will add the MX records for you.
3. Under **Destination addresses**, add `creovelo719@gmail.com` and click the verification email.
4. Under **Routing rules**, create `hello@creovelo.com` → **Send to** `creovelo719@gmail.com`.

After that, anyone who emails hello@creovelo.com reaches that Gmail. Repeat the rule for other addresses if you want them.

## Make the website form email you

The form posts to `/api/contact` on this same Cloudflare project. After Email Routing is on and `creovelo719@gmail.com` is verified, redeploy from current `main`.

`CONTACT_FROM` is already `hello@creovelo.com`. Inquiries are delivered to `creovelo719@gmail.com`. Reply in Gmail — the form sets Reply-To to the visitor’s address.

To send through [Resend](https://resend.com):

1. Redeploy this project from current `main` first. The site must be a Worker with `worker.js`, not static files only. Cloudflare blocks secrets on assets-only Workers.
2. In Resend, add and verify the creovelo.com domain so mail can come from `hello@creovelo.com`.
3. Create an API key.
4. In Cloudflare, open the **creovelo** Worker → **Settings** → **Variables and Secrets**.
5. Add a secret named `RESEND_API_KEY`. Paste the key there only — never commit it or send it in chat.
6. Save. A second deploy is not required after adding a secret, but redeploy if the form still cannot send.

The site then sends a formatted HTML inquiry to `creovelo719@gmail.com`.

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

Then visit http://127.0.0.1:8788. Submissions are accepted and printed in the terminal.

## Files

- `index.html`: page content and structure
- `style.css`: the full design system
- `app.js`: navigation, creative showcase, inquiry dialog, and scroll interactions
- `worker.js`: Cloudflare Worker entry. Serves `/api/contact` and the static site.
- `functions/_lib/contact.js`: shared validation and email sending
- `functions/api/contact.js`: Pages Function fallback for the same API
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
