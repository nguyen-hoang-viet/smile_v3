import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Typography,
  Chip,
  InputAdornment,
} from '@mui/material';
import { Search, Restaurant } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Dish } from '../types';

interface DishSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onDishSelect: (dish: Dish) => void;
  dishes: Dish[];
}

const DishSearch: React.FC<DishSearchProps> = ({
  searchTerm,
  onSearchChange,
  onDishSelect,
  dishes
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = dishes.filter(dish => 
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.id.toLowerCase().startsWith(searchTerm.toLowerCase())
      ).slice(0, 8);
      
      setFilteredDishes(filtered);
      setShowSuggestions(true);
      setHighlightedIndex(-1); // Reset highlight khi danh sách thay đổi
    } else {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  }, [searchTerm, dishes]);

  // Auto scroll đến item được highlight
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const listItems = listRef.current.children;
      if (listItems[highlightedIndex]) {
        listItems[highlightedIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [highlightedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Đảm bảo không bao giờ truyền null hoặc undefined
    const value = e.target.value ?? '';
    onSearchChange(value);
  };

  const handleDishClick = (dish: Dish) => {
    onDishSelect(dish);
    onSearchChange('');
    setShowSuggestions(false);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredDishes.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredDishes.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredDishes.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredDishes.length) {
          handleDishClick(filteredDishes[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        ref={inputRef}
        fullWidth
        value={searchTerm || ''} // Đảm bảo không bao giờ hiển thị null
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleInputBlur}
        onFocus={() => searchTerm && searchTerm.length > 0 && setShowSuggestions(true)}
        placeholder="Nhập tên món hoặc mã món..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />
      
      <AnimatePresence>
        {showSuggestions && filteredDishes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Paper
              elevation={8}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1000,
                mt: 1,
                borderRadius: 2,
                overflow: 'hidden',
                maxHeight: 300,
                overflowY: 'auto',
              }}
            >
              <List ref={listRef} sx={{ p: 0 }}>
                {filteredDishes.map((dish, index) => (
                  <motion.div
                    key={dish.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <ListItem sx={{ p: 0 }}>
                      <ListItemButton
                        onClick={() => handleDishClick(dish)}
                        sx={{
                          py: 1.5,
                          px: 2,
                          backgroundColor: highlightedIndex === index ? '#e3f2fd' : 'transparent',
                          border: highlightedIndex === index ? '2px solid #f7b510' : '2px solid transparent',
                          borderRadius: 1,
                          m: 0.5,
                          '&:hover': {
                            backgroundColor: highlightedIndex === index ? '#bbdefb' : 'primary.50',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                          {highlightedIndex === index ? (
                            <Box sx={{ 
                              backgroundColor: 'primary.main', 
                              color: 'white', 
                              borderRadius: '50%', 
                              width: 20, 
                              height: 20, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: '12px'
                            }}>
                              ▶
                            </Box>
                          ) : (
                            <Restaurant color="action" fontSize="small" />
                          )}
                        </Box>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: highlightedIndex === index ? 700 : 500,
                                  color: highlightedIndex === index ? 'primary.main' : 'inherit'
                                }}
                              >
                                {dish.name}
                              </Typography>
                              <Chip
                                label={dish.id}
                                size="small"
                                variant={highlightedIndex === index ? 'filled' : 'outlined'}
                                color={highlightedIndex === index ? 'primary' : 'default'}
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography 
                              variant="body2" 
                              color="primary" 
                              sx={{ 
                                fontWeight: highlightedIndex === index ? 700 : 600,
                              }}
                            >
                              {formatCurrency(dish.price)}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  </motion.div>
                ))}
                {filteredDishes.length > 0 && (
                  <Box sx={{ 
                    p: 1, 
                    textAlign: 'center', 
                    backgroundColor: '#f5f5f5',
                    borderTop: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      ⬆️⬇️ Điều hướng • Enter Chọn • Esc Đóng
                    </Typography>
                  </Box>
                )}
              </List>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default DishSearch;
