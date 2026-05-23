import { Avatar, Box, Button, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import dayjs from 'dayjs';
import { useState } from 'react';
import type { Comment, ID } from '../../types/api';

export function CommentCard({
  comment,
  onEdit,
  onDelete,
}: {
  comment: Comment;
  onEdit: (id: ID, body: string) => void;
  onDelete: (id: ID) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.content ?? comment.body ?? '');
  const authorName = comment.author?.name ?? 'Unknown user';

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Avatar src={comment.author?.avatarUrl} sx={{ width: 34, height: 34 }}>
          {authorName.charAt(0)}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Box>
              <Typography fontWeight={700}>{authorName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {dayjs(comment.createdAt ?? comment.updatedAt).format('MMM D, YYYY h:mm A')}
              </Typography>
            </Box>
            <Box>
              <IconButton size="small" onClick={() => setEditing(true)} aria-label="Edit comment">
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onDelete(comment.id)} aria-label="Delete comment">
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>
          </Stack>
          {editing ? (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <TextField value={body} onChange={(event) => setBody(event.target.value)} multiline minRows={2} fullWidth />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={() => setEditing(false)}>Cancel</Button>
                <Button variant="contained" onClick={() => { onEdit(comment.id, body); setEditing(false); }}>
                  Save
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Typography sx={{ mt: 1 }}>{comment.content ?? comment.body}</Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
