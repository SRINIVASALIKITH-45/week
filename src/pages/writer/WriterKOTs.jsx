import React, { useState, useEffect, useContext, useMemo } from 'react';
import { WriterAuthContext } from '../../context/WriterAuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
    Clock, ClipboardList, CheckCircle2, Bell,
    ArrowLeft, Utensils, X, Printer, User, Users, ChefHat
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './WriterStyles.css';

/* ─── KOT Detail Modal ──────────────────────────────────── */
const KOTDetailModal = ({ kot, restaurantName, onClose, onServe, parseItems }) => {
    if (!kot) return null;
    const items = parseItems(kot.items_json);
    const newItems = parseItems(kot.new_items_json);
    const newItemNames = new Set(newItems.map(i => i.product_id || i.name));
    const tableNum = kot.table_number || `T-${kot.table_id}`;
    const dateTime = kot.created_at
        ? new Date(kot.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
        : new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });

    const handlePrint = () => {
        const printContent = `
            <html><head><title>KOT #${kot.id}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Courier New', monospace; width: 300px; padding: 10px; }
                .center { text-align: center; }
                .bold { font-weight: bold; }
                .divider { border: 0; border-top: 1px dashed #000; margin: 8px 0; }
                .row { display: flex; justify-content: space-between; font-size: 12px; margin: 3px 0; }
                .label { font-size: 12px; margin: 3px 0; }
                .note { font-size: 11px; color: #444; margin-left: 12px; }
                h2, h3 { text-align: center; }
                h2 { font-size: 14px; text-transform: uppercase; }
                h3 { font-size: 12px; margin-top: 4px; }
                .footer { text-align: center; font-size: 12px; margin-top: 8px; }
                .sig { margin-top: 16px; font-size: 12px; }
            </style>
            </head><body>
                <h2>${restaurantName}</h2>
                <h3>KITCHEN ORDER TICKET (KOT)</h3>
                <hr class="divider" />
                <p class="label"><b>KOT ID  :</b> #${kot.id}</p>
                <p class="label"><b>Table No:</b> ${tableNum}</p>
                <p class="label"><b>Captain :</b> ${kot.writer_name || 'Captain'}</p>
                <p class="label"><b>Customer:</b> ${kot.customer_name || '-'}</p>
                <p class="label"><b>Pax     :</b> ${kot.pax || '-'}</p>
                <p class="label"><b>Time    :</b> ${dateTime}</p>
                <hr class="divider" />
                <p class="bold" style="font-size:12px;margin-bottom:6px;">ITEMS ORDERED</p>
                <hr class="divider" />
                ${items.map((item, i) => `
                    <div class="row">
                        <span>${i + 1}. ${item.name}</span>
                        <span>x${item.quantity}  ₹${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    ${item.note ? `<p class="note">└ Note: ${item.note}</p>` : ''}
                `).join('')}
                <hr class="divider" />
                <div class="row bold">
                    <span>TOTAL</span>
                    <span>₹${items.reduce((s, i) => s + (parseFloat(i.price) * i.quantity), 0).toFixed(2)}</span>
                </div>
                <hr class="divider" />
                <p class="label"><b>STATUS:</b> ${kot.status?.toUpperCase()}</p>
                <hr class="divider" />
                <p class="sig">Kitchen Signature: ________________</p>
                <hr class="divider" />
                <p class="footer"><b>PLEASE PREPARE FAST</b></p>
            </body></html>
        `;
        const win = window.open('', '_blank', 'width=350,height=600');
        win.document.write(printContent);
        win.document.close();
        win.print();
    };

    const statusColor = kot.status === 'Ready' ? '#10b981' : kot.status === 'Preparing' ? '#4f46e5' : '#f59e0b';
    const totalAmt = items.reduce((s, i) => s + (parseFloat(i.price) * i.quantity), 0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 3000,
                background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 22, stiffness: 260 }}
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: '480px',
                    background: 'white', borderRadius: '32px 32px 0 0',
                    maxHeight: '92vh', overflowY: 'auto',
                    paddingBottom: '40px'
                }}
            >
                {/* Handle */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
                    <div style={{ width: '40px', height: '4px', borderRadius: '99px', background: '#e2e8f0' }} />
                </div>

                {/* Header */}
                <div style={{ padding: '16px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>KOT #{kot.id}</h3>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>{dateTime}</span>
                    </div>
                    <button onClick={onClose} style={{ background: '#f8fafc', border: 'none', padding: '10px', borderRadius: '14px', color: '#64748b' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Status + Table */}
                <div style={{ padding: '16px 24px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ padding: '8px 16px', borderRadius: '12px', background: `${statusColor}18`, color: statusColor, fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {kot.status === 'Ready' && <CheckCircle2 size={14} />}
                        {kot.status === 'Preparing' && <ChefHat size={14} />}
                        {kot.status === 'Pending' && <Clock size={14} />}
                        {kot.status}
                    </div>
                    <div style={{ padding: '8px 16px', borderRadius: '12px', background: '#f1f5f9', color: '#1e293b', fontWeight: '800', fontSize: '0.8rem' }}>
                        TABLE {tableNum}
                    </div>
                    {kot.customer_name && (
                        <div style={{ padding: '8px 16px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', fontWeight: '800', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={13} /> {kot.customer_name} {kot.pax ? `• ${kot.pax} pax` : ''}
                        </div>
                    )}
                </div>

                {/* Thermal-style KOT slip */}
                <div style={{
                    margin: '0 16px', padding: '20px',
                    background: '#fffef5', border: '1px dashed #d1d5db',
                    borderRadius: '20px', fontFamily: "'Courier New', monospace"
                }}>
                    {/* Restaurant Header */}
                    <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>{restaurantName}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>KITCHEN ORDER TICKET (KOT)</div>
                    </div>
                    <div style={{ borderTop: '1px dashed #9ca3af', margin: '8px 0' }} />

                    {/* Info rows */}
                    {[
                        ['KOT ID', `#${kot.id}`],
                        ['Table No', tableNum],
                        ['Captain', kot.writer_name || 'Captain'],
                        ['Customer', kot.customer_name || '-'],
                        ['Members', kot.pax || '-'],
                        ['Date/Time', dateTime],
                    ].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                            <span style={{ color: '#64748b', minWidth: '80px' }}>{k}</span>
                            <span style={{ fontWeight: '700', color: '#1e293b', textAlign: 'right' }}>{v}</span>
                        </div>
                    ))}

                    <div style={{ borderTop: '1px dashed #9ca3af', margin: '12px 0 8px' }} />
                    <div style={{ fontSize: '0.78rem', fontWeight: '900', marginBottom: '8px', letterSpacing: '1px' }}>ITEMS ORDERED</div>
                    <div style={{ borderTop: '1px dashed #9ca3af', margin: '0 0 10px' }} />

                    {/* Items */}
                    {items.map((item, idx) => {
                        const isNew = newItemNames.has(item.product_id || item.name);
                        const newEntry = newItems.find(n => (n.product_id || n.name) === (item.product_id || item.name));
                        return (
                        <div key={idx} style={{ marginBottom: '8px', background: isNew ? '#fffbeb' : 'transparent', borderRadius: '8px', padding: isNew ? '4px 8px' : '0', border: isNew ? '1px solid #fcd34d' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                <span style={{ fontWeight: '700', flex: 1 }}>
                                    {idx + 1}. {item.name}
                                    {isNew && <span style={{ background: '#fcd34d', color: '#92400e', fontSize: '0.6rem', fontWeight: '900', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px' }}>
                                        {newEntry?.added_qty ? `+${newEntry.added_qty}` : '★ NEW'}
                                    </span>}
                                </span>
                                <span style={{ whiteSpace: 'nowrap', color: '#1e293b', fontWeight: '800' }}>
                                    x{item.quantity}  ₹{(item.price * item.quantity).toFixed(0)}
                                </span>
                            </div>
                            {item.note && (
                                <div style={{ fontSize: '0.72rem', color: '#f97316', marginLeft: '14px', marginTop: '2px' }}>
                                    └ {item.note}
                                </div>
                            )}
                        </div>
                        );
                    })}

                    <div style={{ borderTop: '1px dashed #9ca3af', margin: '10px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '900' }}>
                        <span>TOTAL</span>
                        <span>₹{totalAmt.toFixed(2)}</span>
                    </div>
                    <div style={{ borderTop: '1px dashed #9ca3af', margin: '10px 0' }} />

                    <div style={{ fontSize: '0.78rem', marginBottom: '12px' }}>
                        <span style={{ color: '#64748b' }}>STATUS: </span>
                        <span style={{ fontWeight: '900', color: statusColor }}>{kot.status?.toUpperCase()}</span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '16px' }}>
                        Kitchen Signature: ________________
                    </div>
                    <div style={{ borderTop: '1px dashed #9ca3af', margin: '8px 0' }} />
                    <div style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: '900', letterSpacing: '1px' }}>
                        PLEASE PREPARE FAST
                    </div>
                    <div style={{ borderTop: '1px dashed #9ca3af', margin: '8px 0' }} />
                </div>

                {/* Action Buttons */}
                <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={handlePrint}
                        style={{
                            width: '100%', padding: '14px', borderRadius: '16px',
                            background: '#1e293b', color: 'white', border: 'none',
                            fontWeight: '800', fontSize: '0.95rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                        }}
                    >
                        <Printer size={18} /> Print KOT
                    </button>

                    {kot.status === 'Ready' && (
                        <button
                            onClick={() => { onServe(kot.id); onClose(); }}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '16px',
                                background: '#10b981', color: 'white', border: 'none',
                                fontWeight: '800', fontSize: '0.95rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                        >
                            <Utensils size={18} /> Mark as Served
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

/* ─── Main Page ─────────────────────────────────────────── */
const WriterKOTs = () => {
    const { writer } = useContext(WriterAuthContext);
    const { socket } = useSocket();
    const navigate = useNavigate();

    const [kots, setKots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('my');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedKOT, setSelectedKOT] = useState(null);
    const [restaurantName, setRestaurantName] = useState('Restaurant');

    useEffect(() => {
        fetchKOTs();
        api.get('/settings').then(r => { if (r.data?.restaurant_name) setRestaurantName(r.data.restaurant_name); }).catch(() => {});

        if (socket) {
            socket.on('newKOT', (newKOT) => {
                setKots(prev => [newKOT, ...prev]);
            });
            // One-KOT-per-table: merge updated items into existing card
            socket.on('kotUpdated', (updatedKOT) => {
                setKots(prev => prev.map(k =>
                    k.id === updatedKOT.id
                        ? { ...k, ...updatedKOT, items_json: updatedKOT.items, new_items_json: updatedKOT.new_items, status: 'Pending' }
                        : k
                ));
                toast.info(`KOT #${updatedKOT.id} updated to v${updatedKOT.version}`, { icon: '✏️' });
            });
            socket.on('kotStatusUpdate', ({ id, status }) => {
                setKots(prev => prev.map(k => k.id === parseInt(id) ? { ...k, status } : k));
                if (status === 'Ready') toast.success(`KOT #${id} is READY!`);
            });
        }
        return () => {
            if (socket) { socket.off('newKOT'); socket.off('kotUpdated'); socket.off('kotStatusUpdate'); }
        };
    }, [socket]);

    const fetchKOTs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/kots/active');
            setKots(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            toast.error('Could not load active orders');
        } finally {
            setLoading(false);
        }
    };

    const handleServe = async (kotId) => {
        try {
            await api.patch(`/kots/${kotId}/status`, { status: 'Served' });
            setKots(prev => prev.filter(k => k.id !== kotId));
            toast.success('Order served');
        } catch { toast.error('Action failed'); }
    };

    const parseItems = (itemsJson) => {
        try {
            if (!itemsJson) return [];
            return typeof itemsJson === 'string' ? JSON.parse(itemsJson) : itemsJson;
        } catch { return []; }
    };

    const filteredKOTs = useMemo(() => {
        let result = kots || [];
        if (viewMode === 'my') result = result.filter(k => k.writer_id === writer?.id);
        if (statusFilter !== 'All') result = result.filter(k => k.status === statusFilter);
        return result;
    }, [kots, viewMode, statusFilter, writer?.id]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <div className="cp-spinner" />
                <p style={{ color: '#64748b', fontWeight: '700' }}>Syncing Feed...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <AnimatePresence>
                {selectedKOT && (
                    <KOTDetailModal
                        kot={selectedKOT}
                        restaurantName={restaurantName}
                        parseItems={parseItems}
                        onClose={() => setSelectedKOT(null)}
                        onServe={handleServe}
                    />
                )}
            </AnimatePresence>

            {/* View + Filter */}
            <div style={{ padding: '0 20px 16px' }}>
                <div style={{ display: 'flex', background: 'white', padding: '6px', borderRadius: '16px', border: '1px solid #f1f5f9', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    {['my', 'all'].map(mode => (
                        <button key={mode} onClick={() => setViewMode(mode)}
                            style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '12px', background: viewMode === mode ? '#1e293b' : 'transparent', color: viewMode === mode ? 'white' : '#64748b', fontWeight: '800', fontSize: '0.85rem', transition: 'all 0.2s' }}>
                            {mode === 'my' ? 'My Feed' : 'All KOTs'}
                        </button>
                    ))}
                </div>
                <div className="writer-pill-scroller" style={{ padding: '0 0 4px', gap: '8px' }}>
                    {['All', 'Pending', 'Preparing', 'Ready'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={statusFilter === s ? 'pill-soft active' : 'pill-soft'}>{s}</button>
                    ))}
                </div>
            </div>

            {/* KOT List */}
            <div style={{ padding: '0 20px 40px' }}>
                {filteredKOTs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <ClipboardList size={40} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>No orders found</h3>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Try switching to 'All KOTs' or 'All' filter.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {filteredKOTs.map(kot => {
                            const statusColor = kot.status === 'Ready' ? '#10b981' : kot.status === 'Preparing' ? '#4f46e5' : '#f59e0b';
                            const items = parseItems(kot.items_json);
                            return (
                                <motion.div layout key={kot.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedKOT(kot)}
                                    style={{
                                        background: 'white', borderRadius: '22px', padding: '18px 20px',
                                        border: `1.5px solid ${kot.status === 'Ready' ? '#10b981' : '#f1f5f9'}`,
                                        boxShadow: kot.status === 'Ready' ? '0 8px 20px -6px rgba(16,185,129,0.3)' : '0 4px 12px rgba(0,0,0,0.02)',
                                        cursor: 'pointer', position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                                                <span style={{ fontSize: '1rem', fontWeight: '900', color: '#1e293b' }}>KOT #{kot.id}</span>
                                                <span className="cp-tag cp-tag-purple" style={{ fontSize: '0.65rem' }}>TABLE {kot.table_number || kot.table_id}</span>
                                            </div>
                                            {kot.customer_name && (
                                                <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '700' }}>👤 {kot.customer_name}{kot.pax ? ` · ${kot.pax} pax` : ''}</span>
                                            )}
                                        </div>
                                        <div style={{ padding: '5px 12px', borderRadius: '10px', background: `${statusColor}18`, color: statusColor, fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase' }}>
                                            {kot.status}
                                        </div>
                                    </div>

                                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '14px' }}>
                                        {items.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '0.83rem', fontWeight: '700', color: '#475569' }}>
                                                    {item.quantity} × {item.name}
                                                </span>
                                                <span style={{ fontSize: '0.83rem', fontWeight: '800', color: '#1e293b' }}>₹{(item.price * item.quantity).toFixed(0)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={11} /> {kot.created_at ? new Date(kot.created_at).toLocaleTimeString('en-IN', { timeStyle: 'short' }) : 'Just now'}
                                        </span>
                                        <span style={{ fontSize: '0.72rem', color: '#4f46e5', fontWeight: '800' }}>Tap to view full KOT →</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WriterKOTs;
