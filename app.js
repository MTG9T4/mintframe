const $ = (id) => document.getElementById(id);
const fields = ['coin-name', 'ticker', 'tagline', 'description', 'website', 'social', 'mint-address'];
const sizes = { icon: [1200, 1200], banner: [1500, 500], social: [1200, 675], story: [1080, 1920] };
const palettes = {
  electric: { base: '#0b191c', mid: '#25473a', glow: '#92b83f', accent: '#c8ff3d', pale: '#f1ffe0', dim: '#8aa998' },
  ember: { base: '#21141b', mid: '#613027', glow: '#b45535', accent: '#ff8559', pale: '#fff0e3', dim: '#d1a190' },
  chrome: { base: '#101921', mid: '#315066', glow: '#678da8', accent: '#b8deef', pale: '#eefaff', dim: '#a0baca' }
};
const state = { output: 'icon', theme: 'electric', art: null, artInfo: null, toastTimer: null };

function form() {
  return {
    name: $('coin-name').value.trim(), ticker: $('ticker').value.trim().replace(/^\$/, '').toUpperCase(),
    tagline: $('tagline').value.trim(), description: $('description').value.trim(),
    website: $('website').value.trim(), social: $('social').value.trim(), mint: $('mint-address').value.trim()
  };
}
function save() {
  const { mint, ...draft } = form();
  localStorage.setItem('mintframe-draft-v1', JSON.stringify({ ...draft, mint, theme: state.theme }));
}
function restore() {
  try {
    const draft = JSON.parse(localStorage.getItem('mintframe-draft-v1') || '{}');
    const mapping = { name: 'coin-name', ticker: 'ticker', tagline: 'tagline', description: 'description', website: 'website', social: 'social', mint: 'mint-address' };
    Object.entries(mapping).forEach(([key, id]) => { if (typeof draft[key] === 'string') $(id).value = draft[key]; });
    if (palettes[draft.theme]) setTheme(draft.theme, false);
  } catch { /* A corrupted local draft should not prevent the studio from opening. */ }
}
function setTheme(theme, shouldSave = true) {
  state.theme = theme;
  document.querySelectorAll('.theme').forEach((button) => {
    const active = button.dataset.theme === theme;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  if (shouldSave) save();
  render();
}
function toast(message) {
  const el = $('toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}
function validUrl(raw, host) {
  if (!raw) return false;
  try { const url = new URL(raw); return ['http:', 'https:'].includes(url.protocol) && (!host || ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'].includes(url.hostname)); }
  catch { return false; }
}
function validMint(address) {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return false;
  let number = 0n;
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  for (const char of address) number = number * 58n + BigInt(alphabet.indexOf(char));
  let count = 0;
  while (number > 0n) { number >>= 8n; count++; }
  for (const char of address) { if (char === '1') count++; else break; }
  return count === 32;
}
function updateChecks() {
  const d = form();
  const checks = [
    ['Name and ticker', !!d.name && !!d.ticker, 'A name and short, recognizable symbol are ready.'],
    ['Clear description', d.description.length >= 25, 'Explain the idea in at least one complete sentence.'],
    ['Coin image', !state.artInfo || state.artInfo.width >= 1000 && state.artInfo.height >= 1000 && state.artInfo.width === state.artInfo.height && state.artInfo.size <= 15e6, 'Export is 1200 × 1200. Custom art should be square and at least 1000 × 1000.'],
    ['Website link', !d.website || validUrl(d.website), 'Optional. If added, use a complete http:// or https:// link.'],
    ['X profile', !d.social || validUrl(d.social, true), 'Optional. If added, use a complete x.com profile link.'],
    ['Launch assets', !!d.name && !!d.ticker && !!d.tagline, 'Your name, ticker and one-line idea populate every export.']
  ];
  const score = checks.filter((check) => check[1]).length;
  $('readiness-score').textContent = `${score}/6`;
  $('score-fill').style.width = `${100 * score / checks.length}%`;
  $('readiness-summary').textContent = score === 6 ? 'Ready for a careful final review on Pump.' : `${checks.length - score} item${checks.length - score === 1 ? '' : 's'} to review before opening Pump.`;
  $('check-list').replaceChildren(...checks.map(([title, good, detail]) => {
    const item = document.createElement('div'); item.className = `check-item ${good ? 'good' : ''}`;
    const icon = document.createElement('span'); icon.className = 'check-icon'; icon.textContent = good ? '✓' : '·';
    const content = document.createElement('div'); const heading = document.createElement('strong'); heading.textContent = title;
    const p = document.createElement('p'); p.textContent = detail; content.append(heading, p); item.append(icon, content); return item;
  }));
  const mintOk = validMint(d.mint);
  const msg = $('mint-message'); msg.className = `mint-message ${d.mint ? mintOk ? 'success' : 'error' : ''}`;
  msg.textContent = !d.mint ? 'The address is shown exactly as entered. Always confirm it on Pump before sharing.' : mintOk ? 'Valid Solana address format. Confirm this exact address on the official Pump coin page.' : 'This is not a complete Solana mint address. Paste the full address.';
  $('copy-address').disabled = !mintOk; $('download-mint').disabled = !mintOk;
  const link = $('pump-link'); link.hidden = !mintOk;
  if (mintOk) link.href = `https://pump.fun/coin/${d.mint}`;
}

function backdrop(ctx, w, h, p) {
  const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, p.base); g.addColorStop(.63, p.mid); g.addColorStop(1, p.base); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * .78, h * .34, 0, w * .78, h * .34, Math.max(w, h) * .67);
  glow.addColorStop(0, p.glow + 'aa'); glow.addColorStop(.55, p.glow + '26'); glow.addColorStop(1, 'transparent'); ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.globalAlpha = .16; ctx.fillStyle = p.pale;
  const step = Math.max(27, Math.round(w / 31));
  for (let x = step; x < w; x += step) for (let y = step; y < h; y += step) {
    ctx.beginPath(); ctx.arc(x, y, 1.1, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function fitText(ctx, text, maxWidth, initial, weight = 700, min = 25) {
  let size = initial;
  do { ctx.font = `${weight} ${size}px "Space Grotesk", Arial, sans-serif`; if (ctx.measureText(text).width <= maxWidth) break; size -= 2; } while (size > min);
  return size;
}
function wrapText(ctx, text, maxWidth, maxLines = 3) {
  const words = text.split(/\s+/).filter(Boolean), lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; if (lines.length === maxLines - 1) break; }
    else line = test;
  }
  if (line) lines.push(line);
  if (lines.length === maxLines && ctx.measureText(lines.at(-1)).width > maxWidth) {
    while (lines.at(-1).length && ctx.measureText(lines.at(-1) + '…').width > maxWidth) lines[lines.length - 1] = lines.at(-1).slice(0, -1);
    lines[lines.length - 1] += '…';
  }
  return lines;
}
function drawImageCover(ctx, image, x, y, w, h, radius = 0) {
  const ratio = Math.max(w / image.width, h / image.height), iw = image.width * ratio, ih = image.height * ratio;
  ctx.save(); if (radius) { ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.clip(); }
  ctx.drawImage(image, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih); ctx.restore();
}
function star(ctx, x, y, radius, color) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = i % 2 ? radius * .39 : radius; const px = Math.cos(a) * r, py = Math.sin(a) * r; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function frame(ctx, w, h, p, margin) { ctx.strokeStyle = p.accent + 'a6'; ctx.lineWidth = Math.max(2, w / 500); ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2); }
function label(ctx, text, x, y, color, size = 22) { ctx.fillStyle = color; ctx.font = `500 ${size}px "DM Mono", monospace`; ctx.fillText(text, x, y); }
function drawAsset(canvas, output) {
  const [w, h] = sizes[output], d = form(), p = palettes[state.theme]; canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d'); backdrop(ctx, w, h, p);
  const name = (d.name || 'YOUR IDEA').toUpperCase(), ticker = (d.ticker || 'TICKER').toUpperCase(), tagline = (d.tagline || 'MAKE IT LAND.').toUpperCase();
  if (output === 'icon') {
    if (state.art) {
      drawImageCover(ctx, state.art, 0, 0, w, h);
      const shade = ctx.createLinearGradient(0, 300, 0, h); shade.addColorStop(0, '#07100e00'); shade.addColorStop(.62, '#07100e87'); shade.addColorStop(1, '#07100ef5'); ctx.fillStyle = shade; ctx.fillRect(0, 0, w, h);
    } else { ctx.save(); ctx.shadowColor = p.accent; ctx.shadowBlur = 110; star(ctx, 780, 405, 270, p.accent); ctx.restore(); star(ctx, 780, 405, 270, p.accent); }
    frame(ctx, w, h, p, 36); label(ctx, 'MF / LAUNCH STUDIO', 75, 100, p.pale, 23);
    label(ctx, `01 / ${ticker}`, 75, 805, p.accent, 24); fitText(ctx, name, 1060, 140, 700, 44);
    ctx.fillStyle = p.pale; ctx.fillText(name, 70, 945);
    ctx.font = '500 30px "DM Mono", monospace'; ctx.fillStyle = p.pale; ctx.fillText(tagline.slice(0, 48), 75, 1015);
    ctx.fillStyle = p.accent; ctx.fillRect(75, 1062, 1050, 2); label(ctx, 'A NEW SIGNAL STARTS HERE', 75, 1115, p.pale, 20);
  } else if (output === 'banner') {
    if (state.art) { drawImageCover(ctx, state.art, 830, 0, 670, h); ctx.fillStyle = p.base + '44'; ctx.fillRect(830, 0, 670, h); }
    else { star(ctx, 1170, 245, 200, p.accent); }
    frame(ctx, w, h, p, 19); label(ctx, `NEW / ${ticker}`, 56, 70, p.accent, 20);
    fitText(ctx, name, 820, 100, 700, 39); ctx.fillStyle = p.pale; ctx.fillText(name, 52, 280);
    ctx.fillStyle = p.accent; ctx.fillRect(56, 322, 100, 4); label(ctx, tagline.slice(0, 48), 56, 382, p.pale, 21);
    label(ctx, 'MINTFRAME / MADE TO LAUNCH', 56, 452, p.dim, 16);
  } else if (output === 'social') {
    if (state.art) { drawImageCover(ctx, state.art, 720, 0, 480, h); ctx.fillStyle = p.base + '55'; ctx.fillRect(720, 0, 480, h); }
    else star(ctx, 950, 315, 182, p.accent);
    frame(ctx, w, h, p, 28); label(ctx, `INTRODUCING / $${ticker}`, 62, 95, p.accent, 21);
    ctx.font = '700 104px "Space Grotesk", Arial, sans-serif'; const lines = wrapText(ctx, name, 650, 3); fitText(ctx, lines[0] || name, 650, 104, 700, 42);
    ctx.fillStyle = p.pale; lines.forEach((line, i) => ctx.fillText(line, 56, 290 + i * 105));
    ctx.fillStyle = p.accent; ctx.fillRect(61, 510, 72, 4); label(ctx, tagline.slice(0, 40), 61, 570, p.pale, 19);
    label(ctx, 'A NEW IDEA, READY FOR THE WORLD.', 61, 628, p.dim, 16);
  } else {
    if (state.art) { drawImageCover(ctx, state.art, 0, 210, w, 1050); ctx.fillStyle = p.base + '33'; ctx.fillRect(0, 210, w, 1050); }
    else { star(ctx, 540, 760, 355, p.accent); }
    frame(ctx, w, h, p, 38); label(ctx, `THE LAUNCH / $${ticker}`, 85, 132, p.accent, 24);
    ctx.fillStyle = p.base + 'dd'; ctx.fillRect(45, 1280, 990, 460);
    ctx.font = '700 125px "Space Grotesk", Arial, sans-serif'; const lines = wrapText(ctx, name, 870, 3); fitText(ctx, lines[0] || name, 870, 125, 700, 46);
    ctx.fillStyle = p.pale; lines.forEach((line, i) => ctx.fillText(line, 85, 1420 + i * 132));
    label(ctx, tagline.slice(0, 38), 87, 1640, p.accent, 25); label(ctx, 'YOUR IDEA. OUT IN THE OPEN.', 87, 1813, p.dim, 22);
  }
}
function drawMint() {
  const canvas = $('mint-preview'), ctx = canvas.getContext('2d'), d = form(), p = palettes[state.theme], w = canvas.width, h = canvas.height;
  backdrop(ctx, w, h, p); frame(ctx, w, h, p, 24);
  label(ctx, 'THE EXACT MINT / SOLANA', 60, 82, p.accent, 19);
  const name = (d.name || 'YOUR PROJECT').toUpperCase(); fitText(ctx, name, 920, 98, 700, 42);
  ctx.fillStyle = p.pale; ctx.fillText(name, 54, 230); star(ctx, 1050, 175, 88, p.accent);
  ctx.fillStyle = '#07120ddd'; ctx.roundRect(53, 350, 1094, 168, 10); ctx.fill();
  label(ctx, 'CONTRACT ADDRESS / COPY THE FULL STRING', 78, 393, p.dim, 16);
  const address = validMint(d.mint) ? d.mint : 'ADD THE MINT ADDRESS AFTER LAUNCH';
  ctx.fillStyle = p.pale; fitText(ctx, address, 1040, 40, 500, 23); ctx.fillText(address, 77, 457);
  label(ctx, 'CONFIRM ON PUMP.FUN BEFORE SHARING', 60, 598, p.pale, 17);
  label(ctx, 'MINTFRAME / EXACT ADDRESS CARD', 775, 598, p.dim, 13);
}
function render() { drawAsset($('preview'), state.output); drawMint(); updateChecks(); }
function selectOutput(output) {
  state.output = output;
  document.querySelectorAll('.preview-tabs button').forEach((button) => {
    const active = button.dataset.output === output; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active));
  });
  $('preview-size').textContent = `${sizes[output][0]} × ${sizes[output][1]} PX`;
  render();
}
function canvasBlob(canvas) { return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not create image')), 'image/png')); }
function download(blob, name) { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000); }
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 38) || 'my-coin';
function pngName(output) { return `mintframe-${slug(form().name)}-${output}.png`; }
async function downloadCurrent() { try { download(await canvasBlob($('preview')), pngName(state.output)); toast('Asset downloaded'); } catch { toast('Export failed. Please try again.'); } }

// A small ZIP writer uses the uncompressed ZIP format. PNGs are already compressed.
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) { let c = i; for (let n = 0; n < 8; n++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcTable[i] = c >>> 0; }
function crc32(data) { let c = 0xffffffff; for (const byte of data) c = crcTable[(c ^ byte) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function zip(files) {
  const encoder = new TextEncoder(), chunks = [], directory = []; let offset = 0;
  const u16 = (view, at, val) => view.setUint16(at, val, true), u32 = (view, at, val) => view.setUint32(at, val, true);
  for (const { name, data } of files) {
    const filename = encoder.encode(name), checksum = crc32(data), local = new Uint8Array(30 + filename.length), v = new DataView(local.buffer);
    u32(v, 0, 0x04034b50); u16(v, 4, 20); u16(v, 6, 0x0800); u16(v, 8, 0); u32(v, 14, checksum); u32(v, 18, data.length); u32(v, 22, data.length); u16(v, 26, filename.length); local.set(filename, 30);
    chunks.push(local, data);
    const central = new Uint8Array(46 + filename.length), cv = new DataView(central.buffer);
    u32(cv, 0, 0x02014b50); u16(cv, 4, 20); u16(cv, 6, 20); u16(cv, 8, 0x0800); u32(cv, 16, checksum); u32(cv, 20, data.length); u32(cv, 24, data.length); u16(cv, 28, filename.length); u32(cv, 42, offset); central.set(filename, 46); directory.push(central);
    offset += local.length + data.length;
  }
  const dirSize = directory.reduce((sum, chunk) => sum + chunk.length, 0), end = new Uint8Array(22), ev = new DataView(end.buffer);
  u32(ev, 0, 0x06054b50); u16(ev, 8, files.length); u16(ev, 10, files.length); u32(ev, 12, dirSize); u32(ev, 16, offset);
  return new Blob([...chunks, ...directory, end], { type: 'application/zip' });
}
async function downloadKit() {
  const d = form(), button = $('download-kit'); button.disabled = true; button.textContent = 'Building your kit…';
  try {
    const files = [];
    for (const output of Object.keys(sizes)) {
      const canvas = document.createElement('canvas'); drawAsset(canvas, output);
      files.push({ name: pngName(output), data: new Uint8Array(await (await canvasBlob(canvas)).arrayBuffer()) });
    }
    if (validMint(d.mint)) files.push({ name: 'exact-mint-card.png', data: new Uint8Array(await (await canvasBlob($('mint-preview'))).arrayBuffer()) });
    const copy = `PROJECT: ${d.name}\nTICKER: $${d.ticker}\n\nDESCRIPTION\n${d.description}\n\nX ANNOUNCEMENT DRAFT\nIntroducing $${d.ticker}: ${d.tagline}\n\n${d.description}\n${validMint(d.mint) ? `\nExact mint: ${d.mint}\nPump: https://pump.fun/coin/${d.mint}` : '\nAdd the exact mint address after launch and verify it on Pump before posting.'}\n${d.website ? `\nWebsite: ${d.website}` : ''}${d.social ? `\nX: ${d.social}` : ''}\n\nFINAL CHECKLIST\n[ ] Confirm all metadata on Pump's create form\n[ ] Confirm uploaded image and banner crop\n[ ] Confirm website and X links\n[ ] Create token and copy the full mint from Pump\n[ ] Update every public post with the exact mint\n\nImages and text made with MintFrame. No account or wallet required.\n`;
    files.push({ name: 'launch-copy-and-checklist.txt', data: new TextEncoder().encode(copy) });
    download(zip(files), `mintframe-${slug(d.name)}-launch-kit.zip`); toast('Your launch kit is ready');
  } catch (error) { console.error(error); toast('Kit export failed. Please try again.'); }
  finally { button.disabled = false; button.innerHTML = 'Download launch kit <span>↗</span>'; }
}
function loadArt(file) {
  if (!file) return;
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 15e6) { toast('Use PNG, JPG or WebP under 15 MB.'); return; }
  const url = URL.createObjectURL(file), image = new Image();
  image.onload = () => {
    state.art = image; state.artInfo = { width: image.width, height: image.height, size: file.size };
    $('upload-title').textContent = file.name; $('upload-subtitle').textContent = `${image.width} × ${image.height} · ${Math.round(file.size / 1024)} KB`;
    $('remove-art').hidden = false; render(); URL.revokeObjectURL(url);
    if (image.width < 1000 || image.height < 1000 || image.width !== image.height) toast('Art loaded. Pump recommends a square image at least 1000 × 1000.');
    else toast('Artwork loaded');
  };
  image.onerror = () => { URL.revokeObjectURL(url); toast('Could not open that image.'); };
  image.src = url;
}
async function scanNames() {
  const d = form(), query = d.name || d.ticker, button = $('scan-names'), results = $('collision-results');
  if (!query) { toast('Add a project name or ticker first.'); return; }
  button.disabled = true; button.textContent = 'Searching…';
  results.replaceChildren();
  const status = document.createElement('div'); status.className = 'collision-status'; status.textContent = 'Checking indexed Solana pairs…'; results.append(status);
  try {
    const queries = [...new Set([d.name, d.ticker].filter(Boolean))];
    const responses = await Promise.all(queries.map(async (term) => {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(term)}`);
      if (!response.ok) throw new Error(`Search unavailable (${response.status})`);
      return response.json();
    }));
    const matches = new Map(), names = [d.name, d.ticker].filter(Boolean).map((value) => value.toLowerCase());
    for (const data of responses) for (const pair of data.pairs || []) {
      if (pair.chainId !== 'solana') continue;
      for (const token of [pair.baseToken, pair.quoteToken]) {
        if (!token?.address || !validMint(token.address)) continue;
        if (![token.name, token.symbol].some((value) => names.includes((value || '').toLowerCase()))) continue;
        if (!matches.has(token.address)) matches.set(token.address, { ...token, url: pair.url });
      }
    }
    results.replaceChildren();
    const list = [...matches.values()].slice(0, 8);
    if (!list.length) { status.textContent = 'No exact name or ticker matches surfaced in this search. New and unindexed tokens may be missing.'; results.append(status); return; }
    const heading = document.createElement('div'); heading.className = 'collision-status'; heading.textContent = `${list.length} indexed token${list.length === 1 ? '' : 's'} surfaced with this exact name or ticker. Compare full addresses before sharing.`; results.append(heading);
    const cards = document.createElement('div'); cards.className = 'collision-list';
    for (const token of list) {
      const card = document.createElement('div'); card.className = 'collision-item';
      const title = document.createElement('strong'); title.textContent = `${token.name || 'Unnamed'} · $${token.symbol || '?'}`;
      const address = document.createElement('code'); address.textContent = token.address;
      const note = document.createElement('span'); note.textContent = validMint(d.mint) && token.address === d.mint ? 'Matches the address you entered' : 'Different address or no address entered';
      const link = document.createElement('a'); link.href = `https://dexscreener.com/solana/${token.address}`; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Inspect on DEX Screener ↗';
      card.append(title, address, note, link); cards.append(card);
    }
    results.append(cards);
  } catch (error) { console.error(error); status.textContent = 'Search is temporarily unavailable. Try again later; the launch studio still works offline.'; results.replaceChildren(status); }
  finally { button.disabled = false; button.textContent = 'Search possible matches ↗'; }
}
restore(); render();
fields.forEach((id) => $(id).addEventListener('input', () => { save(); render(); if (['coin-name', 'ticker', 'mint-address'].includes(id)) $('collision-results').replaceChildren(); }));
document.querySelectorAll('.theme').forEach((button) => button.addEventListener('click', () => setTheme(button.dataset.theme)));
document.querySelectorAll('.preview-tabs button').forEach((button) => button.addEventListener('click', () => selectOutput(button.dataset.output)));
$('upload-button').addEventListener('click', () => $('art-upload').click());
$('art-upload').addEventListener('change', (event) => loadArt(event.target.files[0]));
$('remove-art').addEventListener('click', () => { state.art = null; state.artInfo = null; $('art-upload').value = ''; $('upload-title').textContent = 'Add your artwork'; $('upload-subtitle').textContent = 'PNG, JPG or WebP · kept on this device'; $('remove-art').hidden = true; render(); });
$('download-current').addEventListener('click', downloadCurrent);
$('download-kit').addEventListener('click', downloadKit);
$('copy-address').addEventListener('click', async () => { if (!validMint(form().mint)) return; try { await navigator.clipboard.writeText(form().mint); toast('Full mint address copied'); } catch { toast('Copy failed. Select and copy the address above.'); } });
$('download-mint').addEventListener('click', async () => { if (!validMint(form().mint)) return; try { download(await canvasBlob($('mint-preview')), `mintframe-${slug(form().name)}-exact-mint.png`); toast('Address card downloaded'); } catch { toast('Export failed. Please try again.'); } });
$('scan-names').addEventListener('click', scanNames);
