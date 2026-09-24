# MintFrame

MintFrame is a free, browser-based launch studio for Pump.fun creators. It helps a creator prepare the visual assets and copy for a launch, review details before publishing, and share the full token address afterward.

## What it does

- Live previews and PNG exports for a 1200 × 1200 coin image, 1500 × 500 Pump banner, 1200 × 675 X card, and 1080 × 1920 story.
- Optional local artwork upload, three color themes, and a single ZIP containing every image plus launch copy and a checklist.
- Checks for project details, optional link syntax, and custom artwork dimensions against [Pump's creation guidance](https://intercom.help/pumpfun-web/en/articles/11002205-create-a-coin-on-pump-fun).
- A full-address share card after a Solana mint is created. Address format is checked locally; this does **not** verify ownership or prove a token is safe.
- Optional same-name search through [DEX Screener's public search API](https://docs.dexscreener.com/api/reference). Results are limited to indexed pairs and can lag a new launch.

No account, wallet, backend, or build step is required. Draft text is stored in this browser's local storage. Uploaded artwork stays in the browser and is not saved across reloads. The optional same-name search sends the entered project name or ticker to DEX Screener.

## Run locally

```sh
python3 -m http.server 4188
```

Open <http://localhost:4188>. This is a static site and can be hosted from the repository root on GitHub Pages.

## Scope

MintFrame is an independent tool and is not affiliated with Pump.fun. Its checks cannot predict market performance. Review every field on Pump's current create form before committing immutable metadata. The matching-token search is not exhaustive and must not be treated as a verification system.
