import { BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log'
import { Socket } from 'node:net'

export default class DefaultTCPClientService {
  sockets: Map<string, Socket> = new Map()
  private _window?: BrowserWindow | undefined
  public get window(): BrowserWindow | undefined {
    return this._window
  }
  public set window(value: BrowserWindow | undefined) {
    this._window = value
  }

  constructor() {
    ipcMain.handle('tcpclient:connect', this.connect)
    ipcMain.handle('tcpclient:disconnect', this.disconnect)
    ipcMain.handle('tcpclient:write', this.write)
  }

  connect = async (event: Electron.IpcMainInvokeEvent, id: string, options: any): Promise<any> => {
    options.autoOpen = false
    const socket = this.sockets.get(id) || new Socket(options)
    this.sockets.set(id, socket)
    return new Promise((resolve) => {
      if (socket.closed) {
        socket.connect(options, () => {
          socket.on('data', (data) => this._window?.webContents.send(`tcpclient:${id}:data`, data))
          socket.on('error', (error) => this._window?.webContents.send(`tcpclient:${id}:error`, error))
          socket.on('close', () => this._window?.webContents.send(`tcpclient:${id}:close`))
          resolve({
            result: true,
            err: null
          })
        })
      } else {
        resolve({
          result: true,
          err: null
        })
      }
    })
  }
  disconnect = async (event: Electron.IpcMainInvokeEvent, id: string): Promise<boolean> => {
    const socket = this.sockets.get(id)
    if (socket) {
      return new Promise((resolve) => {
        socket.destroy()
        socket.removeAllListeners()
        this.sockets.delete(id)
        resolve(true)
      })
    } else {
      this.sockets.delete(id)
      return Promise.resolve(true)
    }
  }
  write = async (event: Electron.IpcMainInvokeEvent, id: string, data: any): Promise<any> => {
    const socket = this.sockets.get(id)
    if (socket) {
      return socket.write(data, (err => {
        log.error(err)
        console.log(err)
      }))
    }
  }
}
