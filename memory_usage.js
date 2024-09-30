const { exec } = require('child_process');
const Table = require('cli-table');

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  const k = 1024;
  const sizes = ['KB', 'MB', 'GB', 'TB'];
  let i = -1;
  do {
    bytes /= k;
    i++;
  } while (bytes >= k && i < sizes.length - 1);
  return `${bytes.toFixed(2)} ${sizes[i]}`;
};

const fetchAndDisplayMemoryUsage = () => {
  exec('free -b', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }

    const lines = stdout.trim().split('\n');
    const headers = lines[0].split(/\s+/).map(header => header.charAt(0).toUpperCase() + header.slice(1));
    const data = lines[1].split(/\s+/);

    const table = new Table({
      head: ['Type', 'Total', 'Used', 'Free', 'Shared', 'Buff/Cache', 'Available']
    });

    const total = formatBytes(parseInt(data[1], 10));
    const used = formatBytes(parseInt(data[2], 10));
    const free = formatBytes(parseInt(data[3], 10));
    const shared = formatBytes(parseInt(data[4], 10));
    const buffCache = formatBytes(parseInt(data[5], 10));
    const available = formatBytes(parseInt(data[6], 10));

    table.push(['Memory', total, used, free, shared, buffCache, available]);

    console.log(table.toString());
  });
};

// Check for the --live argument
const args = process.argv.slice(2);
const isLive = args.includes('--live');

if (isLive) {
  // Run the script every 5 seconds (5000 ms)
  setInterval(fetchAndDisplayMemoryUsage, 5000);
  // Initial run
  fetchAndDisplayMemoryUsage();
} else {
  // Run the script once
  fetchAndDisplayMemoryUsage();
}
