import { Box, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/redux';
import { clearCredentials } from '../../features/auth/authSlice';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon /> },
  { label: 'Projects', path: '/projects', icon: <FolderOutlinedIcon /> },
  { label: 'My Tasks', path: '/my-tasks', icon: <AssignmentTurnedInOutlinedIcon /> },
  { label: 'Profile', path: '/profile', icon: <PersonOutlineOutlinedIcon /> },
];

export function Sidebar({ width, mobileOpen, onClose }: { width: number; mobileOpen: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const logout = () => {
    dispatch(clearCredentials());
    navigate('/login', { replace: true });
  };

  const content = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ gap: 1, minHeight: { xs: 64, md: 68 } }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: 'primary.main', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 800 }}>T</Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={800} lineHeight={1.15}>
            Task Manager
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Team workspace
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 2, flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={onClose}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              minHeight: 44,
              color: 'text.secondary',
              '& .MuiListItemIcon-root': { minWidth: 40, color: 'inherit' },
              '&.active': {
                bgcolor: 'rgba(37, 99, 235, 0.1)',
                color: 'primary.main',
                '& .MuiListItemText-primary': { fontWeight: 700 },
              },
              '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.04)' },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List sx={{ p: 1 }}>
        <ListItemButton onClick={logout} sx={{ borderRadius: 1 }}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: width }, flexShrink: { md: 0 } }}>
      <Drawer variant="temporary" open={mobileOpen} onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width } }}>
        {content}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(14px)',
          },
        }}
      >
        {content}
      </Drawer>
    </Box>
  );
}
