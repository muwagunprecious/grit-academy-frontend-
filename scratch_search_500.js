import fs from 'fs';
import path from 'path';

function searchDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.next')) {
      searchDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css') || fullPath.endsWith('.json'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('500') || line.includes('₦500')) {
          console.log(`FOUND in [${fullPath}:${idx + 1}]: ${line.trim()}`);
        }
      });
    }
  }
}

searchDirectory('c:/Users/TINGO-AI-010/Documents/grit-academy-frontend-');
