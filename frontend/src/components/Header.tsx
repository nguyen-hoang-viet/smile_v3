    import React, { useState } from 'react';
    import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Box,
    Chip,
    } from '@mui/material';
    import {
    AccountCircle,
    Restaurant,
    Assessment,
    ExitToApp,
    Person,
    Settings,
    Home,
    } from '@mui/icons-material';
    import { useNavigate, useLocation } from 'react-router-dom';

    interface User {
    id: string;
    username: string;
    fullName: string;
    role: string;
    }

    interface HeaderProps {
    user: User | null;
    onLogin: () => void;
    onLogout: () => void;
    }

    const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        onLogout();
        handleMenuClose();
    };

    const getRoleColor = (role: string) => {
        switch (role) {
        case 'admin':
            return 'error';
        case 'manager':
            return 'warning';
        case 'staff':
            return 'success';
        default:
            return 'default';
        }
    };

    const getRoleText = (role: string) => {
        switch (role) {
        case 'admin':
            return 'Quản trị viên';
        case 'manager':
            return 'Quản lý';
        case 'staff':
            return 'Nhân viên';
        default:
            return role;
        }
    };

    return (
        <AppBar position="sticky" elevation={0} sx={{ 
        background: 'linear-gradient(135deg, #f7b510 0%, #e65100 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1100 // Đảm bảo header luôn ở trên
        }}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
            <Restaurant sx={{ mr: 2, color: '#fff' }} />
            <Typography variant="h6" component="div" sx={{ 
                flexGrow: 1, 
                fontWeight: 600, 
                color: '#fff',
                fontSize: { xs: '1.5rem', sm: '2.0rem' }
            }}>
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    Smile
                </Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                    Smile
                </Box>
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>

            <Button
                sx={{
                    color: location.pathname === '/' ? '#000' : '#fff',
                    backgroundColor: location.pathname === '/' ? '#fff' : 'transparent',
                    fontWeight: location.pathname === '/' ? 700 : 400,
                    textTransform: 'none',
                    border: location.pathname === '/' ? '3px solid #ccc' : '3px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: 2,
                    px: { xs: 1, sm: 2 },
                    py: 1,
                    minWidth: { xs: '40px', sm: 'auto' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                        backgroundColor: location.pathname === '/' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.2)',
                        borderColor: location.pathname === '/' ? '#bbb' : 'rgba(255, 255, 255, 0.5)',
                    },
                    '& .MuiButton-startIcon': {
                        marginLeft: 0,
                        marginRight: { xs: 0, sm: '8px' },
                    },
                }}
                startIcon={<Home sx={{ color: location.pathname === '/' ? '#000' : '#fff' }} />}
                onClick={() => navigate('/')}
            >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    Trang chủ
                </Box>
            </Button>
            
            <Button
                sx={{
                    color: location.pathname === '/report' ? '#000' : '#fff',
                    backgroundColor: location.pathname === '/report' ? '#fff' : 'transparent',
                    fontWeight: location.pathname === '/report' ? 700 : 400,
                    textTransform: 'none',
                    border: location.pathname === '/report' ? '3px solid #ccc' : '3px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: 2,
                    px: { xs: 1, sm: 2 },
                    py: 1,
                    minWidth: { xs: '40px', sm: 'auto' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                        backgroundColor: location.pathname === '/report' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.2)',
                        borderColor: location.pathname === '/report' ? '#bbb' : 'rgba(255, 255, 255, 0.5)',
                    },
                    '& .MuiButton-startIcon': {
                        marginLeft: 0,
                        marginRight: { xs: 0, sm: '8px' },
                    },
                }}
                startIcon={<Assessment sx={{ color: location.pathname === '/report' ? '#000' : '#fff' }} />}
                onClick={() => navigate('/report')}
            >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    Thống kê
                </Box>
            </Button>

            {user ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                    label={getRoleText(user.role)}
                    size="small"
                    color={getRoleColor(user.role) as any}
                    variant="outlined"
                    sx={{ 
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }}
                />
                <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenuOpen}
                    color="inherit"
                    sx={{
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    }}
                >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {user.fullName.charAt(0).toUpperCase()}
                    </Avatar>
                </IconButton>
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    sx={{
                    '& .MuiPaper-root': {
                        borderRadius: 2,
                        minWidth: 200,
                        mt: 1,
                    },
                    }}
                >
                    <MenuItem disabled sx={{ opacity: 1 }}>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {user.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                        @{user.username}
                        </Typography>
                    </Box>
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                    <Person sx={{ mr: 1 }} fontSize="small" />
                    Thông tin cá nhân
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                    <Settings sx={{ mr: 1 }} fontSize="small" />
                    Cài đặt
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                    <ExitToApp sx={{ mr: 1 }} fontSize="small" />
                    Đăng xuất
                    </MenuItem>
                </Menu>
                </Box>
            ) : (
                <Button
                color="inherit"
                startIcon={<AccountCircle />}
                onClick={onLogin}
                variant="outlined"
                sx={{
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    fontWeight: 600,
                    px: { xs: 1, sm: 2 },
                    minWidth: { xs: '40px', sm: 'auto' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '& .MuiButton-startIcon': {
                        marginLeft: 0,
                        marginRight: { xs: 0, sm: '8px' },
                    },
                }}
                >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    Đăng nhập
                </Box>
                </Button>
            )}
            </Box>
        </Toolbar>
        </AppBar>
    );
    };

    export default Header;
