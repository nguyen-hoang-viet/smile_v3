import React from 'react';
import {
  Card,
  CardActionArea,
  Typography,
  Box,
  Badge,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TableRestaurant,
  DeliveryDining,
  ShoppingBag,
  TakeoutDining,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Table } from '../types';

interface TableGridProps {
  tables: Table[];
  selectedTable: Table | null;
  onTableSelect: (table: Table) => void;
}

const TableGrid: React.FC<TableGridProps> = ({ 
  tables, 
  selectedTable, 
  onTableSelect 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const getTableIcon = (table: Table) => {
    const iconSize = isMobile ? 20 : 32;
    if (table.id === 15) return <ShoppingBag sx={{ fontSize: iconSize }} />;
    if (table.id === 16) return <DeliveryDining sx={{ fontSize: iconSize }} />;
    if (table.id === 17) return <TakeoutDining sx={{ fontSize: iconSize }} />;
    return <TableRestaurant sx={{ fontSize: iconSize }} />;
  };

  const getOrderCount = (table: Table) => {
    return table.orders.reduce((total, order) => total + order.quantity, 0);
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 2, height: '100%', overflow: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobile 
            ? 'repeat(3, 1fr)' 
            : isTablet 
              ? 'repeat(4, 1fr)' 
              : 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: isMobile ? 1 : 2,
        }}
      >
        {tables.map((table, index) => (
          <motion.div
            key={table.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.05,
              ease: "easeOut"
            }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Card
              sx={{
                height: isMobile ? 80 : 120,
                cursor: 'pointer',
                border: selectedTable?.id === table.id ? 3 : 2,
                borderColor: selectedTable?.id === table.id 
                  ? '#f7b510' 
                  : table.isOrdered 
                    ? '#f7b510' 
                    : '#e0e0e0',
                backgroundColor: selectedTable?.id === table.id
                  ? '#fff8e1'
                  : table.isOrdered
                    ? '#fffde7'
                    : table.id === 15 || table.id === 16 || table.id === 17
                      ? '#fce4ec'
                      : '#ffffff',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: (theme) => theme.shadows[8],
                },
              }}
            >
              <CardActionArea
                onClick={() => onTableSelect(table)}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: isMobile ? 0.5 : 1,
                }}
              >
                <Badge
                  badgeContent={table.isOrdered ? getOrderCount(table) : 0}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      right: -12,
                      top: -12,
                      backgroundColor: '#f71010ff',
                      color: 'white',
                      fontWeight: 600,
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: selectedTable?.id === table.id
                        ? '#f7b510'
                        : table.isOrdered
                          ? '#f7b510'
                          : table.id === 15 || table.id === 16 || table.id === 17
                            ? '#ad1457'
                            : '#757575',
                    }}
                  >
                    {getTableIcon(table)}
                  </Box>
                </Badge>
                
                <Typography
                  variant={isMobile ? "body2" : "h6"}
                  sx={{
                    fontWeight: 600,
                    fontSize: isMobile ? '0.8rem' : '1.1rem',
                    color: selectedTable?.id === table.id
                      ? '#f7b510'
                      : table.isOrdered
                        ? '#f7b510'
                        : table.id === 15 || table.id === 16 || table.id === 17
                          ? '#ad1457'
                          : '#424242',
                    textAlign: 'center',
                  }}
                >
                  {table.name}
                </Typography>

                {table.isOrdered && !isMobile && (
                  <Chip
                    label="Có đơn"
                    size="small"
                    sx={{ 
                      fontSize: '0.75rem',
                      backgroundColor: '#f7b510',
                      color: 'white',
                      fontWeight: 600,
                      height: 22,
                    }}
                  />
                )}
              </CardActionArea>
            </Card>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
};

export default TableGrid;
