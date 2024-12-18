import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || null);  // Retrieve token from localStorage

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const setAuthToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);  // Save token to localStorage
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, token, setAuthToken }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
