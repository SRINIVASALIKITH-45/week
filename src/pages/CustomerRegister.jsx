import React, { useState, useContext } from 'react';
import { CustomerAuthContext } from '../context/CustomerAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, Lock, Mail, User, Phone, MapPin, Truck } from 'lucide-react';

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    location: '',
    password: ''
  });
  const { register } = useContext(CustomerAuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      toast.success('Registration successful!');
      navigate('/customer/home');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem'
    }}>
      <div className="card glass animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--primary)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Truck size={28} color="white" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: '4px' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif" }}>Join the premium food delivery network</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group mb-3">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }}>
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  name="name"
                  className="form-control" 
                  placeholder="John Doe"
                  value={formData.name} 
                  onChange={handleChange}
                  style={{ paddingLeft: '2.8rem' }}
                  required 
                />
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Gender</label>
              <select 
                name="gender"
                className="form-control" 
                value={formData.gender} 
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }}>
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                name="email"
                className="form-control" 
                placeholder="john@example.com"
                value={formData.email} 
                onChange={handleChange}
                style={{ paddingLeft: '2.8rem' }}
                required 
              />
            </div>
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }}>
                <Phone size={18} />
              </div>
              <input 
                type="tel" 
                name="phone"
                className="form-control" 
                placeholder="1234567890"
                value={formData.phone} 
                onChange={handleChange}
                style={{ paddingLeft: '2.8rem' }}
                required 
              />
            </div>
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Location / Address</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1rem', left: '1rem', color: 'var(--text-secondary)' }}>
                <MapPin size={18} />
              </div>
              <textarea 
                name="location"
                className="form-control" 
                placeholder="Enter your delivery address"
                value={formData.location} 
                onChange={handleChange}
                style={{ paddingLeft: '2.8rem', minHeight: '80px' }}
                required 
              ></textarea>
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }}>
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                name="password"
                className="form-control" 
                placeholder="Create a password"
                value={formData.password} 
                onChange={handleChange}
                style={{ paddingLeft: '2.8rem' }}
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '3.5rem', fontWeight: '600' }}>
            Register Now <ArrowRight size={20} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/customer-login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default CustomerRegister;
