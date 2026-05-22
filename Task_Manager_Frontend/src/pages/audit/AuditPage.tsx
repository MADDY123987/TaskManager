import { Box, Pagination } from '@mui/material';
import { useMemo, useState } from 'react';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';
import { AuditFilters } from './AuditFilters';
import { AuditTable, type AuditLog } from './AuditTable';

const logs: AuditLog[] = [
  { id: '1', actor: 'Admin', action: 'Archived project', entity: 'Website Redesign', severity: 'WARNING', createdAt: new Date().toISOString() },
  { id: '2', actor: 'Madhavan', action: 'Changed task status', entity: 'API Integration', severity: 'INFO', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', actor: 'System', action: 'Failed login threshold reached', entity: 'Authentication', severity: 'CRITICAL', createdAt: new Date(Date.now() - 7200000).toISOString() },
];

const pageSize = 8;

export function AuditPage() {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('ALL');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return logs
      .filter((log) => `${log.actor} ${log.action} ${log.entity}`.toLowerCase().includes(query.toLowerCase()))
      .filter((log) => (severity === 'ALL' ? true : log.severity === severity))
      .sort((a, b) => sort === 'newest' ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [query, severity, sort]);

  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <PageHeader title="Audit Logs" subtitle="Review important workspace changes and security events." />
      <AuditFilters query={query} severity={severity} sort={sort} onQuery={setQuery} onSeverity={setSeverity} onSort={setSort} />
      {visible.length ? <AuditTable logs={visible} /> : <EmptyState title="No audit logs" description="Try changing filters or search terms." />}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={Math.max(Math.ceil(filtered.length / pageSize), 1)} page={page} onChange={(_, value) => setPage(value)} />
      </Box>
    </>
  );
}
