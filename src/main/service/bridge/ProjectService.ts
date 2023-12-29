import { ipcRenderer } from "electron"

export default {
  openProject(): Promise<{ canceled: boolean, result: boolean, project?: string, name?: string, path?: string }> {
    return ipcRenderer.invoke('project:openProject')
  },
  saveProject(project: string, name: string, path: string): Promise<{ result: boolean }> {
    return ipcRenderer.invoke('project:saveProject', project, name, path)
  },
  saveProjectAs(project: string, name?: string, path?: string): Promise<{ canceled: boolean, result: boolean, name?: string, path?: string }> {
    return ipcRenderer.invoke('project:saveProjectAs', project, name, path)
  }
}
