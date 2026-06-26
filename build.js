/**
 * KoalaSave Build Script — Minify all HTML files for production.
 * Strips comments, collapses whitespace, minifies inline CSS/JS.
 * Output goes to dist/ — source files are untouched.
 *
 * Usage:  node build.js
 *         node build.js --serve   # minify + start server on port 3000
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const LAUNCH_JSON = path.join(ROOT, '.claude', 'launch.json');

// ─── CSS Minifier ───

function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '')       // remove comments
        .replace(/\s+/g, ' ')                     // collapse whitespace
        .replace(/\s*([{}:;,])\s*/g, '$1')        // around tokens
        .replace(/;\}/g, '}')                     // trailing ;
        .replace(/^\s+|\s+$/g, '')                // trim
        .replace(/\s*([{;])\s*/g, '$1');
}

// ─── JS Minifier ───

function minifyJS(js) {
    let out = '';
    let i = 0;
    let inStr = null; // ' " or `

    while (i < js.length) {
        let c = js[i];

        if (inStr) {
            out += c;
            if (c === '\\' && i + 1 < js.length) { i++; out += js[i]; }
            else if (c === inStr) inStr = null;
            i++;
            continue;
        }

        if (c === '`') { inStr = '`'; out += c; i++; continue; }
        if (c === "'" || c === '"') { inStr = c; out += c; i++; continue; }

        // Single-line comment
        if (c === '/' && js[i + 1] === '/') {
            i += 2;
            while (i < js.length && js[i] !== '\n') i++;
            continue;
        }

        // Multi-line comment
        if (c === '/' && js[i + 1] === '*') {
            i += 2;
            while (i < js.length && !(js[i] === '*' && js[i + 1] === '/')) i++;
            i += 2;
            continue;
        }

        // Collapse whitespace
        if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
            if (out.length > 0 && out[out.length - 1] !== ' ') out += ' ';
            i++;
            continue;
        }

        out += c;
        i++;
    }

    // Cleanup spaces around tokens
    out = out.replace(/\s*([=+\-*\/%&|^!<>,;{}()\[\]])\s*/g, '$1');
    out = out.replace(/\+\s\+/g, '++');
    out = out.replace(/-\s-/g, '--');
    out = out.replace(/\b(function|if|for|while|switch|catch|return|typeof|new|delete|void)\s*\(/g, '$1(');
    out = out.replace(/\b(else|do|try|finally)\s*\{/g, '$1{');
    out = out.replace(/\s+;/g, ';');

    return out.trim();
}

// ─── HTML Minifier ───

function minifyHTML(html) {
    // Minify inline CSS
    html = html.replace(/<style([^>]*)>([\s\S]*?)<\/style>/g, (m, attrs, content) => {
        return `<style${attrs}>${minifyCSS(content)}</style>`;
    });

    // Minify inline JS (no src=) and JSON-LD
    html = html.replace(/<script([^>]*)>([\s\S]*?)<\/script>/g, (m, attrs, content) => {
        if (/src\s*=|src="/.test(attrs)) return m; // external script, skip
        if (/ld\+json|application\/ld\+json/.test(attrs)) {
            try { return `<script${attrs}>${JSON.stringify(JSON.parse(content), null, 0)}</script>`; }
            catch (e) { return m; }
        }
        return `<script${attrs}>${minifyJS(content)}</script>`;
    });

    // Remove HTML comments (not IE conditionals)
    html = html.replace(/<!--(?!\[)[\s\S]*?-->/g, '');

    // Collapse whitespace between tags
    html = html.replace(/>\s+</g, '><');

    // Collapse multiple spaces in text
    html = html.replace(/\s{2,}/g, ' ');

    // Trim lines
    html = html.split('\n').map(l => l.trim()).join('\n');

    // Remove blank lines
    html = html.replace(/\n\s*\n/g, '\n');

    return html.trim();
}

// ─── Copy static assets ───

const STATIC_FILES = [
    'favicon.png', 'logo.png', 'logo-32.webp', 'logo-64.webp', 'share-cover.png',
    'offline.html', 'manifest.json', 'sw.js', 'sitemap.xml', 'robots.txt', 'ads.txt',
    'privacy-policy.html', 'terms-of-service.html'
];

// ─── Build ───

function build() {
    const inplace = process.argv.includes('--inplace');

    console.log(`🔨 KoalaSave Build — Minifying all HTML files...${inplace ? ' (in-place)' : ''}\n`);

    // Clean dist (only if not inplace)
    if (!inplace && fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
    if (!inplace) fs.mkdirSync(DIST, { recursive: true });

    // Find HTML files
    const allFiles = getAllFiles(ROOT, '.html');
    const htmlFiles = allFiles.filter(f =>
        !f.includes('node_modules') && !f.includes(path.sep + 'dist' + path.sep)
    );

    let totalOrig = 0;
    let totalMin = 0;

    for (const srcPath of htmlFiles) {
        const relPath = path.relative(ROOT, srcPath);
        const original = fs.readFileSync(srcPath, 'utf-8');
        const minified = minifyHTML(original);

        const isInplace = process.argv.includes('--inplace');
        const dstPath = isInplace ? srcPath : path.join(DIST, relPath);
        // Backup original if inplace (saved as .orig)
        if (isInplace) {
            const bakPath = srcPath + '.orig';
            if (!fs.existsSync(bakPath)) fs.copyFileSync(srcPath, bakPath);
        }
        fs.mkdirSync(path.dirname(dstPath), { recursive: true });
        fs.writeFileSync(dstPath, minified, 'utf-8');

        const oSize = Buffer.byteLength(original, 'utf-8');
        const mSize = Buffer.byteLength(minified, 'utf-8');
        totalOrig += oSize;
        totalMin += mSize;
        const savings = ((1 - mSize / oSize) * 100).toFixed(0);

        console.log(`  ${relPath}`);
        console.log(`    ${(oSize/1024).toFixed(1)} KB → ${(mSize/1024).toFixed(1)} KB  (${savings}%)`);
    }

    // Copy static files (only for dist/ mode)
    if (!process.argv.includes('--inplace')) {
        for (const fname of STATIC_FILES) {
            const src = path.join(ROOT, fname);
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, path.join(DIST, fname));
                console.log(`  ${fname} — copied`);
            }
        }
    }

    console.log(`\n📊 Total: ${(totalOrig/1024).toFixed(0)} KB → ${(totalMin/1024).toFixed(0)} KB  (saved ${((totalOrig-totalMin)/1024).toFixed(0)} KB, ${(((totalOrig-totalMin)/totalOrig)*100).toFixed(0)}%)`);
    if (process.argv.includes('--inplace')) {
        console.log('📝 Source files updated in-place. Originals saved as *.orig');
        console.log('💡 To restore: delete any .html file and rename .html.orig back');
    } else {
        console.log(`📁 Output: ${DIST}`);
    }

    return true;
}

function getAllFiles(dir, ext) {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
            results.push(...getAllFiles(full, ext));
        } else if (entry.name.endsWith(ext)) {
            results.push(full);
        }
    }
    return results;
}

function updateLaunchJSON() {
    if (!fs.existsSync(LAUNCH_JSON)) {
        console.log('⚠️  .claude/launch.json not found, skipping');
        return;
    }

    const config = JSON.parse(fs.readFileSync(LAUNCH_JSON, 'utf-8'));
    let changed = false;

    for (const cfg of config.configurations || []) {
        const args = cfg.runtimeArgs || [];
        const newArgs = args.map(arg => {
            if (arg === ROOT || arg === ROOT.replace(/\\/g, '/')) {
                changed = true;
                return DIST;
            }
            return arg;
        });
        if (changed) cfg.runtimeArgs = newArgs;
    }

    if (changed) {
        fs.writeFileSync(LAUNCH_JSON, JSON.stringify(config, null, 2) + '\n');
        console.log('✅  Updated .claude/launch.json to serve from dist/');
    }
}

// ─── Main ───

if (build()) {
    updateLaunchJSON();
}

if (process.argv.includes('--serve')) {
    console.log('\n🚀 Starting preview server at http://localhost:3000');
    execSync(`npx serve "${DIST}" -p 3000 --no-clipboard`, { stdio: 'inherit' });
}
