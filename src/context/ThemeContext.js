import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Проверяем localStorage при загрузке
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? true : false;
  });

  useEffect(() => {
    // Сохраняем тему в localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Меняем класс на body (для глобальных стилей)
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}