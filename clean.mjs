import fs from 'fs';
import path from 'path';

function cleanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      cleanDir(fullPath);
    } else if (entry.name.includes(',toolAction')) {
      const cleanName = entry.name.split(',toolAction')[0];
      const newPath = path.join(dir, cleanName);
      fs.renameSync(fullPath, newPath);
      console.log(`Renamed: ${entry.name} -> ${cleanName}`);
    }
  }
}

cleanDir(path.join(process.cwd(), 'inertia-export'));
console.log('Cleanup completed successfully.');
