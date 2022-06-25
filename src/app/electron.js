const {
  BrowserWindow,
  app,
  //Notification,
  ipcMain,
  dialog,
  shell
} = require('electron')
const path = require('path')
const { getFilePaths } = require('./filewalker')
const isDev = require('electron-is-dev')
const windowStateKeeper = require('electron-window-state')
const log = require('electron-log')

const trash = require('trash')
// eslint-disable-next-line no-unused-expressions
isDev && require('electron-reload')
// eslint-disable-next-line no-unused-expressions
require('electron').process

let win = null

log.info(app.getPath('userData'))
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    log.info(
      'Someoned tried to run a second instance, we should focus our window.'
    )
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  // Create myWindow, load the rest of the app, etc...
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow)

  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    //if (process.platform !== 'darwin')
    app.quit()
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    //if (win === null) createWindow()
  })
}

async function createWindow() {
  // app.allowRendererProcessReuse = false
  // Extract CLI parameter: Enable Auto Update
  // Load the previous state with fallback to defaults
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  })

  // Extract CLI parameter: Window Coordinates
  const [xSet, ySet, widthSet, heightSet] = []
  const { x, y, width, height } = {
    x: parseInt(xSet || 0, 10),
    y: parseInt(ySet, 10),
    width: parseInt(widthSet, 10),
    height: parseInt(heightSet, 10)
  }
  // Create the window using the state information
  win = new BrowserWindow({
    x,
    y,
    width,
    height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      enableRemoteModule: false,
      sandbox: true
    },
    title: 'Disco Bouncer'
    // vibrancy: 'dark',
    // titlebarAppearsTransparent: true
  })
  win.setMenu(null)

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(win)

  // Check for develper console
  isDev && win.webContents.openDevTools()

  win.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      callback(true)
    }
  )

  // Register IPC
  ipcMain.on('open-file-dialog', onOpenFileDialog)
  ipcMain.on('open-with', (event, pathToFile) =>
    shell.showItemInFolder(pathToFile.path)
  )
  ipcMain.on('remove-file', (event, pathToFile) => trash(pathToFile.path))
  ipcMain.on('remove-files', (event, pathsToFiles) => {
    pathsToFiles?.paths.forEach((path) => {
      log.info(path.src)
      trash(path.src)
    })
    return
  })
  ipcMain.on('set-to-actual-win-coords', onSetActualWinCoords)
  ipcMain.on('exit-app', () => app.exit(0))

  const url = isDev
    ? 'http://localhost:3000/'
    : `file://${path.join(__dirname, '../index.html')}`

  win.loadURL(url)
  //  Emitted when the window is closed.
  win.on('closed', function () {
    win = null
  })
}

function onOpenFileDialog(event) {
  doAsync(
    () =>
      dialog.showOpenDialog({
        properties: ['openFile', 'openDirectory']
      }),
    (stuff) => {
      const { filePaths, canceled } = stuff
      if (canceled) return
      doAsync(
        () => loadPaths(filePaths[0]),
        function (tracks) {
          const stufff = {
            content: { tracks },
            presetName: filePaths[0]
          }
          event.sender.send('open-file-dialog-reply', { ...stufff })
        }
      )
      return filePaths
    }
  )
}

function onSetActualWinCoords(event) {
  log.info('onSetActualWinCoords ')
  const { x, y, width, height } = win.getBounds()
  event.sender.send('set-to-actual-win-coords-reply', [x, y, width, height])
  return [x, y, width, height]
}

async function loadPaths(tmpPath) {
  return getFilePaths(tmpPath).filter((item) => {
    return (
      item.endsWith('.wav') ||
      item.endsWith('.flac') ||
      item.endsWith('.mp3') ||
      item.endsWith('.ogg') ||
      item.endsWith('.mp4')
    )
  })
}

function doAsync(promise, cb) {
  const errFunc = (err) => {
    throw new Error(err)
  }
  return promise().then(cb, errFunc).catch(errFunc)
}
