export default class SnowflakeId {
  static timeBitLen = 41n
  static dataCenterBitLen = 5n
  static maxDataCenterNo = -1n ^ (-1n << SnowflakeId.dataCenterBitLen)
  static workerBitLen = 5n
  static maxWorkerNo = -1n ^ (-1n << SnowflakeId.workerBitLen)
  static sequenceBitLen = 12n
  static sequenceMask = -1n ^ (-1n << SnowflakeId.sequenceBitLen)
  static timeShiftBitLen = SnowflakeId.dataCenterBitLen + SnowflakeId.workerBitLen + SnowflakeId.sequenceBitLen
  static dataCenterShiftBitLen = SnowflakeId.workerBitLen + SnowflakeId.sequenceBitLen
  static workerShiftBitLen = SnowflakeId.sequenceBitLen
  options: any = null
  epoch: bigint
  worker: bigint = 0n
  dataCenter: bigint
  lastTick: bigint
  sequence: bigint = 0n

  constructor(options: any) {
    this.options = options || {}
    const { epoch, dataCenter, worker } = this.options
    this.epoch = epoch || BigInt(Date.parse("2020-11-11T00:00:00Z")).valueOf()
    this.worker = worker || 0n
    if (this.worker < 0n || this.worker > SnowflakeId.maxWorkerNo) {
      throw 'Invalid Worker NO.'
    }
    this.dataCenter = dataCenter || 0n
    if (this.dataCenter < 0n || this.dataCenter > SnowflakeId.maxDataCenterNo) {
      throw 'Invalid Data Center NO.'
    }
    this.lastTick = this.epoch
    this.sequence = 0n
  }

  nextId() {
    let tick = BigInt(new Date().valueOf()).valueOf()
    if (tick < this.lastTick) {
      throw 'Are you a Time Traveler from the past?'
    }
    if (tick === this.lastTick) {
      this.sequence = (this.sequence + 1n) & SnowflakeId.sequenceMask
      if (this.sequence === 0n) {
        tick = this.nextTick()
      }
    } else {
      this.sequence = 0n
    }
    this.lastTick = tick
    return ((tick - this.epoch) << SnowflakeId.timeShiftBitLen)
      | (this.dataCenter << SnowflakeId.dataCenterShiftBitLen)
      | (this.worker << SnowflakeId.workerShiftBitLen)
      | this.sequence
  }

  nextTick(): bigint {
    let tick = BigInt(new Date().valueOf()).valueOf()
    while (tick <= this.lastTick) {
      tick = BigInt(new Date().valueOf()).valueOf()
    }
    return tick
  }
}

export const defaultId = new SnowflakeId({ worker: 1n, dataCenter: 1n })