require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { WebSocketServer } = require("ws"); // Changed import
const { spawn } = require("child_process");
const os = require("os");

const connectDB = require("./config/db");
const awsRoutes = require("./routes/awsRoutes");
const authRoutes = require("./routes/authRoutes");
const oauthRoutes = require("./routes/oauth");
const newsletterRoutes = require("./routes/newsletterRoutes");
const terminalRoutes = require("./routes/terminalRoutes");

const app = express();
const server = http.createServer(app);

// Create WebSocket server with CORS support
const wss = new WebSocketServer({
    server,
    clientTracking: true,
    perMessageDeflate: false,
    verifyClient: (info, cb) => {
        const origin = info.origin || 'unknown-origin';
        console.log(`Connection attempt from: ${origin}`);
        // Allow all connections (for development)
        cb(true);
    }
});

// WebSocket server error handling
wss.on('error', (error) => {
    console.error('🔥 WebSocket Server Error:', error);
});
// HTTP server error handling
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error('❌ Port 5001 is already in use!');
        console.log('Try:');
        console.log('1. Change PORT in .env file');
        console.log('2. Find and kill the process:');
        console.log('   -> Windows: netstat -ano | findstr :5001');
        console.log('   -> Mac/Linux: lsof -i :5001');
    } else {
        console.error('Server error:', error);
    }
});

// Add CORS headers for WebSocket
wss.on('headers', (headers) => {
    headers.push('Access-Control-Allow-Origin: *');
    headers.push('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
});

// Security settings from .env
const TERMINAL_TIMEOUT = parseInt(process.env.TERMINAL_TIMEOUT) || 300; // seconds
const BLOCKED_COMMANDS = (process.env.BLOCKED_COMMANDS || '')
    .split(',')
    .map(cmd => cmd.trim());
const MAX_SESSIONS = parseInt(process.env.MAX_SESSIONS) || 5;

// Track active sessions
const activeSessions = new Map();

// Middlewares
app.use(cors({
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/aws", awsRoutes);
app.use("/api", oauthRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/terminal", terminalRoutes);

// WebSocket Terminal Setup
wss.on("connection", (ws, req) => {
    console.log("✅ New connection received!");
    ws.send("Backend connected successfully\r\n");
    // Improved IP extraction (works behind proxies)
    const clientIp = req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        'unknown';

    // Session management
    const clientSessions = activeSessions.get(clientIp) || new Set();

    // Enforce max sessions
    if (clientSessions.size >= MAX_SESSIONS) {
        ws.send("\x1b[31mError: Maximum sessions reached. Disconnecting...\x1b[0m\r\n");
        ws.close(1008, "Too many sessions");
        return;
    }

    console.log(`✅ New terminal connection from ${clientIp}`);

    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    const terminalProcess = spawn(shell, [], {
        cwd: process.env.HOME || process.env.USERPROFILE,
        env: process.env,
        shell: true
    });

    // Add to active sessions
    clientSessions.add(ws);
    activeSessions.set(clientIp, clientSessions);

    // Send initial welcome message
    ws.send("\x1b[32mConnected to terminal server\x1b[0m\r\n");
    ws.send(`\x1b[33mClient IP: ${clientIp}\x1b[0m\r\n`);
    ws.send(`\x1b[34mSession timeout: ${TERMINAL_TIMEOUT}s\x1b[0m\r\n\r\n`);

    // Timeout handler
    let timeout = setTimeout(() => {
        ws.send("\x1b[31mSession timed out due to inactivity. Disconnecting...\x1b[0m\r\n");
        ws.close(1000, "Session timeout");
    }, TERMINAL_TIMEOUT * 1000);

    const resetTimeout = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            ws.send("\x1b[31mSession timed out due to inactivity. Disconnecting...\x1b[0m\r\n");
            ws.close(1000, "Session timeout");
        }, TERMINAL_TIMEOUT * 1000);
    };

    // Handle data from terminal
    const sendToClient = (data) => {
        try {
            resetTimeout();
            ws.send(data.toString());
        } catch (e) {
            console.log('⚠️ Client disconnected');
        }
    };

    terminalProcess.stdout.on("data", sendToClient);
    terminalProcess.stderr.on("data", sendToClient);

    // Handle client input
    ws.on('message', (command) => {
        resetTimeout();
        const cmdString = command.toString();

        // Check for blocked commands
        const isBlocked = BLOCKED_COMMANDS.some(blockedCmd =>
            cmdString.trim().toLowerCase().includes(blockedCmd.toLowerCase())
        );

        if (isBlocked) {
            const warning = `\x1b[31mBlocked command: ${cmdString.trim()}\x1b[0m\r\n`;
            ws.send(warning);
            console.log(`❌ Blocked dangerous command from ${clientIp}: ${cmdString}`);
            return;
        }

        terminalProcess.stdin.write(command);
    });

    // Cleanup on disconnect
    ws.on('close', () => {
        clearTimeout(timeout);
        console.log(`❌ Terminal connection closed from ${clientIp}`);

        try {
            terminalProcess.kill();
        } catch (e) {
            console.error('Error killing terminal process:', e);
        }

        // Remove from active sessions
        const sessions = activeSessions.get(clientIp);
        if (sessions) {
            sessions.delete(ws);
            if (sessions.size === 0) {
                activeSessions.delete(clientIp);
            }
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        websocket: wss.clients.size,
        sessions: activeSessions.size,
        timestamp: new Date().toISOString()
    });
});

// DB Connections
connectDB();
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ Connected to MongoDB cluster"))
    .catch(err => console.log("❌ MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ WebSocket server running on ws://localhost:${PORT}`);
    console.log(`✅ Terminal security settings:`);
    console.log(`   - Timeout: ${TERMINAL_TIMEOUT}s`);
    console.log(`   - Blocked commands: ${BLOCKED_COMMANDS.join(', ')}`);
    console.log(`   - Max sessions per IP: ${MAX_SESSIONS}`);
});