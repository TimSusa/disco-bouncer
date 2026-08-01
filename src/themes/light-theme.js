// Light Theme — Accessibility-first design
// Matches dark theme interaction patterns for consistency
// WCAG AA: normal text ≥ 4.5:1, large text ≥ 3:1

export const lightTheme = {
  typography: {
    useNextVariants: true,
  },
  overrides: {
    // Global focus ring for keyboard accessibility
    MuiButtonBase: {
      root: {
        '&:focus-visible': {
          outline: '2px solid #00796B',
          outlineOffset: '2px',
        },
      },
    },
    MuiButton: {
      contained: {
        backgroundColor: '#E0E0E0',
        color: '#212121',
        '&:hover': {
          backgroundColor: '#D5D5D5',
        },
        '&:focus-visible': {
          outline: '2px solid #00796B',
          outlineOffset: '2px',
        },
      },
      outlined: {
        borderColor: '#BDBDBD',
        color: '#424242',
        '&:hover': {
          borderColor: '#00897B',
          backgroundColor: 'rgba(0, 137, 123, 0.08)',
        },
        '&:focus-visible': {
          outline: '2px solid #00796B',
          outlineOffset: '2px',
        },
      },
    },
    MuiListItem: {
      root: {
        justifyContent: 'center',
        '&:focus-visible': {
          outline: '2px solid #00796B',
          outlineOffset: '-2px',
        },
      },
      gutters: {
        paddingLeft: 2,
        paddingRight: 2,
      },
      button: {
        '&:hover': {
          backgroundColor: '#F5F5F5',
        },
        '&:focus-visible': {
          outline: '2px solid #00796B',
          outlineOffset: '-2px',
        },
      },
    },
    MuiIconButton: {
      root: {
        padding: 0,
        '&:focus-visible': {
          outline: '2px solid #00796B',
          outlineOffset: '2px',
        },
      },
    },
    MuiTableCell: {
      root: {
        padding: '4px 8px 4px 24px',
      },
    },
    MuiDrawer: {
      paper: {
        borderRight: '1px solid #E0E0E0',
      },
    },
    MuiAppBar: {
      colorDefault: {
        backgroundColor: '#FAFAFA',
        color: '#212121',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      },
    },
    MuiDivider: {
      root: {
        backgroundColor: '#E0E0E0',
      },
    },
    MuiCollapse: {
      root: {
        transitionDuration: '200ms',
      },
    },
    MuiTooltip: {
      tooltip: {
        backgroundColor: '#424242',
        color: '#FFFFFF',
        fontSize: '0.75rem',
      },
    },
  },
  palette: {
    type: 'light',
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',   // ~16:1 on #FAFAFA
      secondary: '#616161', // ~5.9:1 on #FAFAFA
      disabled: '#9E9E9E',  // ~2.8:1 — large text only
    },
    primary: {
      light: '#B2DFDB',
      main: '#00897B',       // Teal 600 — meets 4.5:1 on white
      dark: '#00695C',
      contrastText: '#FFFFFF',
    },
    secondary: {
      light: '#E0E0E0',
      main: '#757575',
      dark: '#424242',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#D32F2F',
      contrastText: '#FFFFFF',
    },
    appBar: {
      background: '#FAFAFA',
    },
    slider: {
      trackActive: '#00897B',
      trackNonactive: '#E0E0E0',
      border: '#BDBDBD',
      thump: '#757575',
      thumpBorder: '#00897B',
    },
    button: {
      background: '#FFFFFF',
      fontColor: '#424242',
    },
    surface: {
      level1: '#FFFFFF',
      level2: '#F5F5F5',
      level3: '#EEEEEE',
      level4: '#E0E0E0',
    },
  },
}
