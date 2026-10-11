# Creovelo website

Complete export of the latest published Creovelo website, including the continuously moving hero creatives, fixed mobile header, larger mobile typography, and all website imagery.

## Use with GitHub

1. Extract `creovelo-github.zip`.
2. Create or open your GitHub repository.
3. Upload the **contents** of the extracted `creovelo-github` folder to the repository root. Upload the individual files and folders, not the ZIP itself.
4. Keep `index.html`, the CSS files, `app.js`, and the WebP images together at the root so relative asset paths work.

The site is plain HTML, CSS, and JavaScript. No package installation or build step is required. Any static host can serve the repository root. Adding files to GitHub stores the code; website hosting must be enabled separately if desired.

## Preview locally

Open `index.html` in your browser, or serve this folder with:

```sh
python3 -m http.server 8080
```

Then visit http://localhost:8080.

## Files

- `index.html`: all page content and layout.
- `style.css`: foundational styles.
- `editorial.css`: editorial design layer.
- `refinement.css`: final mobile, spacing, navigation, and continuous-motion refinements. Stylesheets load in this order; keep all three.
- `app.js`: navigation, creative showcase, inquiry dialog, and scroll interactions.
- `favicon.svg`: website favicon.
- Four `.webp` images: optimized image assets used by the website.
- `original-images/`: the four full-resolution AI-generated PNG images, included for future editing. These originals are not required to run the site.
- `.nojekyll`: allows straightforward static-file publishing with GitHub Pages.

## Editing notes

- Change page copy and pricing in `index.html`.
- The interactive Serein, Mora, and Onda concept copy is also defined in the `projects` object in `app.js`.
- For visual changes, check the final rules in `refinement.css`, which override the earlier stylesheets.
- The contact workflow uses `mailto:hello@creovelo.com`. It opens the visitor's email app; it does not send messages or save leads on a server. Confirm that this inbox is active, or replace it in both `index.html` and `app.js`.
- DM Sans and Instrument Serif load from Google Fonts. Font files are not bundled; an internet connection is needed for those fonts. Local fallback fonts are configured.
- The imagery is AI-generated. Serein, Mora, and Onda are fictional studio concepts, not client work or performance evidence.
- Motion follows the device's reduced-motion preference. There is no on-page pause control.

## Export details

This is a portable export of published version 4 from October 11, 2026. Website files match the published source. Git history, temporary scripts, credentials, and ChatGPT-specific hosting configuration are intentionally excluded.
