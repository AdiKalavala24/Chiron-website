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
index.html            Landing page — 8 sections plus the product-tour modal
pricing.html          Plans, what's included, waitlist, FAQ
assets/css/styles.css Design-system CSS on top of Tailwind (shadows, blobs, animations)
assets/js/main.js     Shared: nav, tabs, grade selector, modals, waitlist, scroll reveal
```

Both pages share `styles.css` and `main.js`. Every block in the JS is guarded by an
existence check, so the same file drives both pages without branching on the URL.

## Commercial facts encoded in the site

Chiron is in **closed beta with no announced release date**, so every trial CTA leads to
`pricing.html` rather than a signup flow, and the pricing page opens with a beta notice.
Pricing shown: **$10/month** or **$80/year** (a $40 saving, about $6.67/month), each
**starting with a 3-month free trial**. If any of those change, they appear in the pricing
hero, both plan cards, the FAQ, and the final CTA badge on the landing page.

## Interactive pieces

**Grade selector** (`#subjects`) is an ARIA radiogroup. Clicking a tier — or using
arrow keys / Home / End — rewrites the sample content in all four subject cards from the
`GRADES` object in `main.js`. To change what a grade demonstrates, edit that object; each
entry supplies a node name plus the writing target, speaking word and tip, math prompt and
block count, and reading sentence and words-per-minute.

The writing card sizes its traced text by measuring it (`fitWritingText`), so any target
string from `"Aa"` to a full sentence fills the box without hand-tuned font sizes.

**Modals** are driven by data attributes: `data-open="video"` on any button opens the
matching `[data-modal]`, and `data-modal-close` closes it. Modals trap focus, close on
Escape and backdrop click, lock body scroll, and restore focus to the trigger.

**Waitlist form** lives on the pricing page (`#waitlist`) and posts to **Formspree**
(`https://formspree.io/f/xykrlwzq`) over AJAX, so the success panel renders in place instead
of navigating to Formspree's own thank-you page.

The endpoint lives in the form's `action` attribute rather than in JavaScript, so the form
still posts correctly if the JS never loads — the handler just calls `preventDefault()` and
re-sends the same `FormData` with an `Accept: application/json` header. For the same reason
`novalidate` is set from JS rather than hardcoded: no-JS visitors keep native validation.

The success panel only appears after Formspree confirms with a 2xx. A rejection (monthly
quota, spam filter, disabled form) or a network failure leaves the filled-in form on screen,
surfaces Formspree's own error message, and re-enables the button so the parent can retry.

Two hidden fields ride along: `_subject`, which titles the notification email, and `_gotcha`,
a honeypot Formspree uses to drop bot submissions. The grade `<option>` values are the human
labels ("3rd Grade", not "g3") so the notification email reads cleanly.

To swap forms, change the `action` on the form in `pricing.html` — nothing in the JS is
Formspree-specific beyond parsing its `{ errors: [...] }` response shape.

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

1. The demo video is a placeholder — there is a commented `<iframe>` in the video modal
   showing where the embed goes.
2. Four footer links (About, Privacy & Safety, For Educators, Support) still point at `#`
   because those pages don't exist yet. Every other link and button works.
3. Formspree's free tier caps monthly submissions. If the waitlist converts well, the form
   will start returning errors once the cap is hit — parents see a retry message rather than
   a silent failure, but you'd want to be on a paid plan before a launch push.

**Copy that needs sign-off before launch:** the trust badges ("K–4 Curriculum Aligned",
"Zero Ads · 100% Kid Safe"), the camera/privacy lines in the Adaptation Engine and pricing
FAQ, and the trial-billing description ("billing only begins after those three months") all
make specific claims. Confirm each is accurate — especially the billing language, which is a
commitment to paying customers.
