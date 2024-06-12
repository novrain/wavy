import { Block } from '../frame/Block'
import { Frame, Suite, WavyItem } from '../frame/Frame'
import { FrameProject } from '../frame/FrameProject'
import { AbstractSession as Session } from '../types/session'

export interface Executor {
  executeBlockToSession: (session: Session, block: Block) => Promise<any>
  executeBlocksToSession: (session: Session, blocks: Block[]) => Promise<any>
  executeBlockToSessions: (session: Session[], block: Block) => Promise<any>
  executeBlocksToSessions: (session: Session[], blocks: Block[]) => Promise<any>
  // project 
  executeFrameToSession: (session: Session, frame: Frame) => Promise<any>
  executeFrameToSessions: (sessions: Session[], frame: Frame) => Promise<any>
  executeSuiteToSession: (session: Session, suite: Suite) => Promise<any>
  executeSuiteToSessions: (sessions: Session[], suite: Suite) => Promise<any>
  executeWavyItemToSession: (session: Session, wavyItem: WavyItem) => Promise<any>
  executeWavyItemToSessions: (sessions: Session[], wavyItem: WavyItem) => Promise<any>
  executeProjectToSession: (session: Session, project: FrameProject) => Promise<any>
  executeProjectToSessions: (sessions: Session[], project: FrameProject) => Promise<any>
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
    return await session.sendBlock(block.deRefClone(true), true)
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

  // project 
  executeFrameToSession = async (session: Session, frame: Frame): Promise<any> => {
    await delay(frame.preDelay)
    const res = await session.sendFrame(frame.deRefClone(true) as Frame, true)
    await delay(frame.postDelay)
    return res
  }

  executeFrameToSessions = async (sessions: Session[], frame: Frame): Promise<any> => {
    const promises: Promise<any>[] = []
    for (const s of sessions) {
      promises.push(this.executeFrameToSession(s, frame))
    }
    return Promise.all(promises)
  }

  executeWavyItemToSession = async (session: Session, wavyItem: WavyItem) => {
    switch (wavyItem.__type) {
      case 'Data':
      case 'Ref':
        await this.executeFrameToSession(session, wavyItem as Frame)
        break
      case 'Suite':
        await this.executeSuiteToSession(session, wavyItem as Suite)
        break
    }
  }

  executeWavyItemToSessions = async (sessions: Session[], wavyItem: WavyItem): Promise<any> => {
    const promises: Promise<any>[] = []
    for (const s of sessions) {
      promises.push(this.executeWavyItemToSession(s, wavyItem))
    }
    return Promise.all(promises)
  }

  executeSuiteToSession = async (session: Session, suite: Suite): Promise<any> => {
    const wavyItems = suite.wavyItems
    for (const wavyItem of wavyItems) {
      await this.executeWavyItemToSession(session, wavyItem)
    }
  }

  executeSuiteToSessions = async (sessions: Session[], suite: Suite): Promise<any> => {
    const promises: Promise<any>[] = []
    for (const s of sessions) {
      promises.push(this.executeSuiteToSession(s, suite))
    }
    return Promise.all(promises)
  }

  executeProjectToSession = async (session: Session, project: FrameProject): Promise<any> => {
    project.injectContainerToRef()
    const wavyItems = project.wavyItems
    for (const wavyItem of wavyItems) {
      await this.executeWavyItemToSession(session, wavyItem)
    }
  }

  executeProjectToSessions = async (sessions: Session[], project: FrameProject): Promise<any> => {
    const promises: Promise<any>[] = []
    for (const s of sessions) {
      promises.push(this.executeProjectToSession(s, project))
    }
    return Promise.all(promises)
    // for (const s of sessions) {
    //   await this.executeProjectToSession(s, project)
    // }
  }
}