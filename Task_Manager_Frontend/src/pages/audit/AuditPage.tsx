import { Box, Pagination, Skeleton } from '@mui/material';
import { useMemo, useState } from 'react';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';
import { useGetAuditLogsQuery, useGetEntityAuditLogsQuery, useGetMyAuditLogsQuery } from '../../api/auditApi';
import { AuditFilters } from './AuditFilters';
import { AuditTable } from './AuditTable';

const pageSize = 8;

export function AuditPage() {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('ALL');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [scope, setScope] = useState('all');
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const allLogs = useGetAuditLogsQuery({
    page,
    size: pageSize,
    search: query || undefined,
    severity: severity === 'ALL' ? undefined : severity,
    sort,
  }, { skip: scope !== 'all' });
  const myLogs = useGetMyAuditLogsQuery({
    page,
    size: pageSize,
    search: query || undefined,
    severity: severity === 'ALL' ? undefined : severity,
    sort,
  }, { skip: scope !== 'me' });
  const entityLogs = useGetEntityAuditLogsQuery({ entityType, entityId }, { skip: scope !== 'entity' || !entityType || !entityId });
  const logs = useMemo(
    () => (scope === 'me' ? myLogs.data ?? [] : scope === 'entity' ? entityLogs.data ?? [] : allLogs.data ?? []),
    [allLogs.data, entityLogs.data, myLogs.data, scope],
  );
  const isLoading = scope === 'me' ? myLogs.isLoading : scope === 'entity' ? entityLogs.isLoading : allLogs.isLoading;

  const filtered = useMemo(() => {
    return logs
      .filter((log) => `${log.actor} ${log.action} ${log.entity}`.toLowerCase().includes(query.toLowerCase()))
      .filter((log) => (severity === 'ALL' ? true : log.severity === severity))
      .sort((a, b) => sort === 'newest' ? auditTime(b) - auditTime(a) : auditTime(a) - auditTime(b));
  }, [logs, query, severity, sort]);

  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <PageHeader title="Audit Logs" subtitle="Review important workspace changes and security events." />
      <AuditFilters
        query={query}
        severity={severity}
        sort={sort}
        scope={scope}
        entityType={entityType}
        entityId={entityId}
        onQuery={setQuery}
        onSeverity={setSeverity}
        onSort={setSort}
        onScope={setScope}
        onEntityType={setEntityType}
        onEntityId={setEntityId}
      />
      {isLoading ? <Skeleton variant="rounded" height={420} /> : visible.length ? <AuditTable logs={visible} /> : <EmptyState title="No audit logs" description="Try changing filters or search terms." />}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={Math.max(Math.ceil(filtered.length / pageSize), 1)} page={page} onChange={(_, value) => setPage(value)} />
      </Box>
    </>
  );
}

function auditTime(log: { createdAt?: string; timestamp?: string }) {
  return new Date(log.createdAt ?? log.timestamp ?? 0).getTime();
}
