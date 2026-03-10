import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { TerminalSquare, Search, Filter, RefreshCw, Command, Server } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

const POLLING_INTERVAL_MS = 5000;

export default function LogsViewer() {
  const [searchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);

  // Servers list (persists in MongoDB — survives logout)
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(() => searchParams.get('instance_id') || 'ALL');

  // Filters
  const [level, setLevel] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const bottomRef = useRef(null);

  // Load server list once on mount
  useEffect(() => {
    api.get('/servers').then(res => {
      setServers(res.data.data || []);
    }).catch(console.error);
  }, []);

  // Sync dropdown with URL param when navigating via sidebar
  useEffect(() => {
    const id = searchParams.get('instance_id') || 'ALL';
    setSelectedServer(id);
  }, [searchParams]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (level !== 'ALL') params.set('level', level);
      if (selectedServer !== 'ALL') params.set('instance_id', selectedServer);

      const res = await api.get(`/logs?${params.toString()}`);
      // Backend returns latest-first; reverse so newest is at bottom
      const reversedLogs = [...(res.data.data || [])].reverse();
      setLogs(reversedLogs);
    } catch (err) {
      console.error('Logs fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchLogs();
    let interval;
    if (isLive) {
      interval = setInterval(fetchLogs, POLLING_INTERVAL_MS);
    }
    return () => clearInterval(interval);
  }, [isLive, level, selectedServer]);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (isLive && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isLive]);

  // Client-side search filter (message/instanceId/logGroup)
  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      log.message?.toLowerCase().includes(q) ||
      log.instanceId?.toLowerCase().includes(q) ||
      log.logGroup?.toLowerCase().includes(q)
    );
  });

  const getLevelColor = (lvl) => {
    switch (lvl?.toUpperCase()) {
      case 'ERROR': case 'FATAL': return 'text-danger bg-danger/10 border-danger/20';
      case 'WARN': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'INFO': return 'text-primary bg-primary/10 border-primary/20';
      case 'DEBUG': return 'text-muted bg-surface-hover border-border';
      default: return 'text-gray-300 bg-surface-hover border-border';
    }
  };

  const selectedServerObj = servers.find(s => s.instanceId === selectedServer);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <TerminalSquare className="w-7 h-7 mr-3 text-primary" />
            Live Logs
          </h1>
          {selectedServerObj && (
            <p className="text-xs text-muted mt-1 ml-10">
              Showing logs for <span className="text-primary font-medium">{selectedServerObj.instanceName}</span>
              <span className="text-muted/60 ml-1">({selectedServerObj.instanceId})</span>
            </p>
          )}
        </div>

        <button
          onClick={() => setIsLive(!isLive)}
          className={clsx(
            "px-4 py-2 rounded-lg text-sm font-medium border flex items-center transition-colors",
            isLive
              ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
              : "bg-surface border-border text-muted hover:text-white"
          )}
        >
          <RefreshCw className={clsx("w-4 h-4 mr-2", isLive && "animate-spin")} />
          {isLive ? 'Polling Active' : 'Polling Paused'}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex space-x-3 shrink-0">
        {/* Server Picker */}
        <div className="relative w-56">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Server className="w-4 h-4 text-muted" />
          </div>
          <select
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
            value={selectedServer}
            onChange={(e) => setSelectedServer(e.target.value)}
          >
            <option value="ALL">All Servers</option>
            {servers.map(s => (
              <option key={s._id} value={s.instanceId}>
                {s.instanceName || s.instanceId}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-muted" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Search by message, instance ID, or log group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Level Filter */}
        <div className="relative w-44">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Filter className="w-4 h-4 text-muted" />
          </div>
          <select
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="ALL">All Levels</option>
            <option value="ERROR">Errors</option>
            <option value="WARN">Warnings</option>
            <option value="INFO">Info</option>
            <option value="DEBUG">Debug</option>
          </select>
        </div>
      </div>

      {/* Terminal View */}
      <div className="flex-1 overflow-hidden bg-[#0A0E17] border border-border rounded-xl shadow-inner font-mono text-sm relative flex flex-col">
        <div className="overflow-y-auto flex-1 p-4 space-y-2 no-scrollbar">
          {loading && logs.length === 0 ? (
            <div className="text-muted text-center py-10">Loading log streams...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-muted text-center py-10 flex flex-col items-center">
              <Command className="w-8 h-8 opacity-20 mb-2" />
              No logs matching the current filters.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log._id} className="flex items-start group hover:bg-white/[0.02] -mx-4 px-4 py-1 rounded transition-colors">
                <div className="w-32 shrink-0 text-muted/60 select-none mr-4">
                  {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                </div>
                <div className="w-20 shrink-0 select-none mr-3">
                  <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold border", getLevelColor(log.level))}>
                    {log.level?.toUpperCase() || 'SYS'}
                  </span>
                </div>
                <div className="w-48 shrink-0 text-primary/70 select-none mr-3 truncate" title={log.logGroup}>
                  {log.logGroup?.split('-').slice(2).join('-') || log.logGroup}
                </div>
                <div className="flex-1 text-gray-300 break-words whitespace-pre-wrap leading-relaxed">
                  {log.message}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
