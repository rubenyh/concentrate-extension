// Bundles the extension into dist/ and, with --zip, packs dist/ into a store-ready zip.
import { build } from 'esbuild';
import { cpSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import { join, relative, sep } from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import { crc32, deflateRawSync } from 'node:zlib';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });

await build({
  entryPoints: {
    youtube: join(root, 'src/content/youtube.ts'),
    instagram: join(root, 'src/content/instagram.ts'),
    blocked: join(root, 'src/blocked.ts'),
    popup: join(root, 'src/popup.ts'),
  },
  outdir: dist,
  bundle: true,
  format: 'iife',
  target: 'chrome120',
  minify: false, // readable output eases Chrome Web Store review
  legalComments: 'none',
  logLevel: 'warning',
});

cpSync(join(root, 'static'), dist, { recursive: true });
cpSync(join(root, 'manifest.json'), join(dist, 'manifest.json'));

if (process.argv.includes('--zip')) {
  const { version } = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
  const out = join(root, `reels-shorts-blocker-${version}.zip`);
  writeFileSync(out, zip(dist));
  console.log(`Packed ${relative(root, out)}`);
}
console.log('Built dist/');

function listFiles(dir) {
  return readdirSync(dir)
    .sort()
    .flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? listFiles(path) : [path];
    });
}

// Minimal deterministic zip writer (deflate, fixed 1980-01-01 timestamps).
// ponytail: no zip64, fine while the extension stays far below 4 GB.
function zip(dir) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const file of listFiles(dir)) {
    const name = Buffer.from(relative(dir, file).split(sep).join('/'));
    const raw = readFileSync(file);
    const data = deflateRawSync(raw);
    const crc = crc32(raw);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(0x21, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(0x21, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, name, data);
    centrals.push(central, name);
    offset += local.length + name.length + data.length;
  }
  const centralSize = centrals.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(centrals.length / 2, 8);
  end.writeUInt16LE(centrals.length / 2, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, ...centrals, end]);
}
