const { exec } = require('child_process');
const Table = require('cli-table');
const clear = require('clear');

// Function to format bytes to KB, MB, or GB
const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  const k = 1024;
  const sizes = ['KB', 'MB', 'GB'];
  let i = -1;
  do {
    bytes /= k;
    i++;
  } while (bytes >= k);
  return `${bytes.toFixed(2)} ${sizes[i]}`;
};

// Function to fetch and display the Node.js processes
const fetchAndDisplayProcesses = () => {
  exec('lsof -i -P -n | grep node', (error, stdout, stderr) => {
    if (error) {
      if (error.code === 1) { // No matching processes found
        console.log('No Node.js processes are running.');
        return;
      } else {
        console.error(`Error: ${error.message}`);
        return;
      }
    }

    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }

    const lines = stdout.split('\n').filter(line => line.length > 0);
    if (lines.length === 0) {
      console.log('No Node.js processes are running.');
      return;
    }

    const processes = lines.map(line => {
      const parts = line.split(/\s+/);
      const pid = parts[1];
      const user = parts[2];
      const port = parts.find(part => part.includes(':')).split(':').pop();
      return { pid, user, port };
    }).filter(proc => proc.port);

    // Remove duplicates based on PID
    const uniquePIDs = Array.from(new Set(processes.map(proc => proc.pid)));
    const uniqueProcesses = uniquePIDs.map(pid => processes.find(proc => proc.pid === pid));

    // Fetch more details for each unique process
    const fetchDetails = uniqueProcesses.map(proc => new Promise((resolve, reject) => {
      exec(`ps -p ${proc.pid} -o command=`, (err, cmdOut) => {
        if (err) {
          reject(err);
          return;
        }
        exec(`ps -p ${proc.pid} -o %mem=,rss=`, (memErr, memOut) => {
          if (memErr) {
            reject(memErr);
            return;
          }
          exec(`pwdx ${proc.pid}`, (pwdErr, pwdOut) => {
            if (pwdErr) {
              reject(pwdErr);
              return;
            }

            const memLines = memOut.trim().split(/\s+/);
            const memPercentage = memLines[0] ? memLines[0].trim() : 'N/A';
            const rssKB = memLines[1] ? parseInt(memLines[1].trim(), 10) : 0;
            const rssBytes = rssKB * 1024; // RSS in bytes
            const rssFormatted = formatBytes(rssBytes);

            proc.command = cmdOut.trim();
            proc.memory = `${memPercentage}% (${rssFormatted})`;
            proc.directory = pwdOut.split(': ')[1].trim();
            resolve(proc);
          });
        });
      });
    }));

    Promise.all(fetchDetails)
      .then(results => {
        // Clear the console
        clear();

        // Create a table
        const table = new Table({
          head: ['PID', 'User', 'Port', 'Command', 'Directory', 'Memory Usage']
        });

        results.forEach(proc => {
          table.push([proc.pid, proc.user, proc.port, proc.command, proc.directory, proc.memory]);
        });

        console.log(table.toString());
      })
      .catch(fetchError => console.error(`Error fetching process details: ${fetchError.message}`));
  });
};

// Check for the --live argument
const args = process.argv.slice(2);
const isLive = args.includes('--live');

if (isLive) {
  // Run the script every 5 seconds (5000 ms)
  setInterval(fetchAndDisplayProcesses, 5000);
  // Initial run
  fetchAndDisplayProcesses();
} else {
  // Run the script once
  fetchAndDisplayProcesses();
}
