import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Menu, X, LogOut, BarChart3, Users, Package, User } from 'lucide-react';
import { logout } from '../redux/authSlice'; // Adjust path based on your file structure

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 ease-in-out shadow-lg flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between shrink-0">
          {sidebarOpen && <h1 className="text-xl font-bold">Roop-Jewelers-Admin</h1>}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-8 px-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <Icon
                  size={20}
                  className={`${
                    isActive(item.path) ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  } shrink-0`}
                />
                {sidebarOpen && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer - Logout */}
        <div className="p-4 pt-0 shrink-0 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-start space-x-3 px-3 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200 group ${
              !sidebarOpen ? 'justify-center space-x-0' : ''
            }`}
            aria-label="Logout"
          >
            <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-800">Welcome to Roop-Jewelers-Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
