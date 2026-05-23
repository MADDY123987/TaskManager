import { MenuItem, Stack, TextField } from '@mui/material';

export function AuditFilters({
  query,
  severity,
  sort,
  scope,
  entityType,
  entityId,
  onQuery,
  onSeverity,
  onSort,
  onScope,
  onEntityType,
  onEntityId,
}: {
  query: string;
  severity: string;
  sort: string;
  scope: string;
  entityType: string;
  entityId: string;
  onQuery: (value: string) => void;
  onSeverity: (value: string) => void;
  onSort: (value: string) => void;
  onScope: (value: string) => void;
  onEntityType: (value: string) => void;
  onEntityId: (value: string) => void;
}) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
      <TextField label="Search logs" value={query} onChange={(event) => onQuery(event.target.value)} fullWidth />
      <TextField select label="Severity" value={severity} onChange={(event) => onSeverity(event.target.value)} sx={{ minWidth: 180 }}>
        <MenuItem value="ALL">All</MenuItem>
        <MenuItem value="INFO">Info</MenuItem>
        <MenuItem value="WARNING">Warning</MenuItem>
        <MenuItem value="CRITICAL">Critical</MenuItem>
      </TextField>
      <TextField select label="Sort" value={sort} onChange={(event) => onSort(event.target.value)} sx={{ minWidth: 180 }}>
        <MenuItem value="newest">Newest</MenuItem>
        <MenuItem value="oldest">Oldest</MenuItem>
      </TextField>
      <TextField select label="Scope" value={scope} onChange={(event) => onScope(event.target.value)} sx={{ minWidth: 160 }}>
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="me">Mine</MenuItem>
        <MenuItem value="entity">Entity</MenuItem>
      </TextField>
      {scope === 'entity' && (
        <>
          <TextField label="Entity type" value={entityType} onChange={(event) => onEntityType(event.target.value)} sx={{ minWidth: 160 }} />
          <TextField label="Entity id" value={entityId} onChange={(event) => onEntityId(event.target.value)} sx={{ minWidth: 140 }} />
        </>
      )}
    </Stack>
  );
}
