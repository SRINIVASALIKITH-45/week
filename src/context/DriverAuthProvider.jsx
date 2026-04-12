import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DriverAuthContext } from './DriverAuthContext';

export const DriverAuthProvider = ({ children }) => {
    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDriverProfile = async () => {
            const token = localStorage.getItem('driverToken');
            if (token) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const res = await api.get('/driver-auth/profile');
                    setDriver(res.data);
                } catch (error) {
                    console.error('Driver Auth error', error);
                    localStorage.removeItem('driverToken');
                    delete api.defaults.headers.common['Authorization'];
                    setDriver(null);
                }
            }
            setLoading(false);
        };
        fetchDriverProfile();
    }, []);

    const login = async (phone, password) => {
        const res = await api.post('/driver-auth/login', { phone, password });
        localStorage.setItem('driverToken', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setDriver(res.data.driver);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('driverToken');
        delete api.defaults.headers.common['Authorization'];
        setDriver(null);
    };

    const updateDriverStatus = (status) => {
        if(driver) {
            setDriver({ ...driver, is_active: status });
        }
    };

    return (
        <DriverAuthContext.Provider value={{ driver, login, logout, loading, updateDriverStatus }}>
            {children}
        </DriverAuthContext.Provider>
    );
};
