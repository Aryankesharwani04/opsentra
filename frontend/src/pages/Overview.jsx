import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Activity, Server, AlertCircle, LayoutGrid } from 'lucide-react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';

export default function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Using Promise.all Settled or parallel
        const [statsRes, serversRes] = await Promise.all([
          api.get('/logs/stats?time_range=24h'),
          api.get('/servers')
        ]);
        
        setStats(statsRes.data.data);
        setServers(serversRes.data.data);
      } catch (err) {
        setError('Failed to load dashboard data. Please make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalLogs = stats?.total || 0;
  const errorLogs = stats?.byLevel?.error || 0;
  const errorRate = totalLogs > 0 ? ((errorLogs / totalLogs) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-surface rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-surface rounded-xl"></div>
          <div className="h-32 bg-surface rounded-xl"></div>
          <div className="h-32 bg-surface rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-muted">Here's what's happening in your infrastructure today.</p>
      </div>

      {error ? (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {error}
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Total Servers" 
              value={servers.length} 
              icon={Server} 
              color="text-primary" 
              bg="bg-primary/10" 
            />
            <StatCard 
              title="Logs (24h)" 
              value={totalLogs.toLocaleString()} 
              icon={Activity} 
              color="text-success" 
              bg="bg-success/10" 
            />
            <StatCard 
              title="Error Rate" 
              value={`${errorRate}%`} 
              icon={AlertCircle} 
              color={errorRate > 5 ? 'text-danger' : 'text-muted'} 
              bg={errorRate > 5 ? 'bg-danger/10' : 'bg-surface-hover'} 
              subtitle={`${errorLogs.toLocaleString()} errors`}
            />
          </div>

          {/* Servers List Preview */}
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden pt-5">
            <div className="px-6 flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <LayoutGrid className="w-5 h-5 mr-2 text-muted" />
                Active Servers
              </h2>
            </div>
            
            {servers.length === 0 ? (
              <div className="p-8 text-center border-t border-border">
                <p className="text-muted mb-4">You haven't connected any servers yet.</p>
                <a href="/servers" className="text-primary hover:text-primary-hover font-medium">Add your first server &rarr;</a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-y border-border bg-background/50">
                      <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Instance</th>
                      <th className="py-3 px-6 text-xs font-semibold text-muted uppercase Tracking-wider">Status</th>
                      <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {servers.slice(0, 5).map((server) => (
                      <tr key={server._id} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-medium text-white">{server.instanceName || 'Unknown Handler'}</div>
                          <div className="text-xs text-muted font-mono">{server.instanceId}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={clsx(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            server.status === 'active' ? "bg-success/10 text-success" : "bg-muted/10 text-muted"
                          )}>
                            <span className={clsx("w-1.5 h-1.5 rounded-full mr-1.5", 
                              server.status === 'active' ? 'bg-success' : 'bg-muted'
                            )}></span>
                            {server.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-muted">
                          {formatDistanceToNow(new Date(server.createdAt), { addSuffix: true })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color, bg }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted">{title}</h3>
        <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center", bg)}>
          <Icon className={clsx("w-5 h-5", color)} />
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tight text-white">{value}</div>
        {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
