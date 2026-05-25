import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useForgotPasswordMutation, useResetPasswordMutation } from '../../api/authApi';
import { FormTextField } from '../../components/forms/FormTextField';
import { useSnackbar } from '../../hooks/useSnackbar';

const emailSchema = z.object({ email: z.string().email('Enter a valid email') });
const resetSchema = z.object({
  otp: z.string().regex(/^\d{4}$/, 'Enter the 4 digit OTP'),
  newPassword: z.string().min(6, 'Use at least 6 characters'),
});

type EmailForm = z.infer<typeof emailSchema>;
type ResetForm = z.infer<typeof resetSchema>;

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema), defaultValues: { email: '' } });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema), defaultValues: { otp: '', newPassword: '' } });
  const [forgotPassword, forgotState] = useForgotPasswordMutation();
  const [resetPassword, resetState] = useResetPasswordMutation();
  const navigate = useNavigate();
  const { notify } = useSnackbar();

  const sendOtp = emailForm.handleSubmit(async (values) => {
    try {
      const response = await forgotPassword(values).unwrap();
      setEmail(values.email);
      notify(response.message ?? 'If this email is registered, an OTP has been sent.');
    } catch (err) {
      if (err instanceof Error) {
        notify(err.message || 'Could not request password reset. Please try again.', 'error');
      } else {
        notify('Could not request password reset. Please try again.', 'error');
      }
    }
  });

  const reset = resetForm.handleSubmit(async ({ otp, newPassword }) => {
    try {
      const response = await resetPassword({ email, otp, newPassword }).unwrap();
      notify(response.message ?? 'Password reset successful. You can now login.');
      navigate('/login', { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        const message = err.message.toLowerCase();
        if (message.includes('invalid') && message.includes('otp')) {
          notify('Invalid OTP. Please check and try again or request a new OTP.', 'error');
        } else if (message.includes('expired')) {
          notify('OTP has expired. Please request a new one.', 'error');
        } else if (message.includes('not found')) {
          notify('User not found. Please check your email.', 'error');
        } else {
          notify(err.message || 'Could not reset password. Please try again.', 'error');
        }
      } else {
        notify('Could not reset password. Please try again.', 'error');
      }
    }
  });

  return (
    <Box component="form" onSubmit={email ? reset : sendOtp}>
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        Reset password
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {email ? `Enter the OTP sent to ${email}.` : 'Enter your email to receive a reset OTP.'}
      </Typography>
      {!email ? (
        <Stack key="forgot-password-email" spacing={2}>
          <FormTextField<EmailForm> name="email" control={emailForm.control} label="Email" type="email" />
          <Button type="submit" variant="contained" loading={forgotState.isLoading}>
            Send OTP
          </Button>
        </Stack>
      ) : (
        <Stack key="forgot-password-reset" spacing={2}>
          <FormTextField<ResetForm> name="otp" control={resetForm.control} label="OTP" inputProps={{ inputMode: 'numeric', maxLength: 4 }} />
          <FormTextField<ResetForm> name="newPassword" control={resetForm.control} label="New password" type="password" />
          <Button type="submit" variant="contained" loading={resetState.isLoading}>
            Reset password
          </Button>
        </Stack>
      )}
      <Typography sx={{ mt: 3 }} color="text.secondary">
        Remembered it?{' '}
        <Link component={RouterLink} to="/login">
          Login
        </Link>
      </Typography>
    </Box>
  );
}
