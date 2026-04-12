import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { toast } from 'sonner';
import { SocketContext } from './SocketContext';
import { SOCKET_URL } from '../config';

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });

        newSocket.on('newOrder', (order) => {
            toast.info(`New Order! ID: #${order.id} - Total: ₹${order.total}`, {
                description: 'Check the orders page for details.',
                duration: 5000,
            });
            // Play a notification sound if possible?
        });

        newSocket.on('orderStatusUpdate', (data) => {
            toast.success(`Order #${data.id} is now ${data.status}`);
        });

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
