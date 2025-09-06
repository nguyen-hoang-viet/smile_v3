import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
        main: '#f7b510', // Vàng đậm 
        light: '#ffcc02',
        dark: '#e65100',
        contrastText: '#ffffff',
        },
        secondary: {
        main: '#e65100', // Vàng cam đậm hơn để phù hợp với primary
        light: '#ff9800',
        dark: '#bf360c',
        contrastText: '#ffffff',
        },
        success: {
        main: '#4caf50', // Xanh lá cho nút thanh toán
        light: '#81c784',
        dark: '#388e3c',
        contrastText: '#ffffff',
        },
        warning: {
        main: '#e65100', // Vàng cam đậm cho warning phù hợp với primary
        light: '#ff9800',
        dark: '#bf360c',
        },
        error: {
        main: '#d32f2f',
        light: '#ef5350',
        dark: '#c62828',
        },
        background: {
        default: '#fafafa',
        paper: '#ffffff',
        },
        text: {
        primary: '#212121',
        secondary: '#757575',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: 16, // Tăng base font size từ 14 lên 16
        h1: {
        fontSize: '3rem', // Tăng từ 2.5rem
        fontWeight: 600,
        },
        h2: {
        fontSize: '2.5rem', // Tăng từ 2rem
        fontWeight: 600,
        },
        h3: {
        fontSize: '2rem', // Tăng từ 1.75rem
        fontWeight: 500,
        },
        h4: {
        fontSize: '1.75rem', // Tăng từ 1.5rem
        fontWeight: 500,
        },
        h5: {
        fontSize: '1.5rem', // Tăng từ 1.25rem
        fontWeight: 500,
        },
        h6: {
        fontSize: '1.25rem', // Tăng từ 1rem
        fontWeight: 500,
        },
        body1: {
        fontSize: '1.1rem', // Tăng body text
        },
        body2: {
        fontSize: '1rem',
        },
        button: {
        fontSize: '1.1rem', // Tăng font size cho button
        fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
        styleOverrides: {
            root: {
            textTransform: 'none',
            borderRadius: 12,
            padding: '10px 24px',
            fontSize: '1rem',
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease-in-out',
            },
        },
        },
        MuiCard: {
        styleOverrides: {
            root: {
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            '&:hover': {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            },
            transition: 'all 0.2s ease-in-out',
            },
        },
        },
        MuiTextField: {
        styleOverrides: {
            root: {
            '& .MuiOutlinedInput-root': {
                borderRadius: 12,
            },
            },
        },
        },
        MuiPaper: {
        styleOverrides: {
            root: {
            borderRadius: 16,
            },
        },
        },
    },
});
