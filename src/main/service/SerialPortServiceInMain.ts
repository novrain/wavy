import { BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log'
import { InterByteTimeoutParser, SerialPort } from 'serialport'

export default class DefaultSerialPortService {
  serials: Map<string, SerialPort> = new Map()
  private _window?: BrowserWindow | undefined
  public get window(): BrowserWindow | undefined {
    return this._window
  }
  public set window(value: BrowserWindow | undefined) {
    this._window = value
  }

  constructor() {
    ipcMain.handle('serial:listPorts', this.listPorts)
    ipcMain.handle('serial:connect', this.connect)
    ipcMain.handle('serial:disconnect', this.disconnect)
    ipcMain.handle('serial:write', this.write)
  }

  listPorts = async (event: Electron.IpcMainInvokeEvent): Promise<String[]> => {
    const portInfos = await SerialPort.list()
    return portInfos.map(p => p.path)
  }

  connect = async (event: Electron.IpcMainInvokeEvent, id: string, options: any): Promise<any> => {
    options.autoOpen = false
    const serial = this.serials.get(id) || new SerialPort(options)
    this.serials.set(id, serial)
    return new Promise((resolve) => {
      if (!serial.isOpen) {
        serial.open((err) => {
          if (this.serials.has(id) && !err) {
            serial.update(options)
          }
          if (!err) {
            const parser = serial.pipe(new InterByteTimeoutParser({ interval: options.interval || 30 }))
            parser.on('data', (data) => this._window?.webContents.send(`serial:${id}:data`, data))
            serial.on('error', (error) => this._window?.webContents.send(`serial:${id}:error`, error))
            serial.on('close', () => this._window?.webContents.send(`serial:${id}:close`))
          } else {
            this.serials.delete(id)
          }
          console.log(err)
          resolve({
            result: !err,
            err
          })
        })
      } else {
        if (this.serials.has(id)) {
          serial.update(options, (err) => {
            resolve({
              result: !err,
              err
            })
          })
        }
      }
    })
  }
  disconnect = async (event: Electron.IpcMainInvokeEvent, id: string): Promise<boolean> => {
    const serial = this.serials.get(id)
    if (serial) {
      return new Promise((resolve) => {
        serial.close((err) => {
          console.log(err)
          serial.removeAllListeners()
          this.serials.delete(id)
          resolve(true)
        })
      })
    } else {
      this.serials.delete(id)
      return Promise.resolve(true)
    }
  }
  write = async (event: Electron.IpcMainInvokeEvent, id: string, data: any): Promise<any> => {
    const serial = this.serials.get(id)
    if (serial) {
      return serial.write(data, (err => {
        log.error(err)
        console.log(err)
      }))
    }
  }
}
