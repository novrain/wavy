import { app, BrowserWindow, BrowserWindowConstructorOptions, ipcMain, Menu, nativeImage, Rectangle, screen, TouchBar } from 'electron'
import ElectronConfig from 'electron-store'
import { debounceTime, Observable, Subject } from 'rxjs'
// import { enable as enableRemote } from '@electron/remote/main'
import { compare as compareVersions } from 'compare-versions'
import * as os from 'os'
import * as path from 'path'
import type { Application } from './app'
import { parseArgs } from './cli'
import { loadConfig } from './config'
import macOSRelease from './util/macosRelease'

// let DwmEnableBlurBehindWindow: any = null
// if (process.platform === 'win32') {
//   DwmEnableBlurBehindWindow = require('@tabby-gang/windows-blurbehind').DwmEnableBlurBehindWindow
// }

export interface WindowOptions {
  hidden?: boolean
}

abstract class GlasstronWindow extends BrowserWindow {
  blurType: string | undefined
  abstract setBlur(_: boolean): void
}

const macOSVibrancyType = process.platform === 'darwin' ? compareVersions(macOSRelease(undefined).version || '0.0', '10.14', '>=') ? 'under-window' : 'window' : null

const activityIcon = nativeImage.createFromPath(`${app.getAppPath()}/assets/activity.png`)

export class Window {
  ready: Promise<void>
  isMainWindow = false
  private visible = new Subject<boolean>()
  private closed = new Subject<void>()
  private window?: GlasstronWindow | null
  private windowConfig: ElectronConfig
  private windowBounds?: Rectangle
  private closing = false
  private lastVibrancy: { enabled: boolean, type?: string } | null = null
  private disableVibrancyWhileDragging = false
  private configStore: any
  private touchBarControl: any
  private isFluentVibrancy = false
  private dockHidden = false

  get visible$(): Observable<boolean> { return this.visible }
  get closed$(): Observable<void> { return this.closed }

  get browserWindow() {
    return this.window
  }

  constructor(private application: Application, options?: WindowOptions) {
    this.configStore = loadConfig()

    options = options ?? {}

    this.windowConfig = new ElectronConfig({ name: 'window' })
    this.windowBounds = this.windowConfig.get('windowBoundaries') as Rectangle

    const maximized = this.windowConfig.get('maximized')
    const bwOptions: BrowserWindowConstructorOptions = {
      width: 1300,
      height: 800,
      title: 'Wavy',
      minWidth: 1300,
      minHeight: 800,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true,
        backgroundThrottling: false,
        contextIsolation: true,
      },
      icon: path.join(__dirname, "../renderer/favicon.ico"),
      maximizable: true,
      frame: false,
      show: false,
      backgroundColor: '#00000000',
    }

    if (this.windowBounds) {
      Object.assign(bwOptions, this.windowBounds)
      const closestDisplay = screen.getDisplayNearestPoint({ x: this.windowBounds.x, y: this.windowBounds.y })

      const [left1, top1, right1, bottom1] = [this.windowBounds.x, this.windowBounds.y, this.windowBounds.x + this.windowBounds.width, this.windowBounds.y + this.windowBounds.height]
      const [left2, top2, right2, bottom2] = [closestDisplay.bounds.x, closestDisplay.bounds.y, closestDisplay.bounds.x + closestDisplay.bounds.width, closestDisplay.bounds.y + closestDisplay.bounds.height]

      if ((left2 > right1 || right2 < left1 || top2 > bottom1 || bottom2 < top1) && !maximized) {
        bwOptions.x = closestDisplay.bounds.width / 2 - bwOptions.width! / 2
        bwOptions.y = closestDisplay.bounds.height / 2 - bwOptions.height! / 2
      }
    }

    if ((this.configStore.appearance || {}).frame === 'native') {
      bwOptions.frame = true
    } else {
      if (process.platform === 'darwin') {
        bwOptions.titleBarStyle = 'hidden'
      }
    }

    this.window = new BrowserWindow(bwOptions) as GlasstronWindow
    // this.window.webContents.openDevTools()

    this.window!.once('ready-to-show', () => {
      if (process.platform === 'darwin') {
        this.window!.setVibrancy(macOSVibrancyType)
      } else if (process.platform === 'win32' && (this.configStore.appearance || {}).vibrancy) {
        this.setVibrancy(true)
      }

      if (!options!.hidden) {
        if (maximized) {
          this.window!.maximize()
        } else {
          this.window!.show()
        }
        this.window!.focus()
        this.window!.moveTop()
        application.focus()
      }
    })

    this.window!.on('blur', () => {
      if ((this.configStore.appearance?.dock ?? 'off') !== 'off' && this.configStore.appearance?.dockHideOnBlur) {
        this.hide()
      }
    })

    // enableRemote(this.window!.webContents)

    const isDev = process.env.IS_DEV == "true" ? true : false
    // and load the index.html of the app.
    if (isDev) {
      this.window!.loadURL('http://localhost:3000')
    }
    else {
      this.window!.loadFile(path.join(__dirname, "../renderer/index.html"))
    }

    // Open the DevTools.
    if (isDev) {
      this.window!.webContents.openDevTools()
    }
    this.window!.webContents.setVisualZoomLevelLimits(1, 1)
    this.window!.webContents.setZoomFactor(1)
    this.window!.webContents.session.setPermissionCheckHandler(() => true)
    this.window!.webContents.session.setDevicePermissionHandler(() => true)

    if (process.platform === 'darwin') {
      this.touchBarControl = new TouchBar.TouchBarSegmentedControl({
        segments: [],
        change: index => this.send('touchbar-selection', index),
      })
      this.window!.setTouchBar(new TouchBar({
        items: [this.touchBarControl],
      }))
    } else {
      this.window!.setMenu(null)
    }

    this.setupWindowManagement()

    this.ready = new Promise(resolve => {
      const listener = (event: any) => {
        if (event.sender === this.window!.webContents) {
          ipcMain.removeListener('app:ready', listener as any)
          resolve()
        }
      }
      ipcMain.on('app:ready', listener)
    })
  }

  makeMain(): void {
    this.isMainWindow = true
    this.window!.webContents.send('host:became-main-window')
  }

  setVibrancy(enabled: boolean, type?: string, userRequested?: boolean): void {
    if (userRequested ?? true) {
      this.lastVibrancy = { enabled, type }
    }
    if (process.platform === 'win32') {
      if (parseFloat(os.release()) >= 10) {
        this.window!.blurType = enabled ? type === 'fluent' ? 'acrylic' : 'blurbehind' : undefined
        try {
          this.window!.setBlur(enabled)
          this.isFluentVibrancy = enabled && type === 'fluent'
        } catch (error) {
          console.error('Failed to set window blur', error)
        }
      } else {
        // DwmEnableBlurBehindWindow(this.window, enabled)
      }
    } else if (process.platform === 'linux') {
      this.window!.setBackgroundColor(enabled ? '#00000000' : '#131d27')
      this.window!.setBlur(enabled)
    } else {
      this.window!.setVibrancy(enabled ? macOSVibrancyType : null)
    }
  }

  focus(): void {
    this.window!.focus()
  }

  send(event: string, ...args: any[]): void {
    if (!this.window) {
      return
    }
    this.window!.webContents.send(event, ...args)
    if (event === 'host:config-change') {
      this.configStore = args[0]
      this.enableDockedWindowStyles(this.isDockedOnTop())
    }
  }

  isDestroyed(): boolean {
    return !this.window || this.window!.isDestroyed()
  }

  isFocused(): boolean {
    return this.window!.isFocused()
  }

  isVisible(): boolean {
    return this.window!.isVisible()
  }

  isDockedOnTop(): boolean {
    return this.isMainWindow && this.configStore.appearance?.dock && this.configStore.appearance?.dock !== 'off' && (this.configStore.appearance?.dockAlwaysOnTop ?? true)
  }

  async hide(): Promise<void> {
    if (process.platform === 'darwin') {
      // Lose focus
      Menu.sendActionToFirstResponder('hide:')
      if (this.isDockedOnTop()) {
        await this.enableDockedWindowStyles(false)
      }
    }
    this.window!.blur()
    this.window!.hide()
  }

  async show(): Promise<void> {
    await this.enableDockedWindowStyles(this.isDockedOnTop())
    this.window!.show()
    this.window!.focus()
  }

  async present(): Promise<void> {
    await this.show()
    this.window!.moveTop()
  }

  passCliArguments(argv: string[], cwd: string, secondInstance: boolean): void {
    this.send('cli', parseArgs(argv, cwd), cwd, secondInstance)
  }

  private async enableDockedWindowStyles(enabled: boolean) {
    if (process.platform === 'darwin') {
      if (enabled) {
        if (!this.dockHidden) {
          app.dock.hide()
          this.dockHidden = true
        }
        this.window!.setAlwaysOnTop(true, 'screen-saver', 1)
        if (!this.window!.isVisibleOnAllWorkspaces()) {
          this.window!.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
        }
        if (this.window!.fullScreenable) {
          this.window!.setFullScreenable(false)
        }
      } else {
        if (this.dockHidden) {
          await app.dock.show()
          this.dockHidden = false
        }
        if (this.window!.isAlwaysOnTop()) {
          this.window!.setAlwaysOnTop(false)
        }
        if (this.window!.isVisibleOnAllWorkspaces()) {
          this.window!.setVisibleOnAllWorkspaces(false)
        }
        if (!this.window!.fullScreenable) {
          this.window!.setFullScreenable(true)
        }
      }
    }
  }

  private setupWindowManagement() {
    this.window!.on('show', () => {
      this.visible.next(true)
      this.send('host:window-shown')
    })

    this.window!.on('hide', () => {
      this.visible.next(false)
    })

    const moveSubscription = new Observable<void>((observer: any) => {
      this.window!.on('move', () => observer.next())
    }).pipe(debounceTime(250)).subscribe(() => {
      this.send('host:window-moved')
    })

    this.window!.on('closed', () => {
      moveSubscription.unsubscribe()
    })

    this.window!.on('close', event => {
      if (!this.closing) {
        event.preventDefault()
        this.send('renderer:window-close')
        return
      }
      this.windowConfig.set('windowBoundaries', this.windowBounds)
      this.windowConfig.set('maximized', this.window!.isMaximized())
    })

    this.window!.on('closed', () => {
      this.destroy()
    })

    this.window!.on('resize', () => {
      if (!this.window!.isMaximized()) {
        this.windowBounds = this.window!.getBounds()
      }
    })

    this.window!.on('move', () => {
      if (!this.window!.isMaximized()) {
        this.windowBounds = this.window!.getBounds()
      }
    })

    this.window!.on('focus', () => {
      this.send('host:window-focused')
    })

    ipcMain.on('ready', event => {
      if (!this.window || event.sender !== this.window!.webContents) {
        return
      }
      this.window!.webContents.send('start', {
        config: this.configStore,
        executable: app.getPath('exe'),
        windowID: this.window!.id,
        isMainWindow: this.isMainWindow,
        userPluginsPath: this.application.userPluginsPath,
      })
    })

    ipcMain.on('window:minimize', event => {
      if (!this.window || event.sender !== this.window!.webContents) {
        return
      }
      this.window!.minimize()
    })

    ipcMain.on('window:set-bounds', (event, bounds) => {
      if (!this.window || event.sender !== this.window!.webContents) {
        return
      }
      this.window!.setBounds(bounds)
    })

    ipcMain.on('window:set-always-on-top', (event, flag) => {
      if (!this.window || event.sender !== this.window!.webContents) {
        return
      }
      this.window!.setAlwaysOnTop(flag)
    })

    ipcMain.on('window:set-vibrancy', (event, enabled, type) => {
      if (!this.window || event.sender !== this.window!.webContents) {
        return
      }
      this.setVibrancy(enabled, type)
    })

    ipcMain.on('window:set-title', (event, title) => {
      if (!this.window || event.sender !== this.window!.webContents) {
        return
      }
      this.window!.setTitle(title)
    })

    ipcMain.on('window:bring-to-front', event => {
      if (!this.window || event.sender !== this.window!.webContents) {
        return
      }
      if (this.window!.isMinimized()) {
        this.window!.restore()
      }
      this.present()
    })

    ipcMain.on('window:close', event => {
      if (!this.window || event.sender !== this.window!.webContents) {
        return
      }
      this.closing = true
      this.window!.close()
    })

    ipcMain.on('window:set-touch-bar', (_event, segments, selectedIndex) => {
      this.touchBarControl.segments = segments.map((s: any) => ({
        label: s.label,
        icon: s.hasActivity ? activityIcon : undefined,
      }))
      this.touchBarControl.selectedIndex = selectedIndex
    })

    // this.window!.webContents.on('new-window', (event: any) => event.preventDefault())

    ipcMain.on('window:set-disable-vibrancy-while-dragging', (_event, value) => {
      this.disableVibrancyWhileDragging = value
    })

    let moveEndedTimeout: any = null
    const onBoundsChange = () => {
      if (!this.lastVibrancy?.enabled || !this.disableVibrancyWhileDragging || !this.isFluentVibrancy) {
        return
      }
      this.setVibrancy(false, undefined, false)
      if (moveEndedTimeout) {
        clearTimeout(moveEndedTimeout)
      }
      moveEndedTimeout = setTimeout(() => {
        this.setVibrancy(this.lastVibrancy!.enabled, this.lastVibrancy!.type)
      }, 50)
    }
    this.window!.on('move', onBoundsChange)
    this.window!.on('resize', onBoundsChange)

    // ipcMain.on('window:set-traffic-light-position', (_event, x, y) => {
    //   this.window!.setTrafficLightPosition({ x, y })
    // })

    ipcMain.on('window:set-opacity', (_event, opacity) => {
      this.window!.setOpacity(opacity)
    })

    ipcMain.on('window:set-progress-bar', (_event, value) => {
      this.window!.setProgressBar(value, { mode: value < 0 ? 'none' : 'normal' })
    })

    // 
    ipcMain.handle('window:isMaximized', () => {
      return this.window!.isMaximized()
    })

    ipcMain.on('window:toggleMaximize', () => {
      this.window!.isMaximized() ? this.window!.unmaximize() : this.window!.maximize()
    })

    this.window!.on('maximize', () => this.send('renderer:window-maximized'))
    this.window!.on('unmaximize', () => this.send('renderer:window-unmaximized'))
  }

  private destroy() {
    this.window = null
    this.closed.next()
    this.visible.complete()
    this.closed.complete()
  }
}
