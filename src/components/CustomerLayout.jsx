import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingCart, User, ClipboardList, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CustomerLayout.css';

const CustomerLayout = ({ children }) => {
  const { totalItems, grandTotal } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: '/customer/home', icon: Home, label: 'Home' },
    { to: '/customer/restaurants', icon: UtensilsCrossed, label: 'Menu' },
    { to: '/customer/cart', icon: ShoppingCart, label: 'Cart' },
    { to: '/customer/orders', icon: ClipboardList, label: 'Orders' },
    { to: '/customer/profile', icon: User, label: 'Profile' },
  ];

  // Don't show floating cart on the cart page itself
  const showFloatingCart = totalItems > 0 && location.pathname !== '/customer/cart';

  return (
    <div className="customer-layout">
      <main className="customer-main">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <NavLink key={to} to={to} className={`bottom-nav-item ${active ? 'active' : ''}`}>
              <div className="bottom-nav-icon">
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                {label === 'Cart' && totalItems > 0 && <span className="bottom-nav-badge">{totalItems}</span>}
              </div>
              <span className="bottom-nav-label" style={{ fontWeight: active ? '700' : '500' }}>{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default CustomerLayout;
