const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');

// Create build directory
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy source files to build
const srcDir = path.join(__dirname, '..', 'src');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js') && !f.includes('.test.'));

files.forEach(file => {
  fs.copyFileSync(path.join(srcDir, file), path.join(buildDir, file));
});

// Generate build info
const buildInfo = {
  name: 'mbb-mobileapp',
  version: '1.0.0',
  platform: 'iOS',
  buildTime: new Date().toISOString(),
  nodeVersion: process.version,
  files: files
};

fs.writeFileSync(path.join(buildDir, 'build-info.json'), JSON.stringify(buildInfo, null, 2));

console.log('Build completed successfully!');
console.log(`Output: ${buildDir}`);
console.log(`Files: ${files.join(', ')}`);
