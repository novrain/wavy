import { FrameProject } from '@W/frame/FrameProject'
import { Project, ProjectType } from '@W/types/project'
import BitSet from '@W/util/BitSet'
import SnowflakeId from '@W/util/SnowflakeId'
import { defineStore } from 'pinia'

const tempIndexSet = new BitSet(100)
const idGenerator = new SnowflakeId({})

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [] as Project[]
  }),
  actions: {
    newProject(type: ProjectType, closeable: boolean = true): Project {
      const tempIndex = tempIndexSet.nextClearBit(0)
      const id = idGenerator.nextId().toString()
      const name = `project-${tempIndex}`
      const project = {
        id: id,
        type: type,
        dirty: false,
        index: this.projects.length,
        tempIndex: tempIndex,
        name: name,
        closeable: closeable,
        project: new FrameProject(id, name)
      }
      this.addProject(project)
      return project
    },
    addProject(project: Project) {
      if (project.tempIndex === undefined) {
        project.tempIndex = tempIndexSet.nextClearBit(0)
        tempIndexSet.set(project.tempIndex)
      }
      if (project.index === undefined) {
        project.index = this.projects.length
      }
      if (!project.name) {
        project.name = `project-${project.tempIndex}`
      }
      this.projects.push(project)
    },
    closeProject(project: Project) {
      if (project.tempIndex !== undefined) {
        tempIndexSet.clear(project.tempIndex)
      }
      this.projects = this.projects.filter(s => {
        return !(s.id === project.id)
      })
    },
    setProjectName(project: Project, name: string) {
      const s = this.projects.find(s => {
        return (s.id === project.id)
      })
      if (s) {
        s.name = name
      }
    }
  }
})
