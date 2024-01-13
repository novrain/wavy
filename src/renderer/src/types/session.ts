import { AbstractSession, SessionOptions, SessionType } from '@W/types/session'
import EventEmitter from 'eventemitter3'

export default class RawSerialPortSession extends EventEmitter implements AbstractSession {
  private _tempIndex?: number | undefined
  private _index?: number | undefined
  private _name?: string | undefined
  private _type: SessionType
  private _dirty?: boolean | undefined
  private _isConnected: boolean = false
  private _options: SessionOptions

  constructor(
    readonly id: string,
    options: SessionOptions,
    name?: string | undefined,
    index?: number | undefined,
    tempIndex?: number | undefined,
    dirty?: boolean | undefined,
  ) {
    super()
    this._options = options
    this._tempIndex = tempIndex
    this._name = name
    this._index = index
    this._dirty = dirty
    this._type = 'Serial'
  }

  public get tempIndex(): number | undefined {
    return this._tempIndex
  }

  public set tempIndex(value: number | undefined) {
    this._tempIndex = value
  }

  public get index(): number | undefined {
    return this._index
  }

  public set index(value: number | undefined) {
    this._index = value
  }

  public get name(): string | undefined {
    return this._name
  }

  public set name(value: string | undefined) {
    this._name = value
  }

  public get type(): SessionType {
    return this._type
  }

  public set type(value: SessionType) {
    this._type = value
  }

  public get dirty(): boolean | undefined {
    return this._dirty
  }

  public set dirty(value: boolean | undefined) {
    this._dirty = value
  }

  public get isConnected(): boolean {
    return this._isConnected
  }

  public set isConnected(value: boolean) {
    this._isConnected = value
  }

  public get options(): SessionOptions {
    return this._options
  }

  public set options(value: SessionOptions) {
    this._options = value
  }

  async open(): Promise<any> {
    if (window.serialPort) {
      return window.serialPort.connect(this.id, { ...this.options }).then(r => {
        this.isConnected = r.result
        return r
      })
    }
    return Promise.resolve({ result: false, err: 'window.serialPort not available' })
  }

  async close(): Promise<any> {
    if (window.serialPort) {
      return window.serialPort.disconnect(this.id).then(r => {
        this.isConnected = !r
        return r
      })
    } else {
      return Promise.resolve(true)
    }
  }

  async send(data: Uint8Array, echo: boolean = false, raw: string | undefined = undefined): Promise<any> {
    if (window.serialPort) {
      return window.serialPort.write(this.id, data).then((r) => {
        if (echo) {
          this.emit('echo', { data, raw })
        }
        return r
      })
    } else {
      if (echo) {
      }
      return Promise.resolve()
    }
  }

  addEventListener(event: string, listener: (...args: any[]) => void): this {
    if (event === 'echo') {
      super.addListener(event, listener)
      return this
    }
    if (window.serialPort) {
      window.serialPort.addEventListener(this.id, event.toString(), listener)
    }
    return this
  }

  removeEventListener(event: string, listener: (...args: any[]) => void) {
    if (event === 'echo') {
      super.removeListener(event, listener)
      return this
    }
    if (window.serialPort) {
      window.serialPort.removeEventListener(this.id, event.toString(), listener)
    }
    return this
  }
}

export type Session = RawSerialPortSession // | TCPSession
