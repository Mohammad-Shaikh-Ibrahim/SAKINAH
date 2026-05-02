import { createTheme } from '@mui/material/styles';

export const tokens = {
  primary: {
    main: '#2D9596',    // brand teal — used consistently across all components
    light: '#4DB6AC',
    dark: '#0d4a4b',    // deep teal for gradients and hover states
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
    primary: '#172B4D',   // dark navy — heading text, labels
    secondary: '#6B778C', // slate — captions, meta text
  },
  status: {
    success: '#36B37E',
    warning: '#FFAB00',
    error: '#FF5630',
    info: '#0065FF',
  },
};

export const theme = createTheme({
  palette: {
    primary: tokens.primary,
    secondary: tokens.secondary,
    background: tokens.background,
    text: tokens.text,
    success: { main: tokens.status.success },
    warning: { main: tokens.status.warning },
    error: { main: tokens.status.error },
    info: { main: tokens.status.info },
  },
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
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});
