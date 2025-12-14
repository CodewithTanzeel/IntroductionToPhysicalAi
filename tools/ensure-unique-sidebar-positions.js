import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_ROOT = path.resolve(__dirname, '../docs/docs');
const DRY_RUN = process.argv.includes('--dry-run');
const START_AT = 1;
const VERBOSE = process.argv.includes('--verbose');

function parseFrontmatter(text) {
  const fmMatch = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!fmMatch) return { frontmatter: {}, body: text, raw: null };
  const raw = fmMatch[0];
  const fmBlock = fmMatch[1];
  const body = text.slice(raw.length);

  const frontmatter = {};
  for (const line of fmBlock.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_\-]+)\s*:\s*(.*)$/);
    if (m) {
      const key = m[1].trim();
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith('\'') && val.endsWith('\''))) {
        val = val.slice(1, -1);
      }
      if (/^\d+$/.test(val)) val = Number(val);
      else if (val === 'true') val = true;
      else if (val === 'false') val = false;
      frontmatter[key] = val;
    }
  }
  return { frontmatter, body, raw };
}

function serializeFrontmatter(frontmatter, body) {
  const lines = Object.entries(frontmatter).map(([k, v]) => {
    if (typeof v === 'string') return `${k}: "${v}"`;
    return `${k}: ${v}`;
  });
  return `---\n${lines.join('\n')}\n---\n\n${body}`;
}

async function listMarkdownFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      const sub = await listMarkdownFiles(full);
      out.push(...sub);
    } else if (e.isFile() && (e.name.endsWith('.md') || e.name.endsWith('.mdx'))) {
      out.push(full);
    }
  }
  return out;
}

function groupByFolder(files) {
  const map = new Map();
  for (const f of files) {
    const folder = path.dirname(f);
    if (!map.has(folder)) map.set(folder, []);
    map.get(folder).push(f);
  }
  return map;
}

async function ensureUniquePositions() {
  console.log(`Scanning: ${DOCS_ROOT}`);
  const files = await listMarkdownFiles(DOCS_ROOT);
  console.log(`Found ${files.length} markdown files`);

  const byFolder = groupByFolder(files);
  let changes = 0;

  for (const [folder, fileList] of byFolder.entries()) {
    const parsed = [];
    for (const fp of fileList) {
      const text = await fs.readFile(fp, 'utf8');
      const { frontmatter, body } = parseFrontmatter(text);
      parsed.push({ fp, frontmatter, body });
    }

    const sorted = [...parsed].sort((a, b) => a.fp.localeCompare(b.fp));
    const used = new Set();
    const desired = new Map();

    for (const { fp, frontmatter } of sorted) {
      const pos = frontmatter.sidebar_position;
      if (typeof pos === 'number' && !used.has(pos)) {
        desired.set(fp, pos);
        used.add(pos);
      }
    }

    let nextPos = START_AT;
    for (const { fp } of sorted) {
      if (!desired.has(fp)) {
        while (used.has(nextPos)) nextPos++;
        desired.set(fp, nextPos);
        used.add(nextPos);
        nextPos++;
      }
    }

    for (const item of parsed) {
      const targetPos = desired.get(item.fp);
      const currentPos = item.frontmatter.sidebar_position;
      if (currentPos !== targetPos) {
        item.frontmatter.sidebar_position = targetPos;
        const newText = serializeFrontmatter(item.frontmatter, item.body);
        if (DRY_RUN) {
          console.log(`[DRY] ${path.relative(DOCS_ROOT, item.fp)}: ${currentPos} -> ${targetPos}`);
        } else {
          await fs.writeFile(item.fp, newText, 'utf8');
          if (VERBOSE) console.log(`[SET] ${path.relative(DOCS_ROOT, item.fp)}: ${currentPos} -> ${targetPos}`);
        }
        changes++;
      }
    }
  }

  console.log(DRY_RUN ? 'Dry run finished.' : `Applied ${changes} changes.`);
}

ensureUniquePositions().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
