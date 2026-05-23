import { Stack, Typography } from '@mui/material';
import type { ID } from '../../types/api';
import { EmptyState } from '../../components/common/EmptyState';
import { useAddTaskCommentMutation, useDeleteTaskCommentMutation, useGetTaskCommentsQuery, useUpdateTaskCommentMutation } from '../../api/commentApi';
import { useSnackbar } from '../../hooks/useSnackbar';
import { AddCommentForm } from './AddCommentForm';
import { CommentCard } from './CommentCard';

export function CommentList({ taskId }: { taskId: ID }) {
  const { data: comments = [], isLoading } = useGetTaskCommentsQuery(taskId);
  const [addComment] = useAddTaskCommentMutation();
  const [updateComment] = useUpdateTaskCommentMutation();
  const [deleteComment] = useDeleteTaskCommentMutation();
  const { notify } = useSnackbar();

  const handleAdd = async (content: string) => {
    try {
      await addComment({ taskId, data: { content } }).unwrap();
      notify('Comment added');
    } catch {
      notify('Could not add comment', 'error');
    }
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="h6">Comments</Typography>
      <AddCommentForm onAdd={handleAdd} />
      {isLoading ? (
        <Typography color="text.secondary">Loading comments...</Typography>
      ) : comments.length ? (
        comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onEdit={(commentId, content) => updateComment({ taskId, commentId, data: { content } })}
            onDelete={(commentId) => deleteComment({ taskId, commentId })}
          />
        ))
      ) : (
        <EmptyState title="No comments" description="Start the conversation for this task." />
      )}
    </Stack>
  );
}
