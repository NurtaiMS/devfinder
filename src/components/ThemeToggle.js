import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      aria-label="Переключить тему"
    >
      {isDark ? <FaSun /> : <FaMoon />}
    </button>
  );
}