import React from 'react';
import { Box, Chip, Typography, Tooltip } from '@mui/material';
import { 
  Save as SaveIcon,
  Sync as SyncIcon, 
  CheckCircle as CheckCircleIcon 
} from '@mui/icons-material';

interface PendingIndicatorProps {
  pendingCount: number;
  tableName: string;
  onSave?: () => void;
  isCompact?: boolean;
}

export const PendingIndicator: React.FC<PendingIndicatorProps> = ({
  pendingCount,
  tableName,
  onSave,
  isCompact = false
}) => {
  if (pendingCount === 0) {
    return (
      <Tooltip title="Tất cả thay đổi đã được lưu">
        <Chip
          icon={<CheckCircleIcon />}
          label={isCompact ? "Đã lưu" : "Đã đồng bộ"}
          color="success"
          variant="outlined"
          size="small"
          sx={{ fontSize: '0.75rem' }}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip title={`${pendingCount} thay đổi chưa lưu cho ${tableName}. Click để lưu ngay.`}>
      <Chip
        icon={<SaveIcon />}
        label={isCompact ? `${pendingCount}` : `${pendingCount} chưa lưu`}
        color="warning"
        variant="filled"
        size="small"
        onClick={onSave}
        sx={{ 
          cursor: onSave ? 'pointer' : 'default',
          fontSize: '0.75rem',
          fontWeight: 600,
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': { opacity: 1 },
            '50%': { opacity: 0.7 },
            '100%': { opacity: 1 }
          },
          '&:hover': onSave ? { 
            opacity: 0.8,
            transform: 'scale(1.05)'
          } : {}
        }}
      />
    </Tooltip>
  );
};

interface SyncStatusProps {
  pendingChangesCount: number;
  lastSyncTime?: Date;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  pendingChangesCount,
  lastSyncTime
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      fontSize: '0.75rem',
      color: 'text.secondary'
    }}>
      <SyncIcon sx={{ fontSize: 16 }} />
      <Typography variant="caption">
        {pendingChangesCount > 0 
          ? `${pendingChangesCount} thay đổi đang chờ lưu`
          : lastSyncTime 
            ? `Đồng bộ lần cuối: ${formatTime(lastSyncTime)}`
            : 'Chưa có thay đổi'
        }
      </Typography>
    </Box>
  );
};
