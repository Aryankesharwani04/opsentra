import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Cloud, Server, TerminalSquare, CheckCircle2, ChevronRight, Copy, Check, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

export default function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Step 1: AWS
  const [integrations, setIntegrations] = useState([]);
  const [roleArn, setRoleArn] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [alias, setAlias] = useState('');
  const [cfUrl, setCfUrl] = useState('');
  const [isConnectingAws, setIsConnectingAws] = useState(false);
  const [awsError, setAwsError] = useState('');

  // Step 3: Agent
  const [servers, setServers] = useState([]);
  const [installCommand, setInstallCommand] = useState(null);
  const [copied, setCopied] = useState(false);

  // Poll for completion
  useEffect(() => {
    let interval;
    if (currentStep === 1) {
      fetchAwsState();
    } else if (currentStep === 3) {
      interval = setInterval(fetchServerState, 5000);
      fetchServerState();
    }
    return () => clearInterval(interval);
  }, [currentStep]);

  const fetchAwsState = async () => {
    try {
      setLoading(true);
      const [intRes, cfRes] = await Promise.all([
        api.get('/aws/integrations'),
        api.get('/aws/template')
      ]);
      setIntegrations(intRes.data.data);
      setCfUrl(cfRes.data.data.launchUrl);
      
      // If already connected, jump to step 2
      if (intRes.data.data.length > 0) {
        setCurrentStep(2);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServerState = async () => {
    try {
      const [srvRes, cmdRes] = await Promise.all([
        api.get('/servers'),
        api.get('/agent/install-command')
      ]);
      setServers(srvRes.data.data);
      setInstallCommand(cmdRes.data.data);
      
      // If server is registered, wizard is complete!
      if (srvRes.data.data.length > 0) {
        navigate('/logs');
      }
    } catch (err) {
      console.error('Failed fetching server state', err);
    }
  };

  const handleConnectAws = async (e) => {
    e.preventDefault();
    setIsConnectingAws(true);
    setAwsError('');
    try {
      await api.post('/aws/connect', { role_arn: roleArn, region, alias: alias || undefined });
      setCurrentStep(2);
    } catch (err) {
      setAwsError(err.response?.data?.error?.message || 'Failed to connect AWS account.');
    } finally {
      setIsConnectingAws(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { id: 1, title: 'Connect AWS', icon: Cloud, desc: 'Allow us to read CloudWatch logs' },
    { id: 2, title: 'Attach EC2 Role', icon: Server, desc: 'Give your instances permissions' },
    { id: 3, title: 'Install Agent', icon: TerminalSquare, desc: 'Forward logs to Opsentra' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Opsentra Setup Wizard</h1>
        <p className="text-muted mt-2">Complete these three steps to unlock your live log dashboard.</p>
      </div>

      {/* Progress Stepper */}
      <div className="mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500" 
             style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>
        
        <div className="flex justify-between w-full">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center bg-background px-4">
                <div className={clsx(
                  "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-300",
                  isCompleted ? "bg-primary border-primary text-white" : 
                  isCurrent ? "bg-surface border-primary text-primary" : 
                  "bg-surface border-border text-muted"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="mt-3 text-center">
                  <p className={clsx("text-sm font-semibold", isCurrent || isCompleted ? "text-white" : "text-muted")}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted max-w-[120px] mt-1 hidden sm:block">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-surface border border-border rounded-xl shadow-xl overflow-hidden min-h-[400px]">
        {loading && currentStep === 1 ? (
          <div className="flex items-center justify-center h-64 text-muted">Checking account status...</div>
        ) : (
          <div className="p-8">
            
            {/* STEP 1: AWS CONNECT */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-white mb-6">Step 1: Connect your AWS Account</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">1. Launch CloudFormation Stack</h3>
                    <p className="text-sm text-muted mb-4">
                      Deploy our predefined stack to securely grant Opsentra read-only access to your CloudWatch Logs.
                    </p>
                    {cfUrl && (
                      <a href={cfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm font-medium mb-4">
                        Launch Stack in AWS <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    )}
                    <p className="text-xs text-muted border-l-2 border-border pl-3">
                      Once deployed, go to the <strong>Outputs</strong> tab in CloudFormation and copy the generated <code>RoleArn</code>.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">2. Paste Role ARN</h3>
                    {awsError && <div className="mb-4 p-3 bg-danger/10 text-danger border border-danger/20 rounded-md text-sm">{awsError}</div>}
                    
                    <form onSubmit={handleConnectAws} className="space-y-4">
                      <div>
                        <input 
                          type="text" required placeholder="arn:aws:iam::123456789012:role/..."
                          className="w-full px-4 py-2 bg-background border border-border rounded-md text-white text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                          value={roleArn} onChange={(e) => setRoleArn(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <select className="w-full px-3 py-2 bg-background border border-border rounded-md text-white text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                          value={region} onChange={(e) => setRegion(e.target.value)}>
                          <option value="us-east-1">us-east-1</option>
                          <option value="us-west-2">us-west-2</option>
                          <option value="eu-west-1">eu-west-1</option>
                          <option value="ap-south-1">ap-south-1</option>
                        </select>
                        <input type="text" placeholder="Alias (e.g. Prod)" className="w-full px-3 py-2 bg-background border border-border rounded-md text-white text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                          value={alias} onChange={(e) => setAlias(e.target.value)}
                        />
                      </div>
                      <button type="submit" disabled={isConnectingAws || !roleArn} className="w-full py-2.5 bg-background border border-border hover:bg-surface-hover hover:border-primary disabled:opacity-50 text-white rounded-md transition-all text-sm font-medium flex justify-center items-center">
                        {isConnectingAws ? 'Verifying Context...' : <><span className="mr-2">Connect AWS Account</span> <ChevronRight className="w-4 h-4" /></>}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: IAM EC2 ATTACH */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-white mb-4">Step 2: Give EC2 CloudWatch Access</h2>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
                  <p className="text-gray-300 mb-4">
                    Your EC2 instances need permission to push logs up to CloudWatch so Opsentra can fetch them.
                  </p>
                  <ol className="list-decimal list-inside space-y-3 text-muted">
                    <li>Open the <a href="https://console.aws.amazon.com/ec2" target="_blank" rel="noreferrer" className="text-primary hover:underline">EC2 Console</a>.</li>
                    <li>Select the EC2 instance you want to monitor.</li>
                    <li>Go to <strong>Actions</strong> &gt; <strong>Security</strong> &gt; <strong>Modify IAM role</strong>.</li>
                    <li>Ensure the instance has an IAM Role attached that contains the <code>CloudWatchAgentServerPolicy</code>.</li>
                  </ol>
                </div>
                
                <div className="flex justify-end gap-3 mt-8">
                  <button onClick={() => setCurrentStep(1)} className="px-5 py-2.5 rounded-lg text-sm font-medium border border-border text-muted hover:text-white transition-colors">Back</button>
                  <button onClick={() => { setCurrentStep(3); fetchServerState(); }} className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm font-medium flex items-center">
                    I've done this <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: AGENT INSTALL */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-white mb-2">Step 3: Run Install Script</h2>
                <p className="text-muted mb-6">Run this in your EC2 terminal. It automatically configures and starts the CloudWatch agent for Opsentra.</p>
                
                <div className="relative mb-8">
                  <pre className="w-full bg-background border border-border rounded-lg p-5 overflow-x-auto text-sm text-primary font-mono whitespace-pre-wrap">
                    {installCommand?.install_command || 'Loading command...'}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(installCommand?.install_command)}
                    className="absolute top-4 right-4 p-2 bg-surface hover:bg-surface-hover border border-border rounded-md text-muted hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center p-8 bg-background/50 border border-border border-dashed rounded-lg">
                  <div className="relative flex items-center justify-center w-12 h-12 mb-4">
                    <div className="absolute inset-0 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <Server className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-white font-medium">Waiting for your first server...</h3>
                  <p className="text-muted text-sm mt-1">Leave this page open. We'll automatically redirect you to the dashboard once your server pings us.</p>
                </div>
                
                <div className="flex justify-start mt-6">
                  <button onClick={() => setCurrentStep(2)} className="px-5 py-2.5 rounded-lg text-sm font-medium border border-border text-muted hover:text-white transition-colors">Back</button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
