import { Avatar, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { useMeQuery } from '../../api/authApi';
import { PageHeader } from '../../components/common/PageHeader';
import { useAppSelector } from '../../hooks/redux';

export function ProfilePage() {
  const token = useAppSelector((state) => state.auth.token);
  const cachedUser = useAppSelector((state) => state.auth.user);
  const { data, isLoading } = useMeQuery(undefined, { skip: !token });
  const user = data ?? cachedUser;

  return (
    <>
      <PageHeader title="Profile" subtitle="Your account details." />
      <Paper sx={{ p: 3, maxWidth: 560 }}>
        {isLoading && !user ? (
          <Skeleton variant="rounded" height={140} />
        ) : (
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 28 }}>{user?.name?.charAt(0)?.toUpperCase() ?? 'U'}</Avatar>
            <div>
              <Typography variant="h5">{user?.name ?? 'Unknown user'}</Typography>
              <Typography color="text.secondary">{user?.email ?? 'No email available'}</Typography>
            </div>
          </Stack>
        )}
      </Paper>
    </>
  );
}
