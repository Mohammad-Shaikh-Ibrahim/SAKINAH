import { createTheme } from '@mui/material/styles';

// Define the brand colors based on the "AMAL/hope" theme (Teal/Blue/Green)
export const tokens = {
  primary: {
    main: '#009688', // Teal
    light: '#33ab9f',
    dark: '#00695f',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#4caf50', // Green
    light: '#6fbf73',
    dark: '#357a38',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f4f6f8', // Soft gray/blueish background
    paper: '#ffffff',
  },
  text: {
    primary: '#172b4d',
    secondary: '#6b778c',
  },
  status: {
    success: '#36B37E',
    warning: '#FFAB00',
    error: '#FF5630',
    info: '#0065FF',
  },
};

// Create MUI theme
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
    borderRadius: 8, // Soft rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Remove uppercase transform
          fontWeight: 600,
          borderRadius: '8px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)', // Gentle shadow
        },
      },
    },
  },
});
