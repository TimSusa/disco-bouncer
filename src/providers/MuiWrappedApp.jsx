import CssBaseline from '@material-ui/core/CssBaseline'
import { createMuiTheme } from '@material-ui/core'

import { ThemeProvider } from '@material-ui/styles'
import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import 'typeface-roboto'
import { darkTheme } from '../themes/dark-theme'
import { lightTheme } from '../themes/light-theme'
import { App } from '../App'

export default MuiWrappedApp

MuiWrappedApp.propTypes = {
  children: PropTypes.any,
  isChangedTheme: PropTypes.bool
}

MuiWrappedApp.displayName = 'MuiWrappedApp'

function MuiWrappedApp(props) {
  const { isChangedTheme } = useSelector((state) => state.viewSettings)
  const { children } = props
  const baseTheme = isChangedTheme ? darkTheme : lightTheme

  const theme = createMuiTheme({
    ...baseTheme,
    overrides: {
      ...baseTheme.overrides,
      // Global accessibility styles via CssBaseline
      MuiCssBaseline: {
        '@global': {
          // Remove default outline, replace with focus-visible
          '*:focus': {
            outline: 'none',
          },
          '*:focus-visible': {
            outline: '2px solid',
            outlineColor: isChangedTheme ? '#64DFDF' : '#00796B',
            outlineOffset: '2px',
          },
          // Ensure scrollbars are visible in dark mode
          '::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '::-webkit-scrollbar-track': {
            backgroundColor: isChangedTheme ? '#1E1E1E' : '#F5F5F5',
          },
          '::-webkit-scrollbar-thumb': {
            backgroundColor: isChangedTheme ? '#5C5C5C' : '#BDBDBD',
            borderRadius: '4px',
          },
          '::-webkit-scrollbar-thumb:hover': {
            backgroundColor: isChangedTheme ? '#808080' : '#9E9E9E',
          },
          // Respect prefers-reduced-motion
          '@media (prefers-reduced-motion: reduce)': {
            '*': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
            },
          },
        },
      },
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children ? children : <App {...props} />}
    </ThemeProvider>
  )
}
