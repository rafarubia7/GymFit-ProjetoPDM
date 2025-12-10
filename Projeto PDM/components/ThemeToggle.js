// components/ThemeToggle.js
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle">
      <input 
        type="checkbox" 
        id="theme-toggle" 
        className="theme-toggle-input"
        checked={theme === 'dark'}
        onChange={toggleTheme}
      />
      <label htmlFor="theme-toggle" className="theme-toggle-label">
        <span className="theme-toggle-inner">
          <i className="bi bi-moon-fill"></i>
          <i className="bi bi-sun-fill"></i>
        </span>
      </label>
    </div>
  );
}

export default ThemeToggle;
