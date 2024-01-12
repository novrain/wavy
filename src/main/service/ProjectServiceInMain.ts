import { dialog, ipcMain } from "electron"
import { BrowserWindow } from "electron/main"
import fs from 'fs'
import nPath from 'path'

export default class ProjectServiceInMain {
  private _window?: BrowserWindow | undefined
  public get window(): BrowserWindow | undefined {
    return this._window
  }
  public set window(value: BrowserWindow | undefined) {
    this._window = value
  }

  constructor() {
    ipcMain.handle('project:openProject', this.openProject)
    ipcMain.handle('project:saveProject', this.saveProject)
    ipcMain.handle('project:saveProjectAs', this.saveProjectAs)
    ipcMain.handle('project:saveTextAs', this.saveTextAs)
  }

  openProject = (event: Electron.IpcMainInvokeEvent): Promise<{ canceled: boolean, result: boolean, project?: string, name?: string, path?: string }> => {
    return new Promise((resolve, reject) => {
      const options = {
        filters: [
          {
            name: 'Wavy Project', extensions: ['wproj']
          }
        ],
        properties: ['openFile'] as any
      }
      let promise = undefined
      if (this._window) {
        promise = dialog.showOpenDialog(this._window, options)
      } else {
        promise = dialog.showOpenDialog(options)
      }
      promise.then(r => {
        if (!r.canceled && r.filePaths && r.filePaths.length > 0) {
          const file = r.filePaths[0]
          const dirname = nPath.dirname(file)
          const fileName = nPath.basename(file, '.wproj')
          const project = fs.readFileSync(file)
          resolve({ canceled: false, result: true, project: project.toString('utf8'), path: dirname, name: fileName })
        } else {
          resolve({ canceled: true, result: false })
        }
      })
    })
  }

  saveProject = (event: Electron.IpcMainInvokeEvent,
    project: string,
    name: string,
    path: string): Promise<{ result: boolean }> => {
    return new Promise((resolve, reject) => {
      const file = nPath.join(path, name + '.wproj')
      fs.writeFileSync(file, project)
      resolve({ result: true })
    })
  }

  saveProjectAs = (event: Electron.IpcMainInvokeEvent,
    project: string,
    name?: string | undefined,
    path?: string | undefined): Promise<{ canceled: boolean, result: boolean, name?: string | undefined, path?: string | undefined }> => {
    return new Promise((resolve, reject) => {
      const options = {
        nameFieldLabel: name,
        defaultPath: path,
        filters: [
          {
            name: 'Wavy Project', extensions: ['wproj']
          }
        ]
      }
      let promise = undefined
      if (this._window) {
        promise = dialog.showSaveDialog(this._window, options)
      } else {
        promise = dialog.showSaveDialog(options)
      }
      promise.then(r => {
        if (!r.canceled && r.filePath) {
          const fullPath = r.filePath
          const dirname = nPath.dirname(fullPath)
          const fileName = nPath.basename(fullPath, '.wproj')
          // @Todo 
          const projectCls = JSON.parse(project)
          projectCls.name = fileName
          projectCls.project.name = fileName
          fs.writeFileSync(fullPath, JSON.stringify(projectCls))
          resolve({ canceled: false, result: true, name: fileName, path: dirname })
        } else {
          resolve({ canceled: true, result: false })
        }
      }).catch(() => {
        resolve({ canceled: true, result: false })
      })
    })
  }

  saveTextAs = (event: Electron.IpcMainInvokeEvent,
    text: string): Promise<{ canceled: boolean, result: boolean, name?: string | undefined, path?: string | undefined }> => {
    return new Promise((resolve, reject) => {
      const options = {
        filters: [
          {
            name: 'Wavy Data', extensions: ['txt']
          }
        ]
      }
      let promise = undefined
      if (this._window) {
        promise = dialog.showSaveDialog(this._window, options)
      } else {
        promise = dialog.showSaveDialog(options)
      }
      promise.then(r => {
        if (!r.canceled && r.filePath) {
          const fullPath = r.filePath
          const dirname = nPath.dirname(fullPath)
          const fileName = nPath.basename(fullPath, '.txt')
          fs.writeFileSync(fullPath, text)
          resolve({ canceled: false, result: true, name: fileName, path: dirname })
        } else {
          resolve({ canceled: true, result: false })
        }
      }).catch(() => {
        resolve({ canceled: true, result: false })
      })
    })
  }
}
