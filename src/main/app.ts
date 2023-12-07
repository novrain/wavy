import { app, globalShortcut, ipcMain, Menu, screen, Tray } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { Subject, throttleTime } from 'rxjs'

import { loadConfig } from './config'
import { Window, WindowOptions } from './window'

/* eslint-disable block-scoped-var */

try {
  var wnr = require('windows-native-registry') // eslint-disable-line @typescript-eslint/no-var-requires, no-var
} catch (_) { }

export class Application {
  private tray?: Tray
  private windows: Window[] = []
  private globalHotkey$ = new Subject<void>()
  private quitRequested = false
  private configStore: any
  userPluginsPath: string

  constructor() {
    this.useBuiltinGraphics()

    ipcMain.on('app:config-change', (_event, config) => {
      this.broadcast('host:config-change', config)
      this.configStore = config
    })

    ipcMain.on('app:register-global-hotkey', (_event, specs) => {
      globalShortcut.unregisterAll()
      for (const spec of specs) {
        globalShortcut.register(spec, () => this.globalHotkey$.next())
      }
    })

    this.globalHotkey$.pipe(throttleTime(100)).subscribe(() => {
      this.onGlobalHotkey()
    })

    this.configStore = loadConfig()
    if (process.platform === 'linux') {
      app.commandLine.appendSwitch('no-sandbox')
      if (((this.configStore.appearance || {}).opacity || 1) !== 1) {
        app.commandLine.appendSwitch('enable-transparent-visuals')
        app.disableHardwareAcceleration()
      }
    }
    if (this.configStore.hacks?.disableGPU) {
      app.commandLine.appendSwitch('disable-gpu')
      app.disableHardwareAcceleration()
    }

    this.userPluginsPath = path.join(
      app.getPath('userData'),
      'plugins',
    )

    if (!fs.existsSync(this.userPluginsPath)) {
      fs.mkdirSync(this.userPluginsPath)
    }

    app.commandLine.appendSwitch('disable-http-cache')
    app.commandLine.appendSwitch('max-active-webgl-contexts', '9000')
    app.commandLine.appendSwitch('lang', 'EN')

    for (const flag of this.configStore.flags || [['force_discrete_gpu', '0']]) {
      app.commandLine.appendSwitch(flag[0], flag[1])
    }

    app.on('before-quit', () => {
      this.quitRequested = true
    })

    app.on('window-all-closed', () => {
      if (this.quitRequested || process.platform !== 'darwin') {
        app.quit()
      }
    })
  }

  init(): void {
    screen.on('display-metrics-changed', () => this.broadcast('host:display-metrics-changed'))
    screen.on('display-added', () => this.broadcast('host:displays-changed'))
    screen.on('display-removed', () => this.broadcast('host:displays-changed'))
  }

  async newWindow(options?: WindowOptions): Promise<Window> {
    const window = new Window(this, options)
    this.windows.push(window)
    if (this.windows.length === 1) {
      window.makeMain()
    }
    window.visible$.subscribe(visible => {
      if (visible) {
        this.disableTray()
      } else {
        this.enableTray()
      }
    })
    window.closed$.subscribe(() => {
      this.windows = this.windows.filter(x => x !== window)
      if (!this.windows.some(x => x.isMainWindow)) {
        this.windows[0]?.makeMain()
        this.windows[0]?.present()
      }
    })
    if (process.platform === 'darwin') {
      this.setupMenu()
    }
    await window.ready
    return window
  }

  onGlobalHotkey(): void {
    let isPresent = this.windows.some(x => x.isFocused() && x.isVisible())
    const isDockedOnTop = this.windows.some(x => x.isDockedOnTop())
    if (isDockedOnTop) {
      // if docked and on top, hide even if not focused right now
      isPresent = this.windows.some(x => x.isVisible())
    }

    if (isPresent) {
      for (const window of this.windows) {
        window.hide()
      }
    } else {
      for (const window of this.windows) {
        window.present()
      }
    }
  }

  presentAllWindows(): void {
    for (const window of this.windows) {
      window.present()
    }
  }

  broadcast(event: string, ...args: any[]): void {
    for (const window of this.windows) {
      window.send(event, ...args)
    }
  }

  async send(event: string, ...args: any[]): Promise<void> {
    if (!this.hasWindows()) {
      await this.newWindow()
    }
    this.windows.filter(w => !w.isDestroyed())[0].send(event, ...args)
  }

  enableTray(): void {
    if (this.tray || process.platform === 'linux') {
      return
    }
    if (process.platform === 'darwin') {
      this.tray = new Tray(`${app.getAppPath()}/assets/tray-darwinTemplate.png`)
      this.tray.setPressedImage(`${app.getAppPath()}/assets/tray-darwinHighlightTemplate.png`)
    } else {
      this.tray = new Tray(`${app.getAppPath()}/assets/tray.png`)
    }

    this.tray.on('click', () => setTimeout(() => this.focus()))

    const contextMenu = Menu.buildFromTemplate([{
      label: 'Show',
      click: () => this.focus(),
    }])

    if (process.platform !== 'darwin') {
      this.tray.setContextMenu(contextMenu)
    }

    this.tray.setToolTip(`Tabby ${app.getVersion()}`)
  }

  disableTray(): void {
    if (process.platform === 'linux') {
      return
    }
    this.tray?.destroy()
    this.tray = undefined
  }

  hasWindows(): boolean {
    return !!this.windows.length
  }

  focus(): void {
    for (const window of this.windows) {
      window.present()
    }
  }

  handleSecondInstance(argv: string[], cwd: string): void {
    this.presentAllWindows()
    this.windows[this.windows.length - 1].passCliArguments(argv, cwd, true)
  }

  private useBuiltinGraphics(): void {
    if (process.platform === 'win32') {
      const keyPath = 'SOFTWARE\\Microsoft\\DirectX\\UserGpuPreferences'
      const valueName = app.getPath('exe')
      if (!wnr.getRegistryValue(wnr.HK.CU, keyPath, valueName)) {
        wnr.setRegistryValue(wnr.HK.CU, keyPath, valueName, wnr.REG.SZ, 'GpuPreference=1;')
      }
    }
  }

  private setupMenu() {
    // Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  }
}
