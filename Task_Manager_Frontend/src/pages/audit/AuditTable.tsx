import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import dayjs from 'dayjs';
import type { AuditLog } from '../../types/api';

export function AuditTable({ logs }: { logs: AuditLog[] }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 780 }}>
        <TableHead>
          <TableRow>
            <TableCell>Actor</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Entity</TableCell>
            <TableCell>Severity</TableCell>
            <TableCell>Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} hover>
              <TableCell sx={{ fontWeight: 600 }}>{log.actor ?? log.actorName ?? 'System'}</TableCell>
              <TableCell>{log.action ?? 'Activity'}</TableCell>
              <TableCell>{log.entity ?? log.entityType ?? log.entityId ?? 'Entity'}</TableCell>
              <TableCell>
                <Chip size="small" label={log.severity ?? 'INFO'} color={log.severity === 'CRITICAL' ? 'error' : log.severity === 'WARNING' ? 'warning' : 'default'} />
              </TableCell>
              <TableCell>{dayjs(log.createdAt ?? log.timestamp).format('MMM D, YYYY h:mm A')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
