import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export function ArchiveProjectDialog({ open, loading, onClose, onArchive }: { open: boolean; loading?: boolean; onClose: () => void; onArchive: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Archive project?</DialogTitle>
      <DialogContent>
        <DialogContentText>The project will be hidden from active work views. You can restore it later from administration tools.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="warning" variant="contained" loading={loading} onClick={onArchive}>
          Archive
        </Button>
      </DialogActions>
    </Dialog>
  );
}
