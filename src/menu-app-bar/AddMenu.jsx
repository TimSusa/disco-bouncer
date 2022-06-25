import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import AddIcon from '@material-ui/icons/Add'
import { Tooltip, IconButton } from '@material-ui/core'
import { removeFiles } from '../utils/ipc-renderer.js'
import { actionsContent } from '../global-state'

export default AddMenu

function AddMenu() {
  const dispatch = useDispatch()
  const { removeMarkedTracks } = actionsContent
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const { tracksToRemove } = useSelector((state) => state.content)
  return (
    <React.Fragment>
      <Tooltip title='Add Elements'>
        <IconButton
          aria-owns={anchorEl ? 'menu-appbar-add' : null}
          aria-haspopup='true'
          onClick={handleMenu}
          color='inherit'
        >
          <AddIcon />
        </IconButton>
      </Tooltip>

      <Menu
        id='menu-appbar-add'
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleRemoveMarkedTracks}>
          Remove Marked Tracks
        </MenuItem>
      </Menu>
    </React.Fragment>
  )
  function handleMenu(event) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  function handleRemoveMarkedTracks() {
    removeFiles(tracksToRemove)
    dispatch(removeMarkedTracks({ tracksToRemove }))
    setAnchorEl(null)
  }
}
