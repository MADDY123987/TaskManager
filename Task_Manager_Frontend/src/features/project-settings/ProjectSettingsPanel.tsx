import { Button, Divider, FormControlLabel, Paper, Stack, Switch, Typography } from '@mui/material';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import { useState } from 'react';
import type { Project } from '../../types/api';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ArchiveProjectDialog } from './ArchiveProjectDialog';
import { TransferOwnershipDialog } from './TransferOwnershipDialog';

export function ProjectSettingsPanel({ project }: { project: Project }) {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const { notify } = useSnackbar();

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
          <FormControlLabel control={<Switch defaultChecked />} label="Enable task notifications" />
          <FormControlLabel control={<Switch defaultChecked />} label="Allow members to create tasks" />
          <FormControlLabel control={<Switch />} label="Require approval before completion" />
        </Stack>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Danger zone</Typography>
        <Divider sx={{ my: 2 }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button startIcon={<ManageAccountsOutlinedIcon />} variant="outlined" onClick={() => setTransferOpen(true)}>
            Transfer ownership
          </Button>
          <Button startIcon={<ArchiveOutlinedIcon />} color="warning" variant="contained" onClick={() => setArchiveOpen(true)}>
            Archive project
          </Button>
        </Stack>
      </Paper>
      <TransferOwnershipDialog open={transferOpen} onClose={() => setTransferOpen(false)} onTransfer={(userId) => { setTransferOpen(false); notify(`Ownership transfer prepared for user ${userId}`); }} />
      <ArchiveProjectDialog open={archiveOpen} onClose={() => setArchiveOpen(false)} onArchive={() => { setArchiveOpen(false); notify('Project archive action prepared'); }} />
    </Stack>
  );
}
