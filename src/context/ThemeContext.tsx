import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'bright';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isBright: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem('projectsaathi_theme');
      if (savedTheme === 'bright' || savedTheme === 'dark') {
        return savedTheme;
      }
    } catch {}
    return 'dark';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('projectsaathi_theme', newTheme);
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'bright' : 'dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'bright') {
      root.classList.add('bright-theme');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'bright');
    } else {
      root.classList.remove('bright-theme');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isBright: theme === 'bright' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
