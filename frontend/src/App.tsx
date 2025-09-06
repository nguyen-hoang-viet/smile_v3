import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme/theme';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import Report from './pages/Report';
import './App.css';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    // Mock login logic - replace with actual API call
    const mockUser: User = {
      id: '1',
      username,
      fullName: username === 'admin' ? 'Quản trị viên' : 'Nhân viên',
      role: username === 'admin' ? 'admin' : 'staff'
    };
    setUser(mockUser);
  };

  const handleRegister = async (username: string, password: string, fullName: string, role: string) => {
    // Mock register logic - replace with actual API call
    const newUser: User = {
      id: Date.now().toString(),
      username,
      fullName,
      role
    };
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Header 
            user={user}
            onLogin={() => setAuthModalOpen(true)}
            onLogout={handleLogout}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<Report />} />
          </Routes>
          
          <AuthModal
            open={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
