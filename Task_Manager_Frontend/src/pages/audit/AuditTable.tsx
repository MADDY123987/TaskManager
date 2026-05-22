import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import dayjs from 'dayjs';

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  createdAt: string;
}

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
              <TableCell sx={{ fontWeight: 600 }}>{log.actor}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell>{log.entity}</TableCell>
              <TableCell>
                <Chip size="small" label={log.severity} color={log.severity === 'CRITICAL' ? 'error' : log.severity === 'WARNING' ? 'warning' : 'default'} />
              </TableCell>
              <TableCell>{dayjs(log.createdAt).format('MMM D, YYYY h:mm A')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
