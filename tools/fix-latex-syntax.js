import { readFile, writeFile, readdir, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fix LaTeX syntax in markdown files
 * Converts \( ... \) to $ ... $ (inline)
 * Converts \[ ... \] to $$ ... $$ (display)
 */

async function findMarkdownFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function fixLatexSyntax() {
  const docsDir = path.join(__dirname, '..', 'docs', 'docs');
  const files = await findMarkdownFiles(docsDir);

  let totalFixed = 0;

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    let fixed = content;

    // Replace display math: \[ ... \] with $$ ... $$
    fixed = fixed.replace(/\\\[/g, '$$');
    fixed = fixed.replace(/\\\]/g, '$$');

    // Replace inline math: \( ... \) with $ ... $
    fixed = fixed.replace(/\\\(/g, '$');
    fixed = fixed.replace(/\\\)/g, '$');

    if (fixed !== content) {
      await writeFile(file, fixed, 'utf-8');
      console.log(`✓ Fixed ${path.relative(docsDir, file)}`);
      totalFixed++;
    }
  }

  console.log(`\n✅ Fixed LaTeX syntax in ${totalFixed} files`);
}

fixLatexSyntax().catch(console.error);
