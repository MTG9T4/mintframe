# MintFrame

MintFrame is a free, browser-based launch studio for Pump.fun creators. It helps a creator prepare the visual assets and copy for a launch, review details before publishing, and share the full token address afterward.

## What it does

- Live previews and exports for a 1200 × 1200 PNG coin image, 1500 × 500 JPEG Pump banner, 1200 × 675 PNG X card, and 1080 × 1920 PNG story. Banner output is checked against Pump's 5 MB limit.
- A temporary sample project demonstrates the full kit in one tap, then restores the creator's prior draft. Warnings identify when a one-line idea will be cut in banner, X card, or story exports.
- A Bold letter coin-image style makes a clean, flat-color lettermark from the coin name or up to two custom letters. Background and letter colors are editable; the 72px avatar preview and all coin-image exports show the same result. With no uploaded artwork, the lettermark also appears on the banner, X card, and story. MintFrame's generated project coin image is at [assets/mintframe-coin.png](assets/mintframe-coin.png).
- Optional local artwork upload with independent drag, keyboard, and zoom framing for each export; image look presets, brightness/contrast/color controls, and horizontal flip. The coin image is clean by default, with an optional coin-name overlay. A 72px avatar preview shows how it reads at small size. The upload area warns that artwork disappears on reload. The single ZIP contains every image plus launch copy and a checklist.
- A mobile-friendly Pump handoff copies a complete launch note, prepares the coin image and banner for native file sharing where supported, falls back to downloads, offers one-tap copying for each launch field, and links to Pump's official create route. A return button takes the creator to the mint-address card after launch. On supported phones the Pump link may open the installed app; other browsers open the website. No cross-site prefill flow is documented in Pump's public creation guide, so the creator selects files and enters the fields there.
- Optional Higgsfield affiliate link and project-aware image prompt. Creators generate there, then upload, drop, or paste the downloaded image into MintFrame; there is no Higgsfield account or API integration. Affiliate commissions depend on qualifying purchases, not button clicks.
- Checks for project details, optional website/X/Telegram link syntax, and custom artwork dimensions against [Pump's creation guidance](https://intercom.help/pumpfun-web/en/articles/11002205-create-a-coin-on-pump-fun). A live counter flags combined launch copy above MintFrame's suggested 500-character budget. These checks are guidance, not Pump approval.
- Accept a Solana mint or a Pump coin URL; copy the full mint, download an address card, or make a shareable `?mint=` link. The link shows a user-supplied address and does **not** verify ownership or prove a token is safe.
- Optional import of an indexed name and ticker from [DEX Screener's token-pairs API](https://docs.dexscreener.com/api/reference). The import is a label from an index, not proof of ownership.
- A one-click X post draft that includes the full mint when available.
- Optional pre-launch same-name search through [DEX Screener's public search API](https://docs.dexscreener.com/api/reference). Results are limited to indexed pairs and can lag a new launch; no results is not proof a name is available.

No account, wallet, backend, or build step is required. Draft text is stored in this browser's local storage. Uploaded artwork stays in the browser and is not saved across reloads. The optional name search sends the entered project name or ticker to DEX Screener. The optional token import sends the entered mint address there.

## Run locally

```sh
python3 -m http.server 4188
```

Open <http://localhost:4188>. This is a static site and can be hosted from the repository root on GitHub Pages.

## Scope

MintFrame is an independent tool and is not affiliated with Pump.fun. Its checks cannot predict market performance. Review every field on Pump's current create form before committing immutable metadata. The matching-token search is not exhaustive and must not be treated as a verification system.
