# HEAD (head.com) design token extraction

Captured 2026-09-25. Every value below was measured on the live site unless it is marked **(inferred)**. Frequencies are occurrence counts across the site's own Next.js CSS bundles. The third-party Yotpo review CSS is excluded.

## 1. Sources fetched

| Source | Result |
|---|---|
| `curl -sL` (desktop Chrome UA) on `https://www.head.com/` | **Blocked**: HTTP 429 "Vercel Security Checkpoint" (a JS challenge page) |
| `curl` on `/_next/static/css/*.css` | **Blocked** the same way (429). Those downloads were checkpoint HTML and have been deleted |
| Real Chrome (claude-in-chrome), homepage | OK. It redirected to `https://www.head.com/es_ES/` (geo). Title "Ski, Snowboard, Tennis, Padel and Pickleball equipment – HEAD" |
| Category page | OK. `https://www.head.com/en_US/shop-tennis/racquets` ("Tennis Racquets – HEAD") |
| Product page | OK. `https://www.head.com/en_US/product/iprestige-mp-2-0-2026-239826` |

CSS was fetched with `fetch()` inside the page, then analysed there with regex counts plus CSSOM rule dumps and `getComputedStyle` on live elements. Raw CSS was **not saved to disk**, because the browser can't write to the scratchpad and curl is blocked.

- Home bundles: `6af6515c114cffc3.css` (283 KB, the main one), `10c16263702fd964.css` (95 KB), `8871bd0c9e1691e7.css`, `d459b1a7fa91270b.css`, `0c95609389823d58.css`, `4ba262cd90da2eb8.css`, `4cf9c38560cc8584.css`, `ef46db3751d8e999.css` (empty), 7 inline `<style>` blocks and `/vendor/yotpo-global.css`.
- PDP adds: `3e54834fa8d582d8`, `529c6e8dcb71bd81`, `251aba534c6302a3`, `d32e6ba1da384def`, `723dba4cdbff7638`.
- Stack: Next.js front end on a Magento back end (`mcprod.head.com` media). Product images come from `cdn-mdb.head.com` as 683×911 webp. Class names are CSS-modules style (`button-primary-9Ou`), and the token names follow the **Untitled UI** naming scheme (`--Colors-Effects-Shadows-shadow-md_01`, `utility-gray-200`, "skeumorphic" shadows). A `.zoggs` prefix shows up in a few rules, so this is a multi-brand platform.

## 2. Typography

**Families (from `@font-face`, self-hosted at `/_next/static/media/Inter-*.woff2`, `font-display: swap`)**

| Family name in CSS | Weight | Uses in CSS | Role |
|---|---|---|---|
| `Inter Medium` | 500 | 82 | prices, subtitles, badges, breadcrumbs |
| `Inter Bold` | 700 | 62 | buttons, product names, PDP H1, card titles |
| `Inter SemiBold` | 600 | 48 | display headings (hero, section titles), nav, footer |
| `Inter Regular` | 400 | 31 | inputs, size tiles |
| `Inter Light` | 300 | 14 | **body default** (`body` computes to Inter Light at 16/24) |

The fallback stack is always `Roboto, Arial, sans-serif`. Each weight is registered as its own family name, and `font-weight` values are set to match.

Other families found:
- `interstate-condensed` (21 uses). It is used only inside the `[data-theme="dark"]` token block and some promo rules. It was **not loaded** on any page I visited, and no Typekit link was present. Interstate is a commercial Font Bureau face, available through Adobe Fonts.
- `Interstate WGL Cond` (3), `Aeonik` (15, commercial, CoType), `Gotham Medium` (2, commercial, H&Co). These look like one-offs or sub-brands.
- `Inter-Final` 400/600 loads on the PDP, probably for the review widget.

**Licensing and free alternatives**
- Inter is open source (SIL OFL). Use it directly from Google Fonts or `@fontsource-variable/inter`. No substitute is needed.
- interstate-condensed is commercial. The closest free matches are **Barlow Condensed** (Google Fonts, closest in feel), **Roboto Condensed**, or **Archivo Narrow**.
- Aeonik is commercial. Free alternatives: **Manrope** / **Plus Jakarta Sans**.
- Gotham is commercial. Free alternative: **Montserrat**.

**Measured sizes (computed)**

| Element | Family / weight | Size / line-height | Letter-spacing | Case |
|---|---|---|---|---|
| Hero title (H2 on home) | SemiBold 600 | 52 / 57.2 (1.1) | -1.144px (≈ -0.022em) | none |
| Hero title, secondary slides | SemiBold 600 | 36 / 44 | -0.792px | none |
| Section title ("Highlights") | SemiBold 600 | 40 / 44 | -0.792px | none |
| Hero subtitle | Medium 500 | 28 / 34 and 20 / 24 | -0.588px | none |
| Category H1 ("Tennis Racquets") | SemiBold 600 | 24 / 29 | -0.456px | `capitalize` |
| PDP H1 (product name) | Bold 700 | 24 / 29 | -0.456px | none |
| Footer H2 | SemiBold 600 | 24 / 29 | -0.456px | none |
| PDP section H2/H3 ("Description", "Grip Size") | Bold 700 | 16 / 20 | -0.176px | none |
| Body | Light 300 (named Regular in places) | 16 / 24 | normal | none |
| Nav items | SemiBold 600 | 16 / 20 | -0.176px | none |
| Footer links | SemiBold 600 | 16 / 20, color #737373 | -0.176px | none |
| Small / UI (md buttons, footer H3) | SemiBold 600 | 14 / 17 | -0.084px | none |
| Badge ("New", "Coming soon") | Medium 500 | 12 / 15 | normal | none |
| Card product name | Bold 700 | 16 / 20 | -0.084px | none |
| Card price | Medium 500 | 16 / 24 | normal | none |
| PDP price | Bold 700 | 18 / 21 | normal | none |
| Button 2xl / lg / md | Bold 700 | 18/21, 16/20, 14/17 | normal, -0.176, -0.084 | none |

Font-size frequency: 14px ×79, 16px ×60, 2rem ×33, 20px ×27, 12px ×27, 1.125rem ×24, 40px ×21, 1.5rem ×17, 1.75rem ×16, 3.25rem ×11, 36px ×10. The weight spread is 500 ×90, 700 ×67, 600 ×51, 400 ×47, 300 ×12.

Letter-spacing is **negative and tight** everywhere: -0.084px ×39, -0.176px ×29, -0.792px ×12. That works out to about -0.6% at 14px, -1.1% at 16px and -2% at 40–52px, which matches Untitled UI display tracking.

Uppercase: `uppercase` ×31, `capitalize` ×22, `none` ×21. None of the main UI measured is uppercase. It is limited to small labels and promos **(inferred from counts; exact elements not identified)**.

## 3. Colors

The site's overall character is **light**. It uses a warm off-white page background (`#fdf9f8`, not pure white), near-black text, and white controls. Hero imagery is full-bleed photography with white text over it. A complete dark theme is defined in CSS (`[data-theme="dark"]`), but every page visited ran `data-theme="light"`.

| Role | Hex | Freq | Where used |
|---|---|---|---|
| Page background | `#fdf9f8` | 47 | `--background-color`, `main`, footer bg, the focus-ring offset colour |
| Surface / control bg | `#ffffff` | 188 | primary button bg, size tiles, inputs, carousel arrows |
| Text primary | `#1a1a1a` | 88 | `--colors-text-text-primary-900`, body text, primary button text, wishlist icon |
| Ink / strong black | `#121212` | 84 | `--c-black-1`, 1px dark borders (`1px solid #121212` ×10), dark theme bg |
| Pure black | `#000000` | 27 | overlays and misc |
| Text secondary | `#737373` | 34 | `--colors-text-text-secondary-700`, breadcrumbs, footer links, badge group |
| Border primary | `#e5e5e5` | 70 | `--Colors-border-border-primary`, primary button border, tiles, primary button hover bg |
| Border hover / mid gray | `#949494` | 10 | `--Colors-border-border-primary-hover` |
| Border input (Untitled gray-300) | `#d0d5dd` | 14 | secondary button border, modal inputs |
| Subtle bg (gray-100) | `#f2f4f7` | 25 | disabled button bg, search input bg, mini-cart footer |
| Disabled text (gray-400) | `#98a2b3` | 21 | disabled buttons |
| Tertiary button fg | `#475467` / hover `#344054` | 6 / 5 | icon buttons, tertiary gray |
| **Brand accent: HEAD orange** | `#d5400a` | 57 | `--colors-text-text-brand-secondary-700`, badges ("New", "Coming soon"), selected tile border 1.5px, wishlist selected, `button-primary-dark` bg, tertiary-colour text |
| Brand accent hover / darker | `#9c2f10` | 3 | tertiary-colour hover |
| Focus ring / bright orange | `#fc6c13` | 28 | `--Colors-Effects-Focus-rings-focus-ring`, used in `0 0 0 2px bg, 0 0 0 4px #fc6c13` |
| Orange tint bg | `#fff7ed` / `#ffd5a9` | 7 / 6 | promo and badge tints **(inferred)** |
| Error / destructive | `#d92d20`, hover `#f04438` | 6 / 7 | `button-primary-red`, error focus ring |
| Promo red | `#e81f1f` | 4 | sale/promo **(inferred)** |
| Secondary-colour button hover | `#292929` | 6 | "add to bag" hover goes dark |
| Neutral hover (dark theme) | `#53565a` | 5 | `--c-primary-hover` |
| Accent one-offs | `#a9ff01` (lime) ×6, `#01dcc8` (teal) ×4, `#2e81be` (blue) ×6, `#188179` ×3, `#101640` ×5 | low | campaign or sport colours, not system values |

**Dark theme values defined by the site (`[data-theme="dark"]`)**

| Token | Value |
|---|---|
| bg | `#121212` |
| bg alt | `#1d1d1f` |
| control bg | `#26272b` |
| control hover | `#2b2b2e` |
| control active | `#333741` |
| text | `#f5f5f6` |
| text secondary | `#94969c` |
| border | `#333741` |
| brand text | `#ed5109` |
| add-to-bag | `#d5400a` |
| fg secondary | `#cecfd2` / `#ececed` |

The dark theme also switches product names, prices, footer and breadcrumbs to `interstate-condensed`.

**Overlays and shadow colours:** `rgba(0,0,0,.2)` ×26 (the secondary glass button bg on imagery), Untitled shadow bases `rgba(16,24,40,.05/.06/.1/.08/.03/.18)`, and `rgba(0,0,0,.5/.7)` for modals.

## 4. Spacing and layout

- **Padding scale** (frequency): 1rem ×97, .75rem ×81, .5rem ×60, 1.5rem ×55, 1.25rem ×46, **5rem ×36**, 2.5rem ×29, 2rem ×28, 3rem ×23, .625rem ×22, 4rem ×18, .25rem ×16, 64px ×13, 80px ×7, 6rem ×7. The base is a 4px grid, and 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96 are the real steps.
- **Gap scale**: .75rem ×41, .5rem ×33, 8px ×23, 1rem ×22, 1.25rem ×20, .25rem ×17, .375rem ×7, .625rem ×6, 1.5rem ×6, 2.5rem, 2rem, 64px.
- **Margins**: 1rem, .5rem, .25rem, .75rem, 2rem, 1.5rem, 2.5rem, 3rem.
- **Containers**:
  - Global max width is `1920px` (header, PDP root).
  - `max-width: 120rem` (=1920px) appears ×29 and `1600px` ×6.
  - PDP root padding is `0 80px`, the left gallery column is max `684px`, and toasts are max `1280px`.
- **Gallery side padding**: `calc(50vw - min(1920px, calc(100vw - 40px)) / 2)`, with 32px and 16px variants at smaller breakpoints. That means **page gutters of 20 / 16 / 8px (inferred from the 40/32/16 totals)**.
- **Header**: horizontal padding 32px.
- **Product grid (PLP)**:
  - 4 columns at a 1226px viewport, each 281.5px.
  - `gap: 64px 20px` (64px rows, 20px columns).
  - Container padding `0 20px 64px`.
  - `--gallery-column-gap` is `var(--gapDesktop, 20px)` on desktop and `var(--gapMobile, 12px)` on mobile.
- A 12-column grid exists (`max-width: calc(8.33% - 1.67px)` … one per column).
- Section titles use `padding: 0 48px`.
- **Breakpoints** (max-width is `x.98px`, mobile-first mixed):

  | Breakpoint | Uses |
  |---|---|
  | `767.98 / 768` | ×366, the main one |
  | `1023.98 / 1024` | ×99 |
  | `1365.98 / 1366` | ×40 |
  | `640` | ×4 |
  | `1440` | ×3 |
  | `2880` | ×2 |

  `prefers-reduced-motion: reduce` ×4 and `hover: hover` ×8 are also used.

## 5. Shape and elevation

- **Radius**:

  | Value | Uses | Where |
  |---|---|---|
  | `4px` / `.25rem` | ×77 combined | the system value: all buttons, size tiles, inputs, nav items, mega-menu thumbnails |
  | `0` | ×27 | product card, product images, hero, sections, and product imagery generally |
  | `50%` | ×22 | round carousel arrows 36×36, swatches, dots |
  | `.75rem` (12px) | ×14 | larger panels or modals **(inferred)** |
  | `.5rem` / `8px` | ×8 | icon-only buttons (`button-size-md` icon: 8px) |
  | `6px`, `10px` (`--radius-lg`), `1rem`, `12px 12px 0 0` | rare | drawers or sheets (inferred) |

- **Borders**:
  - `1px solid #e5e5e5` is the standard.
  - `1px solid #121212` is the strong / selected-dark border.
  - `1px solid #d0d5dd` is used for inputs and the secondary button.
  - `2px solid #e5e5e5` is used for popup buttons and the disabled secondary colour button.
  - The **selected state is `1.5px solid #d5400a`** (size and colour tiles).
- **Shadows** (Untitled UI):

  | Level | Value |
  |---|---|
  | xs | `0 1px 2px 0 rgba(16,24,40,.05)` (2xl buttons) |
  | md | `0 4px 8px -2px rgba(16,24,40,.1), 0 2px 4px -2px rgba(16,24,40,.06)` (lg/md/sm buttons) |
  | lg | `0 12px 16px -4px rgba(16,24,40,.08), 0 4px 6px -2px rgba(16,24,40,.03)` |
  | xl | `0 20px 24px -4px rgba(16,24,40,.08), 0 8px 8px -4px rgba(16,24,40,.03)` (dropdowns and modals, inferred) |
  | skeuomorphic | `inset 0 0 0 1px rgba(16,24,40,.18), inset 0 -2px 0 rgba(16,24,40,.05)` plus xs |
  | focus ring | `0 0 0 2px #fdf9f8, 0 0 0 4px #fc6c13` (×14 + 3) |

  Product cards have **no shadow**.

## 6. Components

**Buttons** (`.button-root`)
- `display: inline-flex`, `min-height: 2.5rem` (40px), Inter Bold 700, `:active` transition 128ms, no text-transform.
- Sizes:

  | Size | Padding | Font | Gap | Measured height |
  |---|---|---|---|---|
  | sm | 12px | 14/17 | 4px | n/a |
  | md | 12px 14px | 14/17 | 4px | n/a |
  | lg | 12px 16px | 16/20 | 6px | 45px |
  | xl | 12px 18px | 16/20 | 6px | n/a |
  | 2xl | 16px 22px | 18/21 | 10px | 54px |

- Variants (radius 4px throughout except where noted):

  | Variant | Default | Hover | Other states |
  |---|---|---|---|
  | **primary** | bg `#fff`, 1px `#e5e5e5` border, text `#1a1a1a` (a white button, not black) | bg `#e5e5e5` | focus: orange ring; disabled: bg `#f2f4f7`, text `#98a2b3` |
  | **primary-dark** (brand CTA) | bg and border `#d5400a`, text `#fff` | stays `#d5400a` | n/a |
  | **secondary-gray** (on imagery) | bg `rgba(0,0,0,.2)`, `backdrop-filter: blur(20px)`, 1px `#d0d5dd` border, white text | bg `#e5e5e5`, text `#182230` | n/a |
  | **secondary-color** (add to bag) | bg and 2px border `var(--color-add-to-bag)` = `#1a1a1a` light / `#d5400a` dark | bg `#292929` | n/a |
  | **tertiary-gray** (nav, icon) | transparent, text `#475467` (nav shows `#1a1a1a`) | text `#344054` | icon buttons use radius 8px |
  | **tertiary-color** | text `#d5400a`, radius 10px | text `#9c2f10` | n/a |
  | **destructive** | `#d92d20` | `#f04438` | n/a |

- Home hero pairs "Comprar/Shop" (primary white) with "Explorar/Explore" (glass secondary).

**Product card (PLP)**
- 282×490 at 4 columns. No background, border, radius or shadow; the card is transparent on `#fdf9f8`.
- Image is **3:4** (282×375, sources 683×911 webp), radius 0. The light studio background is baked into the photo. I could not sample its pixel because the canvas was CORS-tainted.
- Above the title: badge line in Inter Medium 12/15, colour `#d5400a`, plain text with no pill (`badges-root` gap 8px).
- Title: Inter Bold 16/20, -0.084px, `#1a1a1a`, 2 lines.
- Price: Inter Medium 16/24 `#1a1a1a`.

**PDP**
- Gallery slides are 548×736 (3:4) with no radius and round white 36px arrows.
- H1 is Inter Bold 24/29. Price is Bold 18/21.
- Option titles are Bold 16/20.
- Size tiles: white bg, 1px `#e5e5e5` border, radius 4px, padding 12px, height 43px, 14/17 weight 700. Selected tiles get a 1.5px `#d5400a` border.
- Info card titles are Bold 16.

**Header / nav**
- `header` is 64px tall inside an 84px container (≈20px announcement/offset, inferred). Background is transparent over `#fdf9f8`, with padding 0 32px and max-width 1920px.
- The logo is at the left in `header-logoContainer` (16px tall SVG).
- Mega-menu triggers (Shop / Sports / Apparel / Community) are tertiary buttons: Inter SemiBold 16/20, -0.176px, `#1a1a1a`, padding 10px 16px, radius 4px, 42px tall, sentence case.
- Search is a button with text. Icon buttons are 42×42 with radius 8px.
- Mega-menu category links are Inter Bold 20/24 `#737373`.

**Inputs**
- Search: bg `#f2f4f7`, no border, Inter Regular 16 (weight 600), placeholder `#737373`.
- Modal input: 36px tall, padding 0 12px, 1px `#d0d5dd` border, radius 4px. Focus changes the border to `#1a1a1a` with no outline.
- Numeric input: 40px tall, white, radius 4px, padding 12px.
- Select (country): 40px, white.

**Badges / tags:** plain orange text (`#d5400a`, Inter Medium 12). No pill background was observed on the PLP.

**Section headers:** SemiBold 40/44, -0.792px, `#1a1a1a`, sentence case, horizontal padding 48px. Hero titles are white over imagery.

**Footer:** bg `#fdf9f8`, bottom padding 48px. Headings are SemiBold 24; sub-heads are SemiBold 14 `#1a1a1a`; links are SemiBold 16 `#737373`.

## 7. Motion

| Where | Value |
|---|---|
| Buttons | `all .1s ease-out` (×4); `:active` 128ms |
| Standard easing | `cubic-bezier(.4,0,.2,1)`: swiper wrapper, visibility/opacity/transform .15s, USP ticker (`--usp-motion-duration: 400ms`) |
| Common | `transform .3s ease-in-out, opacity .3s ease-in-out` (×3), `opacity .3s, visibility .3s`, `.2s`, `.5s` |
| Slow | `transform 1s cubic-bezier(.39,.575,.565,1)` (ease-out-sine, reveal), `transform 3s ease-in-out` (Ken-Burns style hero, inferred) |
| Reduced motion | `prefers-reduced-motion: reduce` is handled (4 blocks) |

## 8. Overall character

- **Light, warm, quiet retail.** Warm off-white page (`#fdf9f8`), near-black ink (`#1a1a1a` / `#121212`), white controls. It is not a high-contrast black/white sports site.
- **One hot accent.** HEAD orange `#d5400a` (focus-ring orange `#fc6c13`) is used sparingly: badges, selected states, brand CTA, wishlist-on. Everything else is neutral.
- **Inter throughout, sentence case, tight negative tracking** (-1% body, -2% display). Headings are SemiBold 600, CTAs Bold 700, body Light/Regular. Uppercase is rare.
- **Small, consistent radius**: 4px on every control; imagery and cards square (0); circles for arrows and swatches.
- **Flat product presentation**: 3:4 studio photos on the page background, no card chrome, generous 64px row gaps.
- **Soft Untitled-UI elevation** on buttons only (xs/md shadows), with a double-ring orange focus state offset by the page colour.
- **Photography carries the drama**: full-bleed heroes with white text and glass (`rgba(0,0,0,.2)` + 20px blur) secondary buttons.
- **The built-in dark theme** (`#121212` / `#1d1d1f` / `#26272b`, text `#f5f5f6`, orange `#ed5109`) switches to a condensed face (Interstate). It is a ready model for a darker "pro" mode.

## 9. Draft token proposal

| Token | Light (as on site) | Dark (suggested, based on the site's dark theme) |
|---|---|---|
| `font-family-sans` | `'Inter', Roboto, Arial, sans-serif` | same |
| `font-family-condensed` | `'Barlow Condensed', 'Roboto Condensed', sans-serif` (free stand-in for Interstate Condensed) | same, used for product names and prices in dark mode like the site does |
| `font-weight-light/regular/medium/semibold/bold` | 300 / 400 / 500 / 600 / 700 | same |
| `type-display-xl` | 52/57 · 600 · -0.022em | same |
| `type-display-lg` | 40/44 · 600 · -0.02em | same |
| `type-display-md` | 36/44 · 600 · -0.02em | same |
| `type-display-sm` | 28/34 · 500 · -0.021em | same |
| `type-heading` | 24/29 · 600 (700 for product titles) · -0.019em | same |
| `type-title` | 20/24 · 500 | same |
| `type-body-lg` | 18/21 · 700 (price, 2xl button) | same |
| `type-body` | 16/24 · 400 (site uses 300) | same |
| `type-ui` | 16/20 · 600 · -0.011em (nav, buttons lg) | same |
| `type-ui-sm` | 14/17 · 600 · -0.006em | same |
| `type-caption` | 12/15 · 500 | same |
| `color-bg` | `#fdf9f8` | `#121212` |
| `color-bg-alt` / surface | `#ffffff` | `#1d1d1f` |
| `color-control` | `#ffffff` | `#26272b` |
| `color-control-hover` | `#e5e5e5` | `#2b2b2e` |
| `color-control-active` | `#e5e5e5` | `#333741` |
| `color-bg-subtle` | `#f2f4f7` | `#161b26` |
| `color-text` | `#1a1a1a` | `#f5f5f6` |
| `color-text-strong` | `#121212` | `#ffffff` |
| `color-text-secondary` | `#737373` | `#94969c` |
| `color-text-disabled` | `#98a2b3` | `#667085` (inferred) |
| `color-border` | `#e5e5e5` | `#333741` |
| `color-border-strong` | `#949494` / `#121212` | `#949494` |
| `color-border-input` | `#d0d5dd` | `#333741` |
| `color-accent` | `#d5400a` | `#ed5109` |
| `color-accent-hover` | `#9c2f10` | `#fc6c13` (inferred) |
| `color-accent-contrast` | `#ffffff` | `#ffffff` |
| `color-focus-ring` | `#fc6c13` | `#fc6c13` |
| `color-danger` / hover | `#d92d20` / `#f04438` | `#f04438` / `#f97066` (inferred) |
| `color-overlay-glass` | `rgba(0,0,0,.2)` + `blur(20px)` | `rgba(255,255,255,.2)` (site's `alpha-black-20` dark value) |
| `color-scrim` | `rgba(0,0,0,.5)` | `rgba(0,0,0,.7)` |
| `space-0.5 … 24` | 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 px | same |
| `layout-max-width` | 1920px (content 1600px) | same |
| `layout-gutter` | 20px desktop / 16px tablet / 8px mobile (inferred) | same |
| `grid-gap` | 20px column / 64px row (mobile 12px) | same |
| `breakpoint-sm/md/lg/xl` | 640 / 768 / 1024 / 1366 (plus 1440) | same |
| `radius-none` | 0 (cards, imagery) | same |
| `radius-sm` | 4px (all controls) | same |
| `radius-md` | 8px (icon buttons) | same |
| `radius-lg` | 12px (panels/modals) | same |
| `radius-full` | 50% / 9999px | same |
| `border-width` | 1px; `border-width-selected` 1.5px; `border-width-strong` 2px | same |
| `shadow-xs` | `0 1px 2px rgba(16,24,40,.05)` | `0 1px 2px rgba(0,0,0,.4)` (inferred) |
| `shadow-md` | `0 4px 8px -2px rgba(16,24,40,.1), 0 2px 4px -2px rgba(16,24,40,.06)` | alpha ×3 (inferred) |
| `shadow-lg` | `0 12px 16px -4px rgba(16,24,40,.08), 0 4px 6px -2px rgba(16,24,40,.03)` | alpha ×3 (inferred) |
| `shadow-xl` | `0 20px 24px -4px rgba(16,24,40,.08), 0 8px 8px -4px rgba(16,24,40,.03)` | alpha ×3 (inferred) |
| `focus-ring` | `0 0 0 2px var(color-bg), 0 0 0 4px #fc6c13` | same formula |
| `control-height-sm/md/lg/xl` | 36 / 40 (min) / 44–45 / 54 px | same |
| `control-padding-x` | sm 12, md 14, lg 16, xl 18, 2xl 22 px | same |
| `duration-instant` | 100ms (`ease-out`) / 128ms press | same |
| `duration-fast` | 150ms | same |
| `duration-base` | 300ms | same |
| `duration-slow` | 400–500ms | same |
| `duration-reveal` | 1000ms | same |
| `easing-standard` | `cubic-bezier(.4,0,.2,1)` | same |
| `easing-in-out` | `ease-in-out` | same |
| `easing-reveal` | `cubic-bezier(.39,.575,.565,1)` | same |

## Not verified

- Raw CSS could not be saved to disk: curl is bot-blocked, and the analysis ran in the browser. Values were read from live CSS, not from memory.
- The product photo background colour (the CORS-tainted canvas blocked sampling).
- Which elements use `uppercase`.
- The source of `interstate-condensed` (it never loaded).
- The exact announcement bar height.
- Mobile computed values: only a 1226px-wide desktop viewport was measured.
- Every dark-mode value marked "inferred" is my extrapolation, not the site's.
