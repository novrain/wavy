import { contextBridge, ipcRenderer } from 'electron'

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
    ipcRenderer.removeListener(key, callback)
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
    ipcRenderer.removeListener('renderer:project-new', listener)
    ipcRenderer.on('renderer:project-new', listener)
  },
  onSaveProject(listener: any) {
    ipcRenderer.removeListener('renderer:project-save', listener)
    ipcRenderer.on('renderer:project-save', listener)
  },
  onSaveAsProject(listener: any) {
    ipcRenderer.removeListener('renderer:project-new', listener)
    ipcRenderer.on('renderer:project-saveAs', listener)
  },
  onOpenProject(listener: any) {
    ipcRenderer.removeListener('renderer:project-open', listener)
    ipcRenderer.on('renderer:project-open', listener)
  },
}

// session service
contextBridge.exposeInMainWorld('projectService', DefaultProjectService)

const DefaultSessionService = {
  // for ipcMain --> renderer  
  onNewSession(listener: any) {
    ipcRenderer.removeListener('renderer:session-new', listener)
    ipcRenderer.on('renderer:session-new', listener)
  },
}

// session service
contextBridge.exposeInMainWorld('sessionService', DefaultSessionService)

const tcpClientListenerMap = new Map<string, any>()

const DefaultTCPClientService = {
  connect(id: string, options: any): Promise<any> {
    return ipcRenderer.invoke('tcpclient:connect', id, options)
  },
  disconnect(id: string): Promise<boolean> {
    return ipcRenderer.invoke('tcpclient:disconnect', id)
  },
  addEventListener(id: string, event: string, listener: any): void {
    const key = `tcpclient:${id}:${event}`
    if (tcpClientListenerMap.has(key)) {
      return
    }
    const callback = (_event: Electron.IpcRendererEvent, ...args: any[]) => { listener(...args) }
    tcpClientListenerMap.set(key, callback)
    ipcRenderer.removeListener(key, callback)
    ipcRenderer.on(key, callback)
  },
  removeEventListener(id: string, event: string, listener: any): void {
    const key = `tcpclient:${id}:${event}`
    if (tcpClientListenerMap.has(key)) {
      listener = tcpClientListenerMap.get(key)
      ipcRenderer.removeListener(key, listener)
      tcpClientListenerMap.delete(key)
    }
  },
  write(id: string, data: any): Promise<void> {
    return ipcRenderer.invoke('tcpclient:write', id, data)
  }
}
// tcp client 
contextBridge.exposeInMainWorld('tcpClient', DefaultTCPClientService)

const tcpServerListenerMap = new Map<string, any>()

const DefaultTCPServerService = {
  connect(id: string, options: any): Promise<any> {
    return ipcRenderer.invoke('tcpserver:connect', id, options)
  },
  disconnect(id: string): Promise<boolean> {
    return ipcRenderer.invoke('tcpserver:disconnect', id)
  },
  disconnectClient(id: string, client: string): Promise<boolean> {
    return ipcRenderer.invoke('tcpserver:disconnectClient', id, client)
  },
  addEventListener(id: string, event: string, listener: any): void {
    const key = `tcpserver:${id}:${event}`
    if (tcpServerListenerMap.has(key)) {
      return
    }
    const callback = (_event: Electron.IpcRendererEvent, ...args: any[]) => { listener(...args) }
    tcpServerListenerMap.set(key, callback)
    ipcRenderer.removeListener(key, callback)
    ipcRenderer.on(key, callback)
  },
  removeEventListener(id: string, event: string, listener: any): void {
    const key = `tcpserver:${id}:${event}`
    if (tcpServerListenerMap.has(key)) {
      listener = tcpServerListenerMap.get(key)
      ipcRenderer.removeListener(key, listener)
      tcpServerListenerMap.delete(key)
    }
  },
  write(id: string, data: any): Promise<void> {
    return ipcRenderer.invoke('tcpserver:write', id, data)
  },
  writeClient(id: string, client: string, data: any): Promise<void> {
    return ipcRenderer.invoke('tcpserver:writeClient', id, client, data)
  }
}
// tcp server 
contextBridge.exposeInMainWorld('tcpServer', DefaultTCPServerService)