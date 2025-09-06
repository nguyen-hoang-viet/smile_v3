import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Drawer,
  Fab,
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
} from '@mui/icons-material';
import TableGrid from '../components/TableGrid';
import OrderPanel from '../components/OrderPanel';
import AuthModal from '../components/AuthModal';
import { Table, OrderItem, OrderResponse } from '../types';
import { orderAPI } from '../services/api';
import { DISHES } from '../data/dishes';
import { usePendingOrders } from '../hooks/usePendingOrders';

const Home: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number>(() => {
    const savedTableId = localStorage.getItem('selectedTableId');
    return savedTableId ? parseInt(savedTableId) : 1;
  });
  const [loading, setLoading] = useState(true);
  const [lastEnterTime, setLastEnterTime] = useState<number>(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Sử dụng pending orders hook
  const {
    addPendingChange,
    savePendingChanges,
    saveCurrentTableChanges,
    setCurrentTable,
    getPendingChangesCount,
    hasPendingChanges
  } = usePendingOrders();

  // Tính toán selectedTable dựa trên tables và selectedTableId
  const selectedTable = useMemo(() => {
    return tables.find(table => table.id === selectedTableId) || null;
  }, [tables, selectedTableId]);

  useEffect(() => {
    // Initialize 17 tables
    const initialTables: Table[] = [];
    for (let i = 1; i <= 17; i++) {
      let name = `Bàn ${i}`;
      if (i === 15) name = "Shopee";
      if (i === 16) name = "Giao đi";
      if (i === 17) name = "Mang về";
      
      initialTables.push({
        id: i,
        name,
        orders: [],
        isOrdered: false
      });
    }
    setTables(initialTables);
    loadTableOrders(initialTables);
  }, []);

  // Khởi tạo current table khi component mount
  useEffect(() => {
    if (selectedTableId) {
      console.log(`🎯 Initializing current table: ${selectedTableId}`);
      setCurrentTable(selectedTableId);
    }
  }, [selectedTableId, setCurrentTable]);

  // Double Enter to focus search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        const currentTime = Date.now();
        
        if (currentTime - lastEnterTime < 500) {
          const searchInput = document.querySelector('input[placeholder*="Nhập tên món"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
          setLastEnterTime(0);
        } else {
          setLastEnterTime(currentTime);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lastEnterTime]);

  const loadTableOrders = async (initialTables: Table[]) => {
    try {
      const response = await orderAPI.getAllOrders();
      const backendOrders = response.data;
      
      // Group orders by table_id
      const ordersByTable: { [key: number]: OrderResponse[] } = {};
      backendOrders.forEach(order => {
        if (!ordersByTable[order.table_id]) {
          ordersByTable[order.table_id] = [];
        }
        ordersByTable[order.table_id].push(order);
      });
      
      // Update tables with orders from backend
      const updatedTables = initialTables.map(table => {
        const tableOrders = ordersByTable[table.id] || [];
        const orders: OrderItem[] = tableOrders.map(order => {
          const dish = DISHES.find(d => d.name === order.dish_name);
          if (!dish) {
            return {
              dish: { id: order.dish_name, name: order.dish_name, price: 0 },
              quantity: order.quantity,
              note: order.note || ''
            };
          }
          return {
            dish,
            quantity: order.quantity,
            note: order.note || ''
          };
        });
        
        return {
          ...table,
          orders,
          isOrdered: orders.length > 0
        };
      });
      
      setTables(updatedTables);
      setLoading(false);
    } catch (error) {
      console.error('Error loading orders:', error);
      setLoading(false);
    }
  };

  const handleTableSelect = useCallback((table: Table) => {
    console.log(`🔄 Switching from table ${selectedTableId} to table ${table.id}`);
    
    // Lưu pending changes của bàn hiện tại trước khi chuyển
    if (selectedTableId !== table.id) {
      console.log(`💾 Auto-saving pending changes for table ${selectedTableId} before switching`);
      setCurrentTable(table.id); // This triggers auto-save of previous table
    }
    
    setSelectedTableId(table.id);
    localStorage.setItem('selectedTableId', table.id.toString());
  }, [setCurrentTable, selectedTableId]);

  // Thêm món mới - chỉ cập nhật local state và thêm vào pending
  const handleAddOrder = useCallback((tableId: number, orderItem: OrderItem) => {
    console.log(`🍽️ Adding order: Table ${tableId}, Dish: ${orderItem.dish.name}, Qty: ${orderItem.quantity}`);
    
    // Cập nhật local state ngay lập tức
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === tableId) {
          const existingOrderIndex = table.orders.findIndex(
            order => order.dish.id === orderItem.dish.id
          );
          
          let updatedOrders;
          if (existingOrderIndex >= 0) {
            // Món đã tồn tại, tăng số lượng
            const newQuantity = table.orders[existingOrderIndex].quantity + orderItem.quantity;
            updatedOrders = table.orders.map((order, index) =>
              index === existingOrderIndex
                ? { ...order, quantity: newQuantity }
                : order
            );
            console.log(`📈 Updated existing dish quantity: ${orderItem.dish.name} -> ${newQuantity}`);
            
            // Chỉ tạo/cập nhật pending change với type 'add' để đảm bảo consistency
            // Backend sẽ tự động merge quantity nếu dish đã tồn tại
            addPendingChange({
              type: 'add',
              tableId,
              dishId: orderItem.dish.id,
              orderItem: { ...orderItem, quantity: newQuantity }
            });
          } else {
            // Món mới, thêm vào danh sách
            updatedOrders = [...table.orders, orderItem];
            console.log(`➕ Added new dish: ${orderItem.dish.name}`);
            
            // Thêm pending change với type 'add' cho món mới
            addPendingChange({
              type: 'add',
              tableId,
              dishId: orderItem.dish.id,
              orderItem
            });
          }
          
          return {
            ...table,
            orders: updatedOrders,
            isOrdered: updatedOrders.length > 0
          };
        }
        return table;
      });
    });
  }, [addPendingChange]);

  // Cập nhật số lượng món
  const handleUpdateOrder = useCallback((tableId: number, dishId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Xóa món nếu số lượng <= 0
      setTables(prevTables => {
        return prevTables.map(table => {
          if (table.id === tableId) {
            const updatedOrders = table.orders.filter(order => order.dish.id !== dishId);
            
            return {
              ...table,
              orders: updatedOrders,
              isOrdered: updatedOrders.length > 0
            };
          }
          return table;
        });
      });

      // Thêm vào pending changes
      addPendingChange({
        type: 'remove',
        tableId,
        dishId
      });
      return;
    }

    // Cập nhật local state
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === tableId) {
          const updatedOrders = table.orders.map(order =>
            order.dish.id === dishId
              ? { ...order, quantity: newQuantity }
              : order
          );
          
          return {
            ...table,
            orders: updatedOrders,
            isOrdered: updatedOrders.length > 0
          };
        }
        return table;
      });
    });

    // Thêm vào pending changes
    addPendingChange({
      type: 'update',
      tableId,
      dishId,
      quantity: newQuantity
    });
  }, [addPendingChange]);

  // Xóa món - wrapper cho handleUpdateOrder với quantity = 0
  const handleRemoveOrder = useCallback((tableId: number, dishId: string) => {
    handleUpdateOrder(tableId, dishId, 0);
  }, [handleUpdateOrder]);

  // Cập nhật ghi chú
  const handleUpdateNote = useCallback((tableId: number, dishId: string, note: string) => {
    // Cập nhật local state
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === tableId) {
          const updatedOrders = table.orders.map(order =>
            order.dish.id === dishId
              ? { ...order, note }
              : order
          );
          
          return {
            ...table,
            orders: updatedOrders
          };
        }
        return table;
      });
    });

    // Thêm vào pending changes
    addPendingChange({
      type: 'note',
      tableId,
      dishId,
      note
    });
  }, [addPendingChange]);

  // Thanh toán
  const handleCompletePayment = async (tableId: number) => {
    try {
      console.log(`💳 Processing payment for table ${tableId}`);
      
      // Lưu tất cả pending changes trước khi thanh toán
      await savePendingChanges(tableId);
      console.log(`✅ Saved pending changes for table ${tableId}`);
      
      // Xóa tất cả order của bàn từ database
      const table = tables.find(t => t.id === tableId);
      if (table && table.orders.length > 0) {
        console.log(`🗑️ Deleting ${table.orders.length} orders from database`);
        
        const deletePromises = table.orders.map(order => 
          orderAPI.deleteOrder(tableId, order.dish.name).catch(error => {
            console.warn(`Failed to delete ${order.dish.name}:`, error);
            // Don't fail the entire payment for individual delete failures
            return null;
          })
        );
        
        await Promise.allSettled(deletePromises);
        console.log(`✅ Completed order deletion for table ${tableId}`);
      }
      
      // Cập nhật local state
      setTables(prevTables =>
        prevTables.map(table =>
          table.id === tableId
            ? { ...table, orders: [], isOrdered: false }
            : table
        )
      );
      
      console.log(`✅ Payment completed for table ${tableId}`);
    } catch (error) {
      console.error('❌ Error completing payment:', error);
      // Không throw error ở đây để OrderPanel có thể hiển thị thông báo thành công
      throw error;
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Đang tải dữ liệu...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      bgcolor: '#fafafa'
    }}>
      {/* Main Content */}
      <Box sx={{ 
        display: 'flex', 
        flex: 1, 
        height: 'calc(100vh - 64px)', // Adjusted for header height
        overflow: 'hidden'
      }}>
        {/* Desktop Layout */}
        {!isMobile && (
          <>
            {/* Table Grid */}
            <Box sx={{ 
              flex: isTablet ? '0 0 50%' : '0 0 40%',
              borderRight: 1, 
              borderColor: 'divider',
              overflow: 'hidden'
            }}>
              <TableGrid 
                tables={tables}
                selectedTable={selectedTable}
                onTableSelect={handleTableSelect}
              />
            </Box>

            {/* Order Panel */}
            <Box sx={{ 
              flex: 1,
              overflow: 'hidden'
            }}>
              {selectedTable && (
                <OrderPanel
                  table={selectedTable}
                  onAddOrder={handleAddOrder}
                  onUpdateOrder={handleUpdateOrder}
                  onRemoveOrder={handleRemoveOrder}
                  onUpdateNote={handleUpdateNote}
                  onCompletePayment={handleCompletePayment}
                  pendingChangesCount={getPendingChangesCount(selectedTable.id)}
                  hasPendingChanges={hasPendingChanges(selectedTable.id)}
                  onSavePendingChanges={saveCurrentTableChanges}
                />
              )}
            </Box>
          </>
        )}

        {/* Mobile Layout */}
        {isMobile && selectedTable && (
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <OrderPanel
              table={selectedTable}
              onAddOrder={handleAddOrder}
              onUpdateOrder={handleUpdateOrder}
              onRemoveOrder={handleRemoveOrder}
              onUpdateNote={handleUpdateNote}
              onCompletePayment={handleCompletePayment}
              pendingChangesCount={getPendingChangesCount(selectedTable.id)}
              hasPendingChanges={hasPendingChanges(selectedTable.id)}
              onSavePendingChanges={saveCurrentTableChanges}
            />
            
            {/* Table Selection Drawer */}
            <Drawer
              anchor="left"
              open={mobileDrawerOpen}
              onClose={() => setMobileDrawerOpen(false)}
              sx={{
                '& .MuiDrawer-paper': {
                  width: 300,
                  backgroundColor: '#fafafa',
                },
              }}
            >
              <Box sx={{ p: 3, borderBottom: 1, borderColor: '#e0e0e0', backgroundColor: '#f7b510' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                  Chọn bàn
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <TableGrid 
                  tables={tables}
                  selectedTable={selectedTable}
                  onTableSelect={(table) => {
                    handleTableSelect(table);
                    setMobileDrawerOpen(false);
                  }}
                />
              </Box>
            </Drawer>

            {/* FAB for table selection */}
            <Fab
              color="primary"
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                backgroundColor: '#f7b510',
                '&:hover': {
                  backgroundColor: '#e65100',
                }
              }}
              onClick={() => setMobileDrawerOpen(true)}
            >
              <RestaurantIcon />
            </Fab>
          </Box>
        )}
      </Box>

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={async () => {}}
        onRegister={async () => {}}
      />
    </Box>
  );
};

export default Home;
