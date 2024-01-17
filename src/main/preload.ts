import { contextBridge, ipcRenderer, shell } from 'electron'

const DefaultHostWindowService = {
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
    ipcRenderer.send('main:openExternal', url)
  },
  exit() {
    ipcRenderer.send('main:close')
  },
  locale() {
    return ipcRenderer.invoke('main:getLocale')
  },
  platform() {
    return ipcRenderer.invoke('main:getPlatform')
  }
}

// host window
contextBridge.exposeInMainWorld('hostWindow', DefaultHostWindowService)

const listenerMap = new Map<string, any>()

const DefaultSerialPortService = {
  listPorts(): Promise<String[]> {
    return ipcRenderer.invoke('serial:listPorts')
  },
  connect(id: string, options: any): Promise<any> {
    return ipcRenderer.invoke('serial:connect', id, options)
  },
  disconnect(id: string): Promise<boolean> {
    return ipcRenderer.invoke('serial:disconnect', id)
  },
  addEventListener(id: string, event: string, listener: any): void {
    const key = `serial:${id}:${event}`
    if (listenerMap.has(key)) {
      return
    }
    const callback = (_event: Electron.IpcRendererEvent, ...args: any[]) => { listener(...args) }
    listenerMap.set(key, callback)
    ipcRenderer.on(key, callback)
  },
  removeEventListener(id: string, event: string, listener: any): void {
    const key = `serial:${id}:${event}`
    if (listenerMap.has(key)) {
      listener = listenerMap.get(key)
      ipcRenderer.removeListener(key, listener)
      listenerMap.delete(key)
    }
  },
  write(id: string, data: any): Promise<void> {
    return ipcRenderer.invoke('serial:write', id, data)
  }
}
// serial port
contextBridge.exposeInMainWorld('serialPort', DefaultSerialPortService)

const DefaultProjectService = {
  openProject(): Promise<{ canceled: boolean, result: boolean, project?: string, name?: string, path?: string }> {
    return ipcRenderer.invoke('project:openProject')
  },
  saveProject(project: string, name: string, path: string): Promise<{ result: boolean }> {
    return ipcRenderer.invoke('project:saveProject', project, name, path)
  },
  saveProjectAs(project: string, name?: string, path?: string): Promise<{ canceled: boolean, result: boolean, name?: string, path?: string }> {
    return ipcRenderer.invoke('project:saveProjectAs', project, name, path)
  },
  saveTextAs(text: string): Promise<{ canceled: boolean, result: boolean, name?: string, path?: string }> {
    return ipcRenderer.invoke('project:saveTextAs', text)
  },
  // for ipcMain --> renderer  
  onNewProject(listener: any) {
    ipcRenderer.on('renderer:project-new', listener)
  },
  onSaveProject(listener: any) {
    ipcRenderer.on('renderer:project-save', listener)
  },
  onSaveAsProject(listener: any) {
    ipcRenderer.on('renderer:project-saveAs', listener)
  },
  onOpenProject(listener: any) {
    ipcRenderer.on('renderer:project-open', listener)
  },
}

// file service
contextBridge.exposeInMainWorld('projectService', DefaultProjectService)

const DefaultSessionService = {
  // for ipcMain --> renderer  
  onNewProject(listener: any) {
    ipcRenderer.on('renderer:session-new', listener)
  },
}

// file service
contextBridge.exposeInMainWorld('sessionService', DefaultSessionService)
