import { Buffer } from 'buffer/'
import { Type } from 'class-transformer'
import crc16 from 'crc/calculators/crc16'
import { Block, Endian, UndefinableBuffer } from './Block'

export interface BlocksComputer {
  type: string
  computer(blocks: Block[], endian: Endian): UndefinableBuffer
}

export type ComputerType = 'Empty' | 'CRC16' | 'Sum8Modulo256'

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

export class Sum8Modulo256 implements BlocksComputer {
  __type: ComputerType = 'Sum8Modulo256'

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
    const resBuffer = Buffer.concat(buffers)
    let sum8 = 0
    for (let index = 0; index < resBuffer.length; index++) {
      sum8 += resBuffer[index]
    }
    sum8 = sum8 % 256
    const res = Buffer.alloc(1)
    res.writeUInt8(sum8, 0)
    return res
  }
}

export const ComputerTransformer = Type(() => Object, {
  discriminator: {
    property: '__type',
    subTypes: [
      { value: EmptyComputer, name: 'Empty' },
      { value: CRC16Computer, name: 'CRC16' },
      { value: Sum8Modulo256, name: 'Sum8Modulo256' },
    ],
  },
})

export const createComputer = (type: ComputerType) => {
  switch (type) {
    case 'Sum8Modulo256':
      return new Sum8Modulo256()
    case 'CRC16':
      return new CRC16Computer()
    case 'Empty':
    default:
      return new EmptyComputer()
  }
}
