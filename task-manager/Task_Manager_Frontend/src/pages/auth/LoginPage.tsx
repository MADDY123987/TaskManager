import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Checkbox, FormControlLabel, Link, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useLoginMutation } from '../../api/authApi';
import { setCredentials } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks/redux';
import { AuthLayout } from './AuthLayout';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean(),
});

type LoginValues = z.infer<typeof schema>;

export function LoginPage() {
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: true },
  });

  const onSubmit = async ({ email, password }: LoginValues) => {
    const payload = await login({ email, password }).unwrap();
    dispatch(setCredentials(payload));
    navigate('/dashboard', { replace: true });
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue managing team work.">
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
        {error && <Alert severity="error">Unable to login. Check your credentials and try again.</Alert>}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Email" autoComplete="email" error={!!errors.email} helperText={errors.email?.message} />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Password"
              type="password"
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          )}
        />
        <Controller
          name="remember"
          control={control}
          render={({ field }) => (
            <FormControlLabel control={<Checkbox checked={field.value} onChange={field.onChange} />} label="Remember me" />
          )}
        />
        <Button type="submit" size="large" variant="contained" disabled={isLoading}>
          Login
        </Button>
        <Link component={RouterLink} to="/signup" textAlign="center">
          Create an account
        </Link>
      </Stack>
    </AuthLayout>
  );
}
