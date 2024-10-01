const blessed = require('blessed');

// Create a screen object for the terminal UI
const screen = blessed.screen();

// Display a simple message
const box = blessed.box({
    top: 'center',
    left: 'center',
    width: '100%',
    height: '100%',
    content: 'Press "q", "Ctrl+C", or "Escape" to quit...',
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'black'
    }
});

// Append the box to the screen
screen.append(box);

// Listen for key press and exit the program
screen.key(['q', 'C-c', 'escape'], function () {
    console.log('Exiting...');
    process.exit(0);
});

// Render the screen
screen.render();
