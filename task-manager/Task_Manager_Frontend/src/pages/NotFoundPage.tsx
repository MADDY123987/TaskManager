import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Stack minHeight="100vh" alignItems="center" justifyContent="center" spacing={2} textAlign="center" p={2}>
      <Typography variant="h4">Page not found</Typography>
      <Typography color="text.secondary">The page you are looking for does not exist.</Typography>
      <Button component={RouterLink} to="/dashboard" variant="contained">
        Back to dashboard
      </Button>
    </Stack>
  );
}
