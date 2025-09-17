import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
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
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <div id="print-area">
        <div className="bill-print">
            {/* Header */}
            <Box className="bill-header" sx={{ textAlign: 'center', mb: 1.5 }}>
            <Typography
                variant="h6"
                sx={{ fontWeight: 'bold', fontSize: '20px', fontFamily: 'monospace', letterSpacing: '0.5px', mb: 0.5 }}
            >
                SMILE - Tiệm ăn vặt
            </Typography>
            <Typography sx={{ fontSize: '15px', mt: 0.3 }}>Địa chỉ: 6/6 Tôn Thất Tùng</Typography>
            <Typography sx={{ fontSize: '15px' }}>Điện thoại: 0932575958</Typography>
            <Typography sx={{ fontSize: '17px', fontWeight: 'bold', mt: 1 }}>HÓA ĐƠN THANH TOÁN</Typography>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

            {/* Bill Info */}
            <Box className="bill-info" sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                <Typography sx={{ fontSize: '15px', fontWeight: 'bold' }}>Số HĐ: {billNumber}</Typography>
                <Typography sx={{ fontSize: '15px', fontWeight: 'bold' }}>Bàn: {tableNumber}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '15px' }}>Ngày: {date}</Typography>
                <Typography sx={{ fontSize: '15px' }}>Giờ: {time}</Typography>
            </Box>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

            {/* Items Header */}
            <Box sx={{ mb: 0.5 }}>
            <Box
                sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 35px 45px 50px',
                gap: '2px',
                fontWeight: 'bold',
                fontSize: '15px'
                }}
            >
                <Typography sx={{ fontSize: '15px', fontWeight: 'bold' }}>Tên món</Typography>
                <Typography sx={{ fontSize: '15px', fontWeight: 'bold', textAlign: 'center' }}>SL</Typography>
                <Typography sx={{ fontSize: '15px', fontWeight: 'bold', textAlign: 'right' }}>Giá</Typography>
                <Typography sx={{ fontSize: '15px', fontWeight: 'bold', textAlign: 'right' }}>T.Tiền</Typography>
            </Box>
            </Box>

            <Divider sx={{ my: 0.5 }} />

            {/* Items List */}
            <Box className="bill-items" sx={{ mb: 1.5 }}>
            {orders.map((order, index) => (
                <Box key={index} sx={{ mb: 0.8 }}>
                <Box
                    sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 35px 45px 50px',
                    gap: '2px',
                    fontSize: '15px',
                    mb: 0.2
                    }}
                >
                    <Typography sx={{ fontSize: '15px', wordBreak: 'break-word', lineHeight: 1.3 }}>
                    {order.dish.name}
                    </Typography>
                    <Typography sx={{ fontSize: '15px', textAlign: 'center' }}>{order.quantity}</Typography>
                    <Typography sx={{ fontSize: '15px', textAlign: 'right' }}>
                    {(order.dish.price / 1000).toFixed(0)}k
                    </Typography>
                    <Typography sx={{ fontSize: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                    {((order.dish.price * order.quantity) / 1000).toFixed(0)}k
                    </Typography>
                </Box>

                {order.note && (
                    <Box sx={{ ml: 0.5, mb: 0.3 }}>
                    <Typography sx={{ fontSize: '12px', fontStyle: 'italic', color: '#666' }}>
                        Ghi chú: {order.note}
                    </Typography>
                    </Box>
                )}
                </Box>
            ))}
            </Box>

            <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

            {/* Summary */}
            <Box className="bill-total" sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                <Typography sx={{ fontSize: '15px' }}>Tạm tính:</Typography>
                <Typography sx={{ fontSize: '15px' }}>{formatCurrency(subtotal)}</Typography>
            </Box>

            {discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                <Typography sx={{ fontSize: '15px' }}>Giảm giá:</Typography>
                <Typography sx={{ fontSize: '15px' }}>-{formatCurrency(discount)}</Typography>
                </Box>
            )}

            {shippingFee > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                <Typography sx={{ fontSize: '15px' }}>Phí giao hàng:</Typography>
                <Typography sx={{ fontSize: '15px' }}>{formatCurrency(shippingFee)}</Typography>
                </Box>
            )}

            <Divider sx={{ my: 0.5 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '17px', fontWeight: 'bold' }}>TỔNG TIỀN:</Typography>
                <Typography sx={{ fontSize: '17px', fontWeight: 'bold' }}>{formatCurrency(total)}</Typography>
            </Box>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

            {/* Footer */}
            <Box className="bill-footer" sx={{ textAlign: 'center', mb: 0.5 }}>
            <Typography sx={{ fontSize: '12px', mb: 0.5 }}>Smile xin chân thành cảm ơn quý khách!</Typography>
            <Typography sx={{ fontSize: '12px', mb: 1 }}>Hẹn gặp lại vào!</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 0.5, mb: 0.5 }}>
                <img
                src="/images/qr-payment.jpg"
                alt="QR Thanh toán"
                style={{ width: '100px', height: '100px', border: '1px solid #ddd', borderRadius: '4px' }}
                onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                }}
                />
            </Box>

            <Typography sx={{ fontSize: '8px', color: '#666' }}>Quét mã QR để thanh toán</Typography>
            </Box>

            {/* Print hint — ẩn khi in bởi CSS */}
            <Box sx={{ textAlign: 'center', mt: 1.5, '@media print': { display: 'none' } }}>
            <Typography sx={{ fontSize: '9px', color: '#666' }}>* Nhấn Ctrl+P để in hóa đơn</Typography>
            </Box>
        </div>
        </div>
    );
};

export default BillPrint;
