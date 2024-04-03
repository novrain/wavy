import RawSerialPortSession, { Session, TCPClientSession } from '@/types/session'
import { SessionOptions, SessionType, createDefaultSerialOptions, createDefaultTCPClientOptions } from '@W/types/session'
import BitSet from '@W/util/BitSet'
import SnowflakeId from '@W/util/SnowflakeId'
import { defineStore } from 'pinia'

const tempIndexSet = new BitSet(100)
const idGenerator = new SnowflakeId({})

const defaultOptions = (type: string): SessionOptions => {
  switch (type) {
    case 'TCPClient':
      return createDefaultTCPClientOptions()
    case 'Serial':
    default:
      return createDefaultSerialOptions()
  }
}

const createSession = (type: string): Session => {
  switch (type) {
    case 'TCPClient':
      return new TCPClientSession(idGenerator.nextId().toString(), defaultOptions(type))
    case 'Serial':
    default:
      return new RawSerialPortSession(idGenerator.nextId().toString(), defaultOptions(type))
  }
}

export const useSessionStore = defineStore('session', {
  state: () => ({
    sessions: []
  } as { sessions: Session[] }),
  actions: {
    newSession(type: SessionType): Session {
      const session = createSession(type)
      this.addSession(session)
      return session
    },
    addSession(session: Session) {
      if (session.tempIndex === undefined) {
        session.tempIndex = tempIndexSet.nextClearBit(0)
        tempIndexSet.set(session.tempIndex)
      }
      if (session.index === undefined) {
        session.index = this.sessions.length
      }
      if (!session.name) {
        session.name = `session-${session.tempIndex}`
      }
      this.sessions.push(session)
    },
    closeSession(session: Session) {
      if (session.tempIndex !== undefined) {
        tempIndexSet.clear(session.tempIndex)
      }
      this.sessions = this.sessions.filter(s => {
        return !(s.id === session.id)
      })
    },
    setSessionName(session: Session, name: string) {
      const s = this.sessions.find(s => {
        return (s.id === session.id)
      })
      if (s) {
        s.name = name
      }
    }
  }
})
