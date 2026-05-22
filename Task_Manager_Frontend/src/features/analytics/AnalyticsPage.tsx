import { Skeleton } from '@mui/material';
import { useGetDashboardQuery } from '../../api/dashboardApi';
import { PageHeader } from '../../components/common/PageHeader';
import { AnalyticsWidgets } from './AnalyticsWidgets';

export function AnalyticsPage() {
  const { data, isLoading } = useGetDashboardQuery();

  return (
    <>
      <PageHeader title="Analytics" subtitle="Delivery trends, task health, and member productivity." />
      {isLoading ? <Skeleton variant="rounded" height={640} /> : <AnalyticsWidgets data={data} />}
    </>
  );
}
