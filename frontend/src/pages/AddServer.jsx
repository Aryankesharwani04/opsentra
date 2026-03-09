import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Server, Copy, Check, Terminal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

export default function AddServer() {
  const [servers, setServers] = useState([]);
  const [installCommand, setInstallCommand] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [serversRes, cmdRes] = await Promise.all([
          api.get('/servers'),
          api.get('/agent/install-command')
        ]);
        setServers(serversRes.data.data);
        setInstallCommand(cmdRes.data.data);
      } catch (err) {
        console.error('Failed to load servers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopy = () => {
    if (!installCommand) return;
    navigator.clipboard.writeText(installCommand.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="text-muted p-8">Loading servers...</div>;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
          <Server className="w-8 h-8 mr-3 text-primary" />
          Servers & Agents
        </h1>
        <p className="text-muted mt-2">Install the Opsentra agent on your servers to automatically forward system and app logs.</p>
      </div>

      {/* Agent Install Section */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-white mb-4">Install CloudWatch Agent</h2>
        <p className="text-sm text-muted mb-4">
          Run this command on your Ubuntu, Debian, Amazon Linux, or RHEL server as root. 
          It will install the AWS CloudWatch Agent, apply the Opsentra configuration, and register the server automatically.
        </p>
        
        <div className="relative mt-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Terminal className="w-5 h-5 text-muted" />
          </div>
          <pre className="w-full bg-background border border-border rounded-lg py-4 pl-12 pr-12 overflow-x-auto text-sm text-primary font-mono whitespace-pre-wrap break-all">
            {installCommand?.command || 'Loading command...'}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-1/2 -translate-y-1/2 right-3 p-2 bg-surface hover:bg-surface-hover border border-border rounded-md text-muted hover:text-white transition-colors"
            title="Copy command"
          >
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">What this script does:</h4>
          <ul className="text-sm text-muted space-y-1 list-disc list-inside">
            {installCommand?.agent_steps?.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Connected Servers */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-background/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Registered Instances</h2>
          <div className="text-xs text-muted font-medium bg-surface px-2 py-1 rounded border border-border">
            Total: {servers.length}
          </div>
        </div>
        
        {servers.length === 0 ? (
          <div className="p-8 text-center border-t border-border bg-surface">
            <p className="text-muted">No servers registered yet.</p>
            <p className="text-xs text-muted/70 mt-2">Run the install script on an EC2 instance to see it here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Instance ID</th>
                  <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
                  <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Log Group Prefix</th>
                  <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {servers.map((server) => (
                  <tr key={server._id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-sm text-white">
                      {server.instanceId}
                      <div className="text-xs text-muted mt-1">{server.region}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-white">{server.instanceName || '—'}</td>
                    <td className="py-4 px-6 text-xs text-muted font-mono">{server.logGroup}</td>
                    <td className="py-4 px-6">
                      <span className={clsx(
                        "inline-flex flex-col items-start px-2.5 py-1 rounded text-xs font-medium",
                        server.status === 'active' ? "bg-success/5 text-success border border-success/20" : "bg-muted/10 text-muted border border-border"
                      )}>
                        <div className="flex items-center">
                          <span className={clsx("w-1.5 h-1.5 rounded-full mr-1.5", 
                            server.status === 'active' ? 'bg-success' : 'bg-muted'
                          )}></span>
                          {server.status.toUpperCase()}
                        </div>
                        <div className="text-[10px] opacity-70 mt-0.5">
                          Seen {formatDistanceToNow(new Date(server.lastSeenAt), { addSuffix: true })}
                        </div>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted">
                      {new Date(server.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
