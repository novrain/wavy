import { Buffer } from 'buffer/'
import {
  Exclude,
  Expose,
  Type
} from 'class-transformer'
import 'reflect-metadata'
import { defaultId } from '../util/SnowflakeId'
import { BlocksComputer, ComputerTransformer, EmptyComputer } from './Computer'

export type UndefinableBuffer = Buffer | undefined

/**
 *  数据块类型
 */
export type BlockType = 'Ref' | 'Decimal' | 'Hex' | 'String' | 'Computed' | 'Delay' | 'Composite'

/**
 * 数据二次加工
 */
// 标准 | 重复
type DataProcessing = 'None' | 'Repeat'

/**
 * 字节序
 */
export type Endian = 'BigEndian' | 'LittleEndian'

export interface Block {
  tempIndex?: number,
  readonly id: string
  name: string
  encoding: string
  __type: BlockType
  encode(): UndefinableBuffer | any
  decode(raw: Buffer, offset: number): number
  toString(): string
  clone(withIdentify: boolean): Block
  // get value(): any
  get type(): BlockType
}

export type UndefinableBlock = Block | undefined

type PadSide = 'End' | 'Start'

/** 数据块接口 */
export interface DataBlock extends Block {
  readonly strValue: string
  // value: number | string | Buffer
  padToLength: number
  padSide: PadSide
  pad: number | string
}

const isBigEndian = (v: Endian): boolean => {
  return v === "BigEndian"
}

type DecimalNumberType = 'UInt8' | 'Int8' | 'UInt16' | 'Int16' | 'UInt32' | 'Int32' | 'UInt64' | 'Int64' | 'Float' | 'Double'

/**
 * 数值型可以转换的数据传输编码类型
 */
//  十六进制 | BCD | ascii
type DecimalEncoding = 'hex' | 'BCD(8421)' | 'ascii'

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

/**
 * Decimal Data Block
 */
export class DecimalBlock implements DataBlock {

  __type: BlockType = 'Decimal'

  @Exclude()
  _value: number | bigint = 0
  strValue: string
  tempIndex?: number

  constructor(
    readonly id: string,
    public name: string,
    value: number | bigint = 0,
    public numberType: DecimalNumberType = 'Int8',
    public endian: Endian = 'BigEndian',
    public encoding: DecimalEncoding = 'hex',
    public padToLength: number = 1,
    public padSide: PadSide = 'Start',
    public pad: number | string = 0
  ) {
    this._value = value || this._value
    this.strValue = this._value + ''
  }

  get type(): BlockType {
    return this.__type
  }

  set value(v: number | bigint) {
    this._value = v || 0
    this.strValue = this._value + ''
  }

  @Expose()
  get value(): number | bigint {
    return this._value
  }

  get numberLength(): number {
    switch (this.numberType) {
      case 'Float':
        return 4
      case 'Double':
        return 8
      case 'Int8':
      case 'UInt8':
        return 1
      case 'UInt16':
      case 'Int16':
        return 2
      case 'UInt32':
      case 'Int32':
        return 4
      case 'UInt64':
      case 'Int64':
        return 8
    }
  }

  encode(): UndefinableBuffer {
    let v = this._value
    switch (this.encoding) {
      case 'hex':
        {
          let numberLength = this.numberLength
          let size = Math.max(numberLength, this.padToLength)
          let padLength = size - numberLength
          let buff = Buffer.alloc(size)
          let isBE = isBigEndian(this.endian)
          let fn: any = undefined
          switch (this.numberType) {
            case 'Int8':
            case 'Int16':
            case 'Int32':
              fn = isBE ? buff.writeIntBE : buff.writeIntLE
              break
            case 'UInt8':
            case 'UInt16':
            case 'UInt32':
              fn = isBE ? buff.writeUIntBE : buff.writeUIntLE
              break
            case 'Int64':
              v = BigInt(v)
              fn = isBE ? buff.writeBigInt64BE : buff.writeBigInt64LE
              break
            case 'UInt64':
              v = BigInt(v)
              fn = isBE ? buff.writeBigUInt64BE : buff.writeBigUInt64LE
              break
            case 'Float':
              fn = isBE ? buff.writeFloatBE : buff.writeFloatLE
              break
            case 'Double':
              fn = isBE ? buff.writeDoubleBE : buff.writeDoubleLE
              break
          }
          fn = fn.bind(buff)
          let pad = Number(this.pad) & 0xFF // can only pad byte
          if (this.padSide === 'End') {
            fn(v, 0, numberLength)
            if (padLength > 0) {
              for (let i = numberLength + 1; i < size; i++) {
                buff.writeInt8(pad, i)
              }
            }
          } else {
            if (padLength > 0) {
              for (let i = 0; i < padLength; i++) {
                buff.writeInt8(pad, i)
              }
            }
            fn(v, padLength, numberLength)
          }
          return buff
        }
      case 'ascii':
        {
          let v = this.strValue
          let pad = this.pad + ''
          if (this.padSide === 'End') {
            v = v.padEnd(this.padToLength, pad)
          } else {
            v = v.padStart(this.padToLength, pad)
          }
          let buff = Buffer.alloc(v.length)
          buff.write(v, 0, v.length, 'ascii')
          return buff
        }
      default:
        return undefined
    }
  }

  decode(raw: Buffer, offset: number): number {
    throw new Error('Method not implemented.')
  }

  toString(): string {
    return this.encode()?.toString(this.encoding) || 'Oops, Encode Error!'
  }

  clone(withIdentify: boolean = false): Block {
    let clone = new DecimalBlock(
      withIdentify ? this.id : defaultId.nextId() + '',
      this.name,
      this.value,
      this.numberType,
      this.endian,
      this.encoding,
      this.padToLength,
      this.padSide,
      this.pad
    )
    if (withIdentify) {
      clone.tempIndex = this.tempIndex
    }
    return clone
  }
}

//  十六进制 | base64 | ascii
type StringEncoding = 'hex' | 'base64' | 'ascii'

/**
 * String Data Block
 */
export class StringBlock implements DataBlock {
  // @Expose({ name: 'type' })
  __type: BlockType = 'String'
  strValue: string = '0'
  tempIndex?: number

  constructor(
    readonly id: string,
    public name: string,
    value: string = '0',
    public encoding: StringEncoding = 'ascii',
    public endian: Endian = 'BigEndian',
    public padToLength: number = 1,
    public padSide: PadSide = 'Start',
    public pad: number | string = 0
  ) {
    this.strValue = value
  }

  get type(): BlockType {
    return this.__type
  }

  set value(v: string) {
    if (v === undefined) {
      return
    }
    this.strValue = v || ''
  }

  @Expose()
  get value(): string {
    return this.strValue
  }

  encode(): UndefinableBuffer {
    let v = this.strValue
    let pad = this.pad + ''
    if (this.padSide === 'End') {
      v = v.padEnd(this.padToLength, pad)
    } else {
      v = v.padStart(this.padToLength, pad)
    }
    let buff = Buffer.from(v, this.encoding)
    return buff
  }

  decode(raw: Buffer, offset: number): number {
    throw new Error('Method not implemented.')
  }

  toString(): string {
    return this.encode()?.toString(this.encoding) || 'Oops, Encode Error!'
  }

  clone(withIdentify: boolean = false): Block {
    let clone = new StringBlock(
      withIdentify ? this.id : defaultId.nextId() + '',
      this.name,
      this.value,
      this.encoding,
      this.endian,
      this.padToLength,
      this.padSide,
      this.pad
    )
    if (withIdentify) {
      clone.tempIndex = this.tempIndex
    }
    return clone
  }
}

export class DelayBlock implements Block {
  tempIndex?: number
  encoding: string = 'none'
  // @Expose({ name: 'type' })
  __type: BlockType = 'Delay'
  @Exclude()
  _value: number

  constructor(
    readonly id: string,
    public name: string,
    value: number = 0,
    public unit: 'ms' | 's' = 'ms',
  ) {
    this._value = value
  }

  @Expose()
  get value(): number {
    return this._value
  }

  set value(v: number) {
    this._value = v
  }

  encode(): number {
    return this.unit === 's' ? this._value * 1000 : this._value * 1
  }

  decode(raw: Buffer, offset: number): number {
    throw new Error('Method not implemented.')
  }

  toString(): string {
    return this.encode() + this.unit
  }

  clone(withIdentify: boolean = false): Block {
    let clone = new DelayBlock(
      withIdentify ? this.id : defaultId.nextId() + '',
      this.name,
      this.value,
      this.unit
    )
    if (withIdentify) {
      clone.tempIndex = this.tempIndex
    }
    return clone
  }

  get type(): BlockType {
    return this.__type
  }
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

const LocalBlockTransformer = Type(() => Object, {
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

export class CompositeBlock implements BlocksContainer, Block {
  tempIndex?: number
  __type: BlockType = 'Composite'
  @Expose({ name: 'blocks' })
  @LocalBlockTransformer
  _blocks: Block[] = []
  @Exclude()
  _blocksContainer?: BlocksContainer
  encoding: string = 'hex'

  constructor(
    readonly id: string,
    public name: string,
    blocks?: Block[],
    blocksContainer?: BlocksContainer
  ) {
    if (blocks) {
      this._blocks = blocks
    }
    this._blocksContainer = blocksContainer
  }

  get type(): BlockType {
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
      (block as RefBlock).blocksContainer = this._blocksContainer
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

  set blocksContainer(v: BlocksContainer | undefined) {
    this._blocksContainer = v
  }

  get blocksContainer(): BlocksContainer | undefined {
    return this._blocksContainer
  }

  injectContainerToRef(): void {
    if (this._blocksContainer) {
      let p = this._blocksContainer
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

  clone(withIdentify: boolean = false): Block {
    let cloned = new CompositeBlock(
      withIdentify ? this.id : defaultId.nextId() + '',
      this.name
    )
    if (withIdentify) {
      cloned.tempIndex = this.tempIndex
    }
    cloned._blocks = this._blocks.map(b => b.clone(withIdentify))
    cloned._blocksContainer = this._blocksContainer
    cloned.injectContainerToRef()
    return cloned
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
      { value: CompositeBlock, name: 'Composite' },
    ],
  },
})

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
    case 'Composite':
      return new CompositeBlock(id, name || 'c-block')
    case 'String':
    default:
      return new StringBlock(id, name || 's-block')
  }
}