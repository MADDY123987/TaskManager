import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Alert, Snackbar, type AlertColor } from '@mui/material';
import { SnackbarContext } from './SnackbarContext';

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ open: false, message: '', severity: 'success' as AlertColor });

  const notify = useCallback((message: string, severity: AlertColor = 'success') => {
    setState({ open: true, message, severity });
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={3500}
        onClose={() => setState((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={state.severity} variant="filled" sx={{ width: '100%' }}>
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
