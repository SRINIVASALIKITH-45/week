import React, { useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Truck, MapPin, Wallet, UserCircle, LogOut } from 'lucide-react';
import { DriverAuthContext } from '../../context/DriverAuthContext';
import './DriverLayout.css';

const DriverLayout = ({ children }) => {
    const { driver, logout } = useContext(DriverAuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { to: '/driver/home', icon: Truck, label: 'Orders' },
        { to: '/driver/active-delivery', icon: MapPin, label: 'Active' },
        { to: '/driver/earnings', icon: Wallet, label: 'Earnings' },
        { to: '/driver/profile', icon: UserCircle, label: 'Profile' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="driver-layout">
            <main className="driver-main">
                {children}
            </main>

            {/* Premium Bottom Navigation - Matching Customer UI */}
            <nav className="bottom-nav">
                {navItems.map(({ to, icon: Icon, label }) => {
                    const active = location.pathname === to;
                    return (
                        <NavLink key={to} to={to} className={`bottom-nav-item ${active ? 'active' : ''}`}>
                            <div className="bottom-nav-icon">
                                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                            </div>
                            <span className="bottom-nav-label" style={{ fontWeight: active ? '700' : '500' }}>{label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
};

export default DriverLayout;
