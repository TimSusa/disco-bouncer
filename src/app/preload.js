const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('appRuntime', {
  send: (channel, data) => {
    ipcRenderer.send(channel, data)
  },
  on: (channel, listener) => {
    const subscription = (_event, ...args) => listener(...args)
    ipcRenderer.on(channel, subscription)
    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
  once: (channel, listener) => {
    const subscription = (_event, ...args) => listener(...args)
    ipcRenderer.once(channel, subscription)
    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
  invoke: (channel, data) => {
    return ipcRenderer.invoke(channel, data)
  }
})
