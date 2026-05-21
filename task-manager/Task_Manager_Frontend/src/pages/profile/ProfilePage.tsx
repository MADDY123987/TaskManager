import { Avatar, Card, CardContent, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { useMeQuery } from '../../api/authApi';
import { PageHeader } from '../../components/common/PageHeader';

export function ProfilePage() {
  const { data: user, isLoading } = useMeQuery();

  return (
    <Stack spacing={3}>
      <PageHeader title="Profile" subtitle="Your account details." />
      <Card>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.dark', fontSize: 34, fontWeight: 800 }}>
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </Avatar>
            <Grid container spacing={2} sx={{ flex: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography color="text.secondary">Name</Typography>
                <Typography variant="h6">{isLoading ? <Skeleton width={180} /> : user?.name}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography color="text.secondary">Email</Typography>
                <Typography variant="h6">{isLoading ? <Skeleton width={240} /> : user?.email}</Typography>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
