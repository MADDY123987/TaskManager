import { RouterProvider } from 'react-router-dom';
import { router } from '../routes/router';
import { SnackbarProvider } from '../components/common/SnackbarProvider';

export function App() {
  return (
    <SnackbarProvider>
      <RouterProvider router={router} />
    </SnackbarProvider>
  );
}
