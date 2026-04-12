import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import DriverLayout from '../../components/driver/DriverLayout';
import { DriverAuthContext } from '../../context/DriverAuthContext';
import { User, Phone, Truck, ShieldCheck, LogOut, ChevronRight, Star } from 'lucide-react';

const DriverProfile = () => {
    const { driver, logout } = useContext(DriverAuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <DriverLayout>
            <div className="cp-page-header">
                <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
                    <div style={{ 
                        width: '90px', height: '90px', 
                        borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)',
                        margin: '0 auto 1.25rem', overflow: 'hidden',
                        backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        color: 'var(--primary)'
                    }}>
                        <User size={50} />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{driver?.name}</h1>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                        <span className="badge-soft-success" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                            <Star size={12} fill="white" /> 4.9 Rating
                        </span>
                        <span className="badge-soft-primary" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                             ID: #{driver?.id}
                        </span>
                    </div>
                </div>
            </div>

            <div className="driver-container px-4" style={{ marginTop: '-20px', padding: '0 1rem' }}>
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 className="cp-section-title" style={{ marginBottom: '1.25rem' }}>Professional Profile</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ color: 'var(--text-secondary)' }}><Phone size={20} /></div>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>PHONE NUMBER</p>
                                <p style={{ fontWeight: '700' }}>+91 {driver?.phone}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ color: 'var(--text-secondary)' }}><Truck size={20} /></div>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>VEHICLE DETAILS</p>
                                <p style={{ fontWeight: '700' }}>{driver?.vehicle_details || 'Bike (Standard)'}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ color: 'var(--text-secondary)' }}><ShieldCheck size={20} /></div>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ACCOUNT STATUS</p>
                                <p style={{ fontWeight: '700', color: '#16a34a' }}>Verified Partner</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '0.5rem', marginBottom: '2rem' }}>
                    <button className="menu-item" style={{ 
                        width: '100%', padding: '1.25rem', display: 'flex', 
                        justifyContent: 'space-between', alignItems: 'center', 
                        border: 'none', background: 'none', cursor: 'pointer',
                        borderBottom: '1px solid var(--border-color)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ color: 'var(--text-secondary)' }}><User size={20} /></div>
                            <span style={{ fontWeight: '700' }}>Personal Settings</span>
                        </div>
                        <ChevronRight size={18} color="var(--text-secondary)" />
                    </button>
                    
                    <button onClick={handleLogout} className="menu-item" style={{ 
                        width: '100%', padding: '1.25rem', display: 'flex', 
                        justifyContent: 'space-between', alignItems: 'center', 
                        border: 'none', background: 'none', cursor: 'pointer'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ color: '#ef4444' }}><LogOut size={20} /></div>
                            <span style={{ fontWeight: '700', color: '#ef4444' }}>Logout session</span>
                        </div>
                        <ChevronRight size={18} color="#ef4444" />
                    </button>
                </div>

                <div style={{ textAlign: 'center', paddingBottom: '3rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tirupati Hubspot Partner App v2.4.0</p>
                </div>
            </div>
        </DriverLayout>
    );
};

export default DriverProfile;
