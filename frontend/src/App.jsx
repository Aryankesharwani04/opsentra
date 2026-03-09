import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardOverview from './pages/Overview';
import ConnectAws from './pages/ConnectAws';
import AddServer from './pages/AddServer';
import LogsViewer from './pages/LogsViewer';
import SetupWizard from './pages/SetupWizard';

// Auth Guard component
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-background text-white">Loading session...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Layout wrapper helper
const WithLayout = ({ component: Component }) => (
  <ProtectedRoute>
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<WithLayout component={DashboardOverview} />} />
          <Route path="/setup" element={<WithLayout component={SetupWizard} />} />
          <Route path="/aws" element={<WithLayout component={ConnectAws} />} />
          <Route path="/servers" element={<WithLayout component={AddServer} />} />
          <Route path="/logs" element={<WithLayout component={LogsViewer} />} />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
