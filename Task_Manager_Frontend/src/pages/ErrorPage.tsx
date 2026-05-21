import { Box, Button, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export function ErrorPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 2 }}>
      <Paper sx={{ p: 4, maxWidth: 460, textAlign: 'center' }}>
        <Typography variant="h4">Page not found</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          The page you are looking for does not exist or has moved.
        </Typography>
        <Button component={RouterLink} to="/dashboard" variant="contained">
          Go to dashboard
        </Button>
      </Paper>
    </Box>
  );
}
