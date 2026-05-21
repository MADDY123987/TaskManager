import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Link, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useSignupMutation } from '../../api/authApi';
import { setCredentials } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks/redux';
import { AuthLayout } from './AuthLayout';

const schema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Use at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type SignupValues = z.infer<typeof schema>;

export function SignupPage() {
  const [signup, { isLoading, error }] = useSignupMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async ({ name, email, password }: SignupValues) => {
    const payload = await signup({ name, email, password }).unwrap();
    dispatch(setCredentials(payload));
    navigate('/dashboard', { replace: true });
  };

  return (
    <AuthLayout title="Create account" subtitle="Invite your team into a clearer workflow.">
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
        {error && <Alert severity="error">Unable to register. Please try again.</Alert>}
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Name" autoComplete="name" error={!!errors.name} helperText={errors.name?.message} />
          )}
        />
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
            <TextField {...field} label="Password" type="password" error={!!errors.password} helperText={errors.password?.message} />
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Confirm password"
              type="password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
          )}
        />
        <Button type="submit" size="large" variant="contained" disabled={isLoading}>
          Register
        </Button>
        <Link component={RouterLink} to="/login" textAlign="center">
          Already have an account?
        </Link>
      </Stack>
    </AuthLayout>
  );
}
