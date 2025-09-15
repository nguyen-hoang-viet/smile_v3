import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Payment,
  Visibility,
  Restaurant,
  Receipt,
  LocalOffer,
  Print,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, OrderItem, Dish } from '../types';
import { DISHES } from '../data/dishes';
import DishSearch from './DishSearch';
import OrderItemList from './OrderItemList';
import BillPrint from './BillPrint';
import { reportAPI } from '../services/api';

interface OrderPanelProps {
  table: Table;
  onAddOrder: (tableId: number, orderItem: OrderItem) => void;
  onUpdateOrder: (tableId: number, dishId: string, quantity: number) => void;
  onRemoveOrder: (tableId: number, dishId: string) => void;
  onCompletePayment: (tableId: number) => void;
  onUpdateNote?: (tableId: number, dishId: string, note: string) => void;
  // Thêm props cho pending changes
  pendingChangesCount?: number;
  hasPendingChanges?: boolean;
  onSavePendingChanges?: () => void;
}

const OrderPanel: React.FC<OrderPanelProps> = ({
  table,
  onAddOrder,
  onUpdateOrder,
  onRemoveOrder,
  onCompletePayment,
  onUpdateNote,
  pendingChangesCount = 0,
  hasPendingChanges = false,
  onSavePendingChanges
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [searchTerm, setSearchTerm] = useState('');

  // Bảo vệ để không cho searchTerm bị null
  const handleSearchTermChange = (term: string) => {
    // Đảm bảo term không bao giờ là null hoặc undefined
    const safeTerm = term ?? '';
    if (process.env.NODE_ENV === 'development' && term !== safeTerm) {
      console.warn('⚠️ SearchTerm nhận giá trị không hợp lệ:', term, '-> đã sửa thành:', safeTerm);
    }
    setSearchTerm(safeTerm);
  };
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [confirmPaymentDialogOpen, setConfirmPaymentDialogOpen] = useState(false);
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSavingPending, setIsSavingPending] = useState(false);
  
  // State để lưu thông tin bill cuối cùng sau thanh toán
  const [lastBillInfo, setLastBillInfo] = useState<{
    orders: OrderItem[];
    discount: number;
    shippingFee: number;
    subtotal: number;
    total: number;
    date: string;
    time: string;
    billNumber: string;
  } | null>(null);

  const handleDishSelect = (dish: Dish) => {
    const orderItem: OrderItem = {
      dish,
      quantity: 1,
      note: '' // Khởi tạo note rỗng
    };
    onAddOrder(table.id, orderItem);
    setSearchTerm('');
  };

  const calculateSubtotal = () => {
    return table.orders.reduce((total, order) => {
      return total + (order.dish.price * order.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    let discountAmount = 0;
    
    if (discount >= 1000) {
      // Nếu >= 1000 thì tính theo số tiền
      discountAmount = discount;
    } else if (discount > 0 && discount <= 100) {
      // Nếu từ 0-100 thì tính theo %
      discountAmount = (subtotal * discount) / 100;
    }
    
    return subtotal - discountAmount + shippingFee;
  };

  const getDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    if (discount >= 1000) {
      return discount;
    } else if (discount > 0 && discount <= 100) {
      return (subtotal * discount) / 100;
    }
    return 0;
  };

  const handlePrintBill = () => {
    window.print();
  };

  const handlePayment = () => {
    if (table.orders.length === 0) {
      alert('Bàn này chưa có món nào!');
      return;
    }
    setPaymentDialogOpen(true);
  };

  const handleConfirmPayment = () => {
    // Mở confirm dialog thay vì thanh toán ngay
    setConfirmPaymentDialogOpen(true);
  };

  const handleFinalConfirmPayment = async () => {
    setIsProcessingPayment(true);

    const currentDateTime = getCurrentDateTime();
    const billInfo = {
        orders: [...table.orders],
        discount: getDiscountAmount(),
        shippingFee: shippingFee,
        subtotal: calculateSubtotal(),
        total: calculateTotal(),
        date: currentDateTime.date,
        time: currentDateTime.time,
        billNumber: `HD${table.id}${Date.now().toString().slice(-6)}`
    };
    
    // --- OPTIMISTIC UI: Cập nhật giao diện ngay lập tức ---
    // 1. Đóng các dialog
    setPaymentDialogOpen(false);
    setConfirmPaymentDialogOpen(false);
    
    // 2. Lưu thông tin bill để hiển thị hóa đơn
    setLastBillInfo(billInfo);
    
    // 3. Hiển thị dialog hóa đơn
    setBillDialogOpen(true);
    
    // 4. Reset state
    setDiscount(0);
    setShippingFee(0);

    // 5. Gọi hàm xử lý logic nền (không cần await)
    //    Hàm này sẽ tự xử lý API và cập nhật state cuối cùng
    onCompletePayment(table.id);

    try {
        // --- LOGIC NỀN: Gửi dữ liệu đi trong khi UI đã cập nhật ---
        console.log('🚀 Bắt đầu gửi báo cáo hàng loạt...');

        // 1. Chuẩn bị dữ liệu báo cáo hàng loạt
        const reportDataBatch = billInfo.orders.map(order => ({
            tableNumber: table.id,
            date: billInfo.date,
            time: billInfo.time,
            code: order.dish.id,
            nameDish: order.dish.name,
            quantity: order.quantity,
            totalCheck: billInfo.total,
            shipFee: billInfo.shippingFee,
            discountCheck: billInfo.discount,
        }));

        // 2. Gọi API batch một lần duy nhất
        if (reportDataBatch.length > 0) {
            // Giả sử bạn đã tạo hàm reportAPI.addReportBatch
            await reportAPI.addReportBatch({ reports: reportDataBatch });
        }

        console.log('✅ Đã lưu báo cáo thành công (nền)');

    } catch (error) {
        // XỬ LÝ LỖI: Nếu API thất bại, thông báo cho người dùng
        console.error('❌ Lỗi nghiêm trọng khi lưu báo cáo (nền):', error);
        // Hiển thị một thông báo toast/alert để người dùng biết rằng
        // có lỗi xảy ra và họ nên kiểm tra lại.
        alert('Thanh toán thành công nhưng có lỗi khi lưu báo cáo. Vui lòng liên hệ quản trị viên.');
    } finally {
        // Đảm bảo trạng thái processing được tắt
        setIsProcessingPayment(false);
    }
};

  const handleCancelConfirmPayment = () => {
    setConfirmPaymentDialogOpen(false);
  };

  const handleView = () => {
    if (table.orders.length === 0) {
      alert('Bàn này chưa có món nào!');
      return;
    }
    // Reset lastBillInfo khi xem bill từ nút "Xem"
    setLastBillInfo(null);
    setBillDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('vi-VN');
    const time = now.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    return { date, time };
  };

  const handleManualSave = async () => {
    if (!onSavePendingChanges || !hasPendingChanges) return;
    
    setIsSavingPending(true);
    try {
      await onSavePendingChanges();
      // Hiển thị thông báo thành công
      console.log(`✅ Đã lưu ${pendingChangesCount} thay đổi cho ${table.name}`);
      // Có thể thêm toast notification ở đây
    } catch (error) {
      console.error('❌ Lỗi khi lưu thay đổi:', error);
      alert('Có lỗi khi lưu thay đổi. Vui lòng thử lại!');
    } finally {
      setIsSavingPending(false);
    }
  };

  return (
    <Box sx={{ 
      p: 1, 
      height: isMobile ? 'calc(100vh - 60px)' : 'calc(100vh - 60px)', // Đồng nhất chiều cao
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden' // Ngăn container chính overflow
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ flexShrink: 0 }} // Không cho phép shrink
      >
        <Paper
          elevation={0}
          sx={{
            p: 1.25,
            mb: 1, 
            background: 'linear-gradient(135deg, #f7b510 0%, #e65100 100%)',
            color: '#fff',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(245, 127, 23, 0.3)',
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            mb: 0.5,
            minHeight: 40 // Đảm bảo có chiều cao tối thiểu
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Restaurant sx={{ color: '#fff', fontSize: 20 }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: '#fff',
                fontSize: '1.5rem', // Giảm kích thước font
                lineHeight: 1.2 // Thêm line height chuẩn
              }}>
                {table.name}
              </Typography>
            </Box>
            {table.isOrdered && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                height: '100%' // Chiếm toàn bộ chiều cao của container
              }}>
                <Chip 
                  label={`${table.orders.reduce((total, order) => total + order.quantity, 0)} món`}
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#e65100',
                    fontWeight: 700,
                    height: 36,
                    borderRadius: '18px',
                    '& .MuiChip-label': {
                      px: 2,
                      py: 0,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      lineHeight: '36px', // Căn giữa bằng line-height = height
                      display: 'block',
                      textAlign: 'center'
                    }
                  }}
                />
                {hasPendingChanges && (
                  <Chip 
                    label={isSavingPending ? "Đang lưu..." : `${pendingChangesCount} chưa lưu`}
                    onClick={handleManualSave}
                    disabled={isSavingPending}
                    sx={{ 
                      backgroundColor: isSavingPending ? 'rgba(33, 150, 243, 0.9)' : 'rgba(255, 193, 7, 0.9)',
                      color: isSavingPending ? '#fff' : '#333',
                      fontWeight: 600,
                      height: 32,
                      borderRadius: '16px',
                      cursor: isSavingPending ? 'default' : 'pointer',
                      border: `2px solid ${isSavingPending ? 'rgba(33, 150, 243, 0.5)' : 'rgba(255, 193, 7, 0.5)'}`,
                      transition: 'all 0.2s ease-in-out',
                      animation: isSavingPending ? 'none' : 'pulse 2s infinite',
                      '&:hover': !isSavingPending ? {
                        backgroundColor: 'rgba(255, 193, 7, 1)',
                        border: '2px solid rgba(255, 193, 7, 0.8)',
                        transform: 'scale(1.05)',
                        boxShadow: '0 2px 8px rgba(255, 193, 7, 0.4)',
                      } : {},
                      '&:active': !isSavingPending ? {
                        transform: 'scale(0.98)',
                      } : {},
                      '&.Mui-disabled': {
                        opacity: 0.8,
                      },
                      '& .MuiChip-label': {
                        px: 1.5,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                      },
                      '@keyframes pulse': {
                        '0%': {
                          boxShadow: '0 0 0 0 rgba(255, 193, 7, 0.7)',
                        },
                        '70%': {
                          boxShadow: '0 0 0 4px rgba(255, 193, 7, 0)',
                        },
                        '100%': {
                          boxShadow: '0 0 0 0 rgba(255, 193, 7, 0)',
                        },
                      },
                    }}
                    title={isSavingPending ? "Đang lưu..." : "Click để lưu ngay"} // Tooltip
                  />
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </motion.div>

      <Box sx={{ mb: 1, flexShrink: 0 }}>
        <DishSearch
          searchTerm={searchTerm}
          onSearchChange={handleSearchTermChange}
          onDishSelect={handleDishSelect}
          dishes={DISHES}
        />
      </Box>

      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        mb: 1,
        minHeight: 0
      }}>
        <OrderItemList
          orders={table.orders}
          onUpdateQuantity={(dishId, quantity) => onUpdateOrder(table.id, dishId, quantity)}
          onRemoveItem={(dishId) => onRemoveOrder(table.id, dishId)}
          onUpdateNote={onUpdateNote ? (dishId, note) => onUpdateNote(table.id, dishId, note) : undefined}
        />
      </Box>

      <AnimatePresence>
        {table.orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Paper 
              elevation={2} 
              sx={{ 
                mb: 0.5,
                p: isMobile ? 1 : 1.5,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                flexShrink: 0
              }}
            >
              {/* ===== THAY ĐỔI 1: Sửa flexDirection thành 'row' cho cả mobile ===== */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexDirection: 'row', // Luôn là hàng ngang
                gap: isMobile ? 1 : 0
              }}>
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    fontWeight: 700,
                    color: '#333',
                    fontSize: isMobile ? '1rem' : '1.2rem'
                  }}
                >
                  <Receipt sx={{ 
                    color: 'primary.main', 
                    fontSize: isMobile ? 18 : 22
                  }} />
                  Tổng tiền:
                </Typography>
                
                <Typography 
                  variant={isMobile ? "h6" : "h5"}
                  sx={{ 
                    fontWeight: 800, 
                    color: '#f7b510',
                    fontSize: isMobile ? '1.1rem' : '1.4rem'
                  }}
                >
                  {formatCurrency(calculateSubtotal())}
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== THAY ĐỔI 2: Sửa direction thành 'row' cho cả mobile ===== */}
      <Stack 
        direction="row" // Luôn là hàng ngang
        spacing={isMobile ? 0.8 : 1.5}
        sx={{ 
          mt: 'auto',
          flexShrink: 0,
          pt: 0.5
        }}
      >
        <Button
          variant="contained"
          startIcon={!isMobile && <Payment />}
          onClick={handlePayment}
          disabled={table.orders.length === 0}
          size="medium"
          sx={{ 
            flex: 1, // Nút này sẽ chiếm phần lớn không gian
            backgroundColor: '#4caf50',
            '&:hover': {
              backgroundColor: '#388e3c',
            },
            py: isMobile ? 1 : 0.8
          }}
        >
          Thanh toán
        </Button>
        <Button
          variant="outlined"
          startIcon={!isMobile && <Visibility />}
          onClick={handleView}
          disabled={table.orders.length === 0}
          size="medium"
          sx={{ 
            flex: 'auto', // Nút này sẽ co lại theo nội dung
            py: isMobile ? 1 : 0.8
          }}
        >
          Xem
        </Button>
      </Stack>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #f7b510 0%, #e65100 100%)',
          color: '#fff'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Payment sx={{ color: '#fff' }} />
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
              Thanh toán - {table.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Tạm tính:</Typography>
              <Typography>{formatCurrency(calculateSubtotal())}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }} fontWeight={600}>Giảm giá</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  {[5, 10, 15, 20, 30, 50, 100].map((percent) => (
                    <Chip
                      key={percent}
                      label={`${percent}%`}
                      onClick={() => setDiscount(discount === percent ? 0 : percent)}
                      color={discount === percent ? "primary" : "default"}
                      variant={discount === percent ? "filled" : "outlined"}
                      size="small"
                    />
                  ))}
                </Box>
                <TextField
                  label="Giảm giá (% hoặc số tiền)"
                  type="number"
                  value={discount === 0 ? '' : discount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDiscount(value === '' ? 0 : Number(value));
                  }}
                  InputProps={{
                    startAdornment: <LocalOffer color="action" sx={{ mr: 1 }} />,
                  }}
                  fullWidth
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }} fontWeight={600}>Phí giao hàng</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip
                    label="6.000đ"
                    onClick={() => setShippingFee(shippingFee === 6000 ? 0 : 6000)}
                    color={shippingFee === 6000 ? "primary" : "default"}
                    variant={shippingFee === 6000 ? "filled" : "outlined"}
                  />
                  <Chip
                    label="10.000đ"
                    onClick={() => setShippingFee(shippingFee === 10000 ? 0 : 10000)}
                    color={shippingFee === 10000 ? "primary" : "default"}
                    variant={shippingFee === 10000 ? "filled" : "outlined"}
                  />
                  <Chip
                    label="Khác"
                    onClick={() => setShippingFee(0)}
                    color={shippingFee !== 6000 && shippingFee !== 10000 && shippingFee !== 0 ? "primary" : "default"}
                    variant={shippingFee !== 6000 && shippingFee !== 10000 && shippingFee !== 0 ? "filled" : "outlined"}
                  />
                </Box>
                <TextField
                  label="Phí giao hàng"
                  type="number"
                  value={shippingFee === 0 ? '' : shippingFee}
                  onChange={(e) => {
                    const value = e.target.value;
                    setShippingFee(value === '' ? 0 : Number(value));
                  }}
                  fullWidth
                  size="small"
                />
              </Box>
            </Box>
            
            {getDiscountAmount() > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'error.main' }}>
                <Typography>Giảm giá:</Typography>
                <Typography>-{formatCurrency(getDiscountAmount())}</Typography>
              </Box>
            )}
            
            {shippingFee > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Phí giao hàng:</Typography>
                <Typography>{formatCurrency(shippingFee)}</Typography>
              </Box>
            )}
            
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tổng tiền:
              </Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                {formatCurrency(calculateTotal())}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setPaymentDialogOpen(false)}
            variant="outlined"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmPayment}
            variant="contained"
            startIcon={<Payment />}
            sx={{
              backgroundColor: '#4caf50',
              '&:hover': {
                backgroundColor: '#388e3c',
              }
            }}
          >
            Xác nhận thanh toán
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bill Dialog */}
      <Dialog
        open={billDialogOpen}
        onClose={() => {
          setBillDialogOpen(false);
          setLastBillInfo(null);
        }}
        maxWidth={isMobile ? "sm" : "md"}
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            maxHeight: isMobile ? '100vh' : '95vh',
            height: isMobile ? '100vh' : 'auto',
            minHeight: isMobile ? '100vh' : '70vh',
            overflow: 'hidden',
            margin: isMobile ? 0 : undefined
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #f7b510 0%, #e65100 100%)',
          color: '#fff',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt sx={{ color: '#fff' }} />
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
              Hóa đơn - {table.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent 
          sx={{ 
            p: isMobile ? 1 : 0, 
            backgroundColor: '#f5f5f5',
            overflow: 'auto',
            maxHeight: isMobile ? 'calc(100vh - 120px)' : 'calc(95vh - 120px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}
        >
          <Box sx={{ 
            py: isMobile ? 1 : 3,
            px: isMobile ? 0 : 2,
            display: 'flex', 
            justifyContent: 'center',
            width: '100%',
            maxWidth: isMobile ? '100%' : 'none'
          }}>
            <Box sx={{ 
              transform: isMobile ? 'scale(1)' : 'scale(1.5)', 
              transformOrigin: 'top center',
              width: isMobile ? '100%' : 'auto',
              maxWidth: isMobile ? '100%' : 'none'
            }}>
              <BillPrint
                tableNumber={table.id}
                orders={lastBillInfo ? lastBillInfo.orders : table.orders}
                discount={lastBillInfo ? lastBillInfo.discount : getDiscountAmount()}
                shippingFee={lastBillInfo ? lastBillInfo.shippingFee : shippingFee}
                subtotal={lastBillInfo ? lastBillInfo.subtotal : calculateSubtotal()}
                total={lastBillInfo ? lastBillInfo.total : calculateTotal()}
                date={lastBillInfo ? lastBillInfo.date : getCurrentDateTime().date}
                time={lastBillInfo ? lastBillInfo.time : getCurrentDateTime().time}
                billNumber={lastBillInfo ? lastBillInfo.billNumber : `HD${table.id}${Date.now().toString().slice(-6)}`}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5', gap: 1 }}>
          <Button 
            onClick={() => {
              setBillDialogOpen(false);
              setLastBillInfo(null);
            }}
            variant="outlined"
            fullWidth={isMobile}
          >
            Đóng
          </Button>
          <Button 
            onClick={handlePrintBill}
            variant="contained"
            startIcon={<Print />}
            fullWidth={isMobile}
            sx={{
              backgroundColor: '#9c27b0',
              '&:hover': {
                backgroundColor: '#7b1fa2',
              }
            }}
          >
            In hóa đơn
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Payment Dialog */}
      <Dialog
        open={confirmPaymentDialogOpen}
        onClose={handleCancelConfirmPayment}
        maxWidth="sm"
        fullWidth
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleFinalConfirmPayment();
          } else if (e.key === 'Escape') {
            handleCancelConfirmPayment();
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Payment sx={{ color: '#fff' }} />
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
            Xác nhận thanh toán
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
            Bạn có chắc chắn muốn thanh toán cho {table.name}?
          </Typography>
          <Box sx={{ 
            backgroundColor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            mb: 2
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Tạm tính:</Typography>
              <Typography>{formatCurrency(calculateSubtotal())}</Typography>
            </Box>
            {getDiscountAmount() > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'error.main' }}>
                <Typography>Giảm giá:</Typography>
                <Typography>-{formatCurrency(getDiscountAmount())}</Typography>
              </Box>
            )}
            {shippingFee > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Phí giao hàng:</Typography>
                <Typography>{formatCurrency(shippingFee)}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tổng tiền:
              </Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                {formatCurrency(calculateTotal())}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Nhấn <strong>Enter</strong> để xác nhận hoặc <strong>ESC</strong> để hủy
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleCancelConfirmPayment}
            variant="outlined"
            fullWidth={isMobile}
          >
            Không (ESC)
          </Button>
          <Button 
            onClick={handleFinalConfirmPayment}
            variant="contained"
            startIcon={isProcessingPayment ? undefined : <Payment />}
            fullWidth={isMobile}
            autoFocus
            disabled={isProcessingPayment}
            sx={{
              backgroundColor: '#4caf50',
              '&:hover': {
                backgroundColor: '#388e3c',
              }
            }}
          >
            {isProcessingPayment ? 'Đang xử lý...' : 'Đồng ý (Enter)'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderPanel;