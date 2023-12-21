// Utilities
import { Session } from '@/types/session'
import { defineStore } from 'pinia'

export interface App {
  session: {
    currentSession: Session | undefined
  }
}

export const useAppStore = defineStore('app', {
  state: () => ({
    session: {
      currentSession: undefined
    }
  } as App),
})
