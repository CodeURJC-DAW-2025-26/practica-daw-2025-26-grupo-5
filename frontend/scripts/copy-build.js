import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve paths
const sourceDir = path.join(__dirname, '../build/client');
const targetDir = path.join(__dirname, '../../backend/src/main/resources/static/new');

// Create target directory recursively
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy files recursively
function copyDir(src, dest) {
  ensureDir(dest);

  const files = fs.readdirSync(src);

  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

try {
  ensureDir(targetDir);
  copyDir(sourceDir, targetDir);
  console.log(`✓ Build copied from ${sourceDir} to ${targetDir}`);
} catch (error) {
  console.error('Error copying build files:', error);
  process.exit(1);
}
