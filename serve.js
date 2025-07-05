#!/usr/bin/env node
/**
 * Simple HTTP server for serving the Ricochet game locally using Node.js.
 * This solves the ES6 module CORS issues when running on Linux.
 *
 * Usage:
 *     node serve.js [port]
 *     ./serve.js [port]
 *
 * Default port is 8000
 *
 * Prerequisites:
 *     - Node.js installed
 *     - No additional dependencies required (uses built-in modules)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const DEFAULT_PORT = 8000;
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.txt': 'text/plain',
    '.md': 'text/markdown'
};

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return MIME_TYPES[ext] || 'application/octet-stream';
}

function serveFile(req, res, filePath) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head><title>404 Not Found</title></head>
                        <body>
                            <h1>404 - File Not Found</h1>
                            <p>The requested file <code>${req.url}</code> was not found.</p>
                            <p><a href="/">Back to index</a></p>
                        </body>
                    </html>
                `);
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Server Error: ${err.message}`);
            }
            return;
        }

        const mimeType = getMimeType(filePath);
        res.writeHead(200, {
            'Content-Type': mimeType,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'no-cache' // Disable caching for development
        });
        res.end(data);
    });
}

function createServer(port) {
    const server = http.createServer((req, res) => {
        // Handle CORS preflight requests
        if (req.method === 'OPTIONS') {
            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            res.end();
            return;
        }

        // Parse URL
        let urlPath = req.url;
        if (urlPath === '/') {
            urlPath = '/index-modular.html'; // Default to modular version
        }

        // Security: prevent directory traversal
        if (urlPath.includes('..')) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Forbidden: Directory traversal not allowed');
            return;
        }

        // Convert URL path to file path
        const filePath = path.join(__dirname, urlPath);

        // Check if file exists and is within the project directory
        const projectDir = path.resolve(__dirname);
        const resolvedPath = path.resolve(filePath);

        if (!resolvedPath.startsWith(projectDir)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Forbidden: Access outside project directory not allowed');
            return;
        }

        // Serve the file
        serveFile(req, res, filePath);
    });

    return server;
}

function openBrowser(url) {
    const commands = {
        'linux': 'xdg-open',
        'darwin': 'open',
        'win32': 'start'
    };

    const command = commands[process.platform];
    if (command) {
        const child = spawn(command, [url], {
            detached: true,
            stdio: 'ignore'
        });
        child.unref();
        return true;
    }
    return false;
}

function main() {
    // Get port from command line or use default
    let port = DEFAULT_PORT;
    if (process.argv.length > 2) {
        const portArg = parseInt(process.argv[2]);
        if (isNaN(portArg) || portArg < 1 || portArg > 65535) {
            console.error(`❌ Error: Invalid port number '${process.argv[2]}'. Using default port ${DEFAULT_PORT}.`);
        } else {
            port = portArg;
        }
    }

    // Create and start server
    const server = createServer(port);

    server.listen(port, 'localhost', () => {
        console.log('🎮 Ricochet Game Server (Node.js)');
        console.log(`📁 Serving directory: ${__dirname}`);
        console.log(`🌐 Server running at: http://localhost:${port}`);
        console.log('📄 Game URLs:');
        console.log(`   • Original:     http://localhost:${port}/index.html`);
        console.log(`   • Modular:      http://localhost:${port}/index-modular.html`);
        console.log(`   • Level Editor: http://localhost:${port}/level-parser-demo.html`);
        console.log('⚡ Press Ctrl+C to stop the server');
        console.log();

        // Auto-open browser after a short delay
        setTimeout(() => {
            const url = `http://localhost:${port}/index-modular.html`;
            if (openBrowser(url)) {
                console.log('🚀 Opened game in default browser');
            } else {
                console.log('⚠️  Could not auto-open browser');
                console.log('📝 Manually open the URL above in your browser');
            }
        }, 1000);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Error: Port ${port} is already in use`);
            console.error(`💡 Try a different port: node serve.js ${port + 1}`);
        } else {
            console.error(`❌ Error starting server: ${err.message}`);
        }
        process.exit(1);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Server stopped by user');
        server.close(() => {
            process.exit(0);
        });
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Server terminated');
        server.close(() => {
            process.exit(0);
        });
    });
}

// Make the script executable
if (require.main === module) {
    main();
}

module.exports = { createServer, getMimeType };
