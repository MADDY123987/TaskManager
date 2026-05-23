import { closestCenter, DndContext, useDraggable, useDroppable, type DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Button, Chip, Grid, IconButton, Paper, Skeleton, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  useCreateBoardColumnMutation,
  useDeleteBoardColumnMutation,
  useGetBoardColumnsQuery,
  useGetProjectBoardQuery,
  useMoveBoardTaskMutation,
  useReorderBoardColumnsMutation,
  useUpdateBoardColumnMutation,
} from '../../api/kanbanApi';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';
import { PriorityChip } from '../../components/common/StatusChip';
import { useSnackbar } from '../../hooks/useSnackbar';
import type { BoardColumn, BoardTask, ID } from '../../types/api';

export function ProjectBoardPage() {
  const { projectId = '' } = useParams();
  const { data: board, isLoading } = useGetProjectBoardQuery(projectId);
  const { data: boardColumns = [] } = useGetBoardColumnsQuery(projectId);
  const [createColumn] = useCreateBoardColumnMutation();
  const [updateColumn] = useUpdateBoardColumnMutation();
  const [deleteColumn] = useDeleteBoardColumnMutation();
  const [reorderColumns] = useReorderBoardColumnsMutation();
  const [moveTask] = useMoveBoardTaskMutation();
  const [newColumn, setNewColumn] = useState('');
  const [search, setSearch] = useState('');
  const { notify } = useSnackbar();
  const columns = useMemo(() => (board?.columns?.length ? board.columns : boardColumns), [board?.columns, boardColumns]);

  const onDragEnd = async (event: DragEndEvent) => {
    const taskId = event.active.id;
    const targetColumnId = event.over?.id;
    if (!targetColumnId) return;
    try {
      await moveTask({ projectId, taskId, data: { targetColumnId } }).unwrap();
      notify('Task moved');
    } catch {
      notify('Could not move task', 'error');
    }
  };

  const addColumn = async () => {
    if (!newColumn.trim()) return;
    await createColumn({ projectId, data: { name: newColumn } }).unwrap();
    setNewColumn('');
  };

  return (
    <>
      <PageHeader title="Kanban Board" subtitle="Drag work across project columns." />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField label="Search tasks" value={search} onChange={(event) => setSearch(event.target.value)} fullWidth />
        <Stack direction="row" spacing={1}>
          <TextField label="New column" value={newColumn} onChange={(event) => setNewColumn(event.target.value)} />
          <Button startIcon={<AddIcon />} variant="contained" onClick={addColumn}>
            Add
          </Button>
          <Button variant="outlined" onClick={() => reorderColumns({ projectId, data: { columnIds: columns.map((column) => column.id) } })}>
            Save order
          </Button>
        </Stack>
      </Stack>
      {isLoading ? (
        <Skeleton variant="rounded" height={520} />
      ) : columns.length ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <Grid container spacing={2}>
            {columns.map((column) => (
              <Grid key={column.id} size={{ xs: 12, md: 3 }}>
                <BoardColumnView
                  column={column}
                  search={search}
                  onRename={(name) => updateColumn({ projectId, columnId: column.id, data: { name } })}
                  onDelete={(columnId) => deleteColumn({ projectId, columnId })}
                />
              </Grid>
            ))}
          </Grid>
        </DndContext>
      ) : (
        <EmptyState title="No board columns" description="Create a column to start organizing tasks." />
      )}
    </>
  );
}

function BoardColumnView({
  column,
  search,
  onRename,
  onDelete,
}: {
  column: BoardColumn;
  search: string;
  onRename: (name: string) => void;
  onDelete: (columnId: ID) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: String(column.id) });
  const [name, setName] = useState(column.name ?? column.title ?? '');
  const tasks = (column.tasks ?? []).filter((task) => task.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <Paper ref={setNodeRef} sx={{ p: 1.5, minHeight: 520, bgcolor: isOver ? 'rgba(37,99,235,0.08)' : '#f8fafc' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <TextField
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={() => name && onRename(name)}
          variant="standard"
          sx={{ flexGrow: 1 }}
        />
        <Chip size="small" label={tasks.length} />
        <IconButton size="small" onClick={() => onDelete(column.id)} aria-label="Delete column">
          <DeleteOutlineOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Stack spacing={1.25}>
        {tasks.map((task) => (
          <BoardTaskCard key={task.id} task={task} />
        ))}
      </Stack>
    </Paper>
  );
}

function BoardTaskCard({ task }: { task: BoardTask }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: String(task.id) });

  return (
    <Paper
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      variant="outlined"
      sx={{ p: 1.5, cursor: 'grab', opacity: isDragging ? 0.65 : 1, transform: CSS.Translate.toString(transform) }}
    >
      <Typography fontWeight={700}>{task.title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
        {task.assignee?.name ?? 'Unassigned'}
      </Typography>
      <PriorityChip priority={task.priority} />
    </Paper>
  );
}
