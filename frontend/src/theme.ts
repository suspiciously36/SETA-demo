    // src/theme.ts
    import { createTheme, responsiveFontSizes } from '@mui/material/styles';

    // Create a base theme instance
    let theme = createTheme({
      typography: {
        fontFamily: [
          'Outfit', // Your desired font
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
        // You can also customize specific typography variants if needed
        h1: {
          fontFamily: 'Outfit, sans-serif', // Example: specific font for h1
          fontWeight: 700, // Example weight
        },
        h2: {
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600,
        },
        button: {
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 500, // Example for button text
          textTransform: 'none', // Often desired to match designs
        }
        // ... other variants
      },
      // You can also define your palette, components overrides, etc. here
      palette: {
        primary: {
          main: '#673ab7', // Example primary color from your login page
        },
        secondary: {
          main: '#5e35b1', // Example secondary color
        },
        // ... other palette colors
      },
      components: {
        // Example: Default props for MuiButton
        MuiButton: {
          defaultProps: {
            disableElevation: true, // Example global button style
          },
          styleOverrides: {
            root: {
              borderRadius: '8px', // Example global button border radius
            }
          }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    // borderRadius: '12px', // Example global paper border radius
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px', // Example global textfield border radius
                    }
                }
            }
        }
        // ... other component overrides
      }
    });

    // Make typography responsive
    theme = responsiveFontSizes(theme);

    export default theme;
    