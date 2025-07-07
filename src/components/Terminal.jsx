import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

const LinuxTerminal = () => {
    const terminalRef = useRef(null);
    const socketRef = useRef(null);
    const xtermRef = useRef(null);
    const [isMounted, setIsMounted] = useState(false);

    // Log window location only once when component mounts
    useEffect(() => {
        console.log("Window location:", {
            protocol: window.location.protocol,
            hostname: window.location.hostname,
            port: window.location.port,
            href: window.location.href
        });
    }, []);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    useEffect(() => {
        // Ensure DOM is fully mounted
        if (!isMounted || !terminalRef.current) return;

        const xterm = new Terminal({
            cursorBlink: true,
            fontFamily: "'Courier New', monospace",
            fontSize: 14,
            theme: {
                background: "#1e1e1e",
                foreground: "#f0f0f0",
                cursor: "#00ff00",
                selection: "rgba(0, 255, 0, 0.3)"
            },
            allowProposedApi: true,
            cols: 80,
            rows: 24
        });

        xtermRef.current = xterm;
        xterm.open(terminalRef.current);

        try {
            // Use hardcoded URL for now to eliminate variables
            const wsUrl = "wss://opsentra.onrender.com";
            console.log("Connecting to WebSocket:", wsUrl);
            
            socketRef.current = new WebSocket(wsUrl);
            
            // Add detailed error logging
            socketRef.current.onerror = (error) => {
                console.error("Detailed WebSocket error:", error);
                const message = `
\x1b[31m───────────────────────────────\x1b[0m
\x1b[31mWebSocket Connection Failed!\x1b[0m
\x1b[33mReason: ${error.message || 'Unknown error'}
\x1b[36mTrying to connect to: ${wsUrl}
\x1b[35mPlease check:
1. Backend server is running
2. Port 5001 is accessible
3. No firewall restrictions
\x1b[31m───────────────────────────────\x1b[0m
`;
                xterm.write(message);
            };
            
            socketRef.current.onopen = () => {
                xterm.writeln("\x1b[32mConnected to terminal server\x1b[0m");
                xterm.writeln(`\x1b[33mConnected to: ${wsUrl}\x1b[0m`);
                xterm.focus();
                
                setTimeout(() => {
                    if (xterm.element) {
                        xterm.resize(80, 24);
                        xterm.refresh(0, xterm.rows - 1);
                    }
                }, 100);
            };

            socketRef.current.onmessage = (e) => {
                xterm.write(e.data);
            };

            socketRef.current.onclose = (event) => {
                let message = "\x1b[31mDisconnected from server\x1b[0m\r\n";
                if (event.code === 1006) {
                    message = "\x1b[31mConnection failed (1006). Check server status\x1b[0m\r\n";
                }
                xterm.write(message);
            };

            xterm.onData((data) => {
                if (socketRef.current?.readyState === WebSocket.OPEN) {
                    socketRef.current.send(data);
                } else {
                    xterm.write("\x1b[33mReconnecting...\x1b[0m\r\n");
                    setTimeout(() => {
                        socketRef.current = new WebSocket(wsUrl);
                    }, 2000);
                }
            });

            const handleResize = () => {
                if (xterm.element) {
                    const dims = xterm.element.getBoundingClientRect();
                    const cols = Math.max(40, Math.floor(dims.width / 9));
                    const rows = Math.max(10, Math.floor(dims.height / 17));
                    xterm.resize(cols, rows);
                }
            };

            window.addEventListener('resize', handleResize);
            setTimeout(handleResize, 500);

            return () => {
                window.removeEventListener('resize', handleResize);
                if (socketRef.current) {
                    socketRef.current.close();
                }
                xterm.dispose();
            };
            
        } catch (error) {
            console.error("Terminal initialization error:", error);
            if (xtermRef.current) {
                xtermRef.current.write("\x1b[31mTerminal initialization failed\x1b[0m\r\n");
            }
        }

    }, [isMounted]);

    return (
        <div className="terminal-container" style={{ height: "100%" }}>
            <div 
                ref={terminalRef} 
                style={{ 
                    height: "500px", 
                    width: "100%",
                    backgroundColor: "#1e1e1e",
                    padding: "10px",
                    boxSizing: "border-box",
                    display: "block"
                }}
            />
        </div>
    );
};

export default LinuxTerminal;