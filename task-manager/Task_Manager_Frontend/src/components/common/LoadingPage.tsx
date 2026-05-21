import { Box, CircularProgress } from '@mui/material';

export function LoadingPage() {
  return (
    <Box minHeight="100vh" display="grid" sx={{ placeItems: 'center' }}>
      <CircularProgress />
    </Box>
  );
}
