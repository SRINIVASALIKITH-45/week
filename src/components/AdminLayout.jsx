import React, { useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Utensils, 
  List, 
  ShoppingCart, 
  Users, 
  Car, 
  Settings as SettingsIcon,
  ClipboardList,
  Ticket,
  LogOut,
  ChefHat 
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Manager'] },
    { name: 'Products', path: '/products', icon: <Utensils size={20} />, roles: ['Admin', 'Manager'] },
    { name: 'Categories', path: '/categories', icon: <List size={20} />, roles: ['Admin', 'Manager'] },
    { name: 'Orders', path: '/orders', icon: <ShoppingCart size={20} />, roles: ['Admin', 'Manager', 'Kitchen'] },
    { name: 'Customers', path: '/customers', icon: <Users size={20} />, roles: ['Admin'] },
    { name: 'Drivers', path: '/drivers', icon: <Car size={20} />, roles: ['Admin'] },
    { name: 'Kitchen Staff', path: '/kitchen-staff', icon: <ChefHat size={20} />, roles: ['Admin'] },
    { name: 'Coupons', path: '/coupons', icon: <Ticket size={20} />, roles: ['Admin'] },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} />, roles: ['Admin'] },
    { name: 'Logs', path: '/logs', icon: <ClipboardList size={20} />, roles: ['Admin'] }
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role || 'Admin'));

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <div className="glass" style={{
        width: '260px', 
        borderRight: '1px solid var(--border-color)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="mb-4 d-flex align-items-center gap-2">
          <div style={{
            width: '40px', height: '40px', 
            backgroundColor: 'var(--primary)', 
            borderRadius: 'var(--radius-md)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            color: 'white', fontWeight: 'bold', fontSize: '1.2rem'
          }}>Z</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>Admin</h2>
        </div>

        <ul style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <Link to={item.path} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'var(--transition)'
                }}>
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        <div style={{ marginTop: 'auto' }}>
          <button 
            onClick={handleLogout} 
            className="btn" 
            style={{ 
              width: '100%', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: '#dc2626' 
            }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--surface-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontWeight: '600' }}>Admin Dashboard</h3>
          <div className="d-flex align-items-center gap-2">
            <div style={{
              width: '35px', height: '35px', 
              borderRadius: '50%', backgroundColor: 'var(--primary)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              color: 'white', fontWeight: 'bold'
            }}>A</div>
            <span style={{ fontWeight: '500' }}>Admin</span>
          </div>
        </header>

        <main style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
