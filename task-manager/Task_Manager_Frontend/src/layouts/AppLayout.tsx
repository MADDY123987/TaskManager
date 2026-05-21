import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import {
  AppBar,
  Avatar,
  Box,
  Badge,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { Sidebar } from '../components/layout/Sidebar';
import { BrandMark } from '../components/common/BrandMark';

const drawerWidth = 280;

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        backgroundImage: 'linear-gradient(180deg, rgba(232,242,255,0.7) 0, rgba(245,247,251,0) 320px)',
      }}
    >
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: theme.zIndex.drawer + 1,
          backdropFilter: 'blur(16px)',
          bgcolor: 'rgba(255, 255, 255, 0.88)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 72 } }}>
          {!isDesktop && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}>
            <BrandMark size={36} />
            <Stack spacing={0}>
              <Typography variant="h6" noWrap lineHeight={1.1}>
                Team Task Manager
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Plan, assign, ship
              </Typography>
            </Stack>
          </Stack>
          <Tooltip title="Notifications">
            <IconButton sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <Badge color="error" variant="dot">
                <NotificationsNoneOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Account">
            <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} sx={{ ml: 1 }}>
              <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.dark', fontWeight: 800 }}>
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          <Sidebar onLogout={handleLogout} />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
          open
        >
          <Sidebar onLogout={handleLogout} />
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1480, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
