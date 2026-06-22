import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Avatar, 
  Button, 
  Paper,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useThemeMode } from '../../theme/ThemeContext';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const DRAWER_WIDTH = 260;

const SidebarItem = ({ icon: Icon, label, to, onClick }) => {
  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        component={NavLink}
        to={to}
        onClick={onClick}
        sx={{
          borderRadius: 2,
          mx: 1.5,
          px: 2,
          py: 1.25,
          color: 'text.secondary',
          transition: 'all 0.2s ease',
          '&.active': {
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            boxShadow: (theme) => `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.25)' : 'rgba(99, 102, 241, 0.25)'}`,
            '& .MuiListItemIcon-root': {
              color: 'primary.contrastText',
            },
            '& .MuiListItemText-primary': {
              fontWeight: 600,
            }
          },
          '&:hover:not(.active)': {
            backgroundColor: 'action.hover',
            color: 'text.primary',
            '& .MuiListItemIcon-root': {
              color: 'text.primary',
            }
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
          <Icon sx={{ fontSize: 20 }} />
        </ListItemIcon>
        <ListItemText 
          primary={label} 
          sx={{
            '& .MuiListItemText-primary': {
              fontSize: '0.875rem',
              fontWeight: 500,
            }
          }}
        />
      </ListItemButton>
    </ListItem>
  );
};

export const PortalLayout = ({ title, navItems }) => {
  const { logout, username, role, allRoles, switchRole } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const theme = useTheme();
  const isUpMd = useMediaQuery(theme.breakpoints.up('lg'));

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleSwitchRole = (newRole) => {
    switchRole(newRole);
    setIsMobileMenuOpen(false);
    handleProfileClose();
  };

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      {/* Brand Section */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 800, 
            color: 'primary.main', 
            letterSpacing: '-0.025em',
            flexGrow: 1
          }}
        >
          Scholario
        </Typography>
        {!isUpMd && (
          <IconButton onClick={toggleMobileMenu} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Nav Items */}
      <Box sx={{ flexGrow: 1, py: 1 }}>
        <List disablePadding>
          {navItems.map((item) => (
            <SidebarItem 
              key={item.to} 
              icon={item.icon} 
              label={item.label} 
              to={item.to} 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Desktop Sidebar */}
      <Box
        component="aside"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', lg: 'block' },
          borderRight: '1px solid',
          borderColor: 'divider',
          height: '100%',
        }}
      >
        {sidebarContent}
      </Box>

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={isMobileMenuOpen}
        onClose={toggleMobileMenu}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
        {/* Header */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            bgcolor: 'background.paper', 
            borderBottom: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
            zIndex: (theme) => theme.zIndex.drawer - 1
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                color="inherit"
                edge="start"
                onClick={toggleMobileMenu}
                sx={{ display: { lg: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 750, color: 'text.primary' }}>
                {title}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <IconButton 
                onClick={toggleTheme} 
                color="inherit" 
                sx={{ 
                  bgcolor: 'action.hover', 
                  borderRadius: 2,
                  p: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.08)'
                  }
                }}
              >
                {mode === 'dark' ? (
                  <LightModeIcon sx={{ color: '#fbbf24', fontSize: 20 }} />
                ) : (
                  <DarkModeIcon sx={{ color: '#475569', fontSize: 20 }} />
                )}
              </IconButton>

              <IconButton 
                onClick={logout} 
                color="inherit" 
                title="Logout"
                sx={{ 
                  bgcolor: 'action.hover', 
                  borderRadius: 2,
                  p: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.08)',
                    color: '#ef4444'
                  }
                }}
              >
                <LogoutIcon sx={{ fontSize: 20 }} />
              </IconButton>

              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                  {username}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.05em' }}>
                  {role}
                </Typography>
              </Box>
              <IconButton
                onClick={handleProfileClick}
                size="small"
                sx={{ p: 0 }}
                aria-controls={anchorEl ? 'profile-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={anchorEl ? 'true' : undefined}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    fontWeight: 'bold',
                    boxShadow: (theme) => `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
                  }}
                >
                  {username?.[0].toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                id="profile-menu"
                open={Boolean(anchorEl)}
                onClose={handleProfileClose}
                onClick={handleProfileClose}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      borderRadius: 3,
                      minWidth: 180,
                      border: '1px solid',
                      borderColor: 'divider',
                    },
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {username}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', fontSize: '9px' }}>
                    Active: {role}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 0.5 }} />

                {allRoles.length > 1 && (
                  <>
                    <Box sx={{ px: 2, py: 0.5 }}>
                      <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Switch Portal
                      </Typography>
                    </Box>
                    {allRoles.map((r) => (
                      <MenuItem
                        key={r}
                        onClick={() => handleSwitchRole(r)}
                        disabled={r === role}
                        sx={{
                          fontSize: '13px',
                          fontWeight: 600,
                          py: 1,
                          px: 2,
                          color: r === role ? 'primary.main' : 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <SwapHorizIcon sx={{ fontSize: 16 }} />
                        {r} Portal
                      </MenuItem>
                    ))}
                    <Divider sx={{ my: 0.5 }} />
                  </>
                )}

                <MenuItem 
                  onClick={logout}
                  sx={{ 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: '#ef4444',
                    py: 1,
                    px: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                    }
                  }}
                >
                  <LogoutIcon sx={{ fontSize: 16 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content Body */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, sm: 4 } }}>
          <Box sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
