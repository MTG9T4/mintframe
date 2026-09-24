const $ = (id) => document.getElementById(id);
const fields = ['coin-name', 'ticker', 'tagline', 'description', 'website', 'social', 'telegram', 'mint-address'];
const sizes = { icon: [1200, 1200], banner: [1500, 500], social: [1200, 675], story: [1080, 1920] };
const palettes = {
  electric: { base: '#0b191c', mid: '#25473a', glow: '#92b83f', accent: '#c8ff3d', pale: '#f1ffe0', dim: '#8aa998' },
  ember: { base: '#21141b', mid: '#613027', glow: '#b45535', accent: '#ff8559', pale: '#fff0e3', dim: '#d1a190' },
  chrome: { base: '#101921', mid: '#315066', glow: '#678da8', accent: '#b8deef', pale: '#eefaff', dim: '#a0baca' }
};
const looks = { natural: [100, 100, 100], pop: [105, 120, 145], noir: [105, 125, 0], soft: [108, 86, 88] };
const defaultFraming = () => Object.fromEntries(Object.keys(sizes).map((output) => [output, { zoom: 1, x: 0, y: 0 }]));
const outputNames = { icon: 'coin image', banner: 'Pump banner', social: 'X card', story: 'story' };
const state = { output: 'icon', theme: 'electric', art: null, artInfo: null, framing: defaultFraming(), brightness: 100, contrast: 100, saturation: 100, look: 'natural', flipArt: false, cleanIcon: false, shareMode: false, importSerial: 0, scanSerial: 0, previewSerial: 0, previewTimer: null, toastTimer: null };

function form() {
  return {
    name: $('coin-name').value.trim(), ticker: $('ticker').value.trim().replace(/^\$/, '').toUpperCase(),
    tagline: $('tagline').value.trim(), description: $('description').value.trim(),
    website: $('website').value.trim(), social: $('social').value.trim(), telegram: $('telegram').value.trim(), mint: $('mint-address').value.trim()
  };
}
function save() {
  if (state.shareMode) return;
  try { localStorage.setItem('mintframe-draft-v1', JSON.stringify({ ...form(), theme: state.theme, framing: state.framing, brightness: state.brightness, contrast: state.contrast, saturation: state.saturation, look: state.look, flipArt: state.flipArt, cleanIcon: state.cleanIcon })); }
  catch { /* Draft saving is optional in restricted browser modes. */ }
}
function restore() {
  try {
    const draft = JSON.parse(localStorage.getItem('mintframe-draft-v1') || '{}');
    const mapping = { name: 'coin-name', ticker: 'ticker', tagline: 'tagline', description: 'description', website: 'website', social: 'social', telegram: 'telegram', mint: 'mint-address' };
    Object.entries(mapping).forEach(([key, id]) => { if (typeof draft[key] === 'string') $(id).value = draft[key]; });
    const legacy = { zoom: draft.artZoom, x: draft.artX, y: draft.artY };
    for (const output of Object.keys(sizes)) {
      const frame = draft.framing?.[output] || legacy;
      state.framing[output] = {
        zoom: Number.isFinite(frame.zoom) ? Math.min(2.2, Math.max(1, frame.zoom)) : 1,
        x: Number.isFinite(frame.x) ? Math.min(1, Math.max(-1, frame.x)) : 0,
        y: Number.isFinite(frame.y) ? Math.min(1, Math.max(-1, frame.y)) : 0
      };
    }
    state.brightness = Number.isFinite(draft.brightness) ? Math.min(150, Math.max(50, draft.brightness)) : 100;
    state.contrast = Number.isFinite(draft.contrast) ? Math.min(150, Math.max(50, draft.contrast)) : 100;
    state.saturation = Number.isFinite(draft.saturation) ? Math.min(200, Math.max(0, draft.saturation)) : 100;
    state.look = Object.hasOwn(looks, draft.look) || draft.look === 'custom' ? draft.look : 'natural';
    state.flipArt = draft.flipArt === true; state.cleanIcon = draft.cleanIcon === true;
    syncFramingControls();
    syncArtControls();
    if (palettes[draft.theme]) setTheme(draft.theme, false);
  } catch { /* A corrupted local draft should not prevent the studio from opening. */ }
}
function syncFramingControls() {
  const frame = state.framing[state.output];
  $('art-zoom').value = Math.round(frame.zoom * 100);
  $('zoom-value').textContent = `${Math.round(frame.zoom * 100)}%`;
  $('framing-output').textContent = outputNames[state.output];
}
function syncArtControls() {
  for (const key of ['brightness', 'contrast', 'saturation']) {
    $(`art-${key}`).value = state[key]; $(`${key}-value`).textContent = `${state[key]}%`;
  }
  $('flip-art').checked = state.flipArt; $('clean-icon').checked = state.cleanIcon;
  document.querySelectorAll('.look').forEach((button) => {
    const active = button.dataset.look === state.look;
    button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
  });
}
function setLook(look) {
  if (!looks[look]) return;
  [state.brightness, state.contrast, state.saturation] = looks[look];
  state.look = look; syncArtControls(); render(); save();
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
function validTelegram(raw) {
  if (!validUrl(raw)) return false;
  return ['t.me', 'www.t.me', 'telegram.me', 'www.telegram.me'].includes(new URL(raw).hostname);
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
function mintFromInput(raw) {
  const value = raw.trim();
  if (validMint(value)) return value;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['pump.fun', 'www.pump.fun'].includes(url.hostname)) return null;
    const match = url.pathname.match(/^\/coin\/([^/]+)\/?$/);
    return match && validMint(match[1]) ? match[1] : null;
  } catch { return null; }
}
function updateChecks() {
  const d = form();
  const checks = [
    ['Name and ticker', !!d.name && !!d.ticker, 'A name and short, recognizable symbol are ready.', true],
    ['Clear description', d.description.length >= 25, 'Recommended: explain the idea in at least one complete sentence.', true],
    ['Coin image', !state.artInfo || Math.min(state.artInfo.width, state.artInfo.height) >= 1000, 'Export is 1200 × 1200. Custom art looks best when its short side is at least 1000px.', true],
    ['Website link', d.website ? validUrl(d.website) : null, 'Optional. If added, use a complete http:// or https:// link.', false],
    ['X profile', d.social ? validUrl(d.social, true) : null, 'Optional. If added, use a complete x.com profile link.', false],
    ['Telegram', d.telegram ? validTelegram(d.telegram) : null, 'Optional. If added, use a complete t.me link.', false],
    ['Launch assets', !!d.name && !!d.ticker && !!d.tagline, 'Your name, ticker and one-line idea populate every export.', true]
  ];
  const core = checks.filter((check) => check[3]);
  const score = core.filter((check) => check[1]).length;
  const invalidLinks = checks.filter((check) => !check[3] && check[1] === false).length;
  $('readiness-score').textContent = `${score}/${core.length}`;
  $('score-fill').style.width = `${100 * score / core.length}%`;
  const issues = core.length - score + invalidLinks;
  $('readiness-summary').textContent = issues ? `${issues} item${issues === 1 ? '' : 's'} to review before opening Pump.` : 'Ready for a careful final review on Pump.';
  $('check-list').replaceChildren(...checks.map(([title, good, detail]) => {
    const item = document.createElement('div'); item.className = `check-item ${good === true ? 'good' : ''}`;
    const icon = document.createElement('span'); icon.className = 'check-icon'; icon.textContent = good === true ? '✓' : good === null ? '–' : '·';
    const content = document.createElement('div'); const heading = document.createElement('strong'); heading.textContent = title;
    const p = document.createElement('p'); p.textContent = detail; content.append(heading, p); item.append(icon, content); return item;
  }));
  const mintOk = !!mintFromInput(d.mint);
  const msg = $('mint-message'); msg.className = `mint-message ${d.mint ? mintOk ? 'success' : 'error' : ''}`;
  msg.textContent = !d.mint ? 'A valid address format is not proof of ownership. Always confirm on Pump.' : mintOk ? 'Valid address format. Confirm this exact mint on the official Pump coin page.' : 'Paste a full Solana mint address or a Pump coin URL.';
  $('copy-address').disabled = !mintOk; $('download-mint').disabled = !mintOk;
  $('import-token').disabled = !mintOk; $('copy-share-link').disabled = !mintOk;
  $('copy-post').textContent = mintOk ? 'Copy launch post' : 'Copy teaser post';
  const link = $('pump-link'); link.hidden = !mintOk;
  if (mintOk) link.href = `https://pump.fun/coin/${mintFromInput(d.mint)}`;
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
function drawImageCover(ctx, image, x, y, w, h, output, radius = 0) {
  const framing = state.framing[output];
  const ratio = Math.max(w / image.width, h / image.height) * framing.zoom, iw = image.width * ratio, ih = image.height * ratio;
  const dx = x + (w - iw) / 2 + framing.x * Math.max(0, (iw - w) / 2);
  const dy = y + (h - ih) / 2 + framing.y * Math.max(0, (ih - h) / 2);
  ctx.save(); if (radius) { ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.clip(); }
  else { ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); }
  ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%)`;
  if (state.flipArt) { ctx.translate(2 * x + w, 0); ctx.scale(-1, 1); }
  ctx.drawImage(image, dx, dy, iw, ih); ctx.restore();
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
  if (output === 'icon' && state.art && state.cleanIcon) { drawImageCover(ctx, state.art, 0, 0, w, h, output); return; }
  if (output === 'icon') {
    if (state.art) {
      drawImageCover(ctx, state.art, 0, 0, w, h, output);
      const shade = ctx.createLinearGradient(0, 300, 0, h); shade.addColorStop(0, '#07100e00'); shade.addColorStop(.62, '#07100e87'); shade.addColorStop(1, '#07100ef5'); ctx.fillStyle = shade; ctx.fillRect(0, 0, w, h);
    } else { ctx.save(); ctx.shadowColor = p.accent; ctx.shadowBlur = 110; star(ctx, 780, 405, 270, p.accent); ctx.restore(); star(ctx, 780, 405, 270, p.accent); }
    frame(ctx, w, h, p, 36); label(ctx, 'MF / LAUNCH STUDIO', 75, 100, p.pale, 23);
    label(ctx, `01 / ${ticker}`, 75, 805, p.accent, 24); fitText(ctx, name, 1060, 140, 700, 44);
    ctx.fillStyle = p.pale; ctx.fillText(name, 70, 945, 1060);
    ctx.font = '500 30px "DM Mono", monospace'; ctx.fillStyle = p.pale; ctx.fillText(tagline.slice(0, 48), 75, 1015);
    ctx.fillStyle = p.accent; ctx.fillRect(75, 1062, 1050, 2); label(ctx, 'A NEW SIGNAL STARTS HERE', 75, 1115, p.pale, 20);
  } else if (output === 'banner') {
    if (state.art) { drawImageCover(ctx, state.art, 830, 0, 670, h, output); ctx.fillStyle = p.base + '44'; ctx.fillRect(830, 0, 670, h); }
    else { star(ctx, 1170, 245, 200, p.accent); }
    frame(ctx, w, h, p, 19); label(ctx, `NEW / ${ticker}`, 56, 70, p.accent, 20);
    fitText(ctx, name, 820, 100, 700, 39); ctx.fillStyle = p.pale; ctx.fillText(name, 52, 280, 820);
    ctx.fillStyle = p.accent; ctx.fillRect(56, 322, 100, 4); label(ctx, tagline.slice(0, 48), 56, 382, p.pale, 21);
    label(ctx, 'MINTFRAME / MADE TO LAUNCH', 56, 452, p.dim, 16);
  } else if (output === 'social') {
    if (state.art) { drawImageCover(ctx, state.art, 720, 0, 480, h, output); ctx.fillStyle = p.base + '55'; ctx.fillRect(720, 0, 480, h); }
    else star(ctx, 950, 315, 182, p.accent);
    frame(ctx, w, h, p, 28); label(ctx, `INTRODUCING / $${ticker}`, 62, 95, p.accent, 21);
    ctx.font = '700 104px "Space Grotesk", Arial, sans-serif'; const lines = wrapText(ctx, name, 650, 3); fitText(ctx, lines[0] || name, 650, 104, 700, 42);
    ctx.fillStyle = p.pale; lines.forEach((line, i) => ctx.fillText(line, 56, 290 + i * 105, 650));
    ctx.fillStyle = p.accent; ctx.fillRect(61, 510, 72, 4); label(ctx, tagline.slice(0, 40), 61, 570, p.pale, 19);
    label(ctx, 'A NEW IDEA, READY FOR THE WORLD.', 61, 628, p.dim, 16);
  } else {
    if (state.art) { drawImageCover(ctx, state.art, 0, 210, w, 1050, output); ctx.fillStyle = p.base + '33'; ctx.fillRect(0, 210, w, 1050); }
    else { star(ctx, 540, 760, 355, p.accent); }
    frame(ctx, w, h, p, 38); label(ctx, `THE LAUNCH / $${ticker}`, 85, 132, p.accent, 24);
    ctx.fillStyle = p.base + 'dd'; ctx.fillRect(45, 1280, 990, 460);
    ctx.font = '700 125px "Space Grotesk", Arial, sans-serif'; const lines = wrapText(ctx, name, 870, 3); fitText(ctx, lines[0] || name, 870, 125, 700, 46);
    ctx.fillStyle = p.pale; lines.forEach((line, i) => ctx.fillText(line, 85, 1420 + i * 132, 870));
    label(ctx, tagline.slice(0, 38), 87, 1640, p.accent, 25); label(ctx, 'YOUR IDEA. OUT IN THE OPEN.', 87, 1813, p.dim, 22);
  }
}
function drawMint() {
  const canvas = $('mint-preview'), ctx = canvas.getContext('2d'), d = form(), p = palettes[state.theme], w = canvas.width, h = canvas.height;
  backdrop(ctx, w, h, p); frame(ctx, w, h, p, 24);
  label(ctx, 'THE EXACT MINT / SOLANA', 60, 82, p.accent, 19);
  const name = (d.name || (mintFromInput(d.mint) ? 'SOLANA MINT' : 'YOUR PROJECT')).toUpperCase(); fitText(ctx, name, 920, 98, 700, 42);
  ctx.fillStyle = p.pale; ctx.fillText(name, 54, 230, 920); star(ctx, 1050, 175, 88, p.accent);
  ctx.fillStyle = '#07120ddd'; ctx.beginPath(); ctx.roundRect(53, 350, 1094, 168, 10); ctx.fill();
  label(ctx, 'CONTRACT ADDRESS / COPY THE FULL STRING', 78, 393, p.dim, 16);
  const address = mintFromInput(d.mint) || 'ADD THE MINT ADDRESS AFTER LAUNCH';
  ctx.fillStyle = p.pale; fitText(ctx, address, 1040, 40, 500, 23); ctx.fillText(address, 77, 457);
  label(ctx, 'CONFIRM ON PUMP.FUN BEFORE SHARING', 60, 598, p.pale, 17);
  label(ctx, 'MINTFRAME / EXACT ADDRESS CARD', 775, 598, p.dim, 13);
}
const outputDescriptions = {
  icon: 'Square PNG · Pump image max 15 MB',
  banner: '1500 × 500 JPG · Pump banner max 5 MB',
  social: 'Landscape PNG · made for an X card',
  story: 'Vertical PNG · made for a story'
};
const avatarSourceCanvas = document.createElement('canvas');
function renderPreview() {
  drawAsset($('preview'), state.output);
  const avatarSource = state.output === 'icon' ? $('preview') : avatarSourceCanvas;
  if (state.output !== 'icon') drawAsset(avatarSourceCanvas, 'icon');
  const avatar = $('avatar-preview').getContext('2d'); avatar.clearRect(0, 0, 72, 72); avatar.drawImage(avatarSource, 0, 0, 72, 72);
  const output = state.output, serial = ++state.previewSerial, note = $('output-note');
  note.textContent = `${outputDescriptions[output]} · measuring…`;
  clearTimeout(state.previewTimer);
  state.previewTimer = setTimeout(async () => {
    try {
      const blob = await assetBlob($('preview'), output);
      if (serial === state.previewSerial) note.textContent = `${outputDescriptions[output]} · ${(blob.size / 1e6).toFixed(2)} MB`;
    } catch { if (serial === state.previewSerial) note.textContent = 'Export size could not be checked. Try another image.'; }
  }, 300);
}
function render() {
  renderPreview(); drawMint(); updateChecks();
  $('preview').parentElement.classList.toggle('has-art', !!state.art);
}
function selectOutput(output) {
  state.output = output;
  document.querySelectorAll('.preview-tabs button').forEach((button) => {
    const active = button.dataset.output === output; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active));
  });
  $('preview-size').textContent = `${sizes[output][0]} × ${sizes[output][1]} PX`;
  syncFramingControls();
  render();
}
function canvasBlob(canvas, type = 'image/png', quality) { return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not create image')), type, quality)); }
async function assetBlob(canvas, output) {
  if (output !== 'banner') return canvasBlob(canvas);
  for (const quality of [.94, .85, .7, .5]) {
    const blob = await canvasBlob(canvas, 'image/jpeg', quality);
    if (blob.type !== 'image/jpeg') throw new Error('JPEG export is unavailable in this browser');
    if (blob.size <= 5e6) return blob;
  }
  throw new Error('Banner exceeds Pump size limit');
}
function download(blob, name) { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000); }
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 38) || 'my-coin';
function assetName(output) { return `mintframe-${slug(form().name)}-${output}.${output === 'banner' ? 'jpg' : 'png'}`; }
async function downloadCurrent() { try { download(await assetBlob($('preview'), state.output), assetName(state.output)); toast('Asset downloaded'); } catch { toast('Export failed. Please try again.'); } }

// A small ZIP writer uses the uncompressed ZIP format. PNGs and JPEGs are already compressed.
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
    if (!d.name || !d.ticker || !d.tagline) { toast('Add a name, ticker, and one-line idea first.'); return; }
    const files = [];
    for (const output of Object.keys(sizes)) {
      const canvas = document.createElement('canvas'); drawAsset(canvas, output);
      files.push({ name: assetName(output), data: new Uint8Array(await (await assetBlob(canvas, output)).arrayBuffer()) });
    }
    const mint = mintFromInput(d.mint);
    if (mint) files.push({ name: 'exact-mint-card.png', data: new Uint8Array(await (await canvasBlob($('mint-preview'))).arrayBuffer()) });
    const copy = `PROJECT: ${d.name}\nTICKER: $${d.ticker}\n\nDESCRIPTION\n${d.description}\n\nX POST DRAFT\n${launchPost(d)}\n${d.website ? `\nWebsite: ${d.website}` : ''}${d.social ? `\nX: ${d.social}` : ''}${d.telegram ? `\nTelegram: ${d.telegram}` : ''}\n${mint ? `\nShareable MintFrame link: ${shareUrl(mint)}` : ''}\n\nFINAL CHECKLIST\n[ ] Confirm all metadata on Pump's create form\n[ ] Confirm image and banner crop; banner is under 5 MB\n[ ] Confirm website, X, and Telegram links\n[ ] Create token and copy the full mint from Pump\n[ ] Verify the exact mint on Pump before posting\n\nImages and text made with MintFrame. No account or wallet required.\n`;
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
    state.framing = defaultFraming(); syncFramingControls();
    $('upload-title').textContent = file.name || 'Pasted image'; $('upload-subtitle').textContent = `${image.width} × ${image.height} · ${Math.round(file.size / 1024)} KB`;
    $('remove-art').hidden = false; $('art-framing').hidden = false; $('art-style').hidden = false; render(); URL.revokeObjectURL(url);
    if (Math.min(image.width, image.height) < 1000) toast('Art loaded. A source at least 1000px on its short side will look sharper.');
    else toast('Artwork loaded');
  };
  image.onerror = () => { URL.revokeObjectURL(url); toast('Could not open that image.'); };
  image.src = url;
}
function shareUrl(mint) {
  const url = new URL(location.pathname, location.origin); url.searchParams.set('mint', mint); url.hash = 'identity'; return url.href;
}
function launchPost(d) {
  const mint = mintFromInput(d.mint);
  const suffix = mint ? `\n\nCA: ${mint}\nhttps://pump.fun/coin/${mint}` : '\n\nLaunch details coming soon.';
  const lead = `${d.name} ($${d.ticker})${d.tagline ? ` — ${d.tagline}` : ''}`.trim();
  const limit = 280 - suffix.length;
  const short = lead.length <= limit ? lead : `${lead.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
  return short + suffix;
}
function imagePrompt(d) {
  const project = d.name ? ` for a coin project called "${d.name}"` : ' for an original coin project';
  const idea = d.tagline ? ` The idea is: ${d.tagline.replace(/[.!?]+$/, '')}.` : '';
  return `Create a striking square profile image${project}.${idea} Show one memorable subject with a bold silhouette, rich lighting, and a polished visual style. Keep the subject centered with breathing room so the image also works in a wide banner crop. Make it recognizable at a tiny avatar size. No words, letters, ticker symbols, logos, watermarks, or interface elements. 1:1 aspect ratio.`;
}
async function copyText(value, success) {
  try { await navigator.clipboard.writeText(value); toast(success); }
  catch { toast('Copy failed. Select the text and copy it manually.'); }
}
async function importToken() {
  const mint = mintFromInput(form().mint), button = $('import-token'), status = $('import-status'), serial = ++state.importSerial;
  if (!mint) return;
  button.disabled = true; button.textContent = '↘ Looking up token…'; status.className = 'import-status'; status.textContent = 'Checking DEX Screener for this exact address…';
  try {
    const response = await fetch(`https://api.dexscreener.com/token-pairs/v1/solana/${mint}`, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error(`Token lookup unavailable (${response.status})`);
    const pairs = await response.json();
    if (serial !== state.importSerial) return;
    const pair = Array.isArray(pairs) && pairs.find((item) => item.chainId === 'solana' && (item.baseToken?.address === mint || item.quoteToken?.address === mint));
    if (!pair) { status.textContent = 'No indexed pair found yet. New Pump launches can take time to appear; the address link still works.'; return; }
    const token = pair.baseToken?.address === mint ? pair.baseToken : pair.quoteToken;
    const name = (token.name || '').slice(0, 32), ticker = (token.symbol || '').slice(0, 12);
    const filled = [];
    if (!$('coin-name').value.trim() && name) { $('coin-name').value = name; filled.push('name'); }
    if (!$('ticker').value.trim() && ticker) { $('ticker').value = ticker; filled.push('ticker'); }
    status.className = 'import-status success';
    status.textContent = `DEX Screener indexes this as ${name || 'unnamed'} (${ticker || '?'}). ${filled.length ? 'Blank fields filled.' : 'Your existing text was kept.'} Labels are not ownership verification.`;
    save(); render();
  } catch (error) { if (serial === state.importSerial) { console.error(error); status.className = 'import-status error'; status.textContent = 'Token lookup is unavailable. You can still use the full address and Pump link.'; } }
  finally { if (serial === state.importSerial) { button.disabled = false; button.textContent = '↘ Load indexed name and ticker'; } }
}
function openSharedAddress() {
  const mint = mintFromInput(new URLSearchParams(location.search).get('mint') || '');
  if (!mint) return;
  state.shareMode = true;
  for (const id of fields) if (id !== 'mint-address') $(id).value = '';
  $('mint-address').value = mint;
  $('shared-banner').hidden = false;
  render();
  void importToken();
}
async function scanNames() {
  const d = form(), query = d.name || d.ticker, button = $('scan-names'), results = $('collision-results'), serial = ++state.scanSerial;
  if (!query) { toast('Add a project name or ticker first.'); return; }
  button.disabled = true; button.textContent = 'Searching…';
  results.replaceChildren();
  const status = document.createElement('div'); status.className = 'collision-status'; status.textContent = 'Checking indexed Solana pairs…'; results.append(status);
  try {
    const queries = [...new Set([d.name, d.ticker].filter(Boolean))];
    const responses = await Promise.all(queries.map(async (term) => {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(term)}`, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error(`Search unavailable (${response.status})`);
      return response.json();
    }));
    if (serial !== state.scanSerial) return;
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
      const note = document.createElement('span'); note.textContent = token.address === mintFromInput(d.mint) ? 'Matches the address you entered' : 'Different address or no address entered';
      const link = document.createElement('a'); link.href = `https://dexscreener.com/solana/${token.address}`; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Inspect on DEX Screener ↗';
      card.append(title, address, note, link); cards.append(card);
    }
    results.append(cards);
  } catch (error) { if (serial === state.scanSerial) { console.error(error); status.textContent = 'Search is temporarily unavailable. Try again later; the launch studio still works offline.'; results.replaceChildren(status); } }
  finally { if (serial === state.scanSerial) { button.disabled = false; button.textContent = 'Search possible matches ↗'; } }
}
restore(); render(); openSharedAddress();
if (document.fonts?.ready) document.fonts.ready.then(render);
fields.forEach((id) => $(id).addEventListener('input', () => {
  if (id === 'mint-address') {
    state.importSerial++;
    const mint = mintFromInput($(id).value);
    if (mint && $(id).value !== mint) $(id).value = mint;
    $('import-status').textContent = 'Optional: load public token labels from DEX Screener after launch.';
    $('import-status').className = 'import-status';
    $('import-token').textContent = '↘ Load indexed name and ticker';
  }
  save(); render(); if (['coin-name', 'ticker', 'mint-address'].includes(id)) { state.scanSerial++; $('scan-names').disabled = false; $('scan-names').textContent = 'Search possible matches ↗'; $('collision-results').replaceChildren(); }
}));
document.querySelectorAll('.theme').forEach((button) => button.addEventListener('click', () => setTheme(button.dataset.theme)));
document.querySelectorAll('.look').forEach((button) => button.addEventListener('click', () => setLook(button.dataset.look)));
for (const key of ['brightness', 'contrast', 'saturation']) {
  $(`art-${key}`).addEventListener('input', (event) => {
    state[key] = Number(event.target.value); state.look = 'custom'; syncArtControls(); renderPreview(); save();
  });
}
$('flip-art').addEventListener('change', (event) => { state.flipArt = event.target.checked; renderPreview(); save(); });
$('clean-icon').addEventListener('change', (event) => { state.cleanIcon = event.target.checked; renderPreview(); save(); });
$('reset-look').addEventListener('click', () => setLook('natural'));
document.querySelectorAll('.preview-tabs button').forEach((button) => button.addEventListener('click', () => selectOutput(button.dataset.output)));
$('upload-button').addEventListener('click', () => $('art-upload').click());
$('art-upload').addEventListener('change', (event) => { loadArt(event.target.files[0]); event.target.value = ''; });
$('copy-image-prompt').addEventListener('click', () => copyText(imagePrompt(form()), 'Image prompt copied'));
const uploadWrap = $('upload-wrap');
uploadWrap.addEventListener('dragover', (event) => {
  if (!Array.from(event.dataTransfer?.types || []).includes('Files')) return;
  event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; uploadWrap.classList.add('is-dragging');
});
uploadWrap.addEventListener('dragleave', (event) => { if (!uploadWrap.contains(event.relatedTarget)) uploadWrap.classList.remove('is-dragging'); });
uploadWrap.addEventListener('drop', (event) => {
  uploadWrap.classList.remove('is-dragging');
  if (!event.dataTransfer?.files.length) return;
  event.preventDefault(); loadArt(event.dataTransfer.files[0]);
});
document.addEventListener('paste', (event) => {
  if (event.target instanceof Element && event.target.closest('input, textarea, [contenteditable="true"]')) return;
  const image = Array.from(event.clipboardData?.items || []).filter((item) => item.kind === 'file').map((item) => item.getAsFile()).find((file) => file?.type.startsWith('image/'));
  if (!image) return;
  event.preventDefault(); loadArt(image);
});
$('remove-art').addEventListener('click', () => { state.art = null; state.artInfo = null; state.framing = defaultFraming(); syncFramingControls(); $('art-upload').value = ''; $('upload-title').textContent = 'Add your artwork'; $('upload-subtitle').textContent = 'PNG, JPG or WebP · kept on this device'; $('remove-art').hidden = true; $('art-framing').hidden = true; $('art-style').hidden = true; render(); save(); });
$('art-zoom').addEventListener('input', (event) => { state.framing[state.output].zoom = Number(event.target.value) / 100; $('zoom-value').textContent = `${event.target.value}%`; renderPreview(); save(); });
$('reset-framing').addEventListener('click', () => { state.framing[state.output] = { zoom: 1, x: 0, y: 0 }; syncFramingControls(); renderPreview(); save(); });
const previewCanvas = $('preview'); let drag = null;
previewCanvas.addEventListener('pointerdown', (event) => {
  if (!state.art) return;
  const frame = state.framing[state.output];
  drag = { x: event.clientX, y: event.clientY, frameX: frame.x, frameY: frame.y, output: state.output };
  previewCanvas.setPointerCapture(event.pointerId); previewCanvas.classList.add('dragging');
});
previewCanvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const rect = previewCanvas.getBoundingClientRect();
  const horizontal = { icon: 1, banner: 670 / 1500, social: 480 / 1200, story: 1 }[drag.output];
  const vertical = drag.output === 'story' ? 1050 / 1920 : 1;
  const frame = state.framing[drag.output];
  frame.x = Math.max(-1, Math.min(1, drag.frameX + 2 * (event.clientX - drag.x) / (rect.width * horizontal)));
  frame.y = Math.max(-1, Math.min(1, drag.frameY + 2 * (event.clientY - drag.y) / (rect.height * vertical)));
  renderPreview();
});
function endDrag() { if (!drag) return; drag = null; previewCanvas.classList.remove('dragging'); save(); }
previewCanvas.addEventListener('pointerup', endDrag); previewCanvas.addEventListener('pointercancel', endDrag);
previewCanvas.addEventListener('keydown', (event) => {
  if (!state.art || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
  event.preventDefault(); const step = event.shiftKey ? .15 : .05;
  const frame = state.framing[state.output];
  if (event.key === 'ArrowLeft') frame.x = Math.max(-1, frame.x - step);
  if (event.key === 'ArrowRight') frame.x = Math.min(1, frame.x + step);
  if (event.key === 'ArrowUp') frame.y = Math.max(-1, frame.y - step);
  if (event.key === 'ArrowDown') frame.y = Math.min(1, frame.y + step);
  renderPreview(); save();
});
$('download-current').addEventListener('click', downloadCurrent);
$('download-kit').addEventListener('click', downloadKit);
$('copy-post').addEventListener('click', async () => { const d = form(); if (!d.name || !d.ticker) { toast('Add a project name and ticker first.'); return; } await copyText(launchPost(d), 'Post draft copied'); });
$('copy-address').addEventListener('click', async () => { const mint = mintFromInput(form().mint); if (mint) await copyText(mint, 'Full mint address copied'); });
$('download-mint').addEventListener('click', async () => { if (!mintFromInput(form().mint)) return; try { download(await canvasBlob($('mint-preview')), `mintframe-${slug(form().name)}-exact-mint.png`); toast('Address card downloaded'); } catch { toast('Export failed. Please try again.'); } });
$('copy-share-link').addEventListener('click', async () => { const mint = mintFromInput(form().mint); if (mint) await copyText(shareUrl(mint), 'Shareable address link copied'); });
$('import-token').addEventListener('click', importToken);
$('back-to-draft').addEventListener('click', () => { state.importSerial++; state.scanSerial++; state.shareMode = false; fields.forEach((id) => { $(id).value = ''; }); $('shared-banner').hidden = true; $('import-status').textContent = 'Optional: load public token labels from DEX Screener after launch.'; $('import-status').className = 'import-status'; $('import-token').textContent = '↘ Load indexed name and ticker'; history.replaceState(null, '', `${location.pathname}#studio`); restore(); render(); $('studio').scrollIntoView({ behavior: 'smooth' }); });
$('scan-names').addEventListener('click', scanNames);

const heroArt = document.querySelector('.hero-art');
$('hero-shuffle').addEventListener('click', () => {
  const shuffled = heroArt.classList.toggle('shuffled');
  $('hero-shuffle').setAttribute('aria-pressed', String(shuffled));
});
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const hero = document.querySelector('.hero');
  let motionFrame = 0;
  hero.addEventListener('pointermove', (event) => {
    if (reducedMotion.matches) return;
    const rect = hero.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
    cancelAnimationFrame(motionFrame);
    motionFrame = requestAnimationFrame(() => {
      for (const [name, value] of Object.entries({ '--front-x': x * 16, '--front-y': y * 12, '--back-x': x * 8, '--back-y': y * 6, '--depth-x': x * 4, '--depth-y': y * 3, '--depth-front-x': x * 10, '--depth-front-y': y * 8 })) {
        heroArt.style.setProperty(name, `${value.toFixed(1)}px`);
      }
    });
  });
  hero.addEventListener('pointerleave', () => {
    cancelAnimationFrame(motionFrame);
    for (const name of ['--front-x', '--front-y', '--back-x', '--back-y', '--depth-x', '--depth-y', '--depth-front-x', '--depth-front-y']) heroArt.style.removeProperty(name);
  });
}
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const elements = document.querySelectorAll('.section-heading, .kit-bar, .score-card, .check-list, .mint-layout, .collision-panel, .closing h2');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }, { threshold: .1, rootMargin: '0px 0px -20px 0px' });
  elements.forEach((element) => { element.classList.add('motion-reveal'); observer.observe(element); });
  document.documentElement.classList.add('motion-ready');
}
