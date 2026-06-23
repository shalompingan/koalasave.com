const fs = require('fs');

const newNav = '<div class="nav-links"><a href="/">🛡️ Safety Net</a><a href="/travel/">🌴 Paradise Fund</a><a href="/housing/">🌿 Eucalyptus Grove</a><a href="/subscription-cost-calculator/">📋 Subscriptions</a><a href="/about/">About</a></div>';

const pages = [
  { path: 'C:/Users/shalom/koalasave.com/best-high-yield-savings-accounts/index.html', nav: 'Calculator Blog' },
  { path: 'C:/Users/shalom/koalasave.com/about/index.html', nav: 'Calculator Blog About' },
  { path: 'C:/Users/shalom/koalasave.com/blog/index.html', nav: '← Calculator' },
  { path: 'C:/Users/shalom/koalasave.com/tools/saving-calculators/index.html', nav: 'Calculator Blog About' },
  { path: 'C:/Users/shalom/koalasave.com/tools/budget-planners/index.html', nav: 'Calculator Blog About' },
];

for (const page of pages) {
  let html = fs.readFileSync(page.path, 'utf8');
  const oldNav = html.match(/<div class="nav-links">.*?<\/div>/);
  if (!oldNav) {
    console.log('ERROR: no nav-links found in ' + page.path);
    continue;
  }

  let replacement = newNav;
  // For about page, add active class to About link
  if (page.path.includes('/about/')) {
    replacement = replacement.replace('<a href="/about/">About</a>', '<a href="/about/" class="active">About</a>');
  }

  html = html.replace(oldNav[0], replacement);
  fs.writeFileSync(page.path, html);
  console.log('Updated: ' + page.path.split('/').slice(-2, -1)[0]);
}
