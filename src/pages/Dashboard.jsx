import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { IndianRupee, ShoppingBag, Users, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const { socket } = useSocket();

  useEffect(() => {
    fetchStats();
    
    if (socket) {
        socket.on('newOrder', fetchStats);
        socket.on('orderStatusUpdate', fetchStats);
    }
    
    return () => {
        if (socket) {
            socket.off('newOrder', fetchStats);
            socket.off('orderStatusUpdate', fetchStats);
        }
    }
  }, [socket, dateRange]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard', { params: dateRange });
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  if (!stats) return <div>Loading dashboard...</div>;

  const revenueData = {
    labels: stats.revenueChart?.map(d => new Date(d.date).toLocaleDateString()) || [],
    datasets: [{
      label: 'Revenue (₹)',
      data: stats.revenueChart?.map(d => d.total) || [],
      backgroundColor: 'rgba(226, 55, 68, 0.8)',
      borderRadius: 4,
    }]
  };

  const statusData = {
    labels: stats.orderStatusChart?.map(d => d.status) || [],
    datasets: [{
      data: stats.orderStatusChart?.map(d => d.count) || [],
      backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#6366f1'],
      borderWidth: 0,
    }]
  };

  const categoryData = {
    labels: stats.categorySales?.map(c => c.name) || [],
    datasets: [{
      label: 'Sales by Category (₹)',
      data: stats.categorySales?.map(c => c.total_sales) || [],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderRadius: 4,
    }]
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Advanced Analytics</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="d-flex align-items-center gap-2">
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>From:</label>
                <input type="date" className="form-control" style={{ width: '150px', padding: '0.3rem' }} value={dateRange.startDate} onChange={e => setDateRange({...dateRange, startDate: e.target.value})} />
            </div>
            <div className="d-flex align-items-center gap-2">
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>To:</label>
                <input type="date" className="form-control" style={{ width: '150px', padding: '0.3rem' }} value={dateRange.endDate} onChange={e => setDateRange({...dateRange, endDate: e.target.value})} />
            </div>
            <div className="badge badge-success">Live Tracking</div>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card d-flex align-items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'rgba(226, 55, 68, 0.1)', borderRadius: '50%', color: 'var(--primary)' }}>
            <IndianRupee size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Total Revenue</p>
            <h3 style={{ fontSize: '1.4rem', margin: 0 }}>₹{stats.totalRevenue}</h3>
          </div>
        </div>
        <div className="card d-flex align-items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', color: '#3b82f6' }}>
            <ShoppingBag size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Total Orders</p>
            <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{stats.totalOrders}</h3>
          </div>
        </div>
        <div className="card d-flex align-items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', color: '#f59e0b' }}>
            <Clock size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Peak Hour</p>
            <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{stats.peakOrderHour.hour}:00</h3>
          </div>
        </div>
        <div className="card d-flex align-items-center gap-4" style={{ cursor: 'pointer' }}>
          <div style={{ padding: '1rem', backgroundColor: stats.lowStockAlerts.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: stats.lowStockAlerts.length > 0 ? '#ef4444' : '#10b981' }}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Low Stock Items</p>
            <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{stats.lowStockAlerts.length}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h4 className="mb-4">Most Ordered Products</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.mostOrderedProducts.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: i < stats.mostOrderedProducts.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <span style={{ fontWeight: '600' }}>{p.name}</span>
                <span className="badge badge-neutral">{p.total_orders} orders</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h4 className="mb-4">Sales by Category</h4>
          <Bar data={categoryData} options={{ responsive: true }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h4 className="mb-4 d-flex align-items-center gap-2">
            <Users size={20} className="text-primary" /> Top Customers (Insights)
          </h4>
          <div className="table-responsive">
            <table className="table table-sm">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Orders</th>
                        <th>Total Spent</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.topCustomers?.map((c, i) => (
                        <tr key={i}>
                            <td className="fw-bold">{c.name}</td>
                            <td>{c.order_count}</td>
                            <td className="text-success fw-bold">₹{c.total_spent}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h4 className="mb-4 d-flex align-items-center gap-2 text-danger">
            <AlertTriangle size={20} /> Fraud & High Cancellations
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.suspiciousUsers?.length === 0 ? (
                <div className="text-muted text-center py-4">No suspicious activity detected.</div>
            ) : (
                stats.suspiciousUsers?.map((u, i) => (
                    <div key={i} className="p-3 bg-soft-danger rounded d-flex justify-content-between align-items-center">
                        <div>
                            <div className="fw-bold text-danger">{u.name}</div>
                            <div className="small">High cancellation rate</div>
                        </div>
                        <div className="badge bg-danger">{u.cancellation_count} Cancelled</div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <h4 className="mb-4">Cancellation Reasons</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {stats.cancellationStats?.map((cs, i) => (
                <div key={i} className="p-3 bg-light rounded text-center">
                    <div className="small text-muted mb-1">{cs.cancellation_reason}</div>
                    <div className="h4 mb-0 fw-bold">{cs.count}</div>
                </div>
            ))}
            {stats.cancellationStats?.length === 0 && <div className="text-muted py-2">No cancellations yet.</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '1.5rem' }}>
        <div className="card">
          <h4 className="mb-4">Revenue History</h4>
          <Bar data={revenueData} options={{ responsive: true }} />
        </div>
        <div className="card">
          <h4 className="mb-4">Order Status</h4>
          <Pie data={statusData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
