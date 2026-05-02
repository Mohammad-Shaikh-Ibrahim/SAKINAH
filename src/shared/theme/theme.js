import { createTheme } from '@mui/material/styles';

export const tokens = {
  primary: {
    main: '#2D9596',
    light: '#4DB6AC',
    dark: '#0d4a4b',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#4caf50',
    light: '#6fbf73',
    dark: '#357a38',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f4f6f8',
    paper: '#ffffff',
  },
  text: {
    primary: '#172B4D',
    secondary: '#6B778C',
  },
  status: {
    success: '#36B37E',
    warning: '#FFAB00',
    error: '#FF5630',
    info: '#0065FF',
  },
  dark: {
    primary: { main: '#4ecdc4', light: '#80cbc4', dark: '#00897b', contrastText: '#001a1a' },
    background: { default: '#0a1929', paper: '#0d2137' },
    text: { primary: '#cce8ff', secondary: '#6ba3be' },
  },
};

const sharedOverrides = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 500 },
    h5: { fontSize: '1.25rem', fontWeight: 500 },
    h6: { fontSize: '1rem', fontWeight: 500 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.43 },
  },
  shape: { borderRadius: 8 },
};

export const createAppTheme = (mode = 'light') =>
  createTheme({
    ...sharedOverrides,
    palette: {
      mode,
      primary: mode === 'dark' ? tokens.dark.primary : tokens.primary,
      secondary: tokens.secondary,
      background: mode === 'dark' ? tokens.dark.background : tokens.background,
      text: mode === 'dark' ? tokens.dark.text : tokens.text,
      success: { main: tokens.status.success },
      warning: { main: tokens.status.warning },
      error: { main: tokens.status.error },
      info: { main: tokens.status.info },
      ...(mode === 'dark' && {
        divider: 'rgba(78, 205, 196, 0.12)',
      }),
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, borderRadius: '8px' },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'dark'
              ? '0px 2px 8px rgba(0, 0, 0, 0.4)'
              : '0px 2px 4px rgba(0, 0, 0, 0.05)',
            ...(mode === 'dark' && {
              backgroundImage: 'none',
              border: '1px solid rgba(78, 205, 196, 0.08)',
            }),
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: mode === 'dark' ? {
            backgroundColor: '#0d2137',
            borderBottom: '1px solid rgba(78, 205, 196, 0.12)',
          } : {},
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: mode === 'dark' ? { borderBottomColor: 'rgba(78, 205, 196, 0.08)' } : {},
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: mode === 'dark' ? { color: tokens.dark.text.primary } : {},
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: mode === 'dark' ? { borderColor: 'rgba(78, 205, 196, 0.2)' } : {},
        },
      },
      MuiChip: {
        styleOverrides: {
          root: mode === 'dark' ? { borderColor: 'rgba(78, 205, 196, 0.2)' } : {},
        },
      },
      MuiCssBaseline: {
        styleOverrides: mode === 'dark' ? {
          body: {
            backgroundColor: '#0a1929',
            color: tokens.dark.text.primary,
            scrollbarColor: '#4ecdc4 #0d2137',
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { background: '#0d2137' },
            '&::-webkit-scrollbar-thumb': { background: '#2a7a7a', borderRadius: '4px' },
          },
        } : {},
      },
    },
  });

export const theme = createAppTheme('light');
