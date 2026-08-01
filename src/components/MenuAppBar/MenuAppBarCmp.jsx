import React from 'react'
import { makeStyles, useTheme } from '@material-ui/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import Brightness4Icon from '@material-ui/icons/Brightness4'
import Brightness7Icon from '@material-ui/icons/Brightness7'
import { useDispatch, useSelector } from 'react-redux'
import { actionsViewSettings } from '../../store'
import AddMenu from './AddMenu'

function MenuAppBarCmp() {
  const theme = useTheme()
  const classes = makeStyles(styles.bind(this, theme))()
  const dispatch = useDispatch()
  const { isChangedTheme } = useSelector((state) => state.viewSettings)
  const { changeTheme } = actionsViewSettings

  return (
    <div className={classes.root}>
      <AppBar className={classes.appBar} position='fixed'>
        <Toolbar>
          <Typography variant='h6' className={classes.typoColorStyle}>
            Disco Bouncer
          </Typography>
          <div
            style={{
              display: 'flex',
              width: '38%',
              justifyContent: 'space-around',
              alignItems: 'center'
            }}
          >
            <AddMenu />
            <Tooltip title={isChangedTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton
                onClick={() => dispatch(changeTheme())}
                color='inherit'
                aria-label='toggle theme'
              >
                {isChangedTheme ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  )
}

function styles(theme) {
  return {
    root: {
      flexGrow: 1
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      background: theme.palette.appBar.background,
      fontWeight: 600
    },
    typoColorStyle: {
      color: theme.palette.text.primary,
      fontWeight: 600,
      flex: 1
    }
  }
}

export default MenuAppBarCmp
