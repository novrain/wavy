// Utilities
import { createDefaultSerialOptions, Session, SessionOptions, SessionType } from '@W/types/session'
import BitSet from '@W/util/BitSet'
import SnowflakeId from '@W/util/SnowflakeId'
import { defineStore } from 'pinia'

const tempIndexSet = new BitSet(100)
const idGenerator = new SnowflakeId({})

const defaultOptions = (type: string): SessionOptions => {
  switch (type) {
    case 'Serial':
    default:
      return createDefaultSerialOptions()
  }
}

export const useSessionStore = defineStore('session', {
  state: () => ({
    sessions: [] as Session[]
  }),
  actions: {
    newSession(type: SessionType): Session {
      const session = {
        id: idGenerator.nextId().toString(),
        type: type,
        options: defaultOptions(type),
        dirty: false,
        index: this.sessions.length
      }
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
        session.name = `new-${session.tempIndex}`
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
    }
  }
})
