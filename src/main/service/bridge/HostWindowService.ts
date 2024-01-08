import { ipcRenderer, shell } from 'electron'

export default {
  isMaximized() {
    return ipcRenderer.invoke('main:isMaximized')
  },
  toggleMaximize() {
    ipcRenderer.send('main:toggleMaximize')
  },
  minimize() {
    ipcRenderer.send('main:minimize')
  },
  onMaximized(listener: any) {
    ipcRenderer.on('renderer:window-maximized', listener)
  },
  onUnMaximized(listener: any) {
    ipcRenderer.on('renderer:window-unmaximized', listener)
  },
  onClose(listener: any) {
    ipcRenderer.on('renderer:window-close', listener)
  },
  openExternal(url: string) {
    shell.openExternal(url)
  },
  exit() {
    ipcRenderer.send('main:close')
  }
}
