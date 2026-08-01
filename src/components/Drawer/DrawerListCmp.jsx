import React, { useEffect, useState } from 'react'
import Divider from '@material-ui/core/Divider'
import { FileTree } from '../FileTree'
import { PropTypes } from 'prop-types'
import { useDispatch } from 'react-redux'
import { actionsContent } from '../../store'
import { addIpcFolderDialogListener } from '../../utils/ipc-renderer'
const version = process.env.REACT_APP_VERSION || 'dev'

export default DrawerListCmp
export { DrawerListCmp }

function DrawerListCmp(props) {
  const dispatch = useDispatch()
  const { stopAll } = actionsContent
  const { classes } = props
  const [treeKey, setTreeKey] = useState(0)

  useEffect(() => {
    dispatch(stopAll())
  }, [stopAll, dispatch])

  // Listen for folder dialog replies from menu bar
  useEffect(() => {
    const cleanup = addIpcFolderDialogListener((result) => {
      if (result && result.tree) {
        setTreeKey((k) => k + 1)
      }
    })
    return cleanup
  }, [])

  function handleFileSelect(node) {
    if (node && node.isAudio) {
      dispatch(actionsContent.setContent({ content: [node.path] }))
    }
  }

  function handleFolderSelect(audioPaths) {
    if (audioPaths && audioPaths.length > 0) {
      dispatch(actionsContent.setContent({ content: audioPaths }))
    }
  }

  return (
    <React.Fragment>
      <div className={classes.drawerHeader} />
      <Divider />
      <FileTree
        key={treeKey}
        onSelectFile={handleFileSelect}
        onSelectFolder={handleFolderSelect}
      />
      <Divider />
      <div style={{ padding: '8px 16px', fontSize: 12, opacity: 0.5 }}>
        v{version}
      </div>
    </React.Fragment>
  )
}

DrawerListCmp.propTypes = {
  classes: PropTypes.shape({
    drawerHeader: PropTypes.any,
    iconColor: PropTypes.any
  }),
  onClose: PropTypes.func
}
