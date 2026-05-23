import { Button, Divider, FormControlLabel, Paper, Stack, Switch, Typography } from '@mui/material';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import { useState } from 'react';
import type { Project } from '../../types/api';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useArchiveProjectMutation, useGetProjectSettingsQuery, useRestoreProjectMutation, useTransferOwnershipMutation, useUpdateProjectSettingsMutation } from '../../api/projectSettingsApi';
import { ArchiveProjectDialog } from './ArchiveProjectDialog';
import { TransferOwnershipDialog } from './TransferOwnershipDialog';

export function ProjectSettingsPanel({ project }: { project: Project }) {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const { data: settings } = useGetProjectSettingsQuery(project.id);
  const [updateSettings] = useUpdateProjectSettingsMutation();
  const [archiveProject, archiveState] = useArchiveProjectMutation();
  const [restoreProject, restoreState] = useRestoreProjectMutation();
  const [transferOwnership, transferState] = useTransferOwnershipMutation();
  const { notify } = useSnackbar();
  const archived = Boolean(settings?.archived);

  const savePreference = async (key: string, value: boolean) => {
    try {
      await updateSettings({ projectId: project.id, data: { ...settings, preferences: { ...(settings?.preferences ?? {}), [key]: value } } }).unwrap();
      notify('Project settings updated');
    } catch {
      notify('Could not update project settings', 'error');
    }
  };

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Project information</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {project.name}
        </Typography>
        <Typography color="text.secondary">{project.description || 'No description provided.'}</Typography>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Project preferences</Typography>
        <Stack sx={{ mt: 1 }}>
          <FormControlLabel control={<Switch defaultChecked onChange={(event) => savePreference('taskNotifications', event.target.checked)} />} label="Enable task notifications" />
          <FormControlLabel control={<Switch defaultChecked onChange={(event) => savePreference('memberTaskCreation', event.target.checked)} />} label="Allow members to create tasks" />
          <FormControlLabel control={<Switch onChange={(event) => savePreference('completionApproval', event.target.checked)} />} label="Require approval before completion" />
        </Stack>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Danger zone</Typography>
        <Divider sx={{ my: 2 }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button startIcon={<ManageAccountsOutlinedIcon />} variant="outlined" onClick={() => setTransferOpen(true)}>
            Transfer ownership
          </Button>
          {archived ? (
            <Button startIcon={<ArchiveOutlinedIcon />} color="success" variant="contained" loading={restoreState.isLoading} onClick={() => restoreProject(project.id).unwrap().then(() => notify('Project restored')).catch(() => notify('Could not restore project', 'error'))}>
              Restore project
            </Button>
          ) : (
            <Button startIcon={<ArchiveOutlinedIcon />} color="warning" variant="contained" onClick={() => setArchiveOpen(true)}>
              Archive project
            </Button>
          )}
        </Stack>
      </Paper>
      <TransferOwnershipDialog
        open={transferOpen}
        loading={transferState.isLoading}
        onClose={() => setTransferOpen(false)}
        onTransfer={(userId) => {
          transferOwnership({ projectId: project.id, data: { userId } }).unwrap().then(() => {
            setTransferOpen(false);
            notify('Ownership transferred');
          }).catch(() => notify('Could not transfer ownership', 'error'));
        }}
      />
      <ArchiveProjectDialog
        open={archiveOpen}
        loading={archiveState.isLoading}
        onClose={() => setArchiveOpen(false)}
        onArchive={() => {
          archiveProject(project.id).unwrap().then(() => {
            setArchiveOpen(false);
            notify('Project archived');
          }).catch(() => notify('Could not archive project', 'error'));
        }}
      />
    </Stack>
  );
}
