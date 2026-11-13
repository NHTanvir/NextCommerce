// Lists the built route stylesheets so the client can warm them into cache
// after first paint. Runs after the Workers build, because the file names
// are content hashes that only exist once the build has run.
import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const assets = new URL('../.open-next/assets/', import.meta.url).pathname;
const cssDir = join(assets, '_next/static/css');

const files = (await readdir(cssDir)).filter((f) => f.endsWith('.css')).sort();
const manifest = files.map((f) => `/_next/static/css/${f}`);

await writeFile(join(assets, 'css-manifest.json'), JSON.stringify(manifest));
console.log(`css-manifest.json: ${manifest.length} stylesheets`);
