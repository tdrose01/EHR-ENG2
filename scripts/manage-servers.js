const { spawn, exec } = require('child_process');
const path = require('path');

// Function to execute npm scripts
function runNpmScript(script) {
    return new Promise((resolve, reject) => {
        exec(`npm run ${script}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running ${script}:`, error);
                reject(error);
                return;
            }
            console.log(stdout);
            resolve();
        });
    });
}

// Function to start both servers
async function startServers() {
    try {
        // Start the backend server
        console.log('Starting backend server...');
        const backendServer = spawn('npm', ['run', 'start:server'], {
            stdio: 'inherit',
            shell: true
        });

        // Start the frontend dev server
        console.log('Starting frontend server...');
        const frontendServer = spawn('npm', ['run', 'dev'], {
            stdio: 'inherit',
            shell: true
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            console.log('\nStopping servers...');
            try {
                await runNpmScript('stop:server');
                process.exit(0);
            } catch (error) {
                console.error('Error stopping servers:', error);
                process.exit(1);
            }
        });

        console.log('\nBoth servers are running. Press Ctrl+C to stop.');
    } catch (error) {
        console.error('Error starting servers:', error);
        process.exit(1);
    }
}

// Function to stop both servers
async function stopServers() {
    try {
        console.log('Stopping servers...');
        await runNpmScript('stop:server');
        console.log('Servers stopped successfully.');
    } catch (error) {
        console.error('Error stopping servers:', error);
        process.exit(1);
    }
}

// Handle command line arguments
const command = process.argv[2];
if (command === 'start') {
    startServers();
} else if (command === 'stop') {
    stopServers();
} else {
    console.log('Usage: node manage-servers.js [start|stop]');
    process.exit(1);
} 