import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { TerminalSquare, Search, Filter, RefreshCw, Command } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

const POLLING_INTERVAL_MS = 5000;

export default function LogsViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  
  // Filters
  const [level, setLevel] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  const bottomRef = useRef(null);

  const fetchLogs = async () => {
    try {
      // we query the paginated general logs route
      // or /logs/recent for just throwing everything
      const res = await api.get('/logs/recent?limit=100');
      
      // /logs/recent returns them latest first (descending).
      // We reverse them so bottom is newest.
      const reversedLogs = [...res.data.data].reverse();
      setLogs(reversedLogs);
    } catch (err) {
      console.error('Logs fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    let interval;
    if (isLive) {
      interval = setInterval(fetchLogs, POLLING_INTERVAL_MS);
    }
    
    return () => clearInterval(interval);
  }, [isLive]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isLive && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isLive]);

  // Filter implementation
  const filteredLogs = logs.filter(log => {
    if (level !== 'ALL' && log.level?.toUpperCase() !== level) return false;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        log.message.toLowerCase().includes(lowerSearch) ||
        log.instanceId?.toLowerCase().includes(lowerSearch) ||
        log.logGroup?.toLowerCase().includes(lowerSearch)
      );
    }
    return true;
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

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <TerminalSquare className="w-7 h-7 mr-3 text-primary" />
            Live Logs
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
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
      </div>

      <div className="flex space-x-4 shrink-0">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-4 h-4 text-muted" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Search logs via message, instance ID, or group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-48">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
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
