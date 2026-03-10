'use strict';

/**
 * websocketService — Real-time dashboard log streaming via WebSocket.
 *
 * Attaches a WebSocket server to the existing HTTP server.
 * Clients authenticate with a JWT token and subscribe to a workspace channel.
 *
 * Protocol:
 *  Connection URL:
 *    ws://host/ws?token=<jwt>&workspace_id=<id>
 *
 *  Server → Client messages:
 *    { type: 'connected',   workspaceId, message }
 *    { type: 'log',         data: <LogEntry>       }
 *    { type: 'ping',        ts }
 *    { type: 'error',       message }
 *
 *  Client → Server messages:
 *    { type: 'ping' }   — keep-alive
 *    { type: 'subscribe',   workspaceId }
 *    { type: 'unsubscribe', workspaceId }
 */

const { WebSocketServer, OPEN } = require('ws');
const { verifyAccessToken } = require('../services/tokenService');
const { subscribeToWorkspace, unsubscribeFromWorkspace, getCachedLatestLogs } = require('./logStreamService');
const logger = require('../utils/logger');

const PING_INTERVAL_MS = 30_000; // 30 s keep-alive ping
const MAX_SUBSCRIPTIONS_PER_CLIENT = 5;

let wss = null;

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Send a structured JSON message to a WebSocket client.
 * Silently drops the send if the socket is no longer open.
 */
const sendMessage = (ws, payload) => {
  if (ws.readyState === OPEN) {
    try {
      ws.send(JSON.stringify(payload));
    } catch (err) {
      logger.debug(`[WebSocket] sendMessage failed: ${err.message}`);
    }
  }
};

/**
 * Authenticate WebSocket connection via JWT in the query string.
 * Returns the decoded token payload or null on failure.
 */
const authenticateConnection = (req) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');
    if (!token) return null;
    return verifyAccessToken(token);
  } catch {
    return null;
  }
};

/**
 * Extract workspaceId from the WebSocket upgrade request URL.
 */
const extractWorkspaceId = (req) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    return url.searchParams.get('workspace_id') || null;
  } catch {
    return null;
  }
};

// ── Connection handler ────────────────────────────────────────────

/**
 * Handle a new WebSocket connection.
 *
 * @param {import('ws').WebSocket} ws
 * @param {import('http').IncomingMessage} req
 */
const handleConnection = async (ws, req) => {
  // 1. Authenticate
  const user = authenticateConnection(req);
  if (!user) {
    sendMessage(ws, { type: 'error', message: 'Unauthorized: invalid or missing token' });
    ws.close(4001, 'Unauthorized');
    return;
  }

  const initialWorkspaceId = extractWorkspaceId(req);

  // Attach metadata to the socket object
  ws.userId = user.sub;
  ws.userRole = user.role;
  ws.subscriptions = new Map(); // workspaceId → unsubscribe fn
  ws.isAlive = true;

  logger.info(`[WebSocket] Client connected — userId: ${ws.userId}`);

  // 2. Auto-subscribe to the requested workspace if provided
  if (initialWorkspaceId) {
    await subscribeClient(ws, initialWorkspaceId);
  }

  // 3. Wire up client message handling
  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      await handleClientMessage(ws, msg);
    } catch (err) {
      sendMessage(ws, { type: 'error', message: 'Invalid message format' });
    }
  });

  // 4. Handle disconnect — clean up all subscriptions
  ws.on('close', () => {
    for (const [workspaceId, unsubscribe] of ws.subscriptions) {
      unsubscribe();
      logger.debug(`[WebSocket] Cleaned up subscription: ${workspaceId} for user ${ws.userId}`);
    }
    ws.subscriptions.clear();
    logger.info(`[WebSocket] Client disconnected — userId: ${ws.userId}`);
  });

  ws.on('error', (err) => {
    logger.error(`[WebSocket] Socket error for user ${ws.userId}: ${err.message}`);
  });

  // Keep-alive pong handler
  ws.on('pong', () => { ws.isAlive = true; });
};

// ── Client subscription management ───────────────────────────────

/**
 * Subscribe a WebSocket client to a workspace log channel.
 * Sends cached recent logs immediately on subscribe.
 *
 * @param {import('ws').WebSocket} ws
 * @param {string} workspaceId
 */
const subscribeClient = async (ws, workspaceId) => {
  if (ws.subscriptions.has(workspaceId)) {
    sendMessage(ws, { type: 'error', message: `Already subscribed to workspace ${workspaceId}` });
    return;
  }

  if (ws.subscriptions.size >= MAX_SUBSCRIPTIONS_PER_CLIENT) {
    sendMessage(ws, { type: 'error', message: `Max subscriptions (${MAX_SUBSCRIPTIONS_PER_CLIENT}) reached` });
    return;
  }

  // Subscribe to the Redis pub/sub channel — forward events to this WebSocket
  const unsubscribe = subscribeToWorkspace(workspaceId, (logEvent) => {
    sendMessage(ws, { type: 'log', data: logEvent });
  });

  ws.subscriptions.set(workspaceId, unsubscribe);

  sendMessage(ws, {
    type: 'connected',
    workspaceId,
    message: `Subscribed to logs:${workspaceId}`,
    ts: Date.now(),
  });

  // Send cached recent logs as initial payload
  const cached = await getCachedLatestLogs(workspaceId);
  if (cached.length > 0) {
    sendMessage(ws, {
      type: 'history',
      workspaceId,
      data: cached,
      count: cached.length,
    });
  }

  logger.info(`[WebSocket] User ${ws.userId} subscribed to workspace ${workspaceId}`);
};

/**
 * Unsubscribe a WebSocket client from a workspace.
 * @param {import('ws').WebSocket} ws
 * @param {string} workspaceId
 */
const unsubscribeClient = (ws, workspaceId) => {
  const unsubscribe = ws.subscriptions.get(workspaceId);
  if (unsubscribe) {
    unsubscribe();
    ws.subscriptions.delete(workspaceId);
    sendMessage(ws, { type: 'unsubscribed', workspaceId });
    logger.info(`[WebSocket] User ${ws.userId} unsubscribed from workspace ${workspaceId}`);
  }
};

// ── Client message dispatcher ─────────────────────────────────────

const handleClientMessage = async (ws, msg) => {
  switch (msg.type) {
    case 'ping':
      ws.isAlive = true;
      sendMessage(ws, { type: 'pong', ts: Date.now() });
      break;

    case 'subscribe':
      if (!msg.workspaceId) {
        sendMessage(ws, { type: 'error', message: 'workspaceId required for subscribe' });
        break;
      }
      await subscribeClient(ws, msg.workspaceId);
      break;

    case 'unsubscribe':
      if (msg.workspaceId) unsubscribeClient(ws, msg.workspaceId);
      break;

    default:
      sendMessage(ws, { type: 'error', message: `Unknown message type: ${msg.type}` });
  }
};

// ── Lifecycle ─────────────────────────────────────────────────────

/**
 * Attach the WebSocket server to an existing HTTP server.
 * @param {import('http').Server} httpServer
 */
const attach = (httpServer) => {
  if (wss) {
    logger.warn('[WebSocket] Server already attached.');
    return wss;
  }

  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', handleConnection);
  wss.on('error', (err) => logger.error(`[WebSocket] Server error: ${err.message}`));

  // Keep-alive heartbeat — ping all clients every 30s, close dead ones
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        logger.debug(`[WebSocket] Terminating dead connection — userId: ${ws.userId}`);
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, PING_INTERVAL_MS);

  // Clean up heartbeat when server closes
  wss.on('close', () => clearInterval(heartbeat));

  logger.info('[WebSocket] ✅ WebSocket server attached at /ws');
  return wss;
};

/**
 * Broadcast a message to all clients subscribed to a workspace.
 * @param {string} workspaceId
 * @param {object} payload
 */
const broadcast = (workspaceId, payload) => {
  if (!wss) return;
  const message = JSON.stringify(payload);

  for (const ws of wss.clients) {
    if (ws.readyState === OPEN && ws.subscriptions?.has(workspaceId)) {
      ws.send(message);
    }
  }
};

/**
 * Get current WebSocket server stats.
 */
const getStats = () => ({
  totalConnections: wss?.clients?.size ?? 0,
});

const detach = () => {
  if (wss) {
    wss.close();
    wss = null;
    logger.info('[WebSocket] Server detached.');
  }
};

module.exports = { attach, broadcast, getStats, detach };
