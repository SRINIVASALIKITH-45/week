import React, { useState, useContext } from 'react';
import { CustomerAuthContext } from '../context/CustomerAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, Lock, Mail, Truck } from 'lucide-react';

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(CustomerAuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/customer/home');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={{
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div className="card glass animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--primary)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Truck size={28} color="white" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: '4px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif" }}>Securely login to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }}>
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                className="form-control" 
                placeholder="Enter your email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.8rem' }}
                required 
              />
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
                className="form-control" 
                placeholder="Enter your password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.8rem' }}
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '3.5rem', fontWeight: '600' }}>
            Sign In <ArrowRight size={20} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/customer-register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default CustomerLogin;
