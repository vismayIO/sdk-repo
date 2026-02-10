import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * ThemeProvider - Manages light/dark/system theme preference.
 *
 * Toggles the `.dark` class on `<html>` element, which activates
 * CSS variable overrides for dark mode across all SDK components.
 */
export function ThemeProvider({
  children,
  defaultTheme = 'light',
}: {
  children: ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('mfe-theme') as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const getResolved = (t: Theme): 'light' | 'dark' => {
    if (t === 'system') {
      return typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return t;
  };

  const resolvedTheme = getResolved(theme);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('mfe-theme', theme);

    // Emit cross-MFE event
    window.dispatchEvent(
      new CustomEvent('mfe:theme:changed', { detail: { theme: resolvedTheme } })
    );
  }, [theme, resolvedTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setThemeState('system'); // Trigger re-render
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const resolved = getResolved(prev);
      return resolved === 'dark' ? 'light' : 'dark';
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme hook - Access and control theme from any component.
 *
 * Falls back to light theme when used outside ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    return {
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: () => console.warn('[useTheme] No ThemeProvider found'),
      toggleTheme: () => console.warn('[useTheme] No ThemeProvider found'),
    };
  }

  return context;
}
