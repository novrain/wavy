/// <reference types="vite/client" />
import { HostWindowService, SerialPortService, ProjectService, SessionService } from '@M/service/types'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  interface Window {
    hostWindow: HostWindowService
    serialPort: SerialPortService,
    projectService: ProjectService
    sessionService: SessionService
  }
}
