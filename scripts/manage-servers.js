const { spawn } = require('child_process');
const path = require('path');

// Function to start a server and wait for a success message
function startServer(command, successMessage, options = {}) {
    return new Promise((resolve, reject) => {
        const serverProcess = spawn(command, {
            ...options,
            shell: true,
            stdio: ['pipe', 'pipe', 'pipe'], // Use pipes to capture stdio
        });

        let output = '';
        const onData = (data) => {
            const chunk = data.toString();
            output += chunk;
            console.log(chunk); // Log output in real-time

            // Check for success message
            if (chunk.includes(successMessage)) {
                resolve(serverProcess);
            }
        };

        serverProcess.stdout.on('data', onData);
        serverProcess.stderr.on('data', onData);

        // Timeout to prevent hanging
        const timeout = setTimeout(() => {
            reject(new Error(`Timeout waiting for server to start with command: ${command}`));
            serverProcess.kill();
        }, 60000); // 60-second timeout

        serverProcess.on('close', (code) => {
            clearTimeout(timeout);
            if (code !== 0) {
                reject(new Error(`Server process exited with code ${code}. Full output:\n${output}`));
            }
        });
    });
}

// Main function to start both servers
async function start() {
    let backendProcess;
    let frontendProcess;

    try {
        console.log('Starting backend server...');
        backendProcess = await startServer('npm run start:server', 'Database connected successfully');
        console.log('✅ Backend server started successfully.');

        console.log('Starting frontend server...');
        frontendProcess = await startServer('npm run dev', 'ready in');
        console.log('✅ Frontend server started successfully.');

        console.log('\n🚀 Both servers are running. Press Ctrl+C to stop.');

    } catch (error) {
        console.error('❌ Error starting servers:', error.message);
        if (backendProcess) backendProcess.kill();
        if (frontendProcess) frontendProcess.kill();
        process.exit(1);
    }

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\nStopping servers...');
        if (backendProcess) backendProcess.kill();
        if (frontendProcess) frontendProcess.kill();
        console.log('Servers stopped.');
        process.exit(0);
    });
}

// Function to stop servers (using kill-port for reliability)
async function stop() {
    console.log('Stopping servers via kill-port...');
    try {
        const { exec } = require('child_process');
        await new Promise((resolve, reject) => {
            exec('npx kill-port 3000 && npx kill-port 5173', (err, stdout, stderr) => {
                if (err) {
                    // Don't reject if ports weren't running, just log it
                    console.warn('Could not kill ports (they may not have been running):', stderr);
                }
                console.log(stdout);
                resolve();
            });
        });
        console.log('✅ Servers stopped.');
    } catch (error) {
        console.error('❌ Error stopping servers:', error);
        process.exit(1);
    }
}


// Handle command line arguments
const command = process.argv[2];
if (command === 'start') {
    start();
} else if (command === 'stop') {
    stop();
} else {
    console.log('Usage: node scripts/manage-servers.js [start|stop]');
    process.exit(1);
}