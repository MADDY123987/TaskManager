import { RouterProvider } from 'react-router-dom';
import { router } from '../routes/router';
import { SnackbarProvider } from '../components/common/SnackbarProvider';
import { WebSocketProvider } from '../services/websocket/WebSocketProvider';
import { AppErrorBoundary } from '../components/common/AppErrorBoundary';

export function App() {
  return (
    <AppErrorBoundary>
      <SnackbarProvider>
        <WebSocketProvider>
          <RouterProvider router={router} />
        </WebSocketProvider>
      </SnackbarProvider>
    </AppErrorBoundary>
  );
}
