import { Clip } from '../Clip'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Box from '@material-ui/core/Box'
import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import { initDrivers } from '../../store/thunks/drivers'
import { FixedSizeList } from 'react-window'

export function ClipList() {
  const dispatch = useDispatch()
  const tracks = useSelector((state) => state.content.tracks || [])
  const containerRef = useRef(null)
  const [containerHeight, setContainerHeight] = useState(600)

  useEffect(() => {
    dispatch(initDrivers())
  }, [])

  useEffect(() => {
    function updateHeight() {
      if (containerRef.current) {
        const h = containerRef.current.parentElement.clientHeight
        if (h > 0) setContainerHeight(h)
      }
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  if (tracks.length === 0) {
    return (
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant='body1' color='textSecondary'>
          Select a folder from the left panel to load tracks
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: 'background.paper'
      }}
    >
      <FixedSizeList
        height={containerHeight}
        itemSize={220}
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
