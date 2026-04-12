import React, { useState, useContext, useEffect } from 'react';
import { WriterAuthContext } from '../../context/WriterAuthContext';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
    User, Phone, Lock, Edit3, Save, X,
    Power, Clock, ShieldCheck, Star, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './WriterStyles.css';

const WriterProfile = () => {
    const { writer, logout, toggleDuty } = useContext(WriterAuthContext);
    const navigate = useNavigate();

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', password: '' });

    useEffect(() => {
        if (writer) setForm({ name: writer.name || '', phone: writer.phone || '', password: '' });
    }, [writer]);

    const handleSave = async () => {
        if (!form.name || !form.phone) {
            toast.error('Name and phone are required');
            return;
        }
        setSaving(true);
        try {
            const payload = { name: form.name, phone: form.phone };
            if (form.password) payload.password = form.password;

            const res = await api.patch('/writer-auth/profile', payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('writerToken')}` }
            });
            toast.success('Profile updated successfully!');
            setEditing(false);
            setForm(prev => ({ ...prev, password: '' }));
        } catch (err) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleDuty = async () => {
        try {
            const newStatus = !writer.is_on_duty;
            await toggleDuty(newStatus);
            toast.success(newStatus ? 'You are now ON DUTY' : 'You are now OFF DUTY');
        } catch {
            toast.error('Failed to update duty status');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!writer) return null;

    const initials = writer.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'CP';

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
            {/* Hero Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                padding: '40px 24px 60px',
                borderRadius: '0 0 40px 40px',
                position: 'relative', overflow: 'hidden', color: 'white', textAlign: 'center'
            }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(79,70,229,0.25) 0%, transparent 70%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: -30, left: -20, width: 110, height: 110, background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />

                {/* Avatar */}
                <div style={{
                    width: '88px', height: '88px', borderRadius: '28px',
                    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 16px 32px rgba(79,70,229,0.35)',
                    fontSize: '2rem', fontWeight: '900', color: 'white',
                    border: '3px solid rgba(255,255,255,0.15)'
                }}>
                    {initials}
                </div>

                <h2 style={{ fontSize: '1.6rem', fontWeight: '900', margin: '0 0 4px' }}>{writer.name}</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', margin: 0 }}>Captain · Restaurant Staff</p>

                {/* Duty Badge */}
                <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={handleToggleDuty}
                    style={{
                        marginTop: '20px',
                        border: 'none',
                        background: writer.is_on_duty ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)',
                        color: 'white', padding: '10px 24px', borderRadius: '14px',
                        fontWeight: '800', fontSize: '0.85rem',
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        boxShadow: writer.is_on_duty ? '0 8px 20px rgba(16,185,129,0.3)' : 'none',
                        cursor: 'pointer'
                    }}
                >
                    <Power size={15} strokeWidth={3} />
                    {writer.is_on_duty ? 'ON DUTY — Tap to End Shift' : 'OFF DUTY — Tap to Start Shift'}
                </motion.button>
            </div>

            {/* Stats Row */}
            <div style={{ padding: '32px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '18px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <ShieldCheck size={22} color="#4f46e5" style={{ marginBottom: '10px' }} />
                    <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#1e293b', marginBottom: '2px' }}>Captain</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Role</div>
                </div>
                <div style={{ background: 'white', borderRadius: '20px', padding: '18px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <Clock size={22} color="#f97316" style={{ marginBottom: '10px' }} />
                    <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#1e293b', marginBottom: '2px' }}>
                        {writer.last_login_time
                            ? new Date(writer.last_login_time).toLocaleTimeString('en-IN', { timeStyle: 'short' })
                            : '—'
                        }
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Shift Started</div>
                </div>
            </div>

            {/* Profile Form Card */}
            <div style={{ margin: '24px 20px 0', background: 'white', borderRadius: '28px', border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f8fafc' }}>
                    <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>Account Details</h3>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', margin: 0 }}>Update your captain info</p>
                    </div>
                    {!editing ? (
                        <button onClick={() => setEditing(true)} style={{ border: 'none', background: '#eff6ff', color: '#4f46e5', padding: '8px 16px', borderRadius: '12px', fontWeight: '800', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <Edit3 size={14} /> Edit
                        </button>
                    ) : (
                        <button onClick={() => setEditing(false)} style={{ border: 'none', background: '#fee2e2', color: '#ef4444', padding: '8px 12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Name */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                disabled={!editing}
                                placeholder="Your full name"
                                style={{
                                    width: '100%', padding: '13px 14px 13px 44px',
                                    borderRadius: '14px', border: editing ? '1.5px solid #4f46e5' : '1.5px solid #f1f5f9',
                                    background: editing ? 'white' : '#f8fafc',
                                    fontWeight: '700', fontSize: '0.95rem', outline: 'none',
                                    color: '#1e293b', transition: 'all 0.2s'
                                }}
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Phone Number</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                disabled={!editing}
                                placeholder="Phone number"
                                style={{
                                    width: '100%', padding: '13px 14px 13px 44px',
                                    borderRadius: '14px', border: editing ? '1.5px solid #4f46e5' : '1.5px solid #f1f5f9',
                                    background: editing ? 'white' : '#f8fafc',
                                    fontWeight: '700', fontSize: '0.95rem', outline: 'none',
                                    color: '#1e293b', transition: 'all 0.2s'
                                }}
                            />
                        </div>
                    </div>

                    {/* Password — only in edit mode */}
                    {editing && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>New Password <span style={{ color: '#cbd5e1' }}>(leave blank to keep)</span></label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    placeholder="Enter new password"
                                    style={{
                                        width: '100%', padding: '13px 14px 13px 44px',
                                        borderRadius: '14px', border: '1.5px solid #4f46e5',
                                        background: 'white',
                                        fontWeight: '700', fontSize: '0.95rem', outline: 'none',
                                        color: '#1e293b'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    {editing && (
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                width: '100%', padding: '15px', borderRadius: '16px', border: 'none',
                                background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
                                color: 'white', fontWeight: '900', fontSize: '1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                boxShadow: '0 10px 20px rgba(79,70,229,0.2)', cursor: 'pointer',
                                marginTop: '4px'
                            }}
                        >
                            {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            <div style={{ margin: '20px 20px 0', background: 'white', borderRadius: '24px', border: '1px solid #fee2e2', padding: '20px 24px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#ef4444', margin: '0 0 12px' }}>Session</h4>
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleLogout}
                    style={{
                        width: '100%', padding: '14px', borderRadius: '16px', border: 'none',
                        background: '#fef2f2', color: '#ef4444',
                        fontWeight: '800', fontSize: '0.95rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        cursor: 'pointer'
                    }}
                >
                    <LogOut size={18} /> Sign Out
                </motion.button>
            </div>
        </div>
    );
};

export default WriterProfile;
