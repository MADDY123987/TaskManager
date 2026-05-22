import { RouterProvider } from 'react-router-dom';
import { router } from '../routes/router';
import { SnackbarProvider } from '../components/common/SnackbarProvider';
import { WebSocketProvider } from '../services/websocket/WebSocketProvider';

export function App() {
  return (
    <SnackbarProvider>
      <WebSocketProvider>
        <RouterProvider router={router} />
      </WebSocketProvider>
    </SnackbarProvider>
  );
}
