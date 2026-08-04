import fs from 'fs';
import path from 'path';

function findFiles(dir, ext) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, ext));
    } else if (file.endsWith(ext)) {
      results.push(filePath);
    }
  }
  return results;
}

const files = findFiles('./src', '.tsx');
const results = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  // Very basic regex to find elements that look like a button or have onClick
  // This isn't a full AST parser but works well enough for an audit
  const onClickRegex = /<(Button|button|Card|div|a)[^>]*onClick=\{([^}]+)\}/g;
  const noOnClickRegex = /<(Button|button)[^>]*(?<!onClick={.*?})>/g;

  let match;
  while ((match = onClickRegex.exec(content)) !== null) {
    const tag = match[1];
    let handler = match[2].trim();
    // find line number
    const upToMatch = content.substring(0, match.index);
    const lineNum = upToMatch.split('\n').length;
    
    // Determine if it's empty/dummy
    let status = 'Implemented';
    if (handler === '() => {}' || handler === '()=>{}') {
      status = 'Empty function';
    } else if (handler.includes('console.log')) {
      status = 'Console.log only';
    } else if (handler.includes('alert(')) {
      status = 'Alert only';
    }
    
    results.push({
      file: path.relative('./src', file),
      line: lineNum,
      tag: tag,
      handlerPreview: handler.substring(0, 50).replace(/\n/g, ' '),
      status: status
    });
  }
});

// Write markdown report
let md = '# Reporte de Auditoría de Botones y Clicks\n\n';
md += '| Archivo | Línea | Elemento | Estado | Vista Previa del Handler |\n';
md += '|---|---|---|---|---|\n';

results.sort((a, b) => {
  if (a.status !== b.status) return a.status.localeCompare(b.status);
  return a.file.localeCompare(b.file);
}).forEach(r => {
  md += `| ${r.file} | ${r.line} | \`<${r.tag}>\` | **${r.status}** | \`${r.handlerPreview}\` |\n`;
});

fs.writeFileSync('./scratch/button_audit_report.md', md);
console.log(`Audited ${files.length} files. Found ${results.length} click handlers. Report saved to scratch/button_audit_report.md`);
