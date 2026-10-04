import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const storedToken = localStorage.getItem('token') || '';
    const [token, setToken] = useState(storedToken);
    // Restore user from localStorage on page refresh so logged-in state is preserved
    const [user, setUser] = useState(() => {
        if (!storedToken) return null;
        // Check if token is expired before restoring user
        try {
            const base64Url = storedToken.split('.')[1];
            const decoded = JSON.parse(atob(base64Url.replace(/-/g, '+').replace(/_/g, '/')));
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                return null;
            }
        } catch {
            return null;
        }
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
            setUser(null);
        }
    }, [token]);

    const login = (jwt, userData) => {
        setToken(jwt);
        setUser(userData);
        // Store user data alongside the token so it survives page refresh
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setToken('');
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
