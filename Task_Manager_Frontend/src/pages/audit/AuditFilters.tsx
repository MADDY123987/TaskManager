import { MenuItem, Stack, TextField } from '@mui/material';

export function AuditFilters({
  query,
  severity,
  sort,
  onQuery,
  onSeverity,
  onSort,
}: {
  query: string;
  severity: string;
  sort: string;
  onQuery: (value: string) => void;
  onSeverity: (value: string) => void;
  onSort: (value: string) => void;
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
    </Stack>
  );
}
