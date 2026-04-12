import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { 
  Store, 
  MapPin, 
  Percent, 
  Truck, 
  Package, 
  Zap, 
  Save, 
  Plus, 
  Trash2 
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    is_restaurant_open: 'true',
    gst_percentage: '5',
    delivery_charge: '40',
    packaging_charge: '10',
    festival_mode_active: 'false'
  });
  const [zones, setZones] = useState([]);
  const [newZone, setNewZone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, zonesRes] = await Promise.all([
        api.get('/settings'),
        api.get('/settings/zones')
      ]);
      setSettings(settingsRes.data);
      setZones(zonesRes.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch settings');
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings', { settings });
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleAddZone = async () => {
    if (!newZone) return;
    try {
      await api.post('/settings/zones', { zone_name: newZone });
      setNewZone('');
      fetchData();
      toast.success('Zone added');
    } catch (error) {
      toast.error('Failed to add zone');
    }
  };

  const handleDeleteZone = async (id) => {
    try {
      await api.delete(`/settings/zones/${id}`);
      fetchData();
      toast.success('Zone deleted');
    } catch (error) {
      toast.error('Failed to delete zone');
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="container-fluid animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontWeight: '700' }}>Store Configuration</h2>
      </div>

      <div className="row g-4">
        <div className="col-md-8">
          <div className="glass p-4 mb-4">
            <h4 className="mb-4 d-flex align-items-center gap-2">
              <Store size={22} className="text-primary" /> General Settings
            </h4>
            
            <form onSubmit={handleUpdateSettings}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Restaurant Status</label>
                  <select 
                    className="form-select"
                    value={settings.is_restaurant_open}
                    onChange={(e) => setSettings({...settings, is_restaurant_open: e.target.value})}
                  >
                    <option value="true">Open</option>
                    <option value="false">Closed</option>
                  </select>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Festival Mode</label>
                  <select 
                    className="form-select"
                    value={settings.festival_mode_active}
                    onChange={(e) => setSettings({...settings, festival_mode_active: e.target.value})}
                  >
                    <option value="true">Active (Show Special Items)</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <hr className="my-3" />
                <h5 className="mb-2 d-flex align-items-center gap-2">
                  <Percent size={18} /> Taxes & Charges
                </h5>

                <div className="col-md-4">
                  <label className="form-label">GST Percentage</label>
                  <div className="input-group">
                    <input 
                      type="number" 
                      className="form-control"
                      value={settings.gst_percentage}
                      onChange={(e) => setSettings({...settings, gst_percentage: e.target.value})}
                    />
                    <span className="input-group-text">%</span>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Delivery Charge</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input 
                      type="number" 
                      className="form-control"
                      value={settings.delivery_charge}
                      onChange={(e) => setSettings({...settings, delivery_charge: e.target.value})}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Packaging Charge</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input 
                      type="number" 
                      className="form-control"
                      value={settings.packaging_charge}
                      onChange={(e) => setSettings({...settings, packaging_charge: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="glass p-4">
            <h4 className="mb-4 d-flex align-items-center gap-2">
              <Zap size={22} className="text-warning" /> Dynamic Pricing System
            </h4>
            <p className="text-muted">Dynamic pricing automatically adjusts product prices based on specified peak hour slots. (Coming Soon - Logic implemented in backend hooks)</p>
            <div className="alert alert-info">
              Current Mode: <strong>Manual override enabled</strong>. 
              Prices will be boosted by +10% during peak hours (7 PM - 10 PM) automatically if configured.
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass p-4">
            <h4 className="mb-4 d-flex align-items-center gap-2">
              <MapPin size={22} className="text-danger" /> Delivery Zones
            </h4>
            
            <div className="input-group mb-3">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Zone Name (e.g. Downtown)" 
                value={newZone}
                onChange={(e) => setNewZone(e.target.value)}
              />
              <button className="btn btn-outline-primary" onClick={handleAddZone}>
                <Plus size={18} />
              </button>
            </div>

            <ul className="list-group list-group-flush">
              {zones.length === 0 ? (
                <li className="list-group-item text-muted text-center py-4">No specific zones defined. Delivery allowed everywhere.</li>
              ) : (
                zones.map(zone => (
                  <li key={zone.id} className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent">
                    <span>{zone.zone_name}</span>
                    <button className="btn btn-link text-danger p-0" onClick={() => handleDeleteZone(zone.id)}>
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
