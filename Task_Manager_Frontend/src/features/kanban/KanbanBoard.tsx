import { closestCenter, DndContext, useDraggable, useDroppable, type DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Box, Chip, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import type { Task, TaskStatus } from '../../types/api';
import { PriorityChip } from '../../components/common/StatusChip';
import { statusLabel } from '../../utils/format';

const columns: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

export function KanbanBoard({ tasks, onStatusChange }: { tasks: Task[]; onStatusChange: (task: Task, status: TaskStatus) => void }) {
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState('ALL');
  const filtered = useMemo(
    () => tasks.filter((task) => task.title.toLowerCase().includes(query.toLowerCase())).filter((task) => (priority === 'ALL' ? true : task.priority === priority)),
    [priority, query, tasks],
  );

  const onDragEnd = (event: DragEndEvent) => {
    const task = tasks.find((item) => String(item.id) === String(event.active.id));
    const status = event.over?.id as TaskStatus | undefined;
    if (task && status && task.status !== status) onStatusChange(task, status);
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField label="Search cards" value={query} onChange={(event) => setQuery(event.target.value)} fullWidth />
        <TextField select SelectProps={{ native: true }} label="Priority" value={priority} onChange={(event) => setPriority(event.target.value)} sx={{ minWidth: 180 }}>
          <option value="ALL">All</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </TextField>
      </Stack>
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <Grid container spacing={2}>
          {columns.map((status) => (
            <Grid key={status} size={{ xs: 12, md: 4 }}>
              <KanbanColumn id={status} title={statusLabel[status]} tasks={filtered.filter((task) => task.status === status)} />
            </Grid>
          ))}
        </Grid>
      </DndContext>
    </Stack>
  );
}

function KanbanColumn({ id, title, tasks }: { id: TaskStatus; title: string; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Paper ref={setNodeRef} sx={{ p: 1.5, minHeight: 440, bgcolor: isOver ? 'rgba(37, 99, 235, 0.08)' : '#f8fafc' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography fontWeight={800}>{title}</Typography>
        <Chip size="small" label={tasks.length} />
      </Stack>
      <Stack spacing={1.25}>
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
      </Stack>
    </Paper>
  );
}

function KanbanCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: String(task.id) });

  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{
        p: 1.5,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        cursor: 'grab',
        opacity: isDragging ? 0.65 : 1,
        transform: CSS.Translate.toString(transform),
      }}
    >
      <Typography fontWeight={700}>{task.title}</Typography>
      <Typography color="text.secondary" variant="body2" sx={{ my: 1 }}>
        {task.assignee?.name ?? 'Unassigned'}
      </Typography>
      <PriorityChip priority={task.priority} />
    </Box>
  );
}
