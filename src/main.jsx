import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthProvider.jsx';
import { CustomerAuthProvider } from './context/CustomerAuthProvider.jsx';
import { DriverAuthProvider } from './context/DriverAuthProvider.jsx';
import { SocketProvider } from './context/SocketProvider.jsx';
import { CartProvider } from './context/CartProvider.jsx';
import { WriterAuthProvider } from './context/WriterAuthProvider.jsx';
import { KitchenAuthProvider } from './context/KitchenAuthProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CustomerAuthProvider>
        <DriverAuthProvider>
          <WriterAuthProvider>
            <KitchenAuthProvider>
              <CartProvider>
                <SocketProvider>
                  <App />
                </SocketProvider>
              </CartProvider>
            </KitchenAuthProvider>
          </WriterAuthProvider>
        </DriverAuthProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  </React.StrictMode>,
);
