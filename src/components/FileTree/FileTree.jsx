import React, { useState, useEffect, useCallback, useRef } from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Collapse from '@material-ui/core/Collapse'
import FolderIcon from '@material-ui/icons/Folder'
import FolderOpenIcon from '@material-ui/icons/FolderOpen'
import AudioFileIcon from '@material-ui/icons/MusicNote'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import Snackbar from '@material-ui/core/Snackbar'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import HomeIcon from '@material-ui/icons/Home'
import { makeStyles, useTheme } from '@material-ui/styles'
import { PropTypes } from 'prop-types'
import { useConnectivity } from '../../hooks/useConnectivity'
import {
  getPersistedFolder,
  addIpcPersistedFolderListenerOnce,
  getFileTree,
  addIpcFileTreeListenerOnce,
  setPersistedFolder
} from '../../utils/ipc-renderer'

const useStyles = makeStyles((theme) => ({
  treeRoot: {
    width: '100%',
    backgroundColor: theme.palette.background.paper
  },
  nested: {
    paddingLeft: theme.spacing(3)
  },
  goUpBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.default
  },
  goUpButton: {
    padding: 6,
    color: theme.palette.text.secondary
  },
  currentPath: {
    fontSize: 11,
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginLeft: 4,
    flex: 1
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    marginLeft: 8,
    flexShrink: 0
  },
  connectionOnline: {
    backgroundColor: '#4CAF50'
  },
  connectionOffline: {
    backgroundColor: '#f44336'
  },
  snackbarContent: {
    backgroundColor: theme.palette.type === 'dark' ? '#383838' : '#323232',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: 4
  }
}))

function getParentPath(filePath) {
  if (!filePath) return null
  const parts = filePath.split('/')
  if (parts.length <= 1) return null
  parts.pop()
  return parts.join('/') || '/'
}

export function FileTree({ onSelectFile, onSelectFolder }) {
  const classes = useStyles()
  const theme = useTheme()
  const [treeData, setTreeData] = useState(null)
  const [expandedNodes, setExpandedNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPath, setCurrentPath] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '' })
  
  // Store home path for fallback
  const homePathRef = useRef(null)
  const lastValidPathRef = useRef(null)

  // Show snackbar notification
  const showNotification = useCallback((message) => {
    setSnackbar({ open: true, message })
  }, [])

  // Handle disconnect - show home tree
  const handleDisconnect = useCallback(() => {
    showNotification('⚡ Verbindung verloren - Zeige Home-Ordner')
    
    // Navigate to home path (persisted folder or Downloads fallback)
    if (homePathRef.current) {
      loadFolder(homePathRef.current)
    } else {
      // Fallback to user's home directory
      const homePath = process.env.HOME || process.env.USERPROFILE || '/'
      loadFolder(homePath)
    }
  }, [showNotification])

  // Handle reconnect - try to restore last valid path
  const handleReconnect = useCallback(() => {
    showNotification('✓ Verbindung wiederhergestellt')
    
    // Try to restore last valid path
    const pathToRestore = lastValidPathRef.current || homePathRef.current
    if (pathToRestore) {
      loadFolder(pathToRestore)
    }
  }, [showNotification])

  // Use connectivity hook
  const { isOnline } = useConnectivity({
    onDisconnect: handleDisconnect,
    onReconnect: handleReconnect
  })

  useEffect(() => {
    loadInitialFolder()
  }, [])

  function loadInitialFolder() {
    setLoading(true)
    try {
      getPersistedFolder()
      addIpcPersistedFolderListenerOnce((folderPath) => {
        if (folderPath) {
          homePathRef.current = folderPath
          loadFolder(folderPath)
        } else {
          // No persisted folder - use home directory
          const homePath = process.env.HOME || process.env.USERPROFILE || '/'
          homePathRef.current = homePath
          loadFolder(homePath)
        }
      })
    } catch (e) {
      console.error('Failed to load initial folder:', e)
      setLoading(false)
      // Fallback to home directory on error
      const homePath = process.env.HOME || process.env.USERPROFILE || '/'
      homePathRef.current = homePath
      loadFolder(homePath)
    }
  }

  function loadFolder(folderPath) {
    setLoading(true)
    setCurrentPath(folderPath)
    lastValidPathRef.current = folderPath
    setPersistedFolder(folderPath)
    getFileTree(folderPath)
    addIpcFileTreeListenerOnce((tree) => {
      if (tree) {
        setTreeData(tree)
        setExpandedNodes([tree.id])
      } else {
        // Empty tree or error - try parent directory
        const parentPath = getParentPath(folderPath)
        if (parentPath && parentPath !== folderPath) {
          loadFolder(parentPath)
          return
        }
        setTreeData(null)
      }
      setLoading(false)
    })
  }

  function handleGoUp() {
    const parentPath = getParentPath(currentPath)
    if (parentPath) {
      loadFolder(parentPath)
    }
  }

  function handleGoHome() {
    if (homePathRef.current) {
      loadFolder(homePathRef.current)
    }
  }

  function handleToggle(nodeId) {
    setExpandedNodes((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    )
  }

  function handleNodeSelect(node) {
    if (node.type === 'folder') {
      handleToggle(node.id)
      const audioFiles = collectAudioFiles(node)
      if (onSelectFolder && audioFiles.length > 0) {
        onSelectFolder(audioFiles)
      }
      if (!node.children || node.children.length === 0) {
        getFileTree(node.path)
        addIpcFileTreeListenerOnce((tree) => {
          if (tree) {
            setTreeData((prev) => mergeTree(prev, tree))
            setExpandedNodes((prev) => [...prev, tree.id])
          }
        })
      }
    } else if (node.type === 'file' && node.isAudio) {
      if (onSelectFile) onSelectFile(node)
    }
  }

  function mergeTree(oldNode, newNode) {
    if (!oldNode) return newNode
    if (oldNode.id === newNode.id) {
      return { ...oldNode, children: newNode.children || [] }
    }
    if (oldNode.children) {
      return {
        ...oldNode,
        children: oldNode.children.map((child) =>
          mergeTree(child, newNode)
        )
      }
    }
    return oldNode
  }

  function collectAudioFiles(node) {
    const files = []
    if (node.type === 'file' && node.isAudio) {
      files.push(node.path)
    }
    if (node.children) {
      node.children.forEach((child) => {
        files.push(...collectAudioFiles(child))
      })
    }
    return files
  }

  function renderNode(node, depth = 0) {
    if (!node) return null
    const isExpanded = expandedNodes.includes(node.id)
    const hasChildren = node.children && node.children.length > 0

    if (node.type === 'file') {
      return (
        <ListItem
          button
          key={node.id}
          onClick={() => handleNodeSelect(node)}
          style={{ paddingLeft: 16 + depth * 16 }}
        >
          <ListItemIcon>
            <AudioFileIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText primary={node.name} />
        </ListItem>
      )
    }

    return (
      <div key={node.id}>
        <ListItem button onClick={() => handleNodeSelect(node)}>
          <ListItemIcon>
            {isExpanded ? (
              <FolderOpenIcon fontSize='small' />
            ) : (
              <FolderIcon fontSize='small' />
            )}
          </ListItemIcon>
          <ListItemText primary={node.name} />
          {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
        </ListItem>
        <Collapse in={isExpanded} timeout='auto' unmountOnExit>
          <List component='div' disablePadding>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </List>
        </Collapse>
      </div>
    )
  }

  return (
    <div className={classes.treeRoot}>
      {/* Three dots menu bar with Go Up and Home buttons */}
      <div className={classes.goUpBar}>
        <IconButton
          className={classes.goUpButton}
          size='small'
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <MoreVertIcon fontSize='small' />
        </IconButton>
        
        {menuOpen && (
          <>
            <Tooltip title='Go to parent folder'>
              <IconButton
                className={classes.goUpButton}
                size='small'
                onClick={() => {
                  handleGoUp()
                  setMenuOpen(false)
                }}
              >
                <ArrowUpwardIcon fontSize='small' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Go to home folder'>
              <IconButton
                className={classes.goUpButton}
                size='small'
                onClick={() => {
                  handleGoHome()
                  setMenuOpen(false)
                }}
              >
                <HomeIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          </>
        )}
        
        {currentPath && (
          <span className={classes.currentPath} title={currentPath}>
            {currentPath.split('/').pop() || currentPath}
          </span>
        )}
        
        {/* Connection status indicator */}
        <Tooltip title={isOnline ? 'Online' : 'Offline'}>
          <div 
            className={`${classes.connectionDot} ${isOnline ? classes.connectionOnline : classes.connectionOffline}`}
          />
        </Tooltip>
      </div>

      {/* Tree content */}
      {loading && <ListItem><ListItemText primary='Loading...' /></ListItem>}
      {!loading && !treeData && (
        <ListItem>
          <ListItemText primary={isOnline ? 'No folder loaded' : 'Offline - showing home folder'} />
        </ListItem>
      )}
      {treeData && treeData.children && treeData.children.map((child) => renderNode(child))}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{
          className: classes.snackbarContent
        }}
      />
    </div>
  )
}

FileTree.propTypes = {
  onSelectFile: PropTypes.func,
  onSelectFolder: PropTypes.func
}
