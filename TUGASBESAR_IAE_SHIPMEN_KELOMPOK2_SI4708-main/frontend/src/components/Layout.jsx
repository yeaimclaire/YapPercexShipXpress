import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  UserCircle, 
  Package, 
  MapPin,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/vehicles', label: 'Vehicles', icon: Truck },
    { path: '/drivers', label: 'Drivers', icon: UserCircle },
    { path: '/shipments', label: 'Shipments', icon: Package },
    { path: '/tracking', label: 'Tracking', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-[#FEF8F0] to-cream">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange via-[#FAB12F] to-[#E8A01F] shadow-xl border-b-4 border-orange/30">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white hover:bg-white/20 p-2 rounded-lg transition-all"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">ShipXpress</h1>
                  <p className="text-white/80 text-xs font-medium">Logistics Management</p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-white text-sm font-medium">System Online</p>
              </div>
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-all"
                  >
                    <User className="w-5 h-5 text-white" />
                    <span className="text-white text-sm font-medium">{user.full_name || user.username}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                      <div className="p-4 border-b border-gray-200">
                        <p className="font-semibold text-gray-800">{user.full_name || user.username}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-orange/10 text-orange rounded-full text-xs font-semibold">
                          {user.role}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/login');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-lg shadow-2xl border-r border-gray-200/50 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          style={{ top: '89px', height: 'calc(100vh - 89px)' }}
        >
          <nav className="p-4 pt-6">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-orange to-[#E8A01F] text-white shadow-lg shadow-orange/30 transform scale-105'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-cream hover:to-orange/10 hover:text-orange hover:shadow-md'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-orange'}`} />
                      <span className={`font-semibold ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-orange'}`}>
                        {item.label}
                      </span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ top: '89px' }}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-89px)]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

