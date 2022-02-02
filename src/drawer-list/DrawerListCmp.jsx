import React, {useEffect} from 'react'
import Divider from '@material-ui/core/Divider'

import { ListItemLoadFileOnWeb } from './ListItemLoadFileOnWeb'
import { PropTypes } from 'prop-types'
import {  useDispatch } from 'react-redux'
import { actionsContent } from '../global-state'
const version = process.env.REACT_APP_VERSION || 'dev'

export const DrawerList = DrawerListCmp

function DrawerListCmp(props) {
  const dispatch = useDispatch()
  const { setContent, stopAll } = actionsContent
  const { classes, onFileChange } = props

  useEffect(()=>{
    dispatch(stopAll())
  }, [stopAll, dispatch])

  return (
    <React.Fragment>
      <div className={classes.drawerHeader} />
      <Divider />
      <ListItemLoadFileOnWeb
        onFileChange={handleFileChange}
        iconColor={classes.iconColor}
      />
      <div>{version}</div>
    </React.Fragment>
  )
  async function handleFileChange(content) {
    dispatch(setContent({ content: content.content.tracks }))
    // trigger close
    onFileChange()
  }
}

DrawerListCmp.propTypes = {
  classes: PropTypes.shape({
    drawerHeader: PropTypes.any,
    iconColor: PropTypes.any
  }),
  handleResetSliders: PropTypes.any,
  onClose: PropTypes.func,
  onFileChange: PropTypes.any,
}
