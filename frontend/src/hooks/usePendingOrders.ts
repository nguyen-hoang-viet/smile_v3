import { useState, useCallback, useRef, useEffect } from 'react';
import { OrderItem } from '../types';
import { orderAPI } from '../services/api';
import { DISHES } from '../data/dishes';

export interface PendingChange {
  type: 'add' | 'update' | 'remove' | 'note';
  tableId: number;
  dishId: string;
  orderItem?: OrderItem;
  quantity?: number;
  note?: string;
  timestamp: number;
}

export interface PendingOrdersState {
  [tableId: number]: {
    [dishId: string]: PendingChange;
  };
}

export const usePendingOrders = () => {
  const [pendingChanges, setPendingChanges] = useState<PendingOrdersState>({});
  const currentTableRef = useRef<number | null>(null);

  // Helper function to convert dishId to dishName
  const getDishNameById = (dishId: string): string => {
    const dish = DISHES.find(d => d.id === dishId);
    return dish ? dish.name : dishId; // Fallback to dishId if not found
  };

  // Lưu tất cả pending changes của một bàn
  const savePendingChanges = useCallback(async (tableId: number) => {
    const tablePendingChanges = pendingChanges[tableId];
    if (!tablePendingChanges || Object.keys(tablePendingChanges).length === 0) {
      return;
    }

    try {
      // Group changes by type để tối ưu request
      const changes = Object.values(tablePendingChanges);
      console.log(`🔄 Saving ${changes.length} pending changes for table ${tableId}:`, changes);

      // Sắp xếp theo thứ tự: remove -> add -> note
      // Không xử lý update riêng vì đã merge vào add hoặc backend tự handle
      const removeChanges = changes.filter(c => c.type === 'remove');
      const addChanges = changes.filter(c => c.type === 'add');
      const updateChanges = changes.filter(c => c.type === 'update');
      const noteChanges = changes.filter(c => c.type === 'note');

      // Xử lý từng loại thay đổi theo thứ tự
      const allPromises: Promise<any>[] = [];

      // 1. Remove orders first
      if (removeChanges.length > 0) {
        removeChanges.forEach(change => {
          const dishName = getDishNameById(change.dishId);
          console.log(`🗑️ Removing: Table ${tableId}, Dish: ${dishName}`);
          allPromises.push(
            orderAPI.deleteOrder(tableId, dishName).catch(error => {
              console.error(`Failed to remove ${dishName}:`, error);
              // Don't throw, continue with other operations
              return null;
            })
          );
        });
      }

      // 2. Add new orders (backend sẽ tự tạo mới hoặc update quantity nếu đã tồn tại)
      if (addChanges.length > 0) {
        addChanges.forEach(change => {
          if (change.orderItem) {
            const now = new Date();
            console.log(`➕ Adding: Table ${tableId}, Dish: ${change.orderItem.dish.name}, Qty: ${change.orderItem.quantity}`);
            allPromises.push(
              orderAPI.addOrder({
                table_id: tableId,
                dish_name: change.orderItem.dish.name,
                quantity: change.orderItem.quantity,
                date: now.toISOString().split('T')[0],
                time: now.toTimeString().split(' ')[0],
                note: change.orderItem.note || ''
              }).catch(error => {
                console.error(`Failed to add ${change.orderItem?.dish.name}:`, error);
                return null;
              })
            );
          }
        });
      }

      // 3. Handle update operations (cho những món chưa có add pending)
      if (updateChanges.length > 0) {
        updateChanges.forEach(change => {
          // Chỉ xử lý update nếu không có add change cho cùng dish
          const hasAddChange = addChanges.some(addChange => addChange.dishId === change.dishId);
          if (!hasAddChange && change.quantity !== undefined) {
            const dishName = getDishNameById(change.dishId);
            console.log(`🔢 Updating quantity: Table ${tableId}, Dish: ${dishName}, Qty: ${change.quantity}`);
            allPromises.push(
              orderAPI.updateOrder(tableId, dishName, change.quantity).catch(error => {
                console.error(`Failed to update quantity for ${dishName}:`, error);
                return null;
              })
            );
          }
        });
      }

      // 4. Update notes
      if (noteChanges.length > 0) {
        noteChanges.forEach(change => {
          if (change.note !== undefined) {
            const dishName = getDishNameById(change.dishId);
            console.log(`📝 Updating note: Table ${tableId}, Dish: ${dishName}, Note: ${change.note}`);
            allPromises.push(
              orderAPI.updateNote(tableId, dishName, change.note).catch(error => {
                console.error(`Failed to update note for ${dishName}:`, error);
                return null;
              })
            );
          }
        });
      }

      // Execute all promises and wait for completion
      const results = await Promise.allSettled(allPromises);
      
      // Count successful operations
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value !== null).length;
      const failedCount = results.length - successCount;

      if (failedCount > 0) {
        console.warn(`⚠️ ${failedCount} operations failed out of ${results.length} for table ${tableId}`);
      }

      // Only clear pending changes if at least some operations succeeded
      if (successCount > 0) {
        setPendingChanges(prev => ({
          ...prev,
          [tableId]: {}
        }));
        console.log(`✅ Saved ${successCount} changes for table ${tableId}`);
      } else {
        console.error(`❌ All operations failed for table ${tableId}, keeping pending changes`);
        throw new Error(`All operations failed for table ${tableId}`);
      }

    } catch (error) {
      console.error('❌ Error saving pending changes:', error);
      throw error; // Re-throw để caller có thể xử lý
    }
  }, [pendingChanges]);

  // Thêm hoặc cập nhật pending change - CHỈ LƯU TẠM, KHÔNG AUTO-SAVE
  const addPendingChange = useCallback((change: Omit<PendingChange, 'timestamp'>) => {
    const pendingChange: PendingChange = {
      ...change,
      timestamp: Date.now()
    };

    setPendingChanges(prev => {
      const newState = {
        ...prev,
        [change.tableId]: {
          ...prev[change.tableId],
          [change.dishId]: pendingChange
        }
      };
      
      console.log(`📝 Added pending change for table ${change.tableId}, dish ${change.dishId}, type: ${change.type}`);
      console.log(`📊 Total pending changes for table ${change.tableId}:`, Object.keys(newState[change.tableId]).length);
      
      return newState;
    });
  }, []);

  // Lưu tất cả changes khi chuyển bàn
  const saveAllPendingChanges = useCallback(async () => {
    const tableIds = Object.keys(pendingChanges).map(Number);
    const savePromises = tableIds.map(tableId => savePendingChanges(tableId));
    
    try {
      await Promise.all(savePromises);
    } catch (error) {
      console.error('Error saving all pending changes:', error);
    }
  }, [pendingChanges, savePendingChanges]);

  // Theo dõi thay đổi bàn hiện tại
  const setCurrentTable = useCallback((tableId: number | null) => {
    const previousTable = currentTableRef.current;
    console.log(`🔄 setCurrentTable: ${previousTable} -> ${tableId}`);
    
    currentTableRef.current = tableId;

    // Nếu chuyển từ bàn này sang bàn khác, lưu pending changes của bàn cũ
    if (previousTable !== null && previousTable !== tableId) {
      console.log(`💾 Auto-saving pending changes for previous table ${previousTable}`);
      savePendingChanges(previousTable);
    }
  }, [savePendingChanges]);

  // Lưu tất cả khi trước khi page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveAllPendingChanges();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveAllPendingChanges]);

  // Lưu thủ công cho bàn hiện tại
  const saveCurrentTableChanges = useCallback(() => {
    if (currentTableRef.current !== null) {
      savePendingChanges(currentTableRef.current);
    }
  }, [savePendingChanges]);

  // Get pending changes count for a table
  const getPendingChangesCount = useCallback((tableId: number) => {
    const count = Object.keys(pendingChanges[tableId] || {}).length;
    console.log(`📊 getPendingChangesCount for table ${tableId}: ${count}`);
    return count;
  }, [pendingChanges]);

  // Check if there are any pending changes
  const hasPendingChanges = useCallback((tableId?: number) => {
    if (tableId) {
      return getPendingChangesCount(tableId) > 0;
    }
    return Object.values(pendingChanges).some(tableChanges => 
      Object.keys(tableChanges).length > 0
    );
  }, [pendingChanges, getPendingChangesCount]);

  return {
    pendingChanges,
    addPendingChange,
    savePendingChanges,
    saveAllPendingChanges,
    saveCurrentTableChanges,
    setCurrentTable,
    getPendingChangesCount,
    hasPendingChanges
  };
};
