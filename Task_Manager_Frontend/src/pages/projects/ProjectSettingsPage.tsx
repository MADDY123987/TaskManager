import { Skeleton } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useGetProjectQuery } from '../../api/projectApi';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';
import { ProjectSettingsPanel } from '../../features/project-settings/ProjectSettingsPanel';

export function ProjectSettingsPage() {
  const { projectId = '' } = useParams();
  const { data: project, isLoading } = useGetProjectQuery(projectId);

  if (isLoading) return <Skeleton variant="rounded" height={420} />;
  if (!project) return <EmptyState title="Project not found" description="Settings could not be loaded." />;

  return (
    <>
      <PageHeader title="Project Settings" subtitle={project.name} />
      <ProjectSettingsPanel project={project} />
    </>
  );
}
