import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Divider,
  Stack,
} from '@mui/material';
import {
  FileDownload,
  Delete,
  Assessment,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Report } from '../types';
import { reportAPI } from '../services/api';

const ReportPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await reportAPI.getAllReports();
      setReports(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]); // Set empty array on error
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log('Exporting to Excel...');
    alert('Tính năng xuất Excel sẽ được thêm sau!');
  };

  const handleDeleteReports = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả báo cáo?')) {
      try {
        await reportAPI.deleteAllReports();
        setReports([]);
        alert('Đã xóa tất cả báo cáo thành công!');
      } catch (error) {
        console.error('Error deleting reports:', error);
        alert('Có lỗi khi xóa báo cáo. Vui lòng thử lại!');
      }
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 64px)',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: '#fafafa'
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Đang tải dữ liệu báo cáo...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)', 
      backgroundColor: '#fafafa',
      p: 3
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={2} sx={{ p: 3, backgroundColor: '#ffffff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Assessment sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#333' }}>
                Bảng thống kê
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<FileDownload />}
                onClick={handleExportExcel}
                sx={{
                  backgroundColor: '#2196f3',
                  '&:hover': {
                    backgroundColor: '#f7b510',
                  }
                }}
              >
                Xuất Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<Delete />}
                onClick={handleDeleteReports}
                color="error"
                sx={{
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  }
                }}
              >
                Xóa tất cả
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <TableContainer component={Paper} elevation={1}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Bàn</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Ngày</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Giờ</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Mã hàng</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Tên hàng</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }} align="right">Số lượng</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }} align="right">Tổng cộng</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }} align="right">Thu thêm</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }} align="right">Giảm giá</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        Chưa có dữ liệu báo cáo
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                        '&:hover': { backgroundColor: '#f0f0f0' }
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.95rem' }}>{report.table_id}</TableCell>
                      <TableCell sx={{ fontSize: '0.95rem' }}>{report.date}</TableCell>
                      <TableCell sx={{ fontSize: '0.95rem' }}>{report.hour}</TableCell>
                      <TableCell sx={{ fontSize: '0.95rem' }}>{report.product_code}</TableCell>
                      <TableCell sx={{ fontSize: '0.95rem' }}>{report.product_name}</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>{report.quantity}</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#f7b510' }}>
                        {report.total.toLocaleString('vi-VN')} ₫
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.95rem' }}>
                        {report.ship_fee.toLocaleString('vi-VN')} ₫
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.95rem' }}>
                        {report.discount.toLocaleString('vi-VN')} ₫
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default ReportPage;
