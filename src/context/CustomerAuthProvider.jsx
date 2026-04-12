import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CustomerAuthContext } from './CustomerAuthContext';

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    const storedCustomer = localStorage.getItem('customerUser');

    if (token && storedCustomer) {
      setCustomer(JSON.parse(storedCustomer));
    }
    setLoading(false);
  }, []);

  const login = async (emailOrPhone, password) => {
    // Determine if the input is an email or a phone number
    const isEmail = emailOrPhone.includes('@');
    const payload = isEmail ? { email: emailOrPhone, password } : { phone: emailOrPhone, password };
    
    const res = await api.post('/customer-auth/login', payload);
    const { token, id, name, email: customerEmail } = res.data;
    
    const customerData = { id, name, email: customerEmail };
    localStorage.removeItem('token'); // Clear admin token to avoid conflict
    localStorage.setItem('customerToken', token);
    localStorage.setItem('customerUser', JSON.stringify(customerData));
    setCustomer(customerData);
    return res.data;
  };

  const register = async (customerDetails) => {
    const res = await api.post('/customer-auth/register', customerDetails);
    const { token, id, name, email } = res.data;
    
    const customerData = { id, name, email };
    localStorage.setItem('customerToken', token);
    localStorage.setItem('customerUser', JSON.stringify(customerData));
    setCustomer(customerData);
  };

  const logout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, login, register, logout, loading }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};
