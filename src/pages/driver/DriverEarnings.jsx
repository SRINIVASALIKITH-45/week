import React, { useState, useEffect } from 'react';
import DriverLayout from '../../components/driver/DriverLayout';
import { Wallet, TrendingUp, Calendar, ChevronRight, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';

const DriverEarnings = () => {
    const [earnings, setEarnings] = useState({ stats: { completed_count: 0, total_earnings: 0, daily_earnings: 0 }, history: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const res = await api.get('/driver-auth/earnings');
                setEarnings(res.data);
            } catch (error) {
                console.error('Failed to fetch earnings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEarnings();
    }, []);

    if (loading) return (
        <DriverLayout>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="cp-spinner"></div>
            </div>
        </DriverLayout>
    );

    return (
        <DriverLayout>
            <div className="cp-page-header">
                <span className="badge-soft-primary" style={{ marginBottom: '0.5rem' }}>Financial Overview</span>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Your Earnings</h1>
            </div>

            <div className="driver-container px-4" style={{ marginTop: '-20px', padding: '0 1rem' }}>
                <div className="card glass animate-fade-in" style={{ 
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                    color: 'white',
                    marginBottom: '1.5rem',
                    padding: '2rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ opacity: 0.8, fontSize: '0.9rem', fontWeight: '600' }}>TOTAL BALANCE</p>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginTop: '0.5rem' }}>₹{earnings.stats.total_earnings}</h2>
                        </div>
                        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                            <TrendingUp size={28} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                        <div className="badge-soft-success" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                            {earnings.stats.completed_count} Deliveries
                        </div>
                        <div className="badge-soft-success" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                            ₹{earnings.stats.daily_earnings} Today
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="cp-section-title">Recent Payouts</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>View All</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
                    {earnings.history.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            <Calendar size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No payout history available yet.</p>
                        </div>
                    ) : (
                        earnings.history.map((item, idx) => (
                            <div key={idx} className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ 
                                        width: '44px', height: '44px', 
                                        borderRadius: '12px', backgroundColor: 'var(--bg-color)', 
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', 
                                        color: '#22c55e' 
                                    }}>
                                        <ArrowUpRight size={20} />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: '800', fontSize: '1rem' }}>Order Payout</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(item.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontWeight: '900', color: 'var(--text-primary)', fontSize: '1.1rem' }}>+₹{item.total_amount}</p>
                                    <span className="badge-soft-success">Success</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DriverLayout>
    );
};

export default DriverEarnings;
