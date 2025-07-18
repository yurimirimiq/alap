import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export const useTheme = () => {
  // localStorage에서 저장된 테마를 가져오거나 기본값으로 'dark' 설정
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('workspace-theme') as Theme;
    return savedTheme || 'dark';
  });

  // 컴포넌트 마운트 시 테마 적용
  useEffect(() => {
    applyTheme(theme);
  }, []);

  // 테마 변경 시 DOM과 localStorage 업데이트
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('workspace-theme', theme);
  }, [theme]);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.style.setProperty('--current-background', 'var(--dark-background)');
      root.style.setProperty('--current-primary-panel', 'var(--dark-primary-panel)');
      root.style.setProperty('--current-secondary-panel', 'var(--dark-secondary-panel)');
      root.style.setProperty('--current-border-color', 'var(--dark-border-color)');
      root.style.setProperty('--current-text-primary', 'var(--dark-text-primary)');
      root.style.setProperty('--current-text-secondary', 'var(--dark-text-secondary)');
      root.style.setProperty('--current-shadow-light', 'var(--dark-shadow-light)');
      root.style.setProperty('--current-shadow-medium', 'var(--dark-shadow-medium)');
      root.style.setProperty('--current-shadow-large', 'var(--dark-shadow-large)');
    } else {
      root.style.setProperty('--current-background', 'var(--background-light)');
      root.style.setProperty('--current-primary-panel', 'var(--primary-panel)');
      root.style.setProperty('--current-secondary-panel', 'var(--secondary-panel)');
      root.style.setProperty('--current-border-color', 'var(--border-color)');
      root.style.setProperty('--current-text-primary', 'var(--text-primary)');
      root.style.setProperty('--current-text-secondary', 'var(--text-secondary)');
      root.style.setProperty('--current-shadow-light', 'var(--shadow-light)');
      root.style.setProperty('--current-shadow-medium', 'var(--shadow-medium)');
      root.style.setProperty('--current-shadow-large', 'var(--shadow-large)');
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};