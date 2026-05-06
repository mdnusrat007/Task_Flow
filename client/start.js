const { execSync } = require('child_process');
const path = require('path');

// Get the port from environment variable, default to 3000 for local development
const port = process.env.PORT || 3000;

// Use serve to serve the dist folder on the correct port
const serveCommand = `npx serve -s dist -l ${port}`;

console.log(`Starting serve on port ${port}...`);
console.log(`Command: ${serveCommand}`);

try {
  execSync(serveCommand, {
    stdio: 'inherit',
    cwd: __dirname
  });
} catch (error) {
  console.error('Failed to start serve:', error);
  process.exit(1);
}