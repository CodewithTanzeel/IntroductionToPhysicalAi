import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import path from 'path';

/**
 * Fix LaTeX syntax in markdown files
 * Converts \( ... \) to $ ... $ (inline)
 * Converts \[ ... \] to $$ ... $$ (display)
 */
async function fixLatexSyntax() {
  const docsDir = path.join(process.cwd(), 'docs');
  const files = await glob('**/*.md', { cwd: docsDir, absolute: true });
  
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
