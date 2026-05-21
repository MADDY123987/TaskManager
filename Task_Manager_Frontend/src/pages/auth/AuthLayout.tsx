import { Box, Paper, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'grid', placeItems: 'center', p: 2 }}>
      <Paper sx={{ width: '100%', maxWidth: 440, p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'primary.main', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 800 }}>T</Box>
          <Box>
            <Typography variant="h6">Team Task Manager</Typography>
            <Typography variant="body2" color="text.secondary">
              Work planning for modern teams
            </Typography>
          </Box>
        </Box>
        <Outlet />
      </Paper>
    </Box>
  );
}
