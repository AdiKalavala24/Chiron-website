# Chiron — Marketing Site

Landing page for **Chiron**, the adaptive AI learning companion for grades K–4.

## Running it

It's a static site with no build step. Open `index.html` directly, or serve it:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Structure

```
index.html            Whole page — all 8 sections, plus the two modals
assets/css/styles.css Design-system CSS on top of Tailwind (shadows, blobs, animations)
assets/js/main.js     Mobile nav, tabs, grade selector, modals, scroll reveal
```

## Interactive pieces

**Grade selector** (`#subjects`) is an ARIA radiogroup. Clicking a tier — or using
arrow keys / Home / End — rewrites the sample content in all four subject cards from the
`GRADES` object in `main.js`. To change what a grade demonstrates, edit that object; each
entry supplies a node name plus the writing target, speaking word and tip, math prompt and
block count, and reading sentence and words-per-minute.

The writing card sizes its traced text by measuring it (`fitWritingText`), so any target
string from `"Aa"` to a full sentence fills the box without hand-tuned font sizes.

**Modals** are driven by data attributes: `data-open="video"` or `data-open="signup"` on any
button opens the matching `[data-modal]`, and `data-modal-close` closes it. Both trap focus,
close on Escape and backdrop click, lock body scroll, and restore focus to the trigger.

## Design system — "Playful Geometric"

| Token | Value | Tailwind |
| --- | --- | --- |
| Background | `#FFFDF5` | `bg-cream` |
| Primary accent | `#8B5CF6` | `bg-brand` |
| Secondary pop | `#F472B6` | `bg-pop` |
| Tertiary optimism | `#FBBF24` | `bg-sun` |
| Quaternary freshness | `#34D399` | `bg-mint` |
| Text / borders | `#1E293B` | `text-ink`, `border-ink` |

Every raised surface uses a 2px solid `#1E293B` border plus a hard offset drop shadow
(`shadow-hard` = `4px 4px 0px 0px #1E293B`, with `-sm`, `-lg`, `-xl` and `-cream` variants).
Add `.press` or `.press-lg` to make that shadow deepen on hover and collapse on click.
Buttons are `rounded-full`, cards are `rounded-2xl`+.

Type is Outfit (display) over Nunito Sans (body), both from Google Fonts.

## Before going live

Tailwind currently loads from the Play CDN, which compiles in the browser and prints a
production warning to the console. Swap it for a compiled stylesheet:

```bash
npm install -D tailwindcss
npx tailwindcss -i src/input.css -o assets/css/tailwind.css --minify
```

Move the `tailwind.config` object from the `<head>` of `index.html` into `tailwind.config.js`,
then replace the CDN `<script>` with a `<link>` to the built file. Self-hosting the two fonts
will also remove the last third-party request.

**Still unwired:**

1. `SIGNUP_ENDPOINT` in `assets/js/main.js` is `null`. Until you set it, the trial form
   validates the email but posts nowhere, and says so on screen rather than showing a false
   confirmation. Set it to your signup API and the real "You're on the list!" state appears.
2. The demo video is a placeholder — there is a commented `<iframe>` in the video modal
   showing where the embed goes.
3. Four footer links (About, Privacy & Safety, For Educators, Support) still point at `#`
   because those pages don't exist yet. Every other link and button on the page works.

**Copy that needs sign-off before launch:** the trust badges ("K–4 Curriculum Aligned",
"Zero Ads · 100% Kid Safe") and the camera/privacy lines in the Adaptation Engine and final
CTA sections make specific claims about the product. Confirm each one is accurate.
