import { Clip } from '../clip/Clip'
import React, { useEffect } from 'react'
//import { useTheme } from '@material-ui/styles'
//import { makeStyles } from '@material-ui/styles'
import { useSelector, useDispatch } from 'react-redux'
import Box from '@material-ui/core/Box'
import ListItem from '@material-ui/core/ListItem'
// import IconButton from '@material-ui/core/IconButton'
// import AddTrackIcon from '@material-ui/icons/PlaylistAdd'
import { initDrivers } from '../global-state/thunks/drivers'
import { actionsContent } from '../global-state'
import { FixedSizeList } from 'react-window'

export function Matrix() {
  const { setContent, 
    //addTrack
  } = actionsContent
  //const theme = useTheme()
  const dispatch = useDispatch()
  //const classes = makeStyles(styles.bind(this, theme))()
  const tracks = useSelector((state) => state.content.tracks || [])
  useEffect(() => {
    dispatch(initDrivers())
    //eslint-disable-next-line
  }, [])
  useEffect(() => {
    //dispatch(setContent({ content: content.content }))
  }, [setContent, dispatch])

  return (

    <Box
      sx={{ width: '100%', height: 800, maxWidth: 1024, bgcolor: 'background.paper' }}
    >
      <FixedSizeList
        height={800}
        // width={800}
        itemSize={200}
        itemCount={tracks.length}
        overscanCount={2}
        itemData={tracks}
      >
        {renderRow}
      </FixedSizeList>
    </Box>

  )
}

// function styles(theme) {
//   return {
//     root: {
//       width: '100%',
//       height: '100%',
//       zIndex: 1,
//       display: 'flex'
//     },
//     appFrame: {
//       position: 'relative',
//       display: 'flex',
//       width: '100%',
//       height: '100%'
//     },
//     appBar: {
//       zIndex: theme.zIndex.drawer + 1,
//       position: 'absolute',
//       right: 0,
//       left: 0,
//       margin: 0
//     },
//     navIconHide: {},
//     drawerHeader: {
//       ...theme.mixins.toolbar
//     },
//     drawerPaper: {
//       width: 250,
//       backgroundColor: theme.palette.background.default,
//       color: theme.palette.primary.contrastText
//     },
//     iconColor: {
//       color: theme.palette.primary.contrastText
//     },
//     content: {
//       backgroundColor: theme.palette.background.default,
//       width: '100%',
//       marginTop: theme.spacing(1)
//     }
//   }
// }

function renderRow(props) {
  const { index, style, data } = props
  const { id, data: dataTmp} = data[index]
  return (
    <ListItem style={style} key={index} component="div" disablePadding>
      <Clip id={id} data={dataTmp[0]}></Clip>
    </ListItem>
  )
}
