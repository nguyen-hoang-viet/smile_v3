import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Close,
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  PersonAdd,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string, fullName: string, role: string) => Promise<void>;
}

interface LoginFormData {
  username: string;
  password: string;
}

interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, onLogin, onRegister }) => {
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loginForm = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: 'staff',
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    loginForm.reset();
    registerForm.reset();
  };

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    setError('');
    
    try {
      await onLogin(data.username, data.password);
      onClose();
      loginForm.reset();
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onRegister(data.username, data.password, data.fullName, data.role);
      onClose();
      registerForm.reset();
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setError('');
    setTabValue(0);
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{ 
        p: 0, 
        position: 'relative',
        background: 'linear-gradient(135deg, #f7b510 0%, #e65100 100%)',
        color: '#fff',
      }}>
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: '#fff' }}>
            Chào mừng đến với Smile Restaurant
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5, color: '#fff' }}>
            Vui lòng đăng nhập hoặc tạo tài khoản mới
          </Typography>
        </Box>
        
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: '#fff',
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
            },
          }}
        >
          <Tab 
            icon={<Person />} 
            iconPosition="start" 
            label="Đăng nhập" 
            sx={{ flex: 1 }}
          />
          <Tab 
            icon={<PersonAdd />} 
            iconPosition="start" 
            label="Đăng ký" 
            sx={{ flex: 1 }}
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <AnimatePresence mode="wait">
            {tabValue === 0 ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Box
                  component="form"
                  onSubmit={loginForm.handleSubmit(handleLogin)}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                  <Controller
                    name="username"
                    control={loginForm.control}
                    rules={{ required: 'Vui lòng nhập tên đăng nhập' }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Tên đăng nhập"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ),
                        }}
                        fullWidth
                      />
                    )}
                  />

                  <Controller
                    name="password"
                    control={loginForm.control}
                    rules={{ required: 'Vui lòng nhập mật khẩu' }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Mật khẩu"
                        type={showPassword ? 'text' : 'password'}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        fullWidth
                      />
                    )}
                  />
                </Box>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Box
                  component="form"
                  onSubmit={registerForm.handleSubmit(handleRegister)}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                  <Controller
                    name="fullName"
                    control={registerForm.control}
                    rules={{ required: 'Vui lòng nhập họ và tên' }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Họ và tên"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        fullWidth
                      />
                    )}
                  />

                  <Controller
                    name="username"
                    control={registerForm.control}
                    rules={{ required: 'Vui lòng nhập tên đăng nhập' }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Tên đăng nhập"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ),
                        }}
                        fullWidth
                      />
                    )}
                  />

                  <Controller
                    name="password"
                    control={registerForm.control}
                    rules={{ 
                      required: 'Vui lòng nhập mật khẩu',
                      minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                    }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Mật khẩu"
                        type={showPassword ? 'text' : 'password'}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        fullWidth
                      />
                    )}
                  />

                  <Controller
                    name="confirmPassword"
                    control={registerForm.control}
                    rules={{ required: 'Vui lòng xác nhận mật khẩu' }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Xác nhận mật khẩu"
                        type={showConfirmPassword ? 'text' : 'password'}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        fullWidth
                      />
                    )}
                  />

                  <Controller
                    name="role"
                    control={registerForm.control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Vai trò</InputLabel>
                        <Select {...field} label="Vai trò">
                          <MenuItem value="staff">Nhân viên</MenuItem>
                          <MenuItem value="manager">Quản lý</MenuItem>
                          <MenuItem value="admin">Quản trị viên</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined">
          Hủy
        </Button>
        <Button
          onClick={tabValue === 0 ? loginForm.handleSubmit(handleLogin) : registerForm.handleSubmit(handleRegister)}
          variant="contained"
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Đang xử lý...' : (tabValue === 0 ? 'Đăng nhập' : 'Đăng ký')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthModal;
