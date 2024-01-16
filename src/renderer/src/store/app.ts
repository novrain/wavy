// Utilities
import { Project } from '@W/types/project'
import { Session } from '@/types/session'
import { instanceToPlain } from 'class-transformer'
import { defineStore } from 'pinia'

export interface App {
  session: {
    currentSession: Session | undefined
  },
  project: {
    currentProject: Project | undefined
  },
  platform: string | undefined
}

export const useAppStore = defineStore('app', {
  state: () => ({
    session: {
      currentSession: undefined
    },
    project: {
      currentProject: undefined
    },
    platform: undefined
  } as App),
  actions: {
    saveCurrentProject(project: Project | undefined = undefined) {
      const projectCls = project || this.project.currentProject
      if (projectCls) {
        if (!projectCls.path || !projectCls.name) {
          this.saveCurrentProjectAs()
          return
        }
        const project = instanceToPlain(projectCls, { excludePrefixes: ['tempIndex', 'index', 'closable', 'dirty', 'path'] })
        window.projectService.saveProject(JSON.stringify(project), projectCls.name, projectCls.path).then(r => {
          if (!r.result) {
          }
        })
      }
    },
    saveCurrentProjectAs(project: Project | undefined = undefined) {
      const projectCls = project || this.project.currentProject
      if (projectCls) {
        const project = instanceToPlain(projectCls, { excludePrefixes: ['tempIndex', 'index', 'closable', 'dirty', 'path'] })
        window.projectService.saveProjectAs(JSON.stringify(project), projectCls.name, projectCls.path).then(r => {
          if (!r.canceled) {
            projectCls.name = r.name
            projectCls.path = r.path
          }
        })
      }
    }
  }
})
