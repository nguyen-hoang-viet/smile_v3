import { useState, useCallback, useRef } from 'react';
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

export type PendingMap = Record<number, PendingChange[]>;

export const usePendingOrders = () => {
  const [pendingChanges, setPendingChanges] = useState<PendingMap>({});
  const currentTableRef = useRef<number | null>(null);

  const setCurrentTable = useCallback((tableId: number) => {
    currentTableRef.current = tableId;
  }, []);

  const addPendingChange = useCallback((change: PendingChange) => {
    setPendingChanges(prev => {
      const list = prev[change.tableId] ? [...prev[change.tableId]] : [];
      const ts = change.timestamp ?? Date.now();
      list.push({ ...change, timestamp: ts });
      return { ...prev, [change.tableId]: list };
    });
  }, []);


  const getPendingChangesCount = useCallback(
    (tableId: number) => (pendingChanges[tableId] || []).length,
    [pendingChanges]
  );

  const hasPendingChanges = useCallback(
    (tableId: number) => getPendingChangesCount(tableId) > 0,
    [getPendingChangesCount]
  );

  // Lưu mọi thay đổi của 1 bàn
  const savePendingChanges = useCallback(async (tableId: number) => {
    const changes = pendingChanges[tableId] || [];
    if (changes.length === 0) return { ok: true };

    console.log(`🔄 Saving ${changes.length} pending changes for table ${tableId}`, changes);

    // Gom theo dishId
    const groups = new Map<string, PendingChange[]>();
    for (const ch of changes) {
      const arr = groups.get(ch.dishId) || [];
      arr.push(ch);
      groups.set(ch.dishId, arr);
    }

    const tasks = Array.from(groups.entries()).map(async ([dishId, chs]) => {
      // Nếu có remove -> xóa và bỏ qua các thay đổi khác
      if (chs.some(c => c.type === 'remove')) {
        const d = DISHES.find(d => String(d.id) === String(dishId));
        const dishName = d?.name || dishId;
        await orderAPI.deleteOrder(tableId, dishName);
        return;
      }

      // Lấy quantity cuối cùng
      const qtyChange = chs
        .filter(c => c.type === 'add' || c.type === 'update')
        .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
        .pop();
      const qty = qtyChange?.quantity ?? qtyChange?.orderItem?.quantity ?? 1;

      // Lấy note cuối cùng
      const noteChange = chs
        .filter(c => c.type === 'note' || typeof c.orderItem?.note === 'string')
        .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
        .pop();
      const note = (noteChange?.note ?? noteChange?.orderItem?.note ?? '').trim();

      // Map dishId -> dishName cho BE route mới (body nhận dish_name)
      const dish = DISHES.find(d => String(d.id) === String(dishId));
      const dishName = dish?.name || dishId;

      // Upsert 1 lần: tạo mới nếu chưa có, nếu đã có thì cập nhật qty + note
      await orderAPI.createItem(tableId, dishName, qty, note);
    });

    const results = await Promise.allSettled(tasks);
    const failed = results.filter(r => r.status === 'rejected').length;

    if (failed === 0) {
      setPendingChanges(prev => {
        const clone = { ...prev };
        delete clone[tableId];
        return clone;
      });
      console.log(`✅ Saved all changes for table ${tableId}`);
      return { ok: true };
    }

    console.warn(`⚠️ ${failed} operation(s) failed for table ${tableId}`);
    return { ok: false, failed };
  }, [pendingChanges]);

  const saveAllPendingChanges = useCallback(async () => {
    const tableIds = Object.keys(pendingChanges).map(Number);
    return Promise.all(tableIds.map(id => savePendingChanges(id)));
  }, [pendingChanges, savePendingChanges]);

  const saveCurrentTableChanges = useCallback(async () => {
    if (currentTableRef.current == null) return { ok: true };
    return savePendingChanges(currentTableRef.current);
  }, [savePendingChanges]);

  return {
    pendingChanges,
    addPendingChange,
    savePendingChanges,
    saveAllPendingChanges,
    saveCurrentTableChanges,
    setCurrentTable,
    getPendingChangesCount,
    hasPendingChanges,
  };
};
