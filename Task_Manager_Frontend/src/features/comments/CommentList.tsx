import { Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import type { ID, User } from '../../types/api';
import { EmptyState } from '../../components/common/EmptyState';
import { AddCommentForm } from './AddCommentForm';
import { CommentCard } from './CommentCard';
import type { TaskComment } from './types';

export function CommentList({ taskId, currentUser }: { taskId: ID; currentUser: User | null }) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const author = useMemo(
    () => currentUser ?? { id: 'me', name: 'You', email: 'you@example.com' },
    [currentUser],
  );

  const addComment = (body: string) => {
    setComments((current) => [
      {
        id: crypto.randomUUID(),
        taskId,
        body,
        author,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="h6">Comments</Typography>
      <AddCommentForm onAdd={addComment} />
      {comments.length ? (
        comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onEdit={(id, body) => setComments((current) => current.map((item) => (item.id === id ? { ...item, body, updatedAt: new Date().toISOString() } : item)))}
            onDelete={(id) => setComments((current) => current.filter((item) => item.id !== id))}
          />
        ))
      ) : (
        <EmptyState title="No comments" description="Start the conversation for this task." />
      )}
    </Stack>
  );
}
