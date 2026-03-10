import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Server,
  Cloud,
  TerminalSquare,
  LogOut,
  User,
  Wand2,
  Lock,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../lib/api';

const baseNavItems = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Logs Viewer', path: '/logs', icon: TerminalSquare, requiresSetup: true },
  { name: 'AWS Accounts', path: '/aws', icon: Cloud },
  { name: 'Servers', path: '/servers', icon: Server },
  { name: 'Setup Wizard', path: '/setup', icon: Wand2, highlight: true },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Guard State
  const [hasServers, setHasServers] = useState(false);
  const [loadingGuard, setLoadingGuard] = useState(true);
  const [servers, setServers] = useState([]);
  const [serversExpanded, setServersExpanded] = useState(true);

  useEffect(() => {
    const checkWizardState = async () => {
      try {
        const res = await api.get('/servers');
        const list = res.data.data || [];
        setHasServers(list.length > 0);
        setServers(list);
      } catch (err) {
        console.error('Failed to check wizard state', err);
      } finally {
        setLoadingGuard(false);
      }
    };

    checkWizardState();
  }, [location.pathname]);

  // Apply guards to nav items
  const navItems = baseNavItems.map(item => {
    if (item.requiresSetup && !hasServers && !loadingGuard) {
      return { ...item, path: '/setup', locked: true };
    }
    // Hide Setup Wizard if already completed
    if (item.path === '/setup' && hasServers) {
      return { ...item, hide: true };
    }
    return item;
  }).filter(item => !item.hide);

  return (
    <div className="flex h-screen bg-background text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <TerminalSquare className="w-6 h-6 text-primary mr-3" />
          <span className="text-xl font-bold tracking-tight text-white">Opsentra</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path && !new URLSearchParams(location.search).get('instance_id');

            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group justify-between',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : item.highlight
                      ? 'bg-primary border border-primary text-white hover:bg-primary-hover shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      : 'text-muted hover:bg-surface-hover hover:text-white',
                  item.locked && 'opacity-60 cursor-not-allowed'
                )}
                title={item.locked ? 'Complete setup wizard first' : ''}
              >
                <div className="flex items-center">
                  <Icon className={clsx(
                    'w-5 h-5 mr-3 flex-shrink-0 transition-colors',
                    isActive || item.highlight ? '' : 'text-muted group-hover:text-gray-300'
                  )} />
                  {item.name}
                </div>
                {item.locked && <Lock className="w-4 h-4 text-muted" />}
              </Link>
            );
          })}

          {/* Dynamic Servers Section */}
          {servers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={() => setServersExpanded(!serversExpanded)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted uppercase tracking-wider hover:text-white transition-colors"
              >
                <span className="flex items-center"><Server className="w-3 h-3 mr-2" />Servers</span>
                {serversExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
              {serversExpanded && (
                <div className="mt-1 space-y-0.5">
                  <Link
                    to="/servers"
                    className={clsx(
                      'flex items-center pl-8 pr-3 py-1.5 rounded-lg text-xs transition-colors',
                      location.pathname === '/servers'
                        ? 'text-primary'
                        : 'text-muted hover:text-white'
                    )}
                  >
                    <span className="mr-1.5 text-lg leading-none">+</span> Add / Manage Servers
                  </Link>
                  {servers.map(server => {
                    const instanceParam = new URLSearchParams(location.search).get('instance_id');
                    const isSelected = location.pathname === '/logs' && instanceParam === server.instanceId;
                    return (
                      <Link
                        key={server._id}
                        to={`/logs?instance_id=${server.instanceId}`}
                        className={clsx(
                          'flex items-center pl-8 pr-3 py-2 rounded-lg text-sm transition-colors',
                          isSelected
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted hover:bg-surface-hover hover:text-white'
                        )}
                      >
                        <span className={clsx('w-2 h-2 rounded-full mr-2.5 flex-shrink-0', server.status === 'running' ? 'bg-success' : 'bg-muted')} />
                        <span className="truncate" title={server.instanceId}>
                          {server.instanceName !== server.instanceId ? server.instanceName : server.instanceId.slice(0, 19)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3">
              {user?.name?.charAt(0) || <User className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 rounded-lg text-sm justify-center font-medium text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-surface border-b border-border flex items-center px-4 shrink-0">
          <TerminalSquare className="w-6 h-6 text-primary mr-3" />
          <span className="text-lg font-bold text-white">Opsentra</span>
        </header>

        <div className="flex-1 overflow-y-auto w-full no-scrollbar relative">
          <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-full">
            {children || <Outlet />}
          </div>
        </div>
      </main>
    </div>
  );
}
