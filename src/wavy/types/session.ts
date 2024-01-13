import EventEmitter from 'eventemitter3'

export const SERIAL_BAUD_RATES = [
  110, 150, 300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600, 1500000,
]

export const SERIAL_STOP_BITS = [1, 1.5, 2]
export const SERIAL_DATA_BITS = [5, 6, 7, 8]
export const SERIAL_PARITIES = ['none', 'odd', 'even', 'mark', 'space']

//@ see @serialport/bindings-interface 
export interface SerialProfileOptions {
  /** The system path of the serial port you want to open. For example, `/dev/tty.XXX` on Mac/Linux, or `COM1` on Windows */
  path?: string
  /**
   * The baud rate of the port to be opened. This should match one of the commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, or 115200. Custom rates are supported best effort per platform. The device connected to the serial port is not guaranteed to support the requested baud rate, even if the port itself supports that baud rate.
   */
  baudRate: number
  /** Must be one of these: 5, 6, 7, or 8 defaults to 8 */
  dataBits?: 5 | 6 | 7 | 8
  /** Prevent other processes from opening the port. Windows does not currently support `false`. Defaults to true */
  lock?: boolean
  /** Must be 1, 1.5 or 2 defaults to 1 */
  stopBits?: 1 | 1.5 | 2
  parity?: string
  /** Flow control Setting. Defaults to false */
  rtscts?: boolean
  /** Flow control Setting. Defaults to false */
  xon?: boolean
  /** Flow control Setting. Defaults to false */
  xoff?: boolean
  /** Flow control Setting defaults to false*/
  xany?: boolean
  /** drop DTR on close. Defaults to true */
  hupcl?: boolean
}

export const createDefaultSerialOptions = (): SerialProfileOptions => {
  return {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none'
  }
}

export type SessionOptions = SerialProfileOptions
export type SessionType = 'Serial' | 'TCP'

export interface AbstractSession {
  id: string,
  type: SessionType,
  isConnected: boolean,
  tempIndex?: number,
  index?: number,
  name?: string,
  dirty?: boolean,
  open(): any | Promise<any>,
  close(): any | Promise<any>,
  send(data: Uint8Array, echo: boolean, raw: string | undefined): any | Promise<any>,
  addEventListener(event: string, listener: (event: any) => void): any
  removeEventListener(event: string, listener: (event: any) => void): any
}
