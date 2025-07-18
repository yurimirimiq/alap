import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, User, Phone } from 'lucide-react';
import { AndCompanyLogo } from './icons';

interface UserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface LoginPageProps {
  onLogin: (userName?: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // 회원가입 폼 상태
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  // 비밀번호 찾기 폼 상태
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 회원가입된 사용자 정보 확인
    const registeredUsers = JSON.parse(localStorage.getItem('registered-users') || '[]') as UserData[];
    const user = registeredUsers.find(u => u.email === email && u.password === password);
    
    setTimeout(() => {
      setIsLoading(false);
      if (user) {
        onLogin(user.name);
      } else {
        alert('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    }, 1500);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (signupData.password.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    
    // 회원가입 처리
    setTimeout(() => {
      setIsLoading(false);
      
      // 기존 사용자 목록 가져오기
      const existingUsers = JSON.parse(localStorage.getItem('registered-users') || '[]') as UserData[];
      
      // 이메일 중복 확인
      if (existingUsers.some(user => user.email === signupData.email)) {
        alert('이미 등록된 이메일입니다.');
        return;
      }
      
      // 새 사용자 추가
      const newUser: UserData = {
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        phone: signupData.phone
      };
      
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('registered-users', JSON.stringify(updatedUsers));
      localStorage.setItem('user-name', signupData.name);
      
      alert('회원가입이 완료되었습니다!');
      onLogin(signupData.name);
    }, 1500);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 등록된 사용자인지 확인
    const registeredUsers = JSON.parse(localStorage.getItem('registered-users') || '[]') as UserData[];
    const userExists = registeredUsers.some(user => user.email === forgotEmail);
    
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      if (userExists) {
        alert('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
        setCurrentView('login');
      } else {
        alert('등록되지 않은 이메일입니다.');
      }
    }, 1500);
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    setIsLoading(true);
    
    // 소셜 로그인 시뮬레이션 (실제로는 OAuth 구현 필요)
    setTimeout(() => {
      setIsLoading(false);
      const userName = provider === 'google' ? 'Google 사용자' : 'Apple 사용자';
      const socialEmail = `${userName.toLowerCase().replace(' ', '')}@${provider}.com`;
      
      // 소셜 로그인 사용자도 등록된 사용자 목록에 추가
      const existingUsers = JSON.parse(localStorage.getItem('registered-users') || '[]') as UserData[];
      if (!existingUsers.some(user => user.email === socialEmail)) {
        const socialUser: UserData = {
          name: userName,
          email: socialEmail,
          password: 'social-login', // 소셜 로그인은 비밀번호가 없음
        };
        const updatedUsers = [...existingUsers, socialUser];
        localStorage.setItem('registered-users', JSON.stringify(updatedUsers));
      }
      
      localStorage.setItem('user-name', userName);
      onLogin(userName);
    }, 2000);
  };

  // 로그인 폼
  if (currentView === 'login') {
    return (
      <div className="login-container">
        <div className="login-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        
        <div className="login-content">
          <div className="login-card">
            <div className="login-header">
              <div className="company-logo">
                <AndCompanyLogo className="logo-icon" />
                <h1 className="company-name">AND COMPANY</h1>
              </div>
              <p className="login-subtitle">AND COMPANY 워크스페이스에 오신 것을 환영합니다</p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">이메일</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    className="form-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">비밀번호</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-wrapper">
                  <input type="checkbox" className="checkbox" />
                  <span className="checkbox-label">로그인 상태 유지</span>
                </label>
                <button 
                  type="button"
                  className="forgot-password"
                  onClick={() => setCurrentView('forgot')}
                >
                  비밀번호 찾기
                </button>
              </div>

              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    로그인
                    <ArrowRight className="button-icon" />
                  </>
                )}
              </button>
            </form>

            <div className="login-divider">
              <span>또는</span>
            </div>

            <div className="social-login">
              <button 
                className="social-button google"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
              >
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 계속하기
              </button>
              
              <button 
                className="social-button apple"
                onClick={() => handleSocialLogin('apple')}
                disabled={isLoading}
              >
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple로 계속하기
              </button>
            </div>

            <div className="signup-link">
              계정이 없으신가요? 
              <button 
                type="button"
                onClick={() => setCurrentView('signup')}
                className="signup-link-btn"
              >
                회원가입
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 회원가입 폼
  if (currentView === 'signup') {
    return (
      <div className="login-container">
        <div className="login-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        
        <div className="login-content">
          <div className="login-card">
            <div className="login-header">
              <div className="company-logo">
                <AndCompanyLogo className="logo-icon" />
                <h1 className="company-name">AND COMPANY</h1>
              </div>
              <p className="login-subtitle">새로운 계정을 만들어보세요</p>
            </div>

            <form className="login-form" onSubmit={handleSignup}>
              <div className="form-group">
                <label className="form-label">이름</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="홍길동"
                    value={signupData.name}
                    onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">이메일</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    className="form-input"
                    placeholder="your@email.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">전화번호</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="010-1234-5678"
                    value={signupData.phone}
                    onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">비밀번호</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="6자 이상 입력하세요"
                    value={signupData.password}
                    onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">비밀번호 확인</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    회원가입
                    <ArrowRight className="button-icon" />
                  </>
                )}
              </button>
            </form>

            <div className="signup-link">
              이미 계정이 있으신가요? 
              <button 
                type="button"
                onClick={() => setCurrentView('login')}
                className="signup-link-btn"
              >
                로그인
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 비밀번호 찾기 폼
  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="company-logo">
              <AndCompanyLogo className="logo-icon" />
              <h1 className="company-name">AND COMPANY</h1>
            </div>
            <p className="login-subtitle">비밀번호를 재설정하세요</p>
          </div>

          <form className="login-form" onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label className="form-label">이메일</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  className="form-input"
                  placeholder="가입하신 이메일을 입력하세요"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  재설정 링크 전송
                  <ArrowRight className="button-icon" />
                </>
              )}
            </button>
          </form>

          <div className="signup-link">
            <button 
              type="button"
              onClick={() => setCurrentView('login')}
              className="signup-link-btn"
            >
              ← 로그인으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;