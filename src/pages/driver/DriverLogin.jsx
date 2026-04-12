import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DriverAuthContext } from '../../context/DriverAuthContext';
import { toast } from 'sonner';
import { Truck } from 'lucide-react';
import './DriverLogin.css';

const DriverLogin = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const { login, driver } = useContext(DriverAuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (driver) {
            navigate('/driver/home');
        }
    }, [driver, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(phone, password);
            toast.success('Logged in successfully');
            navigate('/driver/home');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="driver-login-container">
            <div className="driver-login-card">
                <div className="driver-login-header">
                    <div className="brand-logo">
                        <Truck size={40} className="text-white" />
                    </div>
                    <h2>Driver Partner App</h2>
                    <p>Deliver smiles, earn fast.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="driver-login-form">
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input 
                            type="tel" 
                            placeholder="Enter registered mobile number" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            placeholder="Enter password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <button type="submit" className="driver-login-btn">
                        Start Delivering
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DriverLogin;
