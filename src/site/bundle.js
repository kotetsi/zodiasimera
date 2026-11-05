// Μικρός bundler: ενώνει ES modules του src/ σε ένα script για τον browser,
// ώστε η σελίδα να μη χρειάζεται εξωτερικά αρχεία ή βιβλιοθήκες.
import { readFileSync } from 'node:fs';
import { join, dirname, normalize, relative } from 'node:path';

export function bundle(srcRoot, entry, call) {
  const order = [];
  const seen = new Set();
  const key = (abs) => relative(srcRoot, abs).replace(/\\/g, '/').replace(/\.js$/, '');
  const visit = (abs) => {
    if (seen.has(abs)) return;
    seen.add(abs);
    const code = readFileSync(abs, 'utf8');
    for (const m of code.matchAll(/^import[^'"]*from\s+['"](.+?)['"];?$/gm)) visit(normalize(join(dirname(abs), m[1])));
    order.push({ abs, code });
  };
  visit(join(srcRoot, entry));

  const modules = order.map(({ abs, code }) => {
    const exports = [];
    let body = code.replace(/^import\s+(.+?)\s+from\s+['"](.+?)['"];?$/gm, (_, what, from) => {
      const dep = `__m[${JSON.stringify(key(normalize(join(dirname(abs), from))))}]`;
      if (what.startsWith('* as ')) return `const ${what.slice(5)} = ${dep};`;
      if (what.startsWith('{')) return `const ${what.replace(/\s+as\s+/g, ': ')} = ${dep};`;
      return `const ${what} = ${dep}.default;`;
    });
    body = body.replace(/^export\s+(async\s+)?function\s+(\w+)/gm, (_, a, n) => { exports.push(n); return `${a || ''}function ${n}`; });
    body = body.replace(/^export\s+(const|let)\s+(\w+)/gm, (_, k, n) => { exports.push(n); return `${k} ${n}`; });
    body = body.replace(/^export\s+default\s+/m, () => { exports.push('default: __default'); return 'const __default = '; });
    body = body.replace(/^export\s+\{[^}]*\};?$/gm, '');
    return `__m[${JSON.stringify(key(abs))}] = (() => {\n${body}\nreturn { ${exports.join(', ')} };\n})();`;
  });
  return `(() => {\nconst __m = {};\n${modules.join('\n')}\n${call}\n})();`;
}
