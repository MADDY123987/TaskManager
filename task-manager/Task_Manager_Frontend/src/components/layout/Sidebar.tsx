import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import {
  Box,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import { BrandMark } from '../common/BrandMark';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: <DashboardOutlinedIcon /> },
  { label: 'Projects', to: '/projects', icon: <FolderOutlinedIcon /> },
  { label: 'My Tasks', to: '/my-tasks', icon: <TaskAltOutlinedIcon /> },
  { label: 'Profile', to: '/profile', icon: <PersonOutlineIcon /> },
];

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <Box sx={{ width: 280, height: '100%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3, minHeight: { xs: 64, md: 72 } }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <BrandMark size={34} />
          <Stack spacing={0}>
            <Typography variant="subtitle1" fontWeight={800}>
              Team Tasks
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Command center
            </Typography>
          </Stack>
        </Stack>
      </Toolbar>
      <Divider />
      <Box sx={{ px: 2, py: 2 }}>
        <Chip label="Product workspace" color="primary" variant="outlined" size="small" sx={{ width: '100%' }} />
      </Box>
      <List sx={{ px: 1.5, py: 0 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            sx={{
              borderRadius: 2,
              mb: 0.75,
              minHeight: 46,
              color: 'text.secondary',
              '& .MuiListItemIcon-root': { color: 'text.secondary', minWidth: 40 },
              '&.active': {
                bgcolor: 'primary.light',
                color: 'primary.dark',
                fontWeight: 800,
                boxShadow: 'inset 3px 0 0 #1769d3',
              },
              '&.active .MuiListItemIcon-root': { color: 'primary.main' },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 700 }} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List sx={{ px: 1.5, py: 2 }}>
        <ListItemButton onClick={onLogout} sx={{ borderRadius: 2, color: 'text.secondary' }}>
          <ListItemIcon>
            <LogoutOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 700 }} />
        </ListItemButton>
      </List>
    </Box>
  );
}
