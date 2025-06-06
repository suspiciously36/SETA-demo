    import { createTheme, responsiveFontSizes } from '@mui/material/styles';

    let theme = createTheme({
      typography: {
        fontFamily: [
          'Outfit',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ].join(','),
        h1: {
          fontFamily: 'Outfit, sans-serif', 
          fontWeight: 700, 
        },
        h2: {
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600,
        },
        button: {
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 500,
          textTransform: 'none', 
        }
      },
      palette: {
        primary: {
          main: "rgba(48, 112, 196, 0.95)",
        },
        secondary: {
          main: '#5e35b1', 
        },
      },
      components: {
        MuiButton: {
          defaultProps: {
            disableElevation: true, 
          },
          styleOverrides: {
            root: {
              borderRadius: '8px', 
            }
          }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px', 
                    }
                }
            }
        }
      }
    });

    theme = responsiveFontSizes(theme);

    export default theme;
    