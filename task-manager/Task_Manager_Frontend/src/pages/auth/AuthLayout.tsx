import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { BrandMark } from '../../components/common/BrandMark';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
        backgroundImage: 'linear-gradient(135deg, rgba(232,242,255,0.95), rgba(255,255,255,0.45) 48%, rgba(245,247,251,1))',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 460,
          borderColor: 'rgba(25, 118, 210, 0.14)',
          boxShadow: '0 24px 70px rgba(15, 23, 42, 0.14)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
          <Stack spacing={3}>
            <Stack spacing={1} textAlign="center">
              <Box sx={{ mx: 'auto' }}>
                <BrandMark size={52} />
              </Box>
              <Typography variant="h5">Team Task Manager</Typography>
              <Typography variant="h6">{title}</Typography>
              <Typography color="text.secondary">{subtitle}</Typography>
            </Stack>
            {children}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
