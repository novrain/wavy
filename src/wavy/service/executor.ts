import { Block } from '../frame/Block'
import { AbstractSession as Session } from '../types/session'

export interface Executor {
  executeBlockToSession: (session: Session, block: Block) => Promise<any>
  executeBlocksToSession: (session: Session, blocks: Block[]) => Promise<any>
  executeBlockToSessions: (session: Session[], block: Block) => Promise<any>
  executeBlocksToSessions: (session: Session[], blocks: Block[]) => Promise<any>
  stop(): void
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

export type ExecutorState = 'RUNNING' | 'IDLE' | 'STOPPING'

export class DefaultExecutor implements Executor {
  private _state: ExecutorState = 'IDLE'
  public get state(): ExecutorState {
    return this._state
  }

  constructor(

  ) {

  }

  stop(): void {
    throw new Error("Method not implemented.")
  }

  executeBlockToSession = async (session: Session, block: Block): Promise<any> => {
    if (block.type === 'Delay') {
      return await delay(block.encode())
    }
    const data = block.encode()
    if (data) {
      return await session.send(data, true, data.toString(block.encoding))
    }
  }

  executeBlockToSessions = async (sessions: Session[], block: Block): Promise<any> => {
    // const data = block.encode()
    // const promises: Promise<any>[] = []
    // if (data) {
    // sessions.forEach(s => {
    //   if (s.isConnected) {
    //     promises.push(this.executeBlockToSession(s, block))
    //   }
    // })
    // }
    // return Promise.all(promises)
    for (const s of sessions) {
      await this.executeBlockToSession(s, block)
    }
  }

  executeBlocksToSession = async (session: Session, blocks: Block[]): Promise<any> => {
    // const promises: Promise<any>[] = []
    // for (const block of blocks) {
    //   promises.push(this.executeBlockToSession(session, block))
    // }
    // return Promise.all(promises)
    for (const block of blocks) {
      await this.executeBlockToSession(session, block)
    }
  }

  executeBlocksToSessions = async (sessions: Session[], blocks: Block[]): Promise<any> => {
    const promises: Promise<any>[] = []
    for (const s of sessions) {
      promises.push(this.executeBlocksToSession(s, blocks))
    }
    return Promise.all(promises)
    // for (const s of sessions) {
    //   await this.executeBlocksToSession(s, blocks)
    // }
  }
}