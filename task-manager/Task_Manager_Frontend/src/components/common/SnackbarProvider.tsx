import { ReactNode, useCallback, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { SnackbarContext, SnackbarSeverity } from './snackbarContext';

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({
    open: false,
    message: '',
    severity: 'success' as SnackbarSeverity,
  });

  const notify = useCallback((message: string, severity: SnackbarSeverity = 'success') => {
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
