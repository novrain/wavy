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
  BlockType,
  DecimalBlock,
  DelayBlock,
  Endian,
  StringBlock,
  UndefinableBlock,
  UndefinableBuffer
} from './Block'
import { BlocksComputer, ComputerTransformer, EmptyComputer } from './Computer'

export interface BlocksContainer {
  replaceBlock(oldBlock: number, newBlock: Block): void
  replaceBlock(oldBlock: Block, newBlock: Block): void
  replaceBlock(oldBlock: Block | number, newBlock: Block): void

  addBlock(block: Block, after: number | undefined): void

  deleteBlock(block: number): void
  deleteBlock(block: Block): void
  deleteBlock(block: Block | number): void

  findBlock(id: string): UndefinableBlock

  removeAllBlock(): void

  get blocks(): Block[]
}

export class RefBlock implements Block {
  // @Expose({ name: 'type' })
  __type: BlockType = 'Ref'
  @Exclude()
  _block?: Block
  @Expose({ name: 'refId' })
  _refId?: string
  @Exclude()
  _blocksContainer?: BlocksContainer
  tempIndex?: number

  constructor(
    readonly id: string,
    public name: string,
    refId?: string,
    blocksContainer?: BlocksContainer
  ) {
    this._refId = refId
    this._blocksContainer = blocksContainer
  }

  get type(): BlockType {
    return this.__type
  }

  get encoding(): string {
    this.block
    if (this.block) {
      return this.block.encoding
    } else {
      return 'unknown'
    }
  }

  set blocksContainer(v: BlocksContainer | undefined) {
    this._blocksContainer = v
  }

  get blocksContainer(): BlocksContainer | undefined {
    return this._blocksContainer
  }

  set refId(v: string) {
    this._refId = v
  }

  get refId(): string | undefined {
    return this._refId
  }

  get block(): UndefinableBlock {
    if (this._blocksContainer && this._refId) {
      this._block = this._blocksContainer.findBlock(this._refId)
    }
    return this._block
  }

  encode(): UndefinableBuffer {
    this.block
    if (this._block) {
      return this._block.encode()
    } else {
      return undefined
    }
  }

  decode(raw: Buffer, offset: number): number {
    this.block
    if (this._block) {
      return this._block.decode(raw, offset)
    } else {
      return 0
    }
  }

  toString(): string {
    this.block
    if (this._block) {
      return this._block.toString()
    } else {
      return 'Oops, Ref Error!'
    }
  }

  clone(withIdentify: boolean = false): Block {
    let clone = new RefBlock(
      withIdentify ? this.id : defaultId.nextId() + '',
      this.name,
      this.refId,
      this._blocksContainer
    )
    if (withIdentify) {
      clone.tempIndex = this.tempIndex
    }
    return clone
  }
}

export interface RefIdsContainer {
  replaceRefId(oldRefId: number, newRefId: string): void
  replaceRefId(oldRefId: string, newRefId: string): void
  replaceRefId(oldRefId: string | number, newRefId: string): void

  addRefId(refId: string, after: number | undefined): void

  deleteRefId(refId: number): void
  deleteRefId(refId: string): void
  deleteRefId(refId: string | number): void

  removeAllRefId(): void

  set refIds(value: string[])
  get refIds(): string[]
}


export class ComputedBlock implements Block, RefIdsContainer {
  // @Expose({ name: 'type' })
  __type: BlockType = 'Computed'
  @Exclude()
  _blocks: Block[] = []
  @Expose({ name: 'refIds' })
  _refIds: string[] = []
  @Exclude()
  _blocksContainer?: BlocksContainer
  @Expose({ name: 'blocksComputer' })
  @ComputerTransformer
  _blocksComputer: BlocksComputer
  tempIndex?: number

  constructor(
    readonly id: string,
    public name: string,
    blocksComputer: BlocksComputer,
    public endian: Endian = 'BigEndian',
    blocksContainer?: BlocksContainer
  ) {
    this._blocksContainer = blocksContainer
    this._blocksComputer = blocksComputer
  }

  get type(): BlockType {
    return this.__type
  }

  get encoding(): string {
    return this._blocksComputer.type
  }

  public get blocksComputer(): BlocksComputer {
    return this._blocksComputer
  }

  public set blocksComputer(value: BlocksComputer) {
    this._blocksComputer = value
  }

  public get blocksContainer(): BlocksContainer | undefined {
    return this._blocksContainer
  }

  public set blocksContainer(value: BlocksContainer) {
    this._blocksContainer = value
  }

  get blocks(): Block[] {
    return this._blocks
  }

  set blocks(values: Block[]) {
    this._blocks = values
    this.refIds = this._blocks.map(b => b.id)
  }

  replaceRefId(oldRefId: number, newRefId: string): void
  replaceRefId(oldRefId: string, newRefId: string): void
  replaceRefId(oldRefId: string | number, newRefId: string): void {

  }

  addRefId(refId: string, after: number | undefined): void { }

  deleteRefId(refId: number): void
  deleteRefId(refId: string): void
  deleteRefId(refId: string | number): void { }

  removeAllRefId(): void { }


  set refIds(values: string[]) {
    this._refIds = values
    if (this._blocksContainer && this._refIds.length > 0) {
      this._blocks = this._refIds.map(i => this._blocksContainer?.findBlock(i)) as Block[]
    }
  }

  get refIds(): string[] {
    return this._refIds
  }

  encode(): UndefinableBuffer {
    this.blocks
    if (this._blocks && this._blocks.length > 0) {
      return this._blocksComputer.computer(this._blocks, this.endian)
    }
    else {
      return undefined
    }
  }

  decode(raw: Buffer, offset: number): number {
    throw new Error('Method not implemented.')
  }

  toString(): string {
    const code = this.encode()
    if (code) {
      return code.toString('hex')
    }
    return 'Oops, Ref Error!'
  }

  clone(withIdentify: boolean = false): Block {
    let clone = new ComputedBlock(
      withIdentify ? this.id : defaultId.nextId() + '',
      this.name,
      this._blocksComputer,
      this.endian,
      this._blocksContainer
    )
    clone.refIds = this._refIds
    if (withIdentify) {
      clone.tempIndex = this.tempIndex
    }
    return clone
  }
}

export const BlockTransformer = Type(() => Object, {
  discriminator: {
    property: '__type',
    subTypes: [
      { value: RefBlock, name: 'Ref' },
      { value: DecimalBlock, name: 'Decimal' },
      { value: StringBlock, name: 'String' },
      { value: DelayBlock, name: 'Delay' },
      { value: ComputedBlock, name: 'Computed' },
    ],
  },
})

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

export const createBlock = (type: BlockType, id: string, name: string | undefined = undefined) => {
  switch (type) {
    case 'Computed':
      return new ComputedBlock(id, name || 'c-block', new EmptyComputer())
    case 'Ref':
      return new RefBlock(id, name || 'r-block')
    case 'Decimal':
      return new DecimalBlock(id, name || 'd-block')
    case 'Delay':
      return new DelayBlock(id, name || 'd-block')
    case 'String':
    default:
      return new StringBlock(id, name || 's-block')
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