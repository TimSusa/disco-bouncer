// Dark Theme — Accessibility-first design
// Follows WCAG AA: normal text ≥ 4.5:1, large text ≥ 3:1
// Avoids pure #000000 (causes halation for astigmatism)
// Uses tonal elevation instead of drop shadows

export const darkTheme = {
	typography: {
		useNextVariants: true,
	},
	overrides: {
		// Global focus ring for keyboard accessibility
		MuiButtonBase: {
			root: {
				"&:focus-visible": {
					outline: "2px solid #64DFDF",
					outlineOffset: "2px",
				},
			},
		},
		MuiButton: {
			contained: {
				backgroundColor: "#383838",
				color: "#E0E0E0",
				"&:hover": {
					backgroundColor: "#4A4A4A",
				},
				"&:focus-visible": {
					outline: "2px solid #64DFDF",
					outlineOffset: "2px",
				},
			},
			outlined: {
				borderColor: "#5C5C5C",
				color: "#E0E0E0",
				"&:hover": {
					borderColor: "#80CBC4",
					backgroundColor: "rgba(100, 223, 223, 0.08)",
				},
				"&:focus-visible": {
					outline: "2px solid #64DFDF",
					outlineOffset: "2px",
				},
			},
		},
		MuiListItem: {
			root: {
				"&:focus-visible": {
					outline: "2px solid #64DFDF",
					outlineOffset: "-2px",
				},
			},
			button: {
				"&:hover": {
					backgroundColor: "#2D2D2D",
				},
				"&:focus-visible": {
					outline: "2px solid #64DFDF",
					outlineOffset: "-2px",
				},
			},
		},
		MuiIconButton: {
			root: {
				"&:focus-visible": {
					outline: "2px solid #64DFDF",
					outlineOffset: "2px",
				},
			},
		},
		MuiTableCell: {
			root: {
				padding: "4px 8px 4px 24px",
			},
		},
		// Drawer paper styling
		MuiDrawer: {
			paper: {
				borderRight: "1px solid #383838",
			},
		},
		// AppBar styling
		MuiAppBar: {
			colorDefault: {
				backgroundColor: "#1E1E1E",
				color: "#E0E0E0",
				borderBottom: "1px solid #383838",
			},
		},
		// Divider styling
		MuiDivider: {
			root: {
				backgroundColor: "#383838",
			},
		},
		// Collapse / tree expand animation
		MuiCollapse: {
			root: {
				transitionDuration: "200ms",
			},
		},
		// Tooltip
		MuiTooltip: {
			tooltip: {
				backgroundColor: "#383838",
				color: "#E0E0E0",
				fontSize: "0.75rem",
				border: "1px solid #5C5C5C",
			},
		},
	},
	palette: {
		type: "dark",
		// Surface elevation system (tonal shifts, not shadows)
		background: {
			default: "#121212", // Base surface — not pure black
			paper: "#1E1E1E", // Card/drawer surface — slightly lighter
		},
		// Text colors — all meet 4.5:1+ on #121212
		text: {
			primary: "#E0E0E0", // ~13.5:1 on #121212
			secondary: "#A0A0A0", // ~6.8:1 on #121212
			disabled: "#6C6C6C", // ~3.5:1 — large text only
		},
		primary: {
			light: "#B2DFDB",
			main: "#80CBC4", // Desaturated teal — less halation than #18A49D
			dark: "#4DB6AC",
			contrastText: "#121212", // ~10:1 on teal
		},
		secondary: {
			light: "#E0E0E0",
			main: "#A0A0A0",
			dark: "#6C6C6C",
			contrastText: "#121212",
		},
		error: {
			main: "#CF6679", // Desaturated red — accessible on dark
			contrastText: "#121212",
		},
		appBar: {
			background: "#1E1E1E", // Tonal shift from base
		},
		// Custom slider colors
		slider: {
			trackActive: "#80CBC4",
			trackNonactive: "#383838",
			border: "#5C5C5C",
			thump: "#E0E0E0",
			thumpBorder: "#80CBC4",
		},
		button: {
			background: "#383838",
			fontColor: "#E0E0E0",
		},
		// Elevation surfaces for cards, modals, etc.
		surface: {
			level1: "#1E1E1E", // Cards, sheets
			level2: "#232323", // Raised elements
			level3: "#282828", // Floating elements
			level4: "#2D2D2D", // Highest elevation
		},
	},
};
