import { createContext, useContext } from 'react';

export type SnackbarSeverity = 'success' | 'info' | 'warning' | 'error';

export interface SnackbarContextValue {
  notify: (message: string, severity?: SnackbarSeverity) => void;
}

export const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error('useSnackbar must be used inside SnackbarProvider');
  return context;
}
