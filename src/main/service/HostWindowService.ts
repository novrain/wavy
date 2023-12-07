import { app, ipcRenderer, shell } from 'electron'

export default {
  isMaximized() {
    return ipcRenderer.invoke('window:isMaximized')
  },
  toggleMaximize() {
    ipcRenderer.send('window:toggleMaximize')
  },
  minimize() {
    ipcRenderer.send('window:minimize')
  },
  onMaximized(listener: any) {
    ipcRenderer.on('renderer:window-maximized', listener)
  },
  onUnMaximized(listener: any) {
    ipcRenderer.on('renderer:window-unmaximized', listener)
  },
  openExternal(url: string) {
    shell.openExternal(url)
  },
  exit() {
    ipcRenderer.send('window:close')
  }
}