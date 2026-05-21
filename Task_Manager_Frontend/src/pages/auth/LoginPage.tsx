import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Checkbox, FormControlLabel, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLoginMutation } from '../../api/authApi';
import { setCredentials } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks/redux';
import { useSnackbar } from '../../hooks/useSnackbar';
import { FormTextField } from '../../components/forms/FormTextField';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean(),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  });
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useSnackbar();

  const onSubmit = handleSubmit(async ({ email, password, remember }) => {
    try {
      const payload = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...payload, remember }));
      notify('Welcome back');
      const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch {
      notify('Login failed. Check your credentials.', 'error');
    }
  });

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        Login
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Access your projects, tasks, and team activity.
      </Typography>
      <Stack spacing={2}>
        <FormTextField<LoginForm> name="email" control={control} label="Email" type="email" autoComplete="email" />
        <FormTextField<LoginForm> name="password" control={control} label="Password" type="password" autoComplete="current-password" />
        <FormControlLabel control={<Checkbox defaultChecked />} label="Remember me" />
        <Button type="submit" variant="contained" size="large" loading={isLoading}>
          Login
        </Button>
      </Stack>
      <Typography sx={{ mt: 3 }} color="text.secondary">
        New here?{' '}
        <Link component={RouterLink} to="/signup">
          Create an account
        </Link>
      </Typography>
    </Box>
  );
}
