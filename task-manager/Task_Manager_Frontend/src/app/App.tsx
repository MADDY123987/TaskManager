import { SnackbarProvider } from '../components/common/SnackbarProvider';
import { AppRoutes } from '../routes/AppRoutes';

export function App() {
  return (
    <SnackbarProvider>
      <AppRoutes />
    </SnackbarProvider>
  );
}
