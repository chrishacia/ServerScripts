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

const fetchAndDisplayDiskUsage = () => {
  exec('df -k --output=source,fstype,size,used,avail,pcent,target', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }

    const lines = stdout.trim().split('\n');
    const headers = lines[0].split(/\s+/);
    const data = lines.slice(1).map(line => line.split(/\s+/));

    const table = new Table({
      head: headers.map(header => header.charAt(0).toUpperCase() + header.slice(1))
    });

    data.forEach(line => {
      const source = line[0];
      const fstype = line[1];
      const size = formatBytes(parseInt(line[2], 10) * 1024); // Convert KB to bytes
      const used = formatBytes(parseInt(line[3], 10) * 1024); // Convert KB to bytes
      const avail = formatBytes(parseInt(line[4], 10) * 1024); // Convert KB to bytes
      const pcent = line[5];
      const target = line[6];
      table.push([source, fstype, size, used, avail, pcent, target]);
    });

    console.log(table.toString());
  });
};

// Check for the --live argument
const args = process.argv.slice(2);
const isLive = args.includes('--live');

if (isLive) {
  // Run the script every 5 seconds (5000 ms)
  setInterval(fetchAndDisplayDiskUsage, 5000);
  // Initial run
  fetchAndDisplayDiskUsage();
} else {
  // Run the script once
  fetchAndDisplayDiskUsage();
}
