import { SerialPortService, Result } from '../types'
import { SerialPort } from 'serialport'

class DefaultSerialPortService implements SerialPortService {
  serials: Map<string, SerialPort> = new Map()

  async listPorts(): Promise<String[]> {
    const portInfos = await SerialPort.list()
    return portInfos.map(p => p.path)
  }
  async connect(id: string, options: any): Promise<Result> {
    options.autoOpen = false
    const serial = this.serials.get(id) || new SerialPort(options)
    this.serials.set(id, serial)
    return new Promise((resolve) => {
      if (!serial.isOpen) {
        serial.open((err) => {
          if (this.serials.has(id) && !err) {
            serial.update(options)
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
  async disconnect(id: string): Promise<boolean> {
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
  on(id: string, event: string, listener: any): void {
    const serial = this.serials.get(id)
    if (serial) {
      serial.on(event, listener)
    }
  }
  async write(id: string, data: any): Promise<any> {
    const serial = this.serials.get(id)
    if (serial) {
      return serial.write(data)
    }
  }
}

const service = new DefaultSerialPortService()

// Any other approach to export a instance's function?
export default {
  listPorts(): Promise<String[]> {
    return service.listPorts()
  },
  connect(id: string, options: any): Promise<Result> {
    return service.connect(id, options)
  },
  disconnect(id: string): Promise<boolean> {
    return service.disconnect(id)
  },
  on(id: string, event: string, listener: any): void {
    return service.on(id, event, listener)
  },
  write(id: string, data: any): Promise<void> {
    return service.write(id, data)
  }
}
