import {
  Expose,
  Type
} from 'class-transformer'
import 'reflect-metadata'
import { defaultId } from '../util/SnowflakeId'
import {
  Block,
  UndefinableBlock
} from './Block'
import {
  BlockTransformer,
  DataFrame,
  Frame,
  RefBlock,
  RefFrame,
  Suite,
  UndefinableFrame,
  WavyItem
} from "./Frame"

type UndefinableWavyItem = WavyItem | undefined

export class FrameProject {
  @Expose({ name: 'frames' })
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
  _frames: WavyItem[] = []
  @Expose({ name: 'blocks' })
  @BlockTransformer
  private _blocks: Block[] = []

  constructor(
    readonly id: string,
    public name: string,
    frames?: WavyItem[],
    blocks?: Block[]
  ) {
    if (frames) {
      this._frames = frames
    }
    if (blocks) {
      this._blocks = blocks
    }
    this.injectProjectToRef()
  }

  injectProjectToRef(): void {
    this._frames.forEach((f => {
      f.project = this
    }))
    this._blocks.forEach((b => {
      if (b instanceof RefBlock) {
        b.project = this
      }
    }))
  }

  public get blocks(): Block[] {
    return this._blocks
  }

  addFrame(frame: WavyItem): void {
    this._frames.push(frame)
  }

  findFrame(id: string): UndefinableFrame {
    let f = this._frames.find((f) => {
      return f.id === id
    })
    if (f instanceof Suite) {
      return undefined
    }
    return f as Frame
  }

  findWavyItem(id: string): UndefinableWavyItem {
    let f = this._frames.find((f) => {
      return f.id === id
    })
    return f
  }

  addBlock(block: Block, after: number | undefined = undefined): void {
    if (after !== undefined && after >= 0 && after < this._blocks.length) {
      this._blocks.splice(after, 0, block)
    } else {
      this._blocks.push(block)
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

  clone(): FrameProject {
    let cloned = new FrameProject(defaultId.nextId() + '', this.name)
    cloned._frames = this._frames.map(f => {
      return f.clone()
    })
    cloned._blocks = this._blocks.map(b => {
      return b.clone()
    })
    cloned.injectProjectToRef()
    return cloned
  }
}
