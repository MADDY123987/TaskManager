import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, Box, Button, Divider, Grid, Paper, Skeleton, Stack, Typography } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import { PageHeader } from '../../components/common/PageHeader';
import { FormTextField } from '../../components/forms/FormTextField';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useGetProfileByIdQuery, useGetProfileQuery, useUpdateAvatarMutation, useUpdateProfileMutation } from '../../api/profileApi';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  bio: z.string().max(500, 'Bio should be 500 characters or fewer').optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { userId } = useParams();
  const ownProfile = useGetProfileQuery(undefined, { skip: Boolean(userId) });
  const otherProfile = useGetProfileByIdQuery(userId ?? '', { skip: !userId });
  const [updateProfile, updateProfileState] = useUpdateProfileMutation();
  const [updateAvatar, updateAvatarState] = useUpdateAvatarMutation();
  const user = userId ? otherProfile.data : ownProfile.data;
  const isLoading = userId ? otherProfile.isLoading : ownProfile.isLoading;
  const isOwnProfile = !userId;
  const { notify } = useSnackbar();
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const { control, handleSubmit, reset } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      bio: '',
    },
  });
  const initials = useMemo(() => user?.name?.charAt(0)?.toUpperCase() ?? 'U', [user?.name]);

  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      department: user.department ?? '',
      designation: user.designation ?? '',
      bio: user.bio ?? '',
    });
    setAvatarPreview(user.avatarUrl);
  }, [reset, user]);

  const onAvatarChange = (file?: File) => {
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    const data = new FormData();
    data.append('avatar', file);
    updateAvatar(data)
      .unwrap()
      .then(() => notify('Avatar updated'))
      .catch(() => notify('Could not update avatar', 'error'));
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile(values).unwrap();
      notify('Profile updated');
    } catch {
      notify('Could not update profile', 'error');
    }
  });

  return (
    <>
      <PageHeader title="Profile" subtitle="Your account details." />
      <Paper sx={{ p: { xs: 2.5, md: 3 }, maxWidth: 1040 }}>
        {isLoading && !user ? (
          <Skeleton variant="rounded" height={360} />
        ) : (
          <Box component="form" onSubmit={onSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar src={avatarPreview} sx={{ width: 116, height: 116, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 44 }}>
                    {initials}
                  </Avatar>
                  <Typography variant="h6">{user?.name ?? 'Unknown user'}</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {user?.designation ?? user?.role ?? 'Team member'}
                  </Typography>
                  <Button component="label" variant="outlined" startIcon={<CloudUploadOutlinedIcon />} disabled={!isOwnProfile || updateAvatarState.isLoading}>
                    Upload avatar
                    <input hidden accept="image/*" type="file" onChange={(event) => onAvatarChange(event.target.files?.[0])} />
                  </Button>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={2.25}>
                  <Box>
                    <Typography variant="h6">Editable profile</Typography>
                    <Typography color="text.secondary" variant="body2">
                      Keep contact and role details visible for your teammates.
                    </Typography>
                  </Box>
                  <Divider />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField<ProfileForm> name="name" control={control} label="Name" disabled={!isOwnProfile} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField<ProfileForm> name="email" control={control} label="Email" type="email" disabled={!isOwnProfile} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField<ProfileForm> name="phone" control={control} label="Phone" disabled={!isOwnProfile} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField<ProfileForm> name="department" control={control} label="Department" disabled={!isOwnProfile} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField<ProfileForm> name="designation" control={control} label="Designation" disabled={!isOwnProfile} />
                    </Grid>
                    <Grid size={12}>
                      <FormTextField<ProfileForm> name="bio" control={control} label="Bio" multiline minRows={4} disabled={!isOwnProfile} />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained" startIcon={<SaveOutlinedIcon />} loading={updateProfileState.isLoading} disabled={!isOwnProfile}>
                      Save profile
                    </Button>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </>
  );
}
