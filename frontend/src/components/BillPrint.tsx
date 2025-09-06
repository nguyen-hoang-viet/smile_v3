import React from 'react';
import {
    Box,
    Typography,
    Divider,
    Paper,
} from '@mui/material';
import { OrderItem } from '../types';
import '../styles/bill-print.css';

interface BillPrintProps {
    tableNumber: number;
    orders: OrderItem[];
    discount?: number;
    shippingFee?: number;
    subtotal: number;
    total: number;
    date: string;
    time: string;
    billNumber?: string;
}

const BillPrint: React.FC<BillPrintProps> = ({
    tableNumber,
    orders,
    discount = 0,
    shippingFee = 0,
    subtotal,
    total,
    date,
    time,
    billNumber = `${Date.now()}`
    }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
        }).format(amount);
    };

    return (
        <Paper
        className="bill-print"
        sx={{
            width: { xs: '100%', sm: '80mm' }, // Responsive width
            maxWidth: { xs: '100%', sm: '80mm' },
            minHeight: 'auto',
            padding: { xs: '4px', sm: '8px' }, // Responsive padding
            fontSize: { xs: '10px', sm: '12px' }, // Responsive font size
            fontFamily: 'monospace', // Font đơn giản cho máy in
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            margin: '0 auto',
            '@media print': {
            boxShadow: 'none',
            margin: 0,
            padding: '4px',
            }
        }}
        >
        {/* Header */}
        <Box className="bill-header" sx={{ textAlign: 'center', mb: 2 }}>
            <Typography 
            variant="h6" 
            sx={{ 
                fontWeight: 'bold', 
                fontSize: { xs: '14px', sm: '16px' },
                fontFamily: 'monospace',
                letterSpacing: '1px'
            }}
            >
            SMILE - Tiệm ăn vặt
            </Typography>
            <Typography sx={{ fontSize: { xs: '9px', sm: '11px' }, mt: 0.5 }}>
            Địa chỉ: 6/6 Tôn Thất Tùng
            </Typography>
            <Typography sx={{ fontSize: { xs: '9px', sm: '11px' } }}>
            Điện thoại: 0932575958
            </Typography>
            <Typography sx={{ fontSize: { xs: '9px', sm: '11px' }, fontWeight: 'bold', mt: 1 }}>
            HÓA ĐƠN THANH TOÁN
            </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed', mb: 1 }} />

        {/* Bill Info */}
        <Box className="bill-info" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: { xs: '9px', sm: '11px' } , fontWeight: 'bold'}}>Số HĐ: {billNumber}</Typography>
                <Typography sx={{ fontSize: { xs: '9px', sm: '11px' } , fontWeight: 'bold'}}>Bàn: {tableNumber}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: { xs: '9px', sm: '11px' } }}>Ngày: {date}</Typography>
                <Typography sx={{ fontSize: { xs: '9px', sm: '11px' } }}>Giờ: {time}</Typography>
            </Box>
        </Box>

        <Divider sx={{ borderStyle: 'dashed', mb: 1 }} />

        {/* Items Header */}
        <Box sx={{ mb: 1 }}>
            <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '3fr 1fr 1fr 1fr',
            gap: 0.5,
            fontWeight: 'bold',
            fontSize: { xs: '8px', sm: '10px' }
            }}>
            <Typography sx={{ fontSize: { xs: '8px', sm: '10px' }, fontWeight: 'bold' }}>Tên món</Typography>
            <Typography sx={{ fontSize: { xs: '8px', sm: '10px' }, fontWeight: 'bold', textAlign: 'center' }}>SL</Typography>
            <Typography sx={{ fontSize: { xs: '8px', sm: '10px' }, fontWeight: 'bold', textAlign: 'right' }}>Giá</Typography>
            <Typography sx={{ fontSize: { xs: '8px', sm: '10px' }, fontWeight: 'bold', textAlign: 'right' }}>T.Tiền</Typography>
            </Box>
        </Box>

        <Divider sx={{ borderStyle: 'solid', mb: 1 }} />

        {/* Items List */}
        <Box className="bill-items" sx={{ mb: 2 }}>
            {orders.map((order, index) => (
            <Box key={index} sx={{ mb: 1 }}>
                {/* Item main info */}
                <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '3fr 1fr 1fr 1fr',
                gap: 0.5,
                fontSize: '10px',
                mb: 0.5
                }}>
                <Typography sx={{ 
                    fontSize: { xs: '8px', sm: '10px' },
                    wordBreak: 'break-word',
                    lineHeight: 1.2
                }}>
                    {order.dish.name}
                </Typography>
                <Typography sx={{ fontSize: { xs: '8px', sm: '10px' }, textAlign: 'center' }}>
                    {order.quantity}
                </Typography>
                <Typography sx={{ fontSize: { xs: '8px', sm: '10px' }, textAlign: 'right' }}>
                    {(order.dish.price / 1000).toFixed(0)}k
                </Typography>
                <Typography sx={{ fontSize: { xs: '8px', sm: '10px' }, textAlign: 'right', fontWeight: 'bold' }}>
                    {((order.dish.price * order.quantity) / 1000).toFixed(0)}k
                </Typography>
                </Box>
                
                {/* Note if exists */}
                {order.note && (
                <Box sx={{ ml: 1, mb: 0.5 }}>
                    <Typography sx={{ 
                    fontSize: { xs: '7px', sm: '9px' }, 
                    fontStyle: 'italic',
                    color: '#666'
                    }}>
                    Ghi chú: {order.note}
                    </Typography>
                </Box>
                )}
            </Box>
            ))}
        </Box>

        <Divider sx={{ borderStyle: 'dashed', mb: 1 }} />

        {/* Summary */}
        <Box className="bill-total" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: { xs: '9px', sm: '11px' } }}>Tạm tính:</Typography>
            <Typography sx={{ fontSize: { xs: '9px', sm: '11px' } }}>
                {formatCurrency(subtotal)}
            </Typography>
            </Box>
            
            {discount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: { xs: '9px', sm: '11px' } }}>Giảm giá:</Typography>
                <Typography sx={{ fontSize: { xs: '9px', sm: '11px' } }}>
                -{formatCurrency(discount)}
                </Typography>
            </Box>
            )}
            
            {shippingFee > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: { xs: '9px', sm: '11px' } }}>Phí giao hàng:</Typography>
                <Typography sx={{ fontSize: { xs: '9px', sm: '11px' } }}>
                {formatCurrency(shippingFee)}
                </Typography>
            </Box>
            )}
            
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold' }}>
                TỔNG TIỀN:
            </Typography>
            <Typography sx={{ fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold' }}>
                {formatCurrency(total)}
            </Typography>
            </Box>
        </Box>

        <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

        {/* Footer */}
        <Box className="bill-footer" sx={{ textAlign: 'center', mb: 1 }}>
            <Typography sx={{ fontSize: { xs: '8px', sm: '10px' }, mb: 1 }}>
            Cảm ơn quý khách!
            </Typography>
            <Typography sx={{ fontSize: { xs: '8px', sm: '10px' }, mb: 0.5 }}>
            Hẹn gặp lại!
            </Typography>
        </Box>

        {/* Print Instructions */}
        <Box sx={{ 
            textAlign: 'center', 
            mt: 2, 
            display: { xs: 'none', sm: 'block' }, // Ẩn trên mobile
            '@media print': { display: 'none' }
        }}>
            <Typography sx={{ fontSize: '9px', color: '#666' }}>
            * Nhan Ctrl+P de in hoa don
            </Typography>
        </Box>
        </Paper>
    );
};

export default BillPrint;
