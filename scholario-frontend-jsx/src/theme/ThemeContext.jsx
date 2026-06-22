import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeModeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  });

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      return next;
    });
  };

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode,
        primary: {
          main: mode === 'dark' ? '#818cf8' : '#6366f1', // Indigo-400 for dark mode, Indigo-500 for light mode
          light: mode === 'dark' ? '#a5b4fc' : '#818cf8',
          dark: mode === 'dark' ? '#4f46e5' : '#4338ca',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#10b981', // Emerald
        },
        background: {
          default: mode === 'dark' ? '#090d16' : '#f8fafc', // Very sleek dark space navy vs clean slate blue-grey
          paper: mode === 'dark' ? '#111827' : '#ffffff', // Dark grey/navy paper vs white
        },
        text: {
          primary: mode === 'dark' ? '#f8fafc' : '#0f172a',
          secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
        },
        divider: mode === 'dark' ? '#1f2937' : '#e2e8f0',
        action: {
          hover: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
          selected: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        },
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h5: {
          fontWeight: 800,
          letterSpacing: '-0.02em',
        },
        h6: {
          fontWeight: 700,
          letterSpacing: '-0.01em',
        },
        subtitle1: {
          fontWeight: 600,
        },
        subtitle2: {
          fontWeight: 700,
        },
        body1: {
          fontSize: '0.9375rem',
          lineHeight: 1.6,
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.5,
        },
        caption: {
          fontWeight: 600,
          letterSpacing: '0.02em',
        },
      },
      shape: {
        borderRadius: 12,
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              scrollbarColor: mode === 'dark' ? '#374151 #1f2937' : '#cbd5e1 #f1f5f9',
              transition: 'background-color 0.3s ease, color 0.3s ease',
            },
          },
        },
        MuiCard: {
          defaultProps: {
            elevation: 0,
          },
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              borderRadius: 16,
              border: `1px solid ${mode === 'dark' ? '#1f2937' : '#e2e8f0'}`,
              boxShadow: mode === 'dark' 
                ? '0 4px 20px -2px rgba(0, 0, 0, 0.4)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
              transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
            },
          },
        },
        MuiButton: {
          defaultProps: {
            disableElevation: true,
          },
          styleOverrides: {
            root: {
              borderRadius: 10,
              textTransform: 'none',
              fontWeight: 600,
              transition: 'all 0.2s ease',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundImage: 'none',
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};
