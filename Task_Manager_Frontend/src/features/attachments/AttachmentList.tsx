import { Box, Button, Chip, IconButton, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { useMemo, useState } from 'react';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export function AttachmentList() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const preview = useMemo(() => attachments.find((attachment) => attachment.type.startsWith('image/')), [attachments]);

  const addFiles = (files?: FileList | null) => {
    if (!files) return;
    const next = Array.from(files)
      .filter((file) => allowedTypes.includes(file.type))
      .map((file) => ({ id: crypto.randomUUID(), name: file.name, type: file.type, size: file.size, url: URL.createObjectURL(file) }));
    setAttachments((current) => [...next, ...current]);
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Attachments</Typography>
        <Button component="label" size="small" variant="outlined" startIcon={<UploadFileOutlinedIcon />}>
          Upload
          <input hidden multiple type="file" accept="image/*,.pdf,.docx" onChange={(event) => addFiles(event.target.files)} />
        </Button>
      </Stack>
      {preview && (
        <Paper variant="outlined" sx={{ p: 1 }}>
          <Box component="img" src={preview.url} alt={preview.name} sx={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 1 }} />
        </Paper>
      )}
      <List dense disablePadding>
        {attachments.map((attachment) => (
          <ListItem
            key={attachment.id}
            secondaryAction={
              <Stack direction="row" spacing={0.5}>
                <IconButton component="a" href={attachment.url} download={attachment.name} aria-label="Download attachment">
                  <DownloadOutlinedIcon />
                </IconButton>
                <IconButton onClick={() => setAttachments((current) => current.filter((item) => item.id !== attachment.id))} aria-label="Delete attachment">
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </Stack>
            }
            sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
          >
            <ListItemText primary={attachment.name} secondary={`${Math.round(attachment.size / 1024)} KB`} />
            <Chip size="small" label={attachment.type.includes('pdf') ? 'PDF' : attachment.type.includes('word') ? 'DOCX' : 'Image'} sx={{ mr: 7 }} />
          </ListItem>
        ))}
      </List>
      {!attachments.length && (
        <Typography color="text.secondary" variant="body2">
          No files attached yet. Images, PDFs, and DOCX files are supported.
        </Typography>
      )}
    </Stack>
  );
}
