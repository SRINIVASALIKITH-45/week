import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { WriterAuthContext } from './WriterAuthContext';

export const WriterAuthProvider = ({ children }) => {
    const [writer, setWriter] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('writerToken');
        if (token) {
            fetchWriterProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchWriterProfile = async () => {
        try {
            const res = await api.get('/writer-auth/profile', {
                headers: { Authorization: `Bearer ${localStorage.getItem('writerToken')}` }
            });
            setWriter(res.data);
        } catch (error) {
            localStorage.removeItem('writerToken');
            setWriter(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (phone, password) => {
        const res = await api.post('/writer-auth/login', { phone, password });
        localStorage.setItem('writerToken', res.data.token);
        setWriter(res.data.writer);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('writerToken');
        setWriter(null);
    };

    const toggleDuty = async (is_on_duty) => {
        try {
            const res = await api.patch('/writer-auth/toggle-duty', { is_on_duty }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('writerToken')}` }
            });
            setWriter(prev => ({ ...prev, is_on_duty: res.data.is_on_duty, last_login_time: res.data.last_login_time }));
            return res.data;
        } catch (error) {
            console.error('Failed to toggle duty', error);
            throw error;
        }
    };

    return (
        <WriterAuthContext.Provider value={{ writer, loading, login, logout, toggleDuty }}>
            {children}
        </WriterAuthContext.Provider>
    );
};
