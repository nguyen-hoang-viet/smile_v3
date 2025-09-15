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
  Stack,
  TablePagination,
} from '@mui/material';
import {
  FileDownload,
  Delete,
  Assessment,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Report } from '../types';
import { reportAPI } from '../services/api';
import './Report.css';
import * as XLSX from 'xlsx'; // THAY ĐỔI: Import thư viện xlsx

// Định nghĩa cấu trúc của một đối tượng gộp ô
interface MergeRange {
  s: { r: number; c: number }; // s = start, r = row, c = column
  e: { r: number; c: number }; // e = end
}

const ReportPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Màu sắc cho biểu đồ
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    fetchReports();
  }, []);

  // const fetchReports = async () => {
  //   try {
  //     const response = await reportAPI.getAllReports();
  //     setReports(response.data);
  //     setLoading(false);
  //   } catch (error) {
  //     console.error('Error fetching reports:', error);
  //     setReports([]); // Set empty array on error
  //     setLoading(false);
  //   }
  // };

  const fetchReports = async () => {
  setLoading(true);
  try {
    const { data } = await reportAPI.getAllReports();
    setReports(data);
  } catch (err) {
    console.error('Error fetching reports:', err);
    setReports([]);
  } finally {
    setLoading(false);
  }
};


  // Xử lý dữ liệu cho biểu đồ cột (doanh thu theo ngày)
  const getRevenueByDate = () => {
    const revenueMap = new Map();
    reports.forEach(report => {
      const existing = revenueMap.get(report.date) || 0;
      revenueMap.set(report.date, existing + report.total);
    });
    
    return Array.from(revenueMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Lấy 7 ngày gần nhất
  };

  // Xử lý dữ liệu cho biểu đồ tròn (sản phẩm bán chạy)
  const getTopProducts = () => {
    const productMap = new Map();
    reports.forEach(report => {
      const existing = productMap.get(report.product_name) || 0;
      productMap.set(report.product_name, existing + report.quantity);
    });
    
    return Array.from(productMap.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6); // Top 6 sản phẩm
  };

  // Xử lý phân trang
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Xử lý dữ liệu cho bảng với merge cells
  const getGroupedReports = () => {
    const grouped = new Map();
    
    reports.forEach(report => {
      const key = `${report.date}_${report.hour}_${report.table_id}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          ...report,
          items: [report],
          totalAmount: report.total,
          totalShipFee: report.ship_fee,
          totalDiscount: report.discount
        });
      } else {
        const existing = grouped.get(key);
        existing.items.push(report);
        existing.totalAmount += report.total;
        existing.totalShipFee += report.ship_fee;
        existing.totalDiscount += report.discount;
      }
    });
    
    return Array.from(grouped.values());
  };

  // Dữ liệu cho bảng với phân trang
  const groupedReports = getGroupedReports();
  const paginatedGroupedReports = groupedReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // THAY ĐỔI: Cập nhật toàn bộ hàm handleExportExcel
  const handleExportExcel = () => {
    if (groupedReports.length === 0) {
      alert('Không có dữ liệu để xuất file Excel!');
      return;
    }

    const headers = [
      'Bàn', 'Ngày', 'Giờ', 'Mã hàng', 'Tên hàng',
      'Số lượng', 'Tổng cộng', 'Thu thêm', 'Giảm giá'
    ];

    const dataForSheet = [headers];
    const merges: MergeRange[] = [];
    let currentRowIndex = 1;

    groupedReports.forEach(group => {
      const groupSize = group.items.length;

      group.items.forEach((item: any, itemIndex: number) => {
        let rowData;
        if (itemIndex === 0) {
          rowData = [
            group.table_id,
            group.date,
            group.hour,
            item.product_code,
            item.product_name,
            item.quantity,
            { t: 'n', v: group.totalAmount, z: '#,##0 "₫"' },
            { t: 'n', v: group.totalShipFee, z: '#,##0 "₫"' },
            { t: 'n', v: group.totalDiscount, z: '#,##0 "₫"' },
          ];
        } else {
          rowData = [
            null, null, null,
            item.product_code,
            item.product_name,
            item.quantity,
            null, null, null,
          ];
        }
        dataForSheet.push(rowData);
      });

      if (groupSize > 1) {
        const endRowIndex = currentRowIndex + groupSize - 1;
        merges.push({ s: { r: currentRowIndex, c: 0 }, e: { r: endRowIndex, c: 0 } });
        merges.push({ s: { r: currentRowIndex, c: 1 }, e: { r: endRowIndex, c: 1 } });
        merges.push({ s: { r: currentRowIndex, c: 2 }, e: { r: endRowIndex, c: 2 } });
        merges.push({ s: { r: currentRowIndex, c: 6 }, e: { r: endRowIndex, c: 6 } });
        merges.push({ s: { r: currentRowIndex, c: 7 }, e: { r: endRowIndex, c: 7 } });
        merges.push({ s: { r: currentRowIndex, c: 8 }, e: { r: endRowIndex, c: 8 } });
      }
      
      currentRowIndex += groupSize;
    });

    const worksheet = XLSX.utils.aoa_to_sheet(dataForSheet);
    worksheet['!merges'] = merges;

    // THAY ĐỔI NẰM Ở ĐÂY: Sửa lại logic tính độ rộng cột
    const colWidths = headers.map((header, i) => {
      const widths = dataForSheet.slice(1).map(row => {
        const cell = row[i];
        if (cell === null || cell === undefined) {
          return 0;
        }
        // Kiểm tra nếu cell là object và có thuộc tính 'v' (dành cho tiền tệ)
        if (typeof cell === 'object' && 'v' in cell) {
          return String((cell as any).v).length;
        }
        // Ngược lại, coi nó là giá trị bình thường (string, number)
        return String(cell).length;
      });

      return {
        wch: Math.max(header.length, ...widths) + 2, // +2 để có khoảng trống
      };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BaoCao');
    XLSX.writeFile(workbook, `BaoCaoDonHang_${new Date().toLocaleDateString('vi-VN')}.xlsx`);
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
        {/* Header */}
        <Paper elevation={2} sx={{ p: 3, backgroundColor: '#ffffff', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        </Paper>

        {/* Layout với Box flex - Bảng bên trái, biểu đồ bên phải */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Cột trái - Bảng dữ liệu (3/4 chiều ngang) */}
          <Box sx={{ flex: 3 }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Chi tiết báo cáo đơn hàng
              </Typography>
              
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader className="report-table">
                  <TableHead>
                    <TableRow className="table-header">
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#000000ff !important', backgroundColor: '#ffffffff !important' }}>Bàn</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#000000ff !important', backgroundColor: '#ffffffff !important' }}>Ngày</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#000000ff !important', backgroundColor: '#ffffffff !important' }}>Giờ</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#000000ff !important', backgroundColor: '#ffffffff !important' }}>Mã hàng</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#000000ff !important', backgroundColor: '#ffffffff !important' }}>Tên hàng</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#000000ff !important', backgroundColor: '#ffffffff !important' }} align="right">Số lượng</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#000000ff !important', backgroundColor: '#ffffffff !important' }} align="right">Tổng cộng</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#000000ff !important', backgroundColor: '#ffffffff !important' }} align="right">Thu thêm</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#000000ff !important', backgroundColor: '#ffffffff!important' }} align="right">Giảm giá</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupedReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                          <Typography variant="h6" color="text.secondary">
                            Chưa có dữ liệu báo cáo
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedGroupedReports.map((group: any, groupIndex: number) => (
                        group.items.map((report: any, itemIndex: number) => (
                          <TableRow 
                            key={`${groupIndex}-${itemIndex}`}
                            className={`product-row ${itemIndex === group.items.length - 1 ? 'group-separator' : ''}`}
                            sx={{ 
                              '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                              '&:hover': { backgroundColor: '#f5f5f5 !important' }
                            }}
                          >
                            {/* Merge cells cho Bàn, Ngày, Giờ */}
                            {itemIndex === 0 ? (
                              <>
                                <TableCell 
                                  rowSpan={group.items.length} 
                                  className="merged-cell"
                                  sx={{ fontSize: '0.9rem' }}
                                >
                                  {report.table_id}
                                </TableCell>
                                <TableCell 
                                  rowSpan={group.items.length} 
                                  className="merged-cell"
                                  sx={{ fontSize: '0.85rem' }}
                                >
                                  {report.date}
                                </TableCell>
                                <TableCell 
                                  rowSpan={group.items.length} 
                                  className="merged-cell"
                                  sx={{ fontSize: '0.85rem' }}
                                >
                                  {report.hour}
                                </TableCell>
                              </>
                            ) : null}
                            
                            {/* Các cột không merge */}
                            <TableCell 
                              className="normal-cell"
                              sx={{ fontSize: '0.85rem' }}
                            >
                              {report.product_code}
                            </TableCell>
                            <TableCell 
                              className="normal-cell"
                              sx={{ fontSize: '0.85rem' }}
                            >
                              {report.product_name}
                            </TableCell>
                            <TableCell 
                              className="normal-cell"
                              align="right" 
                              sx={{ fontSize: '0.85rem', fontWeight: 500 }}
                            >
                              {report.quantity}
                            </TableCell>
                            
                            {/* Merge cells cho Tổng cộng, Thu thêm, Giảm giá */}
                            {itemIndex === 0 ? (
                              <>
                                <TableCell 
                                  rowSpan={group.items.length} 
                                  align="right" 
                                  className="merged-cell merged-cell-total"
                                  sx={{ fontSize: '0.9rem', fontWeight: 600 }}
                                >
                                  {group.totalAmount.toLocaleString('vi-VN')} ₫
                                </TableCell>
                                <TableCell 
                                  rowSpan={group.items.length} 
                                  align="right" 
                                  className="merged-cell"
                                  sx={{ fontSize: '0.85rem' }}
                                >
                                  {group.totalShipFee.toLocaleString('vi-VN')} ₫
                                </TableCell>
                                <TableCell 
                                  rowSpan={group.items.length} 
                                  align="right" 
                                  className="merged-cell"
                                  sx={{ fontSize: '0.85rem' }}
                                >
                                  {group.totalDiscount.toLocaleString('vi-VN')} ₫
                                </TableCell>
                              </>
                            ) : null}
                          </TableRow>
                        ))
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Phân trang */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={groupedReports.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Số nhóm mỗi trang:"
                labelDisplayedRows={({ from, to, count }) => 
                  `${from}–${to} của ${count !== -1 ? count : `hơn ${to}`} nhóm`
                }
              />
            </Paper>
          </Box>

          {/* Cột phải - Biểu đồ (1/4 chiều ngang) */}
          <Box sx={{ flex: 1, minWidth: '300px' }}>
            {/* Biểu đồ doanh thu */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}>
                Doanh thu 7 ngày
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={getRevenueByDate()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [
                      `${value.toLocaleString('vi-VN')} ₫`, 
                      'Doanh thu'
                    ]}
                    labelStyle={{ fontSize: '12px' }}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            {/* Biểu đồ tròn sản phẩm */}
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}>
                Top sản phẩm
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={getTopProducts()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="quantity"
                    fontSize={10}
                  >
                    {getTopProducts().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default ReportPage;