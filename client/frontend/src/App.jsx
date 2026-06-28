import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Boards from './pages/Boards';
import BoardDetail from './pages/BoardDetail';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Activity from './pages/Activity';
import Setting from './pages/Setting';
import { TaskProvider } from './context/TaskContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
           <TaskProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                {/* Dashboard Routes */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Board Routes */}
                <Route path="boards" element={<Boards />} />
                <Route path="boards/:boardId" element={<BoardDetail />} />
                
                {/* Calendar Route */}
                <Route path="calendar" element={<Calendar />} />
                
                {/* Analytics Route */}
                <Route path="analytics" element={<Analytics />} />
                
                {/* Activity Route */}
                <Route path="activity" element={<Activity />} />
                
                {/* Settings Route */}
                <Route path="settings" element={<Setting />} />
                
               
              </Route>
              
              {/* 404 Not Found Route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
          </TaskProvider>
        </AuthProvider>
        
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;