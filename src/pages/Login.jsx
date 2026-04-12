import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, Lock, User, Truck } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success('Welcome back to the Admin Panel!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={{
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Left side - Visual Branding */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'none',
        // Hide on typical mobile screens
        '@media (min-width: 768px)': {
          display: 'block'
        }
      }} className="d-flex d-md-block d-none-mobile">
        {/* We use an inline style workaround for the split screen since basic media queries need classes */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          {/* Overlay to darken image */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(226,55,68,0.4) 100%)',
          }}></div>
        </div>
        
        {/* Branding Content */}
        <div style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '4rem',
          color: 'white',
          zIndex: 10
        }}>
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '50px', 
              height: '50px', 
              backgroundColor: 'var(--primary)', 
              borderRadius: '12px',
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              boxShadow: '0 8px 32px rgba(226, 55, 68, 0.4)'
            }}>
              <Truck size={28} color="white" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
              Door To Door
            </h1>
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1.5rem', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              Delivering <br/>
              <span style={{ color: 'var(--primary)' }}>Excellence.</span>
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', maxWidth: '400px', lineHeight: '1.6' }}>
              Welcome to the central command center. Manage your menu, track live orders, and monitor your business performance in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        position: 'relative'
      }}>
        {/* Subtle background abstract circle for right pane */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(226,55,68,0.06) 0%, rgba(226,55,68,0) 70%)',
          borderRadius: '50%',
          zIndex: 0
        }}></div>

        <div className="card glass animate-fade-in" style={{ 
          width: '100%', 
          maxWidth: '440px', 
          padding: '3rem', 
          zIndex: 10,
          border: '1px solid rgba(226, 55, 68, 0.1)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: 'var(--text-primary)', 
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em'
            }}>Admin Portal</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Sign in to Door To Door Delivery
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-4">
              <label className="form-label" style={{ fontWeight: '600' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }}>
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter your username"
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ paddingLeft: '2.8rem', height: '3.2rem', fontSize: '1rem' }}
                  required 
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label" style={{ fontWeight: '600' }}>Password</label>
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
                  style={{ paddingLeft: '2.8rem', height: '3.2rem', fontSize: '1rem' }}
                  required 
                />
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }} /> 
                Remember me
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                height: '3.5rem', 
                fontSize: '1.05rem', 
                fontWeight: '600',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Sign In 
              <ArrowRight 
                size={20} 
                style={{ 
                  transform: isHovered ? 'translateX(4px)' : 'translateX(0)', 
                  transition: 'transform 0.3s ease' 
                }} 
              />
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} Door To Door Delivery. <br/>All rights reserved.
          </p>
        </div>
      </div>

      {/* Add a little piece of media query styles directly for the display block/none split screen */}
      <style>{`
        @media (max-width: 900px) {
          .d-none-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
