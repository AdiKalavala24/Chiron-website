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
index.html            Whole page — all 8 sections
assets/css/styles.css Design-system CSS on top of Tailwind (shadows, blobs, animations)
assets/js/main.js     Mobile nav, teaching-style tabs, scroll reveal
```

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

**Copy that needs sign-off before launch:** the trust badges ("K–4 Curriculum Aligned",
"Zero Ads · 100% Kid Safe") and the camera/privacy lines in the Adaptation Engine and final
CTA sections make specific claims about the product. Confirm each one is accurate.
All CTAs currently point at `#` and need real destinations.
