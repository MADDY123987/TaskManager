import { Skeleton } from '@mui/material';
import { Suspense, type ReactNode } from 'react';

export function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Skeleton variant="rounded" height={420} />}>{children}</Suspense>;
}
