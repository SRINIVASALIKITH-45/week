import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { Plus, Edit } from 'lucide-react';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', vehicle_details: '' });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers');
      setDrivers(res.data);
    } catch (error) {
      toast.error('Failed to fetch drivers');
    }
  };

  const openModal = (driver = null) => {
    setCurrentDriver(driver);
    setFormData(driver ? { name: driver.name, phone: driver.phone, vehicle_details: driver.vehicle_details || '' } : { name: '', phone: '', vehicle_details: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentDriver) {
        await api.put(`/drivers/${currentDriver.id}`, formData);
        toast.success('Driver updated');
      } else {
        await api.post('/drivers', formData);
        toast.success('Driver added');
      }
      setShowModal(false);
      fetchDrivers();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const toggleActive = async (id) => {
    try {
      await api.patch(`/drivers/${id}/toggle-active`);
      toast.success('Status updated');
      fetchDrivers();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Drivers</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add Driver
        </button>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.id}>
                <td>#{d.id}</td>
                <td>{d.name}</td>
                <td>{d.phone}</td>
                <td>{d.vehicle_details}</td>
                <td>
                  <span 
                    className={`badge ${d.is_active ? 'badge-success' : 'badge-neutral'}`}
                    style={{cursor: 'pointer'}}
                    onClick={() => toggleActive(d.id)}
                  >
                    {d.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-outline" style={{padding: '0.4rem 0.6rem'}} onClick={() => openModal(d)}>
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card animate-fade-in" style={{ width: '400px' }}>
            <h3 className="mb-4">{currentDriver ? 'Edit Driver' : 'Add Driver'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Details</label>
                <input type="text" className="form-control" value={formData.vehicle_details} onChange={e => setFormData({...formData, vehicle_details: e.target.value})} />
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="button" className="btn btn-outline" style={{flex: 1}} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
