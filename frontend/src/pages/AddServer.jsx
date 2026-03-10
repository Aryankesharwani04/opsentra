import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import {
  Server, Copy, Check, Terminal, ChevronRight, CheckCircle2,
  ExternalLink, ArrowLeft, Shield
} from 'lucide-react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';

const steps = [
  { id: 1, title: 'Attach IAM Role', icon: Shield, desc: 'Grant EC2 CloudWatch access' },
  { id: 2, title: 'Install Agent', icon: Terminal, desc: 'Run script on the instance' },
  { id: 3, title: 'Done', icon: CheckCircle2, desc: 'Server registered' },
];

export default function AddServer() {
  const [step, setStep] = useState(1);
  const [servers, setServers] = useState([]);
  const [installCommand, setInstallCommand] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [srvRes, cmdRes] = await Promise.all([
          api.get('/servers'),
          api.get('/agent/install-command'),
        ]);
        setServers(srvRes.data.data || []);
        setInstallCommand(cmdRes.data.data);
      } catch (err) {
        console.error('Failed to load', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCopy = () => {
    const cmd = installCommand?.install_command;
    if (!cmd) return;
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) return <div className="text-muted p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <Server className="w-7 h-7 mr-3 text-primary" />
            Add New Server
          </h1>
          <p className="text-muted text-sm mt-1">
            Follow these two steps to start monitoring another EC2 instance.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="relative flex items-start">
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-border -z-10" />
        <div
          className="absolute top-6 left-6 h-0.5 bg-primary -z-10 transition-all duration-500"
          style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
        />
        <div className="flex justify-between w-full">
          {steps.map(s => {
            const Icon = s.icon;
            const done = step > s.id;
            const current = step === s.id;
            return (
              <div key={s.id} className="flex flex-col items-center bg-background px-4">
                <div className={clsx(
                  'w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-300',
                  done ? 'bg-primary border-primary text-white' :
                    current ? 'bg-surface border-primary text-primary' :
                      'bg-surface border-border text-muted'
                )}>
                  {done ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                </div>
                <p className={clsx('text-sm font-semibold mt-2', current || done ? 'text-white' : 'text-muted')}>
                  {s.title}
                </p>
                <p className="text-xs text-muted hidden sm:block">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-surface border border-border rounded-xl shadow-xl overflow-hidden min-h-[360px]">
        <div className="p-8">

          {/* ── STEP 1: IAM ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-white mb-2">
                Step 1: Attach an IAM Role to your EC2 Instance
              </h2>
              <p className="text-muted text-sm mb-6">
                The CloudWatch agent on your EC2 instance needs permission to publish logs to AWS CloudWatch.
                Attach an IAM role with the <code className="text-primary bg-primary/10 px-1 rounded">CloudWatchAgentServerPolicy</code> policy.
              </p>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
                <ol className="list-decimal list-inside space-y-4 text-sm text-gray-300">
                  <li>
                    Open the{' '}
                    <a href="https://console.aws.amazon.com/ec2" target="_blank" rel="noreferrer"
                      className="text-primary hover:underline inline-flex items-center">
                      EC2 Console <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </li>
                  <li>Select the EC2 instance you want to monitor.</li>
                  <li>Click <strong>Actions → Security → Modify IAM role</strong>.</li>
                  <li>
                    Attach or create a role that includes the{' '}
                    <code className="text-primary bg-primary/10 px-1 rounded text-xs">CloudWatchAgentServerPolicy</code> managed policy.
                  </li>
                  <li>Click <strong>Update IAM role</strong> to save.</li>
                </ol>
              </div>

              <p className="text-xs text-muted border-l-2 border-border pl-3 mb-8">
                If you already have an IAM role with this policy attached, you can skip directly to the next step.
              </p>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm font-medium flex items-center"
                >
                  IAM is attached — Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: INSTALL ──────────────────────────────────── */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-white mb-2">
                Step 2: Run the Install Script on your EC2 Instance
              </h2>
              <p className="text-muted text-sm mb-6">
                SSH into your EC2 instance and run the command below. It installs the CloudWatch agent, configures it for Opsentra, and automatically registers the instance.
              </p>

              <div className="relative mb-6">
                <pre className="w-full bg-background border border-border rounded-lg p-5 overflow-x-auto text-sm text-primary font-mono whitespace-pre-wrap break-all pr-14">
                  {installCommand?.install_command || 'Loading command...'}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-4 right-4 p-2 bg-surface hover:bg-surface-hover border border-border rounded-md text-muted hover:text-white transition-colors"
                  title="Copy"
                >
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {installCommand?.agent_steps?.length > 0 && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg mb-8">
                  <h4 className="text-sm font-medium text-white mb-2">What this script does:</h4>
                  <ul className="text-sm text-muted space-y-1 list-disc list-inside">
                    {installCommand.agent_steps.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium border border-border text-muted hover:text-white transition-colors flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm font-medium flex items-center"
                >
                  Script run — Mark Done <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: DONE ─────────────────────────────────────── */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Setup Complete!</h2>
              <p className="text-muted text-sm max-w-md mx-auto mb-8">
                Your EC2 instance should appear in the Servers list below shortly after the script finishes. Click on it in the sidebar to view its live logs.
              </p>
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium border border-border text-muted hover:text-white transition-colors"
              >
                + Add Another Server
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Registered Servers Table */}
      {servers.length > 0 && (
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-background/50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Registered Instances</h2>
            <span className="text-xs text-muted bg-surface px-2 py-1 rounded border border-border">
              Total: {servers.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Instance ID</th>
                  <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
                  <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Region</th>
                  <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {servers.map(server => (
                  <tr key={server._id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-sm text-white">{server.instanceId}</td>
                    <td className="py-4 px-6 text-sm text-white">{server.instanceName || '—'}</td>
                    <td className="py-4 px-6 text-sm text-muted">{server.region}</td>
                    <td className="py-4 px-6">
                      <span className={clsx(
                        'inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border',
                        server.status === 'running'
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-muted/10 text-muted border-border'
                      )}>
                        <span className={clsx('w-1.5 h-1.5 rounded-full mr-1.5',
                          server.status === 'running' ? 'bg-success' : 'bg-muted'
                        )} />
                        {server.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Link
                        to={`/logs?instance_id=${server.instanceId}`}
                        className="text-xs text-primary hover:underline flex items-center"
                      >
                        View Logs <ChevronRight className="w-3 h-3 ml-0.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
