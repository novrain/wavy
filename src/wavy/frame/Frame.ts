import { Buffer } from 'buffer/'
import {
  Exclude,
  Expose,
  Type
} from 'class-transformer'
import 'reflect-metadata'
import { defaultId } from '../util/SnowflakeId'
import {
  Block,
  BlockTransformer,
  BlocksContainer,
  ComputedBlock,
  RefBlock,
  UndefinableBlock,
  UndefinableBuffer
} from './Block'

export type FrameType = 'Ref' | 'Data'

export interface WavyItem {
  tempIndex?: number
  readonly id: string
  __type: WavyItemType
  name: string
  container?: Container
  injectContainerToRef(): void
  clone(withIdentify: boolean): WavyItem
  get type(): WavyItemType
  toString(): string
}

export interface Frame extends WavyItem {
  get preDelay(): number
  set preDelay(v: number)
  get postDelay(): number
  set postDelay(v: number)
  encode(): UndefinableBuffer
  decode(raw: Buffer, offset: number): number
  decodeByResponse(raw: Buffer, offset: number): number
}

export type UndefinableFrame = Frame | undefined

export interface WavyItemsContainer {
  replaceWavyItem(oldWavyItem: number, newWavyItem: WavyItem): void
  replaceWavyItem(oldWavyItem: WavyItem, newWavyItem: WavyItem): void
  replaceWavyItem(oldWavyItem: WavyItem | number, newWavyItem: WavyItem): void

  addWavyItem(wavyItem: WavyItem, after: number | undefined): void

  deleteWavyItem(wavyItem: number): void
  deleteWavyItem(wavyItem: WavyItem): void
  deleteWavyItem(wavyItem: WavyItem | number): void

  findWavyItem(id: string): UndefinableWavyItem

  findFrame(id: string): UndefinableFrame

  removeAllWavyItem(): void
}

export type Container = BlocksContainer & WavyItemsContainer

export class RefFrame implements Frame {
  tempIndex?: number

  __type: WavyItemType = 'Ref'
  @Exclude()
  _frame?: Frame
  @Exclude()
  _container?: Container

  @Expose({ name: 'refId' })
  _refId?: string

  constructor(
    readonly id: string,
    public name: string,
    refId?: string,
    container?: Container
  ) {
    this._refId = refId
    this._container = container
  }

  get preDelay(): number {
    this.frame
    if (this._frame) {
      return this._frame.preDelay
    } else {
      return 0
    }
  }

  set preDelay(v: number) {
    this.frame
    if (this._frame) {
      this._frame.preDelay = v
    }
  }

  get postDelay(): number {
    this.frame
    if (this._frame) {
      return this._frame.postDelay
    } else {
      return 0
    }
  }

  set postDelay(v: number) {
    this.frame
    if (this._frame) {
      this._frame.postDelay = v
    }
  }

  get type(): WavyItemType {
    return this.__type
  }

  set container(v: Container | undefined) {
    this._container = v
  }

  get container(): Container | undefined {
    return this._container
  }

  injectContainerToRef(): void {
  }

  set refId(v: string) {
    this._refId = v
  }

  get refId(): string | undefined {
    return this._refId
  }

  get frame(): UndefinableFrame {
    if (this._container && this._refId) {
      let f = this._container.findFrame(this._refId)
      this._frame = f
    }
    return this._frame
  }

  encode(): UndefinableBuffer {
    this.frame
    if (this._frame) {
      return this._frame.encode()
    } else {
      return undefined
    }
  }

  decode(raw: Buffer, offset: number): number {
    this.frame
    if (this._frame) {
      return this._frame.decode(raw, offset)
    } else {
      return 0
    }
  }

  toString(): string {
    this.frame
    if (this._frame) {
      return this._frame.toString()
    } else {
      return 'Oops, Ref Error!'
    }
  }

  decodeByResponse(raw: Buffer, offset: number): number {
    this.frame
    if (this._frame) {
      return this._frame.decodeByResponse(raw, offset)
    } else {
      return 0
    }
  }

  clone(withIdentify: boolean = false): Frame {
    let cloned = new RefFrame(
      withIdentify ? this.id : defaultId.nextId() + '',
      this.name,
      this.refId,
      this._container
    )
    if (withIdentify) {
      cloned.tempIndex = this.tempIndex
    }
    return cloned
  }
}

export class DataFrame implements BlocksContainer, Frame {
  tempIndex?: number
  @Expose({ name: 'preDelay' })
  _preDelay?: number
  @Expose({ name: 'postDelay' })
  _postDelay?: number
  // @Expose({ name: 'type' })
  __type: WavyItemType = 'Data'

  @Expose({ name: 'blocks' })
  @BlockTransformer
  _blocks: Block[] = []
  @Type(() => Object, {
    discriminator: {
      property: '__type',
      subTypes: [
        { value: RefFrame, name: 'Ref' },
        { value: DataFrame, name: 'Data' }
      ],
    },
  })
  @Expose({ name: 'responseFrame' })
  _responseFrame?: Frame
  @Exclude()
  _container?: Container

  constructor(
    readonly id: string,
    public name: string,
    blocks?: Block[],
    responseFrame?: Frame,
    container?: Container
  ) {
    if (blocks) {
      this._blocks = blocks
    }
    this._responseFrame = responseFrame
    this._container = container
  }

  get preDelay(): number {
    return (this._preDelay || 0) * 1
  }

  set preDelay(v: number) {
    this._preDelay = v * 1
  }

  get postDelay(): number {
    return (this._postDelay || 0) * 1
  }

  set postDelay(v: number) {
    this._postDelay = v * 1
  }

  get type(): WavyItemType {
    return this.__type
  }

  public get blocks(): Block[] {
    return this._blocks
  }

  addBlock(block: Block, after: number | undefined = undefined): void {
    if (after !== undefined && after >= 0 && after < this._blocks.length) {
      this._blocks.splice(after, 0, block)
    } else {
      this._blocks.push(block)
    }
    if (block.__type === 'Ref') {
      (block as RefBlock).blocksContainer = this._container
    }
  }

  deleteBlock(block: number): void
  deleteBlock(block: Block): void
  deleteBlock(block: Block | number): void {
    let index = block
    if (typeof block !== 'number') {
      index = this._blocks.indexOf(block)
    }
    const deletedBlock = this._blocks.splice(index as number, 1)
    // @Todo ref broken
  }

  replaceBlock(oldBlock: number, newBlock: Block): void
  replaceBlock(oldBlock: Block, newBlock: Block): void
  replaceBlock(oldBlock: Block | number, newBlock: Block): void {
    if (typeof oldBlock === 'number') {
      const block = this._blocks.splice(oldBlock, 1, newBlock)
      return
    }
    const index = this._blocks.findIndex(b => oldBlock.id === b.id)
    const block = this._blocks.splice(index, 1, newBlock)
    // @Todo ref broken
  }

  findBlock(id: string): UndefinableBlock {
    let b = this._blocks.find((b) => {
      return b.id === id
    })
    return b
  }

  removeAllBlock(): void {
    this._blocks.forEach(b => {
      // @Todo ref broken
    })
    this._blocks.splice(0, this._blocks.length)
  }

  set container(v: Container | undefined) {
    this._container = v
  }

  get container(): Container | undefined {
    return this._container
  }

  injectContainerToRef(): void {
    if (this._container) {
      let p = this._container
      this._blocks.forEach((b => {
        if (b instanceof RefBlock) {
          b.blocksContainer = p
        }
        if (b instanceof ComputedBlock) {
          b.blocksContainer = this
          b.refIds = b.refIds // force update
        }
      }))
    }
  }

  set responseFrame(frame: Frame) {
    this._responseFrame = frame
  }

  get responseFrame(): Frame {
    if (this._responseFrame) {
      return this._responseFrame
    }
    else {
      throw Error('response frame is undefined')
    }
  }

  encode(): UndefinableBuffer {
    let buffs = this._blocks.map(b => b.encode() || Buffer.alloc(0)) // @Todo 处理异常？
    return Buffer.concat(buffs)
  }

  decode(raw: Buffer, offset: number): number {
    throw new Error('Method not implemented.')
  }

  toString(): string {
    return this._blocks.map(b => b.toString()).join('')
  }

  decodeByResponse(raw: Buffer, offset: number): number {
    return this.responseFrame.decode(raw, offset)
  }

  clone(withIdentify: boolean = false): Frame {
    let cloned = new DataFrame(
      withIdentify ? this.id : defaultId.nextId() + '',
      this.name
    )
    if (withIdentify) {
      cloned.tempIndex = this.tempIndex
    }
    cloned._blocks = this._blocks.map(b => b.clone(withIdentify))
    if (this._responseFrame) {
      cloned._responseFrame = this._responseFrame.clone(withIdentify) as Frame
    }
    cloned._container = this._container
    cloned.injectContainerToRef()
    cloned._preDelay = this._preDelay
    cloned._postDelay = this._postDelay
    return cloned
  }
}

export type WavyItemType = FrameType | 'Suite'
export type UndefinableWavyItem = WavyItem | undefined

export class Suite implements WavyItem, WavyItemsContainer {
  tempIndex?: number
  // @Expose({ name: 'type' })
  __type: WavyItemType = 'Suite'

  // Cannot declare before Suite
  @Type(() => Object, {
    discriminator: {
      property: '__type',
      subTypes: [
        { value: RefFrame, name: 'Ref' },
        { value: DataFrame, name: 'Data' },
        { value: Suite, name: 'Suite' },
      ],
    },
  })
  @Expose({ name: 'wavyItems' })
  _wavyItems: WavyItem[] = []
  @Exclude()
  _container?: Container

  constructor(
    readonly id: string,
    public name: string,
    frames?: WavyItem[],
    container?: Container
  ) {
    if (frames) {
      this._wavyItems = frames
      this._container = container
      this.injectContainerToRef()
    }
  }

  get type(): WavyItemType {
    return this.__type
  }

  set container(v: Container | undefined) {
    this._container = v
    this.injectContainerToRef()
  }

  get container(): Container | undefined {
    return this._container
  }

  public get wavyItems(): WavyItem[] {
    return this._wavyItems
  }

  public get nestFrames(): WavyItem[] {
    const items: WavyItem[] = []
    this._wavyItems.forEach((item) => {
      if (item.__type === 'Suite') {
        items.push(...(item as Suite).nestFrames)
      } else {
        items.push(item)
      }
    })
    return items
  }

  injectContainerToRef(): void {
    if (this._container) {
      this._wavyItems.forEach((f => {
        f.container = this._container
        f.injectContainerToRef()
      }))
    }
  }

  addFrame(frame: WavyItem): void {
    this.addWavyItem(frame)
  }

  addWavyItem(wavyItem: WavyItem, after: number | undefined = undefined): void {
    if (after !== undefined && after >= 0 && after < this._wavyItems.length) {
      this._wavyItems.splice(after, 0, wavyItem)
    } else {
      this._wavyItems.push(wavyItem)
    }
    if (wavyItem.__type === 'Ref') {
      wavyItem.container = this._container
    }
  }

  deleteWavyItem(wavyItem: number): void
  deleteWavyItem(wavyItem: WavyItem): void
  deleteWavyItem(wavyItem: WavyItem | number): void {
    let index = wavyItem
    if (typeof wavyItem !== 'number') {
      index = this._wavyItems.indexOf(wavyItem)
    }
    const deletedWavyItem = this._wavyItems.splice(index as number, 1)
    // @Todo ref broken
  }

  replaceWavyItem(oldWavyItem: number, newWavyItem: WavyItem): void
  replaceWavyItem(oldWavyItem: WavyItem, newWavyItem: WavyItem): void
  replaceWavyItem(oldWavyItem: WavyItem | number, newWavyItem: WavyItem): void {
    if (typeof oldWavyItem === 'number') {
      const wavyItem = this._wavyItems.splice(oldWavyItem, 1, newWavyItem)
      return
    }
    const index = this._wavyItems.findIndex(b => oldWavyItem.id === b.id)
    const wavyItem = this._wavyItems.splice(index, 1, newWavyItem)
    // @Todo ref broken
  }

  findFrame(id: string): UndefinableFrame {
    let f = this._wavyItems.find((f) => {
      return f.id === id
    })
    if (f instanceof Suite) {
      return undefined
    }
    return f as Frame
  }

  findWavyItem(id: string): UndefinableWavyItem {
    let f = this._wavyItems.find((f) => {
      return f.id === id
    })
    return f
  }

  removeAllWavyItem(): void {
    this._wavyItems.forEach(i => {

    })
    this._wavyItems.splice(0, this._wavyItems.length)
  }

  clone(withIdentify: boolean): WavyItem {
    let cloned = new Suite(
      withIdentify ? this.id : defaultId.nextId() + '',
      this.name,
    )
    if (withIdentify) {
      cloned.tempIndex = this.tempIndex
    }
    cloned._wavyItems = this._wavyItems.map(f => f.clone(withIdentify))
    cloned._container = this._container
    cloned.injectContainerToRef()
    return cloned
  }
}

export const createWavyItem = (type: WavyItemType, id: string, name: string | undefined = undefined) => {
  switch (type) {
    case 'Suite':
      return new Suite(id, name || 'w-suite')
    case 'Ref':
      return new RefFrame(id, name || 'w-ref')
    case 'Data':
    default:
      return new DataFrame(id, name || 'w-data')
  }
}
