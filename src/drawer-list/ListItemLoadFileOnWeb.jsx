import React from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import LoadIcon from '@material-ui/icons/InsertDriveFile'
import {
  addIpcFileListenerOnce,
  openIpcFileDialog
} from './../utils/ipc-renderer'
import { PropTypes } from 'prop-types'

ListItemLoadFileOnWeb.propTypes = {
  iconColor: PropTypes.any,
  onFileChange: PropTypes.func
}

// At Electron App we use ipc for file loading from main process
export function ListItemLoadFileOnWeb({ onFileChange, iconColor }) {
  return (
    <List>
      <ListItem
        button
        onClick={() => {
          addIpcFileListenerOnce(onFileChange)
          openIpcFileDialog()
        }}
      >
        <ListItemIcon className={iconColor}>
          <LoadIcon />
        </ListItemIcon>
        <ListItemText>Select Incoming Folder</ListItemText>
      </ListItem>
    </List>
  )
}