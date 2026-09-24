# MintFrame — project handoff and enhancement review

**Live site:** https://mintframe.fun/  
**Repository:** https://github.com/MTG9T4/mintframe  
**Status:** Working static site hosted with GitHub Pages and a Cloudflare-managed domain. The product is live; a MintFrame token is a separate launch decision. No official token mint address is recorded in this repo.

## What we are building

MintFrame is a free, browser-based launch studio for people creating coins on Pump.fun. It helps a creator prepare images and copy, catch setup mistakes before submitting Pump's create form, and share the exact mint address afterward. The intended user is usually on a phone and may have little patience for a complicated editor. The experience should feel polished, fast, and useful without a login or wallet connection.

The broader ambition is to build a product people actually use and share, then consider a MintFrame coin (`$MFRAME`). There is no promised market-cap outcome or token-gated feature. Product utility and trust matter more than speculative claims.

## What exists today

- A responsive studio with coin name, ticker, one-line idea, description, optional links, live previews, and a sticky edit/preview arrangement on small screens. A temporary sample demonstrates the kit and restores the previous draft when cleared.
- Exports for a 1200 × 1200 PNG coin image, 1500 × 500 JPEG Pump banner, 1200 × 675 PNG X card, 1080 × 1920 PNG story, and a ZIP launch kit with copy and checklist.
- Local PNG/JPG/WebP artwork upload, drop, and paste; independent crop, zoom, and image adjustments; a clean coin-image option; a two-color Bold letter generator; and a 72 px avatar check. The editor warns that uploaded art disappears on reload and that long ideas are shortened in some exports.
- A Higgsfield affiliate link and a copyable image prompt. Generating there is a separate visit; the creator downloads the result and imports it into MintFrame. There is no Higgsfield API or account integration.
- A preflight checklist and optional same-name search before launch, plus a mobile Pump handoff that copies fields and shares or downloads images. Pump's form is **not** filled automatically: the creator selects the files and pastes fields in Pump.
- After launch, a creator can enter a full Solana mint or Pump coin URL, copy the exact address, make an address card and shareable link, and optionally load indexed token labels. Indexed search and labels do not establish ownership, name availability, or safety.
- A generated MintFrame project coin image at [`assets/mintframe-coin.png`](assets/mintframe-coin.png). The website's social preview is [`og.png`](og.png); they serve different purposes.

## Codebase guide

Read the code before proposing changes. Start with [`README.md`](README.md), [`LAUNCH_PLAN.md`](LAUNCH_PLAN.md), and [`RESEARCH.md`](RESEARCH.md) for product context. Then inspect [`index.html`](index.html) for the UI, [`styles.css`](styles.css) for responsive layout and motion, and [`app.js`](app.js) for state, canvas rendering, exports, validation, and integrations. `CNAME` configures the custom domain.

In `app.js`, follow the path from `form()` and `state` through `drawAsset()`/`renderPreview()` to `assetBlob()` and `downloadKit()`. For the Pump handoff, inspect `pumpFields()`, `pumpSummary()`, and the `prepare-pump` handler. For post-launch sharing, inspect `mintFromInput()`, `shareUrl()`, `importToken()`, and `scanNames()`. Check the mobile preview behavior and breakpoints in `styles.css`, not just a desktop screenshot.

There is no build framework, backend, account system, or test suite. Run locally with `python3 -m http.server 4188` from the repo root, then open `http://localhost:4188`. Text drafts use browser local storage; uploaded images remain in browser memory and disappear on reload. Optional DEX Screener lookups send the entered name or mint to its public API.

## What we want from your review

Inspect the **actual codebase and live mobile experience** before giving ideas. Identify improvements that make MintFrame more useful, easier to understand, more visually compelling, and more likely to be shared by real Pump creators. Include both small fixes and one or two distinctive product ideas. Prioritize mobile usability, the first minute of use, image quality, the Pump handoff, and the after-launch exact-address flow.

Please return:

1. A brief assessment of what works and the strongest friction points, with references to specific code or UI behavior.
2. Five to eight enhancement ideas ranked by user value and implementation effort. For each, explain the user problem, the proposed interaction, and what would need to change in this repo.
3. Your top two recommendations as implementation-ready mini specs with acceptance checks, including phone-sized screens and export behavior.
4. Any claims or integrations that need current Pump, Higgsfield, or DEX Screener documentation checked before implementation. Distinguish verified facts from assumptions.

Favor features that can work with the current static hosting. If an idea needs a backend, wallet, paid API, or external credentials, state the added cost and trust implications. Keep creators in control of the final Pump submission, label indexed data honestly, and do not infer token ownership or investment safety from a pasted address. If you cannot inspect the repo or site, say what you could access and limit your conclusions accordingly.
