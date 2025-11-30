import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedAdminRoute = () => {
    const location = useLocation();
    const [authState, setAuthState] = useState({
        isChecking: true,
        isAuthenticated: false,
        isAdmin: false,
    });

    useEffect(() => {
        // Check authentication status by calling the API
        const checkAuth = async () => {
            // First check localStorage for user data
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (!user || !user.isAdmin) {
                // No user in localStorage or not admin
                setAuthState({
                    isChecking: false,
                    isAuthenticated: false,
                    isAdmin: false,
                });
                return;
            }

            // Verify the token is still valid by making an API call
            try {
                const response = await fetch('http://localhost:5000/api/users', {
                    credentials: 'include', // Send the httpOnly cookie
                });

                if (response.ok) {
                    // Token is valid
                    setAuthState({
                        isChecking: false,
                        isAuthenticated: true,
                        isAdmin: user.isAdmin,
                    });
                } else {
                    // Token is invalid or expired
                    localStorage.removeItem('user');
                    setAuthState({
                        isChecking: false,
                        isAuthenticated: false,
                        isAdmin: false,
                    });
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setAuthState({
                    isChecking: false,
                    isAuthenticated: false,
                    isAdmin: false,
                });
            }
        };

        checkAuth();
    }, [location.pathname]); // Re-check when route changes

    if (authState.isChecking) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    if (!authState.isAuthenticated) {
        // Not logged in, redirect to admin login
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    if (!authState.isAdmin) {
        // Logged in but not admin, redirect to home
        return <Navigate to="/" replace />;
    }

    // User is authenticated and is admin
    return <Outlet />;
};

export default ProtectedAdminRoute;
