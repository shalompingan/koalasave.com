const fs = require('fs');

const BANNER = '<div style="text-align:center;padding:12px 18px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);border:1.5px solid #6ee7b7;border-radius:12px;margin:20px 0 24px;"><div style="font-weight:600;font-size:.85rem;color:#065f46;">🏦 Earn up to 4-5% APY on your savings</div><div style="font-size:.78rem;color:#047857;margin:4px 0 8px;">Put your money to work in a high-yield savings account while you save.</div><a href="/best-high-yield-savings-accounts/" style="display:inline-block;padding:6px 16px;background:#059669;color:#fff;border-radius:8px;font-size:.8rem;font-weight:600;text-decoration:none;">See Which Banks Pay 4-5% APY →</a></div>';

const BANNER_START = '<div style="text-align:center;padding:12px 18px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);border:1.5px solid #6ee7b7;border-radius:12px;margin:20px 0 24px;">';
const BANNER_END = '>See Which Banks Pay 4-5% APY →</a></div>';

function removeBanner(html) {
  const startIdx = html.indexOf(BANNER_START);
  if (startIdx === -1) return null;
  const endMarker = BANNER_END;
  const endIdx = html.indexOf(endMarker, startIdx);
  if (endIdx === -1) return null;
  const removeEnd = endIdx + endMarker.length;
  return html.substring(0, startIdx) + html.substring(removeEnd);
}

function insertAfter(html, marker, insertHtml) {
  const idx = html.indexOf(marker);
  if (idx === -1) return null;
  return html.substring(0, idx + marker.length) + insertHtml + html.substring(idx + marker.length);
}

// ---- debt-payoff-calculator ----
// Hero: <section class="hero">...</section>
// Insert after </section>
let html = fs.readFileSync('debt-payoff-calculator/index.html', 'utf8');
html = removeBanner(html);
if (html) {
  html = insertAfter(html, '</section>', '<div class="container" style="margin-top:24px">' + BANNER + '</div>');
  if (html) { fs.writeFileSync('debt-payoff-calculator/index.html', html); console.log('✅ debt-payoff-calculator'); }
  else console.log('❌ debt-payoff-calculator insert failed');
} else console.log('❌ debt-payoff-calculator banner not found');

// ---- subscription-cost-calculator ----
html = fs.readFileSync('subscription-cost-calculator/index.html', 'utf8');
html = removeBanner(html);
if (html) {
  // After </header>, before <div class="container" style="max-width:820px;...">
  html = insertAfter(html, '</header>', '<div class="container" style="margin-top:24px">' + BANNER + '</div>');
  if (html) { fs.writeFileSync('subscription-cost-calculator/index.html', html); console.log('✅ subscription-cost-calculator'); }
  else console.log('❌ subscription-cost-calculator insert failed');
} else console.log('❌ subscription-cost-calculator banner not found');

// ---- travel ----
html = fs.readFileSync('travel/index.html', 'utf8');
html = removeBanner(html);
if (html) {
  html = insertAfter(html, '</header>', '<div class="container" style="margin-top:24px">' + BANNER + '</div>');
  if (html) { fs.writeFileSync('travel/index.html', html); console.log('✅ travel'); }
  else console.log('❌ travel insert failed');
} else console.log('❌ travel banner not found');

// ---- housing ----
html = fs.readFileSync('housing/index.html', 'utf8');
html = removeBanner(html);
if (html) {
  html = insertAfter(html, '</header>', '<div class="container" style="margin-top:24px">' + BANNER + '</div>');
  if (html) { fs.writeFileSync('housing/index.html', html); console.log('✅ housing'); }
  else console.log('❌ housing insert failed');
} else console.log('❌ housing banner not found');

// ---- about ----
html = fs.readFileSync('about/index.html', 'utf8');
html = removeBanner(html);
if (html) {
  // No <header> tag. Insert after the last-updated div, INSIDE the content container
  // ...last-updated text</div><div class="content"><div class="container"><div class="section">
  html = insertAfter(html, 'class="content"><div class="container">', BANNER);
  if (html) { fs.writeFileSync('about/index.html', html); console.log('✅ about'); }
  else console.log('❌ about insert failed');
} else console.log('❌ about banner not found');

console.log('Done!');
