import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import {
  Delete,
  Restaurant,
  Add,
  Remove,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderItem } from '../types';

interface OrderItemListProps {
  orders: OrderItem[];
  onUpdateQuantity: (dishId: string, quantity: number) => void;
  onRemoveItem: (dishId: string) => void;
  onUpdateNote?: (dishId: string, note: string) => void;
}

const OrderItemList: React.FC<OrderItemListProps> = ({
  orders,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNote
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [quantityDialogOpen, setQuantityDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ dishId: string; currentQuantity: number } | null>(null);
  const [tempQuantity, setTempQuantity] = useState(1);

  const handleMobileQuantityClick = (dishId: string, currentQuantity: number) => {
    setSelectedItem({ dishId, currentQuantity });
    setTempQuantity(currentQuantity);
    setQuantityDialogOpen(true);
  };

  const handleQuantityConfirm = () => {
    if (selectedItem) {
      onUpdateQuantity(selectedItem.dishId, tempQuantity);
    }
    setQuantityDialogOpen(false);
    setSelectedItem(null);
  };

  const handleQuantityIncrease = (dishId: string, currentQuantity: number) => {
    onUpdateQuantity(dishId, currentQuantity + 1);
  };

  const handleQuantityDecrease = (dishId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      onUpdateQuantity(dishId, currentQuantity - 1);
    }
  };

  const handleNoteChange = (dishId: string, note: string) => {
    if (onUpdateNote) {
      onUpdateNote(dishId, note);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (orders.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: isMobile ? 2 : 4,
          color: 'text.secondary',
        }}
      >
        <Restaurant sx={{ fontSize: isMobile ? 36 : 48, mb: isMobile ? 1 : 2, opacity: 0.5 }} />
        <Typography variant="body1" sx={{ fontStyle: 'italic', fontSize: isMobile ? '0.9rem' : '1rem' }}>
          Chưa có món nào được chọn
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <AnimatePresence>
        {orders.map((order, index) => (
          <motion.div
            key={order.dish.id}
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ 
              opacity: 0, 
              x: 20, 
              scale: 0.8,
              transition: { duration: 0.2, ease: "easeInOut" }
            }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.02,
              ease: "easeInOut"
            }}
            layout
            style={{ overflow: 'hidden' }}
          >
            <Card sx={{ 
              mb: isMobile ? 1 : 2, 
              overflow: 'visible',
              border: '2px solid #f0f0f0',
              borderRadius: 3,
              '&:hover': {
                borderColor: '#e0e0e0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}>
              <CardContent sx={{ p: isMobile ? 2 : 3, '&:last-child': { pb: isMobile ? 2 : 3 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: isMobile ? 'flex-start' : 'center',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1.5 : 0
                }}>
                  {/* ===== THAY ĐỔI Ở ĐÂY: Chỉ giữ lại tên món ===== */}
                  <Box sx={{ flex: 1, mr: isMobile ? 0 : 2, width: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: isMobile ? '1.1rem' : '1.2rem' }}>
                      {order.dish.name}
                    </Typography>
                  </Box>

                  {/* Control và giá */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: isMobile ? 1 : 1.5,
                    width: isMobile ? '100%' : '70%',
                    justifyContent: isMobile ? 'space-between' : 'flex-start'
                  }}>
                    {/* Note field */}
                    <Box sx={{ flex: isMobile ? 1 : 2, mr: isMobile ? 1 : 2 }}>
                      <TextField
                        size="small"
                        placeholder="Ghi chú..."
                        value={order.note || ''}
                        onChange={(e) => handleNoteChange(order.dish.id, e.target.value)}
                        variant="outlined"
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8f9fa',
                            fontSize: isMobile ? '0.8rem' : '0.9rem',
                            '&:hover': {
                              backgroundColor: '#fff',
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#fff',
                            }
                          },
                          '& .MuiInputBase-input::placeholder': {
                            fontSize: isMobile ? '0.8rem' : '0.9rem',
                            opacity: 0.7
                          }
                        }}
                      />
                    </Box>

                    {/* Số lượng */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {isMobile ? (
                        <Box
                          onClick={() => handleMobileQuantityClick(order.dish.id, order.quantity)}
                          sx={{
                            width: 60,
                            height: 32,
                            backgroundColor: '#f8f9fa',
                            border: '2px solid #e0e0e0',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                              borderColor: 'primary.main',
                              backgroundColor: '#fff',
                            }
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {order.quantity}
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityDecrease(order.dish.id, order.quantity)}
                            disabled={order.quantity <= 1}
                            sx={{
                              width: 28,
                              height: 28,
                              backgroundColor: '#f5f5f5',
                              border: '1px solid #ddd',
                              '&:hover': {
                                backgroundColor: '#e0e0e0',
                              },
                              '&:disabled': {
                                backgroundColor: '#f9f9f9',
                                color: '#ccc',
                              }
                            }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          
                          <Typography
                            variant="body1"
                            sx={{
                              width: 40,
                              textAlign: 'center',
                              fontWeight: 600,
                              backgroundColor: '#f8f9fa',
                              border: '1px solid #e0e0e0',
                              borderRadius: 1,
                              py: 0.5,
                            }}
                          >
                            {order.quantity}
                          </Typography>
                          
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityIncrease(order.dish.id, order.quantity)}
                            sx={{
                              width: 28,
                              height: 28,
                              backgroundColor: '#f5f5f5',
                              border: '1px solid #ddd',
                              '&:hover': {
                                backgroundColor: '#e0e0e0',
                              }
                            }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>

                    {/* Giá tổng */}
                    <Box sx={{ 
                      backgroundColor: '#f7b510', 
                      color: 'white', 
                      px: isMobile ? 1.5 : 2, 
                      py: isMobile ? 0.5 : 1, 
                      borderRadius: 2,
                      minWidth: isMobile ? 100 : 120,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: isMobile ? '1rem' : '1.1rem' }}>
                        {formatCurrency(order.dish.price * order.quantity)}
                      </Typography>
                    </Box>

                    {/* Nút xóa */}
                    <IconButton
                      size={isMobile ? "medium" : "large"}
                      color="error"
                      onClick={() => onRemoveItem(order.dish.id)}
                      sx={{
                        width: isMobile ? 36 : 44,
                        height: isMobile ? 36 : 44,
                        backgroundColor: 'error.50',
                        border: '2px solid',
                        borderColor: 'error.main',
                        '&:hover': {
                          backgroundColor: 'error.100',
                          transform: 'scale(1.05)',
                          borderColor: 'error.dark',
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <Delete sx={{ fontSize: isMobile ? 18 : 22 }} />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Dialog chọn số lượng cho mobile */}
      <Dialog
        open={quantityDialogOpen}
        onClose={() => setQuantityDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f7b510 0%, #e65100 100%)',
          color: 'white'
        }}>
          Chọn số lượng
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2
          }}>
            <IconButton
              onClick={() => setTempQuantity(Math.max(1, tempQuantity - 1))}
              disabled={tempQuantity <= 1}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: '#f5f5f5',
                border: '2px solid #ddd',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                },
                '&:disabled': {
                  backgroundColor: '#f9f9f9',
                  color: '#ccc',
                }
              }}
            >
              <Remove />
            </IconButton>
            
            <Typography
              variant="h4"
              sx={{
                width: 80,
                textAlign: 'center',
                fontWeight: 700,
                backgroundColor: '#f8f9fa',
                border: '2px solid #e0e0e0',
                borderRadius: 2,
                py: 1,
                color: '#f7b510'
              }}
            >
              {tempQuantity}
            </Typography>
            
            <IconButton
              onClick={() => setTempQuantity(tempQuantity + 1)}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: '#f5f5f5',
                border: '2px solid #ddd',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                }
              }}
            >
              <Add />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setQuantityDialogOpen(false)}
            variant="outlined"
            fullWidth
          >
            Hủy
          </Button>
          <Button 
            onClick={handleQuantityConfirm}
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: '#f7b510',
              '&:hover': {
                backgroundColor: '#e65100',
              }
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderItemList;