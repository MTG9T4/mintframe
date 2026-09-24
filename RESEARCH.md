# Pump.fun community service research

Reviewed September 24, 2026. These are observations from first-party product pages and documentation, not claims about what will make a token appreciate.

## What the platforms already do

- [Pump's creation form](https://pump.fun/create) supports a name, ticker, description, social links, image/video, banner, and a SOL or USDC pair. It warns that coin details and social/banner data cannot be edited after creation. It offers a preview; a new service should add checks and shareable workflows rather than duplicate that preview.
- [Pump Explore](https://pump.fun/explore) already has movers, new, live, market cap, agents, and other discovery categories. [Coin pages](https://pump.fun/coin/ATBR4i19gcQ31Rfr7ymA2XvkCQEAkNFGBtVKTmdqpump) show an audit tab, bubble map, holders, callouts, trades, creator fee destination, and similar coins. Another stats dashboard has little clear advantage.
- [Pump GO](https://pump.fun/go) already supports bounties and submissions, including promotional and creative tasks. A simple bounty or “raid” board would duplicate a native feature.
- [Pump's public protocol docs](https://github.com/pump-fun/pump-public-docs) show active changes: USDC quote support, updated trade instructions, and [holder rewards coins](https://github.com/pump-fun/pump-public-docs/blob/main/docs/HOLDER_REWARDS_README.md). Older cashback launch mode is deprecated. [Pump's fee page](https://pump.fun/docs/fees) says creation is free and describes creator fees. A build should avoid hardcoding fee or launch-mode assumptions.
- [Bags](https://support.bags.fm/en/articles/13434866-change-royalty-recipient) emphasizes immutable fee recipient settings as a trust measure. Its [royalty documentation](https://support.bags.fm/en/articles/13434876-royalty-earned) explains fee sharing at launch. [BONKfun](https://rewards.bonk.fun/) has a daily reward pool for bonded-token deployers. Competing on fee mechanics would require a real launchpad and much more infrastructure.

## Concrete opening: a launch identity and preflight studio

**Working concept: Mintproof.** A creator drafts a coin before touching Pump's irreversible create action. The studio checks the exact media sizes, links, description length, and likely name/ticker collisions; previews a Pump-sized tile and X share card; then produces a clean launch checklist and media kit. Once the mint exists, it turns into a public **canonical mint page**: full address, Pump link, project links, creator-authored updates, and a visual comparison of similarly named tokens. A visitor can copy the full address or download a share card rather than rely on a cropped ticker or screenshot.

Why this is a plausible gap: Pump's form explicitly warns of irreversible metadata, yet does not show a full prelaunch review workflow in the inspected form. Pump coin pages expose similar coins, but the official address is still easy to lose when a project is shared outside Pump. Its native audit and stats answer trading questions; they do not organize a creator's launch assets and canonical links. These are **inferences from inspected interfaces**, not proof that no competing tool exists.

The user's prior [Mint Faceoff coin](https://pump.fun/coin/CixxxgHdkpPSSKbVdCyj1NsQcL6shj8z93fZvPhipump) and [same-name coin](https://pump.fun/coin/D8wKEfNnP5MYbo3T2jYVXhBXuPvWu9FBBkLPPi95pump) illustrate the identity problem. Those pages were inspected in the prior session; the web crawler could not reload them for this review, so treat that example as contextual rather than fresh market evidence.

## Buildable MVP and limits

1. **Before launch:** media dimensions/type checker, URL validation, editable preview, downloadable launch card, and copyable X/Telegram copy. No account or wallet needed.
2. **After launch:** paste a mint; fetch token image/name/links and same-name candidates via [DEX Screener's documented search and token endpoints](https://docs.dexscreener.com/api/reference); show exact-address comparison and direct links to Pump. Add timestamp and data source to any market facts.
3. **Trust rule:** never call a mint “verified” solely because a user entered it. Wallet-signature ownership proof would be a later feature. Search results are incomplete and indexer data can lag a new launch; label candidates as *possible matches*, not exhaustive copies.
4. **Share loop:** export attractive square and vertical cards carrying the full mint address and source link. Measure card downloads, copied addresses, and repeat use before deciding whether a coin is warranted.

The product can help creators avoid costly setup errors and help communities share the correct address. It cannot manufacture an audience or make a credible $1M market-cap prediction. A coin needs a distinct, defensible role after people use the service; adding one at launch would repeat the previous product/token mismatch.
