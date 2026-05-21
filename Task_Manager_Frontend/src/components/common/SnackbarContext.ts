import { createContext } from 'react';
import type { AlertColor } from '@mui/material';

interface SnackbarContextValue {
  notify: (message: string, severity?: AlertColor) => void;
}

export const SnackbarContext = createContext<SnackbarContextValue | null>(null);
