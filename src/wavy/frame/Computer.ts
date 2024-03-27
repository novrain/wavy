import { Buffer } from 'buffer/'
import { Type } from 'class-transformer'
import { Block, Endian, UndefinableBuffer } from './Block'
import crc16 from 'crc/calculators/crc16'

export interface BlocksComputer {
  type: string
  computer(blocks: Block[], endian: Endian): UndefinableBuffer
}

export type ComputerType = 'Empty' | 'CRC16'

export class EmptyComputer implements BlocksComputer {
  __type: ComputerType = 'Empty'

  constructor() {

  }

  get type(): string {
    return this.__type
  }

  computer(blocks: Block[], endian: Endian): UndefinableBuffer {
    return new Buffer('')
  }
}

export class CRC16Computer implements BlocksComputer {
  __type: ComputerType = 'CRC16'

  constructor() {

  }

  get type(): string {
    return this.__type
  }

  computer(blocks: Block[], endian: Endian): UndefinableBuffer {
    const buffers = []
    for (let i = 0; i < blocks.length; i++) {
      let bI = blocks[i].encode()
      if (bI) {
        buffers.push(bI)
      } else {
        return undefined
      }
    }
    const res = Buffer.alloc(2)
    const resBuffer = Buffer.concat(buffers)
    const crcNumber = crc16(resBuffer)
    endian === 'BigEndian' ? res.writeUInt16BE(crcNumber, 0) : res.writeUInt16LE(crcNumber, 0)
    return res
  }
}

export const ComputerTransformer = Type(() => Object, {
  discriminator: {
    property: '__type',
    subTypes: [
      { value: EmptyComputer, name: 'Empty' },
      { value: CRC16Computer, name: 'CRC16' },
    ],
  },
})

export const createComputer = (type: ComputerType) => {
  switch (type) {
    case 'CRC16':
      return new CRC16Computer()
    case 'Empty':
    default:
      return new EmptyComputer()
  }
}
