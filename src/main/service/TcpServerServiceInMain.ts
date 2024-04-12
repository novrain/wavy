import { BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log'
import { Server, Socket } from 'node:net'
import { defaultId } from '../../wavy/util/SnowflakeId'

export default class TCPServerServiceInMain {
  servers: Map<string, Server> = new Map()
  serverSockets: Map<string, Map<string, Socket>> = new Map()
  private _window?: BrowserWindow | undefined
  public get window(): BrowserWindow | undefined {
    return this._window
  }
  public set window(value: BrowserWindow | undefined) {
    this._window = value
  }

  constructor() {
    ipcMain.handle('tcpserver:connect', this.connect)
    ipcMain.handle('tcpserver:disconnect', this.disconnect)
    ipcMain.handle('tcpserver:disconnectClient', this.disconnectClient)
    ipcMain.handle('tcpserver:write', this.write)
    ipcMain.handle('tcpserver:writeClient', this.writeClient)
  }

  connect = async (event: Electron.IpcMainInvokeEvent, id: string, options: any): Promise<any> => {
    options.autoOpen = false
    const server = this.servers.get(id) || new Server(options)
    this.servers.set(id, server)
    return new Promise((resolve) => {
      if (!server.listening) {
        server.once('error', (error: any) => {
          server.removeAllListeners()
          resolve({
            result: false,
            err: error.message
          })
        })
        server.listen(options, () => {
          server.removeAllListeners()
          server.on('close', () => this._window?.webContents.send(`tcpserver:${id}:close`))
          server.on('error', () => this._window?.webContents.send(`tcpserver:${id}:error`))
          const sockets = this.serverSockets.get(id) || new Map()
          this.serverSockets.set(id, sockets)
          server.on('connection', (socket) => {
            const client = defaultId.nextId() + ''
            sockets.set(client, socket)
            this._window?.webContents.send(`tcpserver:${id}:connection`, { id: client, remoteAddress: socket.remoteAddress, remotePort: socket.remotePort })
            socket.on('data', (data) => this._window?.webContents.send(`tcpserver:${id}:${client}:data`, data))
            socket.on('error', (error) => this._window?.webContents.send(`tcpserver:${id}:${client}:error`, error))
            socket.on('close', () => {
              sockets.delete(id)
              this._window?.webContents.send(`tcpserver:${id}:${client}:close`)
            })
          })
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
    const server = this.servers.get(id)
    if (server) {
      return new Promise((resolve) => {
        server.close()
        const sockets = this.serverSockets.get(id) || new Map()
        sockets.forEach((s, k) => {
          s.destroy()
          // s.removeAllListeners()
        })
        sockets.clear()
        this.serverSockets.delete(id)
        server.removeAllListeners()
        this.servers.delete(id)
        resolve(true)
      })
    } else {
      this.servers.delete(id)
      return Promise.resolve(true)
    }
  }
  disconnectClient = async (event: Electron.IpcMainInvokeEvent, id: string, client: string): Promise<boolean> => {
    const server = this.servers.get(id)
    if (server) {
      const sockets = this.serverSockets.get(id) || new Map()
      const socket = sockets.get(client)
      if (socket) {
        return new Promise((resolve) => {
          socket.destroy()
          sockets.delete(client)
          socket.removeAllListeners()
          resolve(true)
        })
      } else {
        return Promise.resolve(true)
      }
    } else {
      this.servers.delete(id)
      return Promise.resolve(true)
    }
  }
  write = async (event: Electron.IpcMainInvokeEvent, id: string, data: any): Promise<any> => {
    const sockets = this.serverSockets.get(id)
    if (sockets) {
      sockets.forEach((s, k) => {
        s.write(data, (err => {
          log.error(err)
          console.log(err)
        }))
      })
    }
  }
  writeClient = async (event: Electron.IpcMainInvokeEvent, id: string, client: string, data: any): Promise<any> => {
    const sockets = this.serverSockets.get(id)
    if (sockets) {
      const socket = sockets.get(client)
      if (socket) {
        return socket.write(data, (err => {
          log.error(err)
          console.log(err)
        }))
      }
    }
  }
}
