# MintFrame

MintFrame is a free, browser-based launch studio for Pump.fun creators. It helps a creator prepare the visual assets and copy for a launch, review details before publishing, and share the full token address afterward.

## What it does

- Live previews and exports for a 1200 × 1200 PNG coin image, 1500 × 500 JPEG Pump banner, 1200 × 675 PNG X card, and 1080 × 1920 PNG story. Banner output is checked against Pump's 5 MB limit.
- Optional local artwork upload with independent drag, keyboard, and zoom framing for each export; image look presets, brightness/contrast/color controls, horizontal flip, and a clean artwork-only PFP mode. A 72px avatar preview shows how the coin image reads at small size. The single ZIP contains every image plus launch copy and a checklist.
- Optional Higgsfield affiliate link and project-aware image prompt. Creators generate there, then upload, drop, or paste the downloaded image into MintFrame; there is no Higgsfield account or API integration. Affiliate commissions depend on qualifying purchases, not button clicks.
- Checks for project details, optional website/X/Telegram link syntax, and custom artwork dimensions against [Pump's creation guidance](https://intercom.help/pumpfun-web/en/articles/11002205-create-a-coin-on-pump-fun). These checks are guidance, not Pump approval.
- Accept a Solana mint or a Pump coin URL; copy the full mint, download an address card, or make a shareable `?mint=` link. The link shows a user-supplied address and does **not** verify ownership or prove a token is safe.
- Optional import of an indexed name and ticker from [DEX Screener's token-pairs API](https://docs.dexscreener.com/api/reference). The import is a label from an index, not proof of ownership.
- A one-click X post draft that includes the full mint when available.
- Optional same-name search through [DEX Screener's public search API](https://docs.dexscreener.com/api/reference). Results are limited to indexed pairs and can lag a new launch.

No account, wallet, backend, or build step is required. Draft text is stored in this browser's local storage. Uploaded artwork stays in the browser and is not saved across reloads. The optional name search sends the entered project name or ticker to DEX Screener. The optional token import sends the entered mint address there.

## Run locally

```sh
python3 -m http.server 4188
```

Open <http://localhost:4188>. This is a static site and can be hosted from the repository root on GitHub Pages.

## Scope

MintFrame is an independent tool and is not affiliated with Pump.fun. Its checks cannot predict market performance. Review every field on Pump's current create form before committing immutable metadata. The matching-token search is not exhaustive and must not be treated as a verification system.
