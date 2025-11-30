import React, { createContext, useReducer, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        loading: false,
        user: null,
      };
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const initialState = {
    isAuthenticated: null,
    loading: true,
    user: null,
  };

  const [state, dispatch] = useReducer(authReducer, initialState);
  const [cartItems, setCartItems] = useState([]);

  // Configure axios to send cookies with requests
  axios.defaults.withCredentials = true;

  const loadUser = async () => {
    try {
      const res = await axios.get('/api/users');
      dispatch({ type: 'USER_LOADED', payload: res.data });
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  const fetchCart = async () => {
    try {
      const { data } = await axios.get('/api/cart');
      setCartItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchCart();
    }
  }, [state.isAuthenticated]);

  const register = async (formData) => {
    try {
      const res = await axios.post('/api/users/register', formData);
      dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
      loadUser();
    } catch (err) {
      dispatch({ type: 'REGISTER_FAIL' });
    }
  };

  const login = async (formData) => {
    console.log('Attempting login with:', formData);
    try {
      const res = await axios.post('/api/users/login', formData);
      console.log('Login successful, response:', res.data);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      loadUser();
    } catch (err) {
      console.error('Login failed:', err.response ? err.response.data : err.message);
      dispatch({ type: 'LOGIN_FAIL' });
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/users/logout'); // Assuming a logout endpoint on backend
      dispatch({ type: 'LOGOUT' });
    } catch (err) {
      console.error('Logout failed:', err.response ? err.response.data : err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, register, login, logout, cartItems, fetchCart }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
