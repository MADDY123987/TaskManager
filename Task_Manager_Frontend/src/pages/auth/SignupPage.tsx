import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSignupMutation } from '../../api/authApi';
import { setCredentials } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks/redux';
import { useSnackbar } from '../../hooks/useSnackbar';
import { FormTextField } from '../../components/forms/FormTextField';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Use at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupForm = z.infer<typeof signupSchema>;

export function SignupPage() {
  const { control, handleSubmit } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });
  const [signup, { isLoading }] = useSignupMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notify } = useSnackbar();

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    try {
      const payload = await signup({ name, email, password }).unwrap();
      dispatch(setCredentials({ ...payload, remember: true }));
      notify('Account created');
      navigate('/dashboard', { replace: true });
    } catch {
      notify('Signup failed. Try a different email.', 'error');
    }
  });

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        Create account
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Start coordinating work with your team.
      </Typography>
      <Stack spacing={2}>
        <FormTextField<SignupForm> name="name" control={control} label="Name" autoComplete="name" />
        <FormTextField<SignupForm> name="email" control={control} label="Email" type="email" autoComplete="email" />
        <FormTextField<SignupForm> name="password" control={control} label="Password" type="password" autoComplete="new-password" />
        <FormTextField<SignupForm> name="confirmPassword" control={control} label="Confirm password" type="password" autoComplete="new-password" />
        <Button type="submit" variant="contained" size="large" loading={isLoading}>
          Register
        </Button>
      </Stack>
      <Typography sx={{ mt: 3 }} color="text.secondary">
        Already have an account?{' '}
        <Link component={RouterLink} to="/login">
          Login
        </Link>
      </Typography>
    </Box>
  );
}
