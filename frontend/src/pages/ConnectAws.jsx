import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Cloud, Plus, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

export default function ConnectAws() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [roleArn, setRoleArn] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [alias, setAlias] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // CF Template state
  const [cfUrl, setCfUrl] = useState('');

  const fetchIntegrations = async () => {
    try {
      const res = await api.get('/aws');
      setIntegrations(res.data.data);
    } catch (err) {
      setError('Failed to load AWS integrations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCfTemplateUrl = async () => {
    try {
      const res = await api.get('/aws/template');
      setCfUrl(res.data.data.launchUrl);
    } catch (err) {
      console.error('Failed to get CF template URL', err);
    }
  };

  useEffect(() => {
    fetchIntegrations();
    fetchCfTemplateUrl();
  }, []);

  const handleConnect = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await api.post('/aws/connect', { roleArn, region, alias: alias || undefined });
      setRoleArn('');
      setAlias('');
      await fetchIntegrations(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to connect AWS account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-muted p-8">Loading integrations...</div>;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
          <Cloud className="w-8 h-8 mr-3 text-primary" />
          AWS Contexts
        </h1>
        <p className="text-muted mt-2">Connect your AWS accounts to ingest logs from CloudWatch.</p>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger flex items-center">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Connection Form */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-white mb-6">Connect New Account</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-medium text-white mb-2">1. Create IAM Role</h3>
            <p className="text-sm text-muted mb-4">
              We need a cross-account IAM role with permissions to read CloudWatch logs.
              The fastest way is to launch our CloudFormation stack.
            </p>
            {cfUrl && (
              <a 
                href={cfUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center px-4 py-2 bg-background border border-border hover:bg-surface-hover text-white rounded-lg transition-colors text-sm font-medium"
              >
                Launch CloudFormation Stack
                <ExternalLink className="w-4 h-4 ml-2 text-muted" />
              </a>
            )}
            <p className="text-xs text-muted mt-3">
              After creation, copy the generated Role ARN from the stack's Outputs tab.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white mb-2">2. Register Role ARN</h3>
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">Role ARN</label>
                <input 
                  type="text" 
                  required
                  placeholder="arn:aws:iam::123456789012:role/OpsentraRole"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-white text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  value={roleArn}
                  onChange={(e) => setRoleArn(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted mb-1">Region</label>
                  <select
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-white text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    <option value="us-east-1">us-east-1</option>
                    <option value="us-west-2">us-west-2</option>
                    <option value="eu-west-1">eu-west-1</option>
                    <option value="ap-south-1">ap-south-1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Alias (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Production"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-white text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting || !roleArn}
                className="w-full py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-md transition-colors text-sm font-medium"
              >
                {isSubmitting ? 'Verifying...' : 'Connect Account'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Active Integrations */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-background/50">
          <h2 className="text-lg font-semibold text-white">Connected Accounts</h2>
        </div>
        
        {integrations.length === 0 ? (
          <div className="p-8 text-center">
            <ShieldCheck className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted">No AWS accounts connected yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {integrations.map((integration) => (
              <div key={integration._id} className="p-6 flex items-center justify-between hover:bg-surface-hover/50 transition-colors">
                <div>
                  <div className="flex items-center mb-1">
                    <span className="font-medium text-white mr-3">
                      {integration.alias || integration.awsAccountId}
                    </span>
                    <span className={clsx(
                      "px-2 py-0.5 rounded text-xs font-medium uppercase",
                      integration.status === 'active' ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    )}>
                      {integration.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted font-mono bg-background px-2 py-1 rounded inline-block mt-1">
                    {integration.roleArn}
                  </div>
                  <div className="text-xs text-muted mt-2">
                    Region: {integration.region} • Added: {formatDistanceToNow(new Date(integration.createdAt), { addSuffix: true })}
                  </div>
                </div>
                
                {integration.status === 'error' && integration.lastError && (
                  <div className="max-w-xs text-xs text-danger bg-danger/10 p-2 rounded border border-danger/20">
                    <span className="font-semibold block mb-0.5">Sync Error:</span>
                    <p className="truncate" title={integration.lastError}>{integration.lastError}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
