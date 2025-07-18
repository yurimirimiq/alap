import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Home from './pages/Home';
import Documents from './pages/Documents';
import Favorites from './pages/Favorites';
import PasswordProtected from './pages/PasswordProtected';
import Trash from './pages/Trash';
import Schedule from './pages/Schedule';
import Report from './pages/Report';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>('');

  const handleLogin = (name?: string) => {
    setIsLoggedIn(true);
    if (name) {
      setUserName(name);
      localStorage.setItem('user-name', name);
    } else {
      // 기존 저장된 이름 불러오기
      const savedName = localStorage.getItem('user-name');
      setUserName(savedName || '');
    }
  };

  // 컴포넌트 마운트 시 저장된 사용자 이름 확인
  React.useEffect(() => {
    const savedName = localStorage.getItem('user-name');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div style={{ display: 'none' }} data-user-name={userName}></div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/documents/:pageId" element={<Documents />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/password-protected" element={<PasswordProtected />} />
        <Route path="/trash" element={<Trash />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </Router>
  );
}

export default App;