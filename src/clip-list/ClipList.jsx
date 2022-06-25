import { Clip } from '../clip/Clip'
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Box from '@material-ui/core/Box'
import ListItem from '@material-ui/core/ListItem'
import { initDrivers } from '../global-state/thunks/drivers'
// import { actionsContent } from '../global-state'
import { FixedSizeList } from 'react-window'

export function ClipList() {
  //const { setContent } = actionsContent
  const dispatch = useDispatch()
  const tracks = useSelector((state) => state.content.tracks || [])
  useEffect(() => {
    dispatch(initDrivers())
  }, [])
  //useEffect(() => {}, [setContent, dispatch])
  return (
    <Box
      sx={{
        width: '100%',
        height: 800,
        // maxWidth: 1024,
        bgcolor: 'background.paper'
      }}
    >
      <FixedSizeList
        height={800}
        itemSize={200}
        itemCount={tracks.length}
        overscanCount={5}
        itemData={tracks}
      >
        {renderRow}
      </FixedSizeList>
    </Box>
  )
}

function renderRow(props) {
  const { index, style } = props

  return (
    <ListItem style={style} key={index} component='div'>
      <Clip index={index}></Clip>
    </ListItem>
  )
}
