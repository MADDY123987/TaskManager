import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1769d3', dark: '#0d47a1', light: '#e8f2ff' },
    success: { main: '#16833a' },
    warning: { main: '#f59e0b' },
    error: { main: '#dc2626' },
    background: { default: '#f5f7fb', paper: '#ffffff' },
    text: { primary: '#111827', secondary: '#64748b' },
    divider: '#e5e7eb',
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
    h4: { fontWeight: 800, letterSpacing: 0 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    overline: { letterSpacing: 0, textTransform: 'uppercase' },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e5e7eb',
          boxShadow: '0 14px 38px rgba(15, 23, 42, 0.06)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, minHeight: 40 },
        containedPrimary: { boxShadow: '0 10px 20px rgba(25, 118, 210, 0.18)' },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700 },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#f8fafc',
          color: '#475569',
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'uppercase',
        },
      },
    },
  },
});
