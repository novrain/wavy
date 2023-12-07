export default class BitSet {
  private size: number
  private words: Uint32Array

  constructor(size: number) {
    this.size = size
    this.words = new Uint32Array(Math.ceil(size / 32))
  }

  set(bitIndex: number): void {
    if (bitIndex < 0 || bitIndex >= this.size) {
      throw new Error('Index out of bounds')
    }

    const wordIndex = bitIndex >>> 5 // Equivalent to bitIndex / 32
    const bitOffset = bitIndex & 31  // Equivalent to bitIndex % 32
    this.words[wordIndex] |= (1 << bitOffset)
  }

  clear(bitIndex: number): void {
    if (bitIndex < 0 || bitIndex >= this.size) {
      throw new Error('Index out of bounds')
    }

    const wordIndex = bitIndex >>> 5
    const bitOffset = bitIndex & 31
    this.words[wordIndex] &= ~(1 << bitOffset)
  }

  get(bitIndex: number): boolean {
    if (bitIndex < 0 || bitIndex >= this.size) {
      throw new Error('Index out of bounds')
    }

    const wordIndex = bitIndex >>> 5
    const bitOffset = bitIndex & 31
    return (this.words[wordIndex] & (1 << bitOffset)) !== 0
  }

  clearAll(): void {
    this.words.fill(0)
  }

  toString(): string {
    const binaryString = this.words.reduce((acc, word) => {
      return acc + word.toString(2).padStart(32, '0')
    }, '')
    return binaryString.substring(0, this.size)
  }

  nextSetBit(fromIndex: number): number {
    for (let i = fromIndex; i < this.size; i++) {
      if (this.get(i)) {
        return i
      }
    }
    return -1
  }

  nextClearBit(fromIndex: number): number {
    for (let i = fromIndex; i < this.size; i++) {
      if (!this.get(i)) {
        return i
      }
    }
    return -1
  }

  and(otherBitSet: BitSet): void {
    const newSize = Math.min(this.size, otherBitSet.size)
    for (let i = 0; i < newSize; i++) {
      this.words[i] &= otherBitSet.words[i]
    }
  }


  // Performs a logical AND NOT operation on this BitSet.
  andNot(otherBitSet: BitSet): void {
    const newSize = Math.min(this.size, otherBitSet.size)
    for (let i = 0; i < newSize; i++) {
      if (otherBitSet.get(i)) {
        this.clear(i)
      }
    }
  }

  // Returns a new BitSet that is a copy of this BitSet.
  clone(): BitSet {
    const clonedBitSet = new BitSet(this.size)
    clonedBitSet.words.set(this.words)
    return clonedBitSet
  }

  // Returns a Boolean indicating whether this BitSet is equal to another BitSet.
  equals(otherBitSet: BitSet): boolean {
    if (this.size !== otherBitSet.size) {
      return false
    }

    for (let i = 0; i < this.words.length; i++) {
      if (this.words[i] !== otherBitSet.words[i]) {
        return false
      }
    }

    return true
  }

  // Returns an array of set bit indices in ascending order.
  toArray(): number[] {
    const setBits: number[] = []
    for (let i = 0; i < this.size; i++) {
      if (this.get(i)) {
        setBits.push(i)
      }
    }
    return setBits
  }

  // Performs a logical NOT operation on this BitSet.
  flipAll(): void {
    for (let i = 0; i < this.size; i++) {
      this.flip(i)
    }
  }

  or(otherBitSet: BitSet): void {
    const newSize = Math.min(this.size, otherBitSet.size)
    for (let i = 0; i < newSize; i++) {
      this.words[i] |= otherBitSet.words[i]
    }
  }

  xor(otherBitSet: BitSet): void {
    const newSize = Math.min(this.size, otherBitSet.size)
    for (let i = 0; i < newSize; i++) {
      this.words[i] ^= otherBitSet.words[i]
    }
  }

  flip(bitIndex: number): void {
    if (bitIndex < 0 || bitIndex >= this.size) {
      throw new Error('Index out of bounds')
    }

    const wordIndex = bitIndex >>> 5
    const bitOffset = bitIndex & 31
    this.words[wordIndex] ^= (1 << bitOffset)
  }

  getRange(fromIndex: number, toIndex: number): BitSet {
    if (fromIndex < 0 || fromIndex >= this.size || toIndex < 0 || toIndex > this.size || fromIndex >= toIndex) {
      throw new Error('Invalid range')
    }

    const newBitSet = new BitSet(toIndex - fromIndex)
    for (let i = fromIndex; i < toIndex; i++) {
      if (this.get(i)) {
        newBitSet.set(i - fromIndex)
      }
    }
    return newBitSet
  }
}
