import { Button, Chip, IconButton, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { useDeleteTaskAttachmentMutation, useGetTaskAttachmentsQuery, useLazyGetAttachmentDownloadUrlQuery, useUploadTaskAttachmentMutation } from '../../api/attachmentApi';
import type { ID } from '../../types/api';
import { useSnackbar } from '../../hooks/useSnackbar';

const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export function AttachmentList({ taskId }: { taskId: ID }) {
  const { data: attachments = [], isLoading } = useGetTaskAttachmentsQuery(taskId);
  const [uploadAttachment, uploadState] = useUploadTaskAttachmentMutation();
  const [deleteAttachment] = useDeleteTaskAttachmentMutation();
  const [getDownloadUrl] = useLazyGetAttachmentDownloadUrlQuery();
  const { notify } = useSnackbar();

  const addFiles = async (files?: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files).filter((candidate) => allowedTypes.includes(candidate.type))) {
      const data = new FormData();
      data.append('file', file);
      await uploadAttachment({ taskId, data }).unwrap();
    }
    notify('Attachment uploaded');
  };

  const download = async (attachmentId: ID) => {
    const response = await getDownloadUrl({ taskId, attachmentId }).unwrap();
    const url = response.downloadUrl ?? response.url;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Attachments</Typography>
        <Button component="label" size="small" variant="outlined" startIcon={<UploadFileOutlinedIcon />} loading={uploadState.isLoading}>
          Upload
          <input hidden multiple type="file" accept="image/*,.pdf,.docx" onChange={(event) => addFiles(event.target.files)} />
        </Button>
      </Stack>
      {isLoading && <Typography color="text.secondary">Loading attachments...</Typography>}
      <List dense disablePadding>
        {attachments.map((attachment) => (
          <ListItem
            key={attachment.id}
            secondaryAction={
              <Stack direction="row" spacing={0.5}>
                <IconButton onClick={() => download(attachment.id)} aria-label="Download attachment">
                  <DownloadOutlinedIcon />
                </IconButton>
                <IconButton onClick={() => deleteAttachment({ taskId, attachmentId: attachment.id })} aria-label="Delete attachment">
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </Stack>
            }
            sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
          >
            <ListItemText primary={attachment.fileName ?? attachment.name ?? 'Attachment'} secondary={attachment.size ? `${Math.round(attachment.size / 1024)} KB` : 'File'} />
            <Chip size="small" label={attachment.contentType?.includes('pdf') ? 'PDF' : attachment.contentType?.includes('word') ? 'DOCX' : 'File'} sx={{ mr: 7 }} />
          </ListItem>
        ))}
      </List>
      {!isLoading && !attachments.length && (
        <Typography color="text.secondary" variant="body2">
          No files attached yet. Images, PDFs, and DOCX files are supported.
        </Typography>
      )}
    </Stack>
  );
}
