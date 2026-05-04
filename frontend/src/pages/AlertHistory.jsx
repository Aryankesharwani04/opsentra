import { useState, useEffect } from 'react';
import api from '../lib/api';
import { BellRing, ChevronDown, ChevronUp, RefreshCw, Bot, Terminal } from 'lucide-react';
import clsx from 'clsx';
import { formatDistanceToNow, format } from 'date-fns';

const SEVERITY_STYLES = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/30',
  high:     'text-orange-400 bg-orange-400/10 border-orange-400/30',
  medium:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
};

function AlertCard({ alert }) {
  const [expanded, setExpanded] = useState(false);
  const hasAi = !!alert.aiCause;
  const severityStyle = SEVERITY_STYLES[alert.aiSeverity] || SEVERITY_STYLES.high;

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden transition-all">
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-hover transition-colors text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          {/* Severity / error badge */}
          <span className={clsx(
            'shrink-0 px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wide',
            severityStyle
          )}>
            {alert.aiSeverity || 'error'}
          </span>

          {/* Error count */}
          <span className="shrink-0 text-sm font-semibold text-white">
            {alert.errorCount} error{alert.errorCount !== 1 ? 's' : ''}
          </span>

          {/* AI cause preview */}
          {hasAi && (
            <span className="text-sm text-muted truncate hidden sm:block">
              {alert.aiCause}
            </span>
          )}

          {/* AI badge */}
          {hasAi && (
            <span className="shrink-0 flex items-center gap-1 text-xs text-primary/70 bg-primary/10 px-2 py-0.5 rounded">
              <Bot className="w-3 h-3" /> AI
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0 ml-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted">
              {formatDistanceToNow(new Date(alert.firedAt), { addSuffix: true })}
            </p>
            <p className="text-xs text-muted/50">
              {format(new Date(alert.firedAt), 'MMM d, HH:mm:ss')}
            </p>
          </div>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-muted" />
            : <ChevronDown className="w-4 h-4 text-muted" />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-4">

          {/* AI Analysis block */}
          {hasAi && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <p className="text-xs font-semibold text-primary/70 uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" /> AI Analysis — Gemini 2.0 Flash
              </p>
              {alert.aiSummary && (
                <p className="text-sm text-gray-300">{alert.aiSummary}</p>
              )}
              <div>
                <p className="text-xs text-muted uppercase mb-1">Root Cause</p>
                <p className="text-sm text-white">{alert.aiCause}</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase mb-1">Suggested Fix</p>
                <code className="block bg-[#0A0E17] text-green-400 text-xs font-mono px-3 py-2 rounded border border-border">
                  {alert.aiFix}
                </code>
              </div>
            </div>
          )}

          {/* Sample log messages */}
          {alert.sampleMessages?.length > 0 && (
            <div>
              <p className="text-xs text-muted uppercase mb-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> Sample Logs
              </p>
              <div className="bg-[#0A0E17] rounded-lg border border-border p-3 space-y-1.5 font-mono text-xs">
                {alert.sampleMessages.map((msg, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-red-400 shrink-0">ERR</span>
                    <span className="text-gray-300 break-all">{msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted pt-1">
            <span>Email sent to: <span className="text-white">{alert.emailSentTo || '—'}</span></span>
            <span>Queued: <span className={alert.emailQueued ? 'text-green-400' : 'text-red-400'}>{alert.emailQueued ? 'Yes' : 'No'}</span></span>
            <span>Time: <span className="text-white">{format(new Date(alert.firedAt), 'PPpp')}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AlertHistory() {
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [page, setPage]       = useState(1);
  const [meta, setMeta]       = useState(null);

  const fetchAlerts = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/alerts?page=${p}&limit=20`);
      setAlerts(res.data.data || []);
      setMeta(res.data.meta || null);
      setPage(p);
    } catch (err) {
      setError('Failed to load alert history.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(1); }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <BellRing className="w-7 h-7 mr-3 text-primary" />
            Alert History
          </h1>
          <p className="text-sm text-muted mt-1 ml-10">
            Every alert fired for your workspace — with AI analysis
          </p>
        </div>
        <button
          onClick={() => fetchAlerts(page)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-sm text-muted hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Stats strip */}
      {meta && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-surface border border-border rounded-xl px-4 py-3">
            <p className="text-xs text-muted uppercase tracking-wider">Total Alerts</p>
            <p className="text-2xl font-bold text-white mt-1">{meta.total}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl px-4 py-3">
            <p className="text-xs text-muted uppercase tracking-wider">This Page</p>
            <p className="text-2xl font-bold text-white mt-1">{alerts.length}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl px-4 py-3">
            <p className="text-xs text-muted uppercase tracking-wider">AI Analysed</p>
            <p className="text-2xl font-bold text-primary mt-1">
              {alerts.filter(a => a.aiCause).length}
            </p>
          </div>
        </div>
      )}

      {/* Alert list */}
      {loading ? (
        <div className="text-center text-muted py-16">Loading alert history...</div>
      ) : error ? (
        <div className="text-center text-danger py-16">{error}</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <BellRing className="w-10 h-10 text-muted opacity-30" />
          <p className="text-muted">No alerts fired yet.</p>
          <p className="text-muted/50 text-sm">Alerts appear here when ERROR or FATAL logs are detected.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertCard key={alert._id} alert={alert} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-2">
          <button
            disabled={page <= 1 || loading}
            onClick={() => fetchAlerts(page - 1)}
            className="px-4 py-2 rounded-lg bg-surface border border-border text-sm text-muted hover:text-white disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-muted">
            Page {page} of {meta.totalPages}
          </span>
          <button
            disabled={page >= meta.totalPages || loading}
            onClick={() => fetchAlerts(page + 1)}
            className="px-4 py-2 rounded-lg bg-surface border border-border text-sm text-muted hover:text-white disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
