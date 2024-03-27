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
  Container,
  DataFrame,
  Frame,
  RefBlock,
  RefFrame,
  Suite,
  UndefinableFrame,
  UndefinableWavyItem,
  WavyItem
} from './Frame'

export class FrameProject implements Container {
  @Expose({ name: 'wavyItems' })
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
  _wavyItems: WavyItem[] = []
  @Expose({ name: 'blocks' })
  @BlockTransformer
  _blocks: Block[] = []

  constructor(
    readonly id: string,
    public name: string,
    wavyItems?: WavyItem[],
    blocks?: Block[]
  ) {
    if (wavyItems) {
      this._wavyItems = wavyItems
    }
    if (blocks) {
      this._blocks = blocks
    }
    this.injectContainerToRef()
  }

  injectContainerToRef(): void {
    this._wavyItems.forEach((f => {
      f.container = this
      f.injectContainerToRef()
    }))
    this._blocks.forEach((b => {
      if (b instanceof RefBlock) {
        b.blocksContainer = this
      }
    }))
  }

  public get blocks(): Block[] {
    return this._blocks
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

  addFrame(frame: WavyItem): void {
    this._wavyItems.push(frame)
  }

  addWavyItem(wavyItem: WavyItem): void {
    this._wavyItems.push(wavyItem)
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

  addBlock(block: Block, after: number | undefined = undefined): void {
    if (after !== undefined && after >= 0 && after < this._blocks.length) {
      this._blocks.splice(after, 0, block)
    } else {
      this._blocks.push(block)
    }
    if (block.__type === 'Ref') {
      (block as RefBlock).blocksContainer = this
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

  clone(withIdentify: boolean): FrameProject {
    let cloned = new FrameProject(withIdentify ? this.id : defaultId.nextId() + '', this.name)
    cloned._wavyItems = this._wavyItems.map(f => {
      return f.clone(withIdentify)
    })
    cloned._blocks = this._blocks.map(b => {
      return b.clone(withIdentify)
    })
    cloned.injectContainerToRef()
    return cloned
  }
}
