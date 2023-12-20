import { Buffer } from 'buffer/'
import {
  Expose,
  Type
} from 'class-transformer'
import 'reflect-metadata'
import {
  Block,
  BlockType,
  DecimalBlock,
  StringBlock,
  UndefinableBlock,
  UndefinableBuffer
} from "./Block"
import { defaultId } from '../util/SnowflakeId'
import { FrameProject } from './FrameProject'

type UndefinableFrameProject = FrameProject | undefined

export class RefBlock implements Block {
  __type: BlockType = 'Ref'
  _block?: Block
  _refId?: string
  _project?: FrameProject

  constructor(
    readonly id: string,
    public name: string,
    refId?: string,
    project?: FrameProject
  ) {
    this._refId = refId
    this._project = project
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

  set project(v: UndefinableFrameProject) {
    this._project = v
  }

  get project(): UndefinableFrameProject {
    return this._project
  }

  set refId(v: string) {
    this._refId = v
  }

  get block(): UndefinableBlock {
    if (this._project && this._refId) {
      this._block = this._project.findBlock(this._refId)
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

  clone(): Block {
    let clone = new RefBlock(
      defaultId.nextId() + '',
      this.name,
      this.refId,
      this._project
    )
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
    ],
  },
})

type FrameType = 'Ref' | 'Data'

export interface WavyItem {
  readonly id: string
  name: string
  project?: FrameProject
  injectProjectToRef(): void
  clone(): WavyItem
}

export interface Frame extends WavyItem {
  encode(): UndefinableBuffer
  decode(raw: Buffer, offset: number): number
  decodeByResponse(raw: Buffer, offset: number): number
}

export type UndefinableFrame = Frame | undefined

export class RefFrame implements Frame {
  _frame?: Frame
  _project?: FrameProject

  @Expose({ name: 'refId' })
  _refId?: string

  constructor(
    readonly id: string,
    public name: string,
    refId?: string,
    project?: FrameProject
  ) {
    this._refId = refId
    this._project = project
  }

  set project(v: UndefinableFrameProject) {
    this._project = v
  }

  get project(): UndefinableFrameProject {
    return this._project
  }

  injectProjectToRef(): void {
  }

  set refId(v: string) {
    this._refId = v
  }

  get frame(): UndefinableFrame {
    if (this._project && this._refId) {
      let f = this._project.findFrame(this._refId)
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

  decodeByResponse(raw: Buffer, offset: number): number {
    this.frame
    if (this._frame) {
      return this._frame.decodeByResponse(raw, offset)
    } else {
      return 0
    }
  }

  clone(): Frame {
    let cloned = new RefFrame(
      defaultId.nextId() + '',
      this.refId,
      this.name,
      this._project
    )
    return cloned
  }
}

export class DataFrame implements Frame {
  @BlockTransformer
  blocks: Block[] = []
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
  _project?: FrameProject

  constructor(
    readonly id: string,
    public name: string,
    blocks?: Block[],
    responseFrame?: Frame,
    project?: FrameProject
  ) {
    if (blocks) {
      this.blocks = blocks
    }
    this._responseFrame = responseFrame
    this._project = project
  }

  addBlock(block: Block) {
    this.blocks.push(block)
  }

  set project(v: UndefinableFrameProject) {
    this._project = v
  }

  get project(): UndefinableFrameProject {
    return this._project
  }

  injectProjectToRef(): void {
    if (this._project) {
      let p = this._project
      this.blocks.forEach((b => {
        if (b instanceof RefBlock) {
          b.project = p
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
    let buffs = this.blocks.map(b => b.encode() || Buffer.alloc(0)) // @Todo 处理异常？
    return Buffer.concat(buffs)
  }

  decode(raw: Buffer, offset: number): number {
    throw new Error('Method not implemented.')
  }

  decodeByResponse(raw: Buffer, offset: number): number {
    return this.responseFrame.decode(raw, offset)
  }

  clone(): Frame {
    let cloned = new DataFrame(
      defaultId.nextId() + '',
      this.name
    )
    cloned.blocks = this.blocks.map(b => b.clone())
    if (this._responseFrame) {
      cloned._responseFrame = this._responseFrame.clone() as Frame
    }
    cloned._project = this._project
    cloned.injectProjectToRef()
    return cloned
  }
}

type WavyItemType = FrameType | 'Suite'

export class Suite implements WavyItem {
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
  @Expose({ name: 'frames' })
  _frames: WavyItem[] = []
  _project?: FrameProject

  constructor(
    readonly id: string,
    public name: string,
    frames?: WavyItem[],
    project?: FrameProject
  ) {
    if (frames) {
      this._frames = frames
      this._project = project
      this.injectProjectToRef()
    }
  }

  set project(v: UndefinableFrameProject) {
    this._project = v
    this.injectProjectToRef()
  }

  get project(): UndefinableFrameProject {
    return this._project
  }

  injectProjectToRef(): void {
    if (this._project) {
      this._frames.forEach((f => {
        f.project = this._project
      }))
    }
  }

  addFrame(frame: WavyItem): void {
    this._frames.push(frame)
  }

  clone(): WavyItem {
    let cloned = new Suite(
      defaultId.nextId() + '',
      this.name,
    )
    cloned._frames = this._frames.map(f => f.clone())
    cloned._project = this._project
    cloned.injectProjectToRef()
    return cloned
  }
}
