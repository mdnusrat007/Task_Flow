const { spawn } = require('child_process');

// Read PORT from environment — Railway injects this automatically
const port = process.env.PORT || 3000;

console.log(`Starting serve on port ${port}...`);
console.log(`Command: npx serve -s dist -l ${port}`);

// Use spawn so signals (SIGTERM, etc.) are forwarded correctly to the child
const child = spawn('npx', ['serve', '-s', 'dist', '-l', String(port)], {
  stdio: 'inherit',
  cwd: __dirname,
});

child.on('error', (err) => {
  console.error('Failed to start serve:', err);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 1);
  }
});

// Forward Railway's shutdown signals to the child process
['SIGTERM', 'SIGINT'].forEach((sig) => {
  process.on(sig, () => child.kill(sig));
});
