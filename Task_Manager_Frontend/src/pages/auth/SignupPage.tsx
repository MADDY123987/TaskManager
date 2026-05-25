import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRegisterMutation, useVerifyOtpMutation } from '../../api/authApi';
import { setCredentials } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks/redux';
import { useSnackbar } from '../../hooks/useSnackbar';
import { FormTextField } from '../../components/forms/FormTextField';
import { normalizeAuthPayload } from '../../utils/authPayload';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
});

const verifySchema = z
  .object({
    otp: z.string().regex(/^\d{4}$/, 'Enter the 4 digit OTP'),
    password: z.string().min(6, 'Use at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;
type VerifyForm = z.infer<typeof verifySchema>;

export function SignupPage() {
  const [pendingRegistration, setPendingRegistration] = useState<RegisterForm | null>(null);
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '' },
  });
  const verifyForm = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
    defaultValues: { otp: '', password: '', confirmPassword: '' },
  });
  const [registerUser, registerState] = useRegisterMutation();
  const [verifyOtp, verifyState] = useVerifyOtpMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notify } = useSnackbar();

  const onRegister = registerForm.handleSubmit(async (values) => {
    try {
      const response = await registerUser(values).unwrap();
      setPendingRegistration(values);
      notify(response.message ?? `OTP sent to ${values.email}. Please check your email.`);
    } catch (err) {
      if (err instanceof Error) {
        const message = err.message.toLowerCase();
        if (message.includes('already registered') || message.includes('email already')) {
          notify('This email is already registered. Please log in or use a different email.', 'error');
        } else if (message.includes('network')) {
          notify('Network error. Please check your connection and try again.', 'error');
        } else {
          notify(err.message || 'Registration failed. Please try a different email.', 'error');
        }
      } else {
        notify('Registration failed. Please try a different email.', 'error');
      }
    }
  });

  const onVerify = verifyForm.handleSubmit(async ({ otp, password }) => {
    if (!pendingRegistration) return;
    try {
      const payload = await verifyOtp({ ...pendingRegistration, otp, password }).unwrap();
      dispatch(setCredentials({ ...normalizeAuthPayload(payload), remember: true }));
      notify('Account created');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'OTP verification failed. Please try again.';
      notify(errorMsg, 'error');
    }
  });

  return (
    <Box component="form" onSubmit={pendingRegistration ? onVerify : onRegister}>
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        {pendingRegistration ? 'Verify OTP' : 'Create account'}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {pendingRegistration ? `Enter the OTP sent to ${pendingRegistration.email} and set your password.` : 'Enter your name and email to receive an OTP.'}
      </Typography>
      {!pendingRegistration ? (
        <Stack key="registration-details" spacing={2}>
          <FormTextField<RegisterForm> name="name" control={registerForm.control} label="Name" autoComplete="name" />
          <FormTextField<RegisterForm> name="email" control={registerForm.control} label="Email" type="email" autoComplete="email" />
          <Button type="submit" variant="contained" size="large" loading={registerState.isLoading}>
            Send OTP
          </Button>
        </Stack>
      ) : (
        <Stack key="registration-verification" spacing={2}>
          <FormTextField<VerifyForm> name="otp" control={verifyForm.control} label="OTP" inputProps={{ inputMode: 'numeric', maxLength: 4 }} />
          <FormTextField<VerifyForm> name="password" control={verifyForm.control} label="Password" type="password" autoComplete="new-password" />
          <FormTextField<VerifyForm> name="confirmPassword" control={verifyForm.control} label="Confirm password" type="password" autoComplete="new-password" />
          <Button type="submit" variant="contained" size="large" loading={verifyState.isLoading}>
            Verify and Create Account
          </Button>
          <Button onClick={() => setPendingRegistration(null)}>Change email</Button>
        </Stack>
      )}
      <Typography sx={{ mt: 3 }} color="text.secondary">
        Already have an account?{' '}
        <Link component={RouterLink} to="/login">
          Login
        </Link>
      </Typography>
    </Box>
  );
}
