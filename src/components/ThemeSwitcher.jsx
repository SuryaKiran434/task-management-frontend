import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="theme-switcher" onClick={toggleTheme}>
      <span className={`theme-icon ${theme === 'light' ? 'sun' : 'moon'}`} data-icon={theme === 'light' ? '☀️' : '🌙'}>
        {theme === 'light' ? '☀️' : '🌙'} {/* Display the appropriate icon */}
      </span>
    </div>
  );
};

export default ThemeSwitcher;
