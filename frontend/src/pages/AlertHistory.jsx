import { useState, useEffect } from 'react';
import api from '../lib/api';
import {
  BellRing, ChevronDown, ChevronUp, RefreshCw,
  Bot, Terminal, FileText, X, Copy, Check,
  AlertTriangle, Clock, Wrench, ShieldCheck, TerminalSquare,
} from 'lucide-react';
import clsx from 'clsx';
import { formatDistanceToNow, format } from 'date-fns';

// ── Severity styles ───────────────────────────────────────────────
const SEVERITY_STYLES = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/30',
  high:     'text-orange-400 bg-orange-400/10 border-orange-400/30',
  medium:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
};

// ── Incident Report Modal ─────────────────────────────────────────
function ReportModal({ report, onClose }) {
  const [copied, setCopied] = useState(false);

  const severityStyle = SEVERITY_STYLES[report.severity] || SEVERITY_STYLES.high;

  const handleCopy = () => {
    const text = buildPlainText(report);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f0f0f] border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* Modal header */}
        <div className="flex items-start justify-between p-6 border-b border-border shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={clsx('px-2.5 py-1 rounded-md text-xs font-bold border uppercase', severityStyle)}>
                {report.severity}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-primary/70 bg-primary/10 px-2 py-1 rounded">
                <Bot className="w-3 h-3" /> Gemini 2.0 Flash
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{report.title}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-sm text-muted hover:text-white transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal body — scrollable */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6 no-scrollbar">

          {/* Timeline */}
          {report.timeline?.length > 0 && (
            <section>
              <SectionHeader icon={Clock} title="Timeline" />
              <div className="space-y-2 mt-3">
                {report.timeline.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <span className="shrink-0 text-xs font-mono text-primary/80 w-20 pt-0.5">{item.time}</span>
                    <div className="flex-1 flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                      <p className="text-sm text-gray-300">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Root Cause */}
          <section>
            <SectionHeader icon={AlertTriangle} title="Root Cause" />
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">{report.rootCause}</p>
          </section>

          {/* Impact */}
          {report.impact && (
            <section>
              <SectionHeader icon={BellRing} title="Impact" />
              <p className="mt-3 text-sm text-gray-300 leading-relaxed">{report.impact}</p>
            </section>
          )}

          {/* Prevention steps */}
          {report.preventionSteps?.length > 0 && (
            <section>
              <SectionHeader icon={ShieldCheck} title="Prevention Steps" />
              <ol className="mt-3 space-y-2">
                {report.preventionSteps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Recommended commands */}
          {report.commands?.length > 0 && (
            <section>
              <SectionHeader icon={TerminalSquare} title="Recommended Commands" />
              <div className="mt-3 space-y-3">
                {report.commands.map((cmd, i) => (
                  <div key={i} className="rounded-lg border border-border bg-[#0A0E17] p-3">
                    <p className="text-xs text-muted mb-1.5">{cmd.description}</p>
                    <code className="text-sm text-green-400 font-mono break-all">{cmd.command}</code>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-primary/70" />
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h3>
    </div>
  );
}

function buildPlainText(report) {
  const lines = [
    `INCIDENT REPORT — ${report.title}`,
    `SEVERITY: ${report.severity?.toUpperCase()}`,
    '',
    'TIMELINE',
    ...(report.timeline || []).map(t => `  ${t.time}  ${t.event}`),
    '',
    'ROOT CAUSE',
    report.rootCause,
    '',
    'IMPACT',
    report.impact,
    '',
    'PREVENTION STEPS',
    ...(report.preventionSteps || []).map((s, i) => `  ${i + 1}. ${s}`),
    '',
    'RECOMMENDED COMMANDS',
    ...(report.commands || []).map(c => `  # ${c.description}\n  ${c.command}`),
    '',
    `Generated by Opsentra + Gemini 2.0 Flash`,
  ];
  return lines.join('\n');
}

// ── Alert Card ────────────────────────────────────────────────────
function AlertCard({ alert }) {
  const [expanded, setExpanded]     = useState(false);
  const [generating, setGenerating] = useState(false);
  const [report, setReport]         = useState(null);
  const [reportError, setReportError] = useState(null);

  const hasAi = !!alert.aiCause;
  const severityStyle = SEVERITY_STYLES[alert.aiSeverity] || SEVERITY_STYLES.high;

  const handleGenerateReport = async (e) => {
    e.stopPropagation();
    setGenerating(true);
    setReportError(null);
    try {
      const res = await api.post(`/alerts/${alert._id}/report`);
      setReport(res.data.data);
    } catch (err) {
      setReportError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      {report && <ReportModal report={report} onClose={() => setReport(null)} />}

      <div className="bg-surface border border-border rounded-xl overflow-hidden transition-all">
        {/* Header row */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-hover transition-colors text-left"
        >
          <div className="flex items-center gap-4 min-w-0">
            <span className={clsx(
              'shrink-0 px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wide',
              severityStyle,
            )}>
              {alert.aiSeverity || 'error'}
            </span>
            <span className="shrink-0 text-sm font-semibold text-white">
              {alert.errorCount} error{alert.errorCount !== 1 ? 's' : ''}
            </span>
            {hasAi && (
              <span className="text-sm text-muted truncate hidden sm:block">{alert.aiCause}</span>
            )}
            {hasAi && (
              <span className="shrink-0 flex items-center gap-1 text-xs text-primary/70 bg-primary/10 px-2 py-0.5 rounded">
                <Bot className="w-3 h-3" /> AI
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0 ml-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted">{formatDistanceToNow(new Date(alert.firedAt), { addSuffix: true })}</p>
              <p className="text-xs text-muted/50">{format(new Date(alert.firedAt), 'MMM d, HH:mm:ss')}</p>
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
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
                {alert.aiSummary && <p className="text-sm text-gray-300">{alert.aiSummary}</p>}
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

            {/* Sample logs */}
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

            {/* Meta + Generate Report button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
                <span>Email: <span className="text-white">{alert.emailSentTo || '—'}</span></span>
                <span>Queued: <span className={alert.emailQueued ? 'text-green-400' : 'text-red-400'}>{alert.emailQueued ? 'Yes' : 'No'}</span></span>
                <span>Time: <span className="text-white">{format(new Date(alert.firedAt), 'PPpp')}</span></span>
              </div>

              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                    generating
                      ? 'opacity-60 cursor-not-allowed bg-surface border-border text-muted'
                      : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20',
                  )}
                >
                  {generating ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
                  ) : (
                    <><FileText className="w-4 h-4" /> Generate Incident Report</>
                  )}
                </button>
                {reportError && (
                  <p className="text-xs text-red-400">{reportError}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
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
            Every alert fired for your workspace — with AI analysis &amp; incident reports
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
          <span className="text-sm text-muted">Page {page} of {meta.totalPages}</span>
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
