import {
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import type { ReactNode } from 'react';

export interface DataColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  columns: DataColumn<T>[];
  rows: T[];
  loading?: boolean;
  getRowKey: (row: T) => string;
}

export function DataTable<T>({ columns, rows, loading, getRowKey }: DataTableProps<T>) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Table sx={{ minWidth: 760 }}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key} align={column.align}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : rows.map((row) => (
                <TableRow
                  key={getRowKey(row)}
                  hover
                  sx={{
                    '&:last-child td': { borderBottom: 0 },
                    '&:hover': { bgcolor: 'rgba(23, 105, 211, 0.035)' },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
