const { exec } = require('child_process');
const blessed = require('blessed');
const contrib = require('blessed-contrib');

// Create a screen object for the terminal UI
const screen = blessed.screen();

// Create a grid layout
const grid = new contrib.grid({ rows: 12, cols: 9, screen: screen });  // Adjusting columns to leave space for legend

// Line chart to display active connection trends over time
const line = grid.set(0, 0, 6, 9, contrib.line, {
    label: 'Traffic Over Time (Connections)',
    showLegend: true,  // Show built-in legend for now
    maxY: 100,  // Adjust based on expected traffic
    style: { baseline: 'black' },
    wholeNumbersOnly: true,  // Ensure Y-axis only shows whole numbers
    showNthLabel: 1,  // Show all labels on X-axis
});

// Table to display current active connections
const table = grid.set(6, 0, 5, 9, contrib.table, {
    keys: true,
    fg: 'white',
    label: 'Current Active Connections',
    columnWidth: [20, 20, 15],
});

// Custom Legend Box (hidden by default)
let legendVisible = true;
const legend = blessed.box({
    top: '0',  // Position at the top
    right: '0',  // Position at the right
    width: 'shrink',  // Dynamic width based on content
    height: 'shrink',  // Dynamic height based on content
    content: `{yellow-fg}●{/yellow-fg} Total Connections\n{red-fg}●{/red-fg} HTTP (80)\n{green-fg}●{/green-fg} HTTPS (443)\n{blue-fg}●{/blue-fg} MySQL (3306)\n{magenta-fg}●{/magenta-fg} FTP (21)`,
    tags: true,  // Allows color tags in the content
    border: { type: 'line' },
    style: {
        fg: 'white',
        border: { fg: 'gray' },
    },
    hidden: false,  // Initially visible
});

// Key bindings box at the bottom
const keyBindings = blessed.box({
    bottom: 0,
    height: 2,
    left: 'center',
    width: 'shrink',  // Make the width dynamic based on content
    content: '^Q Quit | l Toggle Legend | a Toggle Alerts',
    tags: true,
    style: {
        fg: 'white',
        border: { fg: 'gray' },
    },
});

// Append legend and keybindings to the screen
screen.append(legend);
screen.append(keyBindings);

// Initialize empty arrays for chart data
let trafficTimestamps = [];
let totalConnections = [];
let httpData = [];
let httpsData = [];
let mysqlData = [];
let ftpData = [];

// Function to initialize the chart with placeholder data
const initializeChart = () => {
    line.setData([
        { title: 'Total Connections', x: trafficTimestamps, y: totalConnections, style: { line: 'yellow' } },
        { title: 'HTTP', x: trafficTimestamps, y: httpData, style: { line: 'red' } },
        { title: 'HTTPS', x: trafficTimestamps, y: httpsData, style: { line: 'green' } },
        { title: 'MySQL', x: trafficTimestamps, y: mysqlData, style: { line: 'blue' } },
        { title: 'FTP', x: trafficTimestamps, y: ftpData, style: { line: 'magenta' } },
    ]);
    screen.render();  // Force initial render to display chart axes
};

// Toggle the legend with the 'l' key
screen.key(['l'], () => {
    legendVisible = !legendVisible;
    if (legendVisible) {
        legend.show();
    } else {
        legend.hide();
    }
    screen.render();  // Re-render the screen after toggling the legend
});

// Function to monitor network traffic for relevant services
const getTraffic = () => {
    const services = {
        'http': '80',
        'https': '443',
        'mysql': '3306',
        'ftp': '21',
    };

    const servicePromises = Object.entries(services).map(([name, port]) => {
        return new Promise((resolve, reject) => {
            exec(`ss -tan | grep ":${port}" | wc -l`, (error, stdout) => {
                if (error) return reject(error);
                const count = parseInt(stdout.trim(), 10) || 0;
                resolve({ name, count });
            });
        });
    });

    return Promise.all(servicePromises)
        .then(results => {
            let totalActiveConnections = 0;
            const currentData = {};

            results.forEach(({ name, count }) => {
                totalActiveConnections += count;
                currentData[name] = count;
            });

            const timestamp = new Date().toLocaleTimeString();
            trafficTimestamps.push(timestamp);
            if (trafficTimestamps.length > 60) trafficTimestamps.shift();  // Limit to last 60 entries

            httpData.push(currentData.http);
            httpsData.push(currentData.https);
            mysqlData.push(currentData.mysql);
            ftpData.push(currentData.ftp);
            totalConnections.push(totalActiveConnections);

            if (httpData.length > 60) {
                httpData.shift();
                httpsData.shift();
                mysqlData.shift();
                ftpData.shift();
                totalConnections.shift();
            }

            // Update the chart with new data
            line.setData([
                { title: 'Total Connections', x: trafficTimestamps, y: totalConnections, style: { line: 'yellow' } },
                { title: 'HTTP', x: trafficTimestamps, y: httpData, style: { line: 'red' } },
                { title: 'HTTPS', x: trafficTimestamps, y: httpsData, style: { line: 'green' } },
                { title: 'MySQL', x: trafficTimestamps, y: mysqlData, style: { line: 'blue' } },
                { title: 'FTP', x: trafficTimestamps, y: ftpData, style: { line: 'magenta' } },
            ]);

            // Update the table with the latest connection data
            table.setData({
                headers: ['Service', 'Port', 'Connections'],
                data: [
                    ['HTTP', '80', currentData.http],
                    ['HTTPS', '443', currentData.https],
                    ['MySQL', '3306', currentData.mysql],
                    ['FTP', '21', currentData.ftp],
                    ['Total', '-', totalActiveConnections],
                ]
            });

            screen.render();  // Render the chart and table after updating data
        })
        .catch(error => {
            console.error(`Error fetching traffic data: ${error.message}`);
        });
};

// Function to monitor bandwidth usage using `nload`
const getBandwidth = () => {
    exec('sudo nload > /dev/null 2>&1', (error) => {
        if (error) {
            console.error(`Error executing bandwidth monitor: ${error.message}`);
        }
    });
};

// Set an interval to refresh traffic data every 5 seconds
setInterval(() => {
    getTraffic();
}, 5000);

// Handle bandwidth monitoring separately every 60 seconds
setInterval(getBandwidth, 60000);

// Exit handling: Quit on 'q', 'Ctrl+C', or 'Escape'
screen.key(['q', 'C-c', 'escape'], function () {
    screen.destroy();  // Clean up the terminal
    process.exit(0);
});

// Initialize the chart with placeholder data at the start
initializeChart();

// Fetch initial traffic and bandwidth data
getTraffic();
getBandwidth();
