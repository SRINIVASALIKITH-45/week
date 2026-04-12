import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ClipboardList, 
  Search, 
  Clock, 
  User, 
  Activity 
} from 'lucide-react';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/settings/logs');
      setLogs(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch logs', error);
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) || 
    log.username.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontWeight: '700' }}>Admin Activity Logs</h2>
        <div className="d-flex gap-2">
          <div className="position-relative">
            <Search className="position-absolute translate-middle-y top-50 start-0 ms-3 text-muted" size={18} />
            <input 
              type="text" 
              className="form-control ps-5" 
              placeholder="Search logs..." 
              style={{ width: '300px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="glass overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5">Loading logs...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-5">No logs found.</td></tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 text-muted">
                      <div className="d-flex align-items-center gap-2">
                        <Clock size={14} />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <div className="d-flex align-items-center gap-2">
                        <User size={14} className="text-primary" />
                        {log.username}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-soft-primary text-primary">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted" style={{ maxWidth: '400px' }}>
                      <pre className="mb-0 overflow-hidden text-truncate" style={{ fontSize: '0.8rem', backgroundColor: 'transparent', color: 'inherit' }}>
                        {log.details}
                      </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
