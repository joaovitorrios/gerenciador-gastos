import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import TransactionForm from './pages/TransactionForm';
import PrivateRoute from './components/PrivateRoute';

// Configure axios defaults
import axios from 'axios';
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
axios.defaults.timeout = 5000;

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/transactions" element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            } />
            <Route path="/transactions/new" element={
              <PrivateRoute>
                <TransactionForm />
              </PrivateRoute>
            } />
            <Route path="/transactions/edit/:id" element={
              <PrivateRoute>
                <TransactionForm />
              </PrivateRoute>
            } />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;