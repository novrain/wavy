
export interface Result {
  result: boolean
  err: any
}

export interface HostWindowService {
  isMaximized(): Promise<boolean>
  toggleMaximize(): void
  minimize(): void
  onMaximized(listener: any): void
  onUnMaximized(listener: any): void
  onClose(listener: any): void
  openExternal(url: string): void
  exit(): void
  locale(): Promise<string>
  platform(): Promise<string>
}

export interface SerialPortService {
  listPorts(): Promise<String[]>
  connect(id: string, options: any): Promise<Result>
  disconnect(id: string): Promise<boolean>
  addEventListener(id: string, event: string, listener: any): void
  removeEventListener(id: string, event: string, listener: any): void
  write(id: string, data: any): Promise<void>
}

export interface ProjectService {
  openProject(): Promise<{ canceled: boolean, result: boolean, project?: string, name?: string, path?: string }>
  saveProject(project: string, name: string, path: string): Promise<{ result: boolean }>
  saveProjectAs(project: string, name?: string, path?: string): Promise<{ canceled: boolean, result: boolean, name?: string, path?: string }>
  saveTextAs(text: string): Promise<{ canceled: boolean, result: boolean, name?: string, path?: string }>
}
