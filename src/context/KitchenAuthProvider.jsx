import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { KitchenAuthContext } from './KitchenAuthContext';

export const KitchenAuthProvider = ({ children }) => {
    const [kitchenUser, setKitchenUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('kitchenToken');
        const storedUser = localStorage.getItem('kitchenUser');
        
        if (storedUser) {
            setKitchenUser(JSON.parse(storedUser));
        }

        if (token) {
            fetchKitchenProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchKitchenProfile = async () => {
        try {
            const res = await api.get('/kitchen-auth/profile');
            setKitchenUser(res.data);
            localStorage.setItem('kitchenUser', JSON.stringify(res.data));
        } catch (error) {
            console.error('Failed to fetch kitchen profile:', error);
            localStorage.removeItem('kitchenToken');
            localStorage.removeItem('kitchenUser');
            setKitchenUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (phone, password) => {
        const res = await api.post('/kitchen-auth/login', { phone, password });
        localStorage.setItem('kitchenToken', res.data.token);
        localStorage.setItem('kitchenUser', JSON.stringify(res.data.staff));
        setKitchenUser(res.data.staff);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('kitchenToken');
        localStorage.removeItem('kitchenUser');
        setKitchenUser(null);
    };

    return (
        <KitchenAuthContext.Provider value={{ kitchenUser, loading, login, logout }}>
            {children}
        </KitchenAuthContext.Provider>
    );
};
