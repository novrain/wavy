import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron'
import { Application } from './app'
import { parseArgs } from './cli'
import ProjectServiceInMain from './service/ProjectServiceInMain'
import electronDebug from 'electron-debug'
import SerialPortServiceInMain from './service/SerialPortServiceInMain'

if (!process.env.TABBY_PLUGINS) {
  process.env.TABBY_PLUGINS = ''
}

app.disableHardwareAcceleration()

const application = new Application()

ipcMain.on('app:new-window', () => {
  application.newWindow()
})

ipcMain.handle('main:getLocale', () => {
  return app.getSystemLocale()
})

ipcMain.on('main:openExternal', (event: Electron.IpcMainInvokeEvent, url: string) => {
  shell.openExternal(url)
})

app.on('activate', () => {
  if (!application.hasWindows()) {
    application.newWindow()
  } else {
    application.focus()
  }
})

process.on('uncaughtException' as any, (err: any) => {
  console.log(err)
  application.broadcast('uncaughtException', err)
})

app.on('second-instance', (_event, argv, cwd) => {
  application.handleSecondInstance(argv, cwd)
})

const argv = parseArgs(process.argv, process.cwd())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  app.exit(0)
}

if (argv.d) {
  electronDebug({
    isEnabled: true,
    showDevTools: true,
    devToolsMode: 'undocked',
  })
}

app.on('ready', async () => {
  if (process.platform === 'darwin') {
    app.dock.setMenu(Menu.buildFromTemplate([
      {
        label: 'New window',
        click() {
          // this.app.newWindow()
          application.newWindow()
        },
      },
    ]))
  }
  application.init()

  const projectService = new ProjectServiceInMain()
  const serialPortService = new SerialPortServiceInMain()
  const window = await application.newWindow({ hidden: argv.hidden })
  projectService.window = window.browserWindow as BrowserWindow
  serialPortService.window = window.browserWindow as BrowserWindow
  // await window.ready
  window.passCliArguments(process.argv, process.cwd(), false)
  window.focus()
})
