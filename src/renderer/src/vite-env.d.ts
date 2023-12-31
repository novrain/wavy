/// <reference types="vite/client" />
import { HostWindowService, SerialPortService, ProjectService } from '@M/service/types'

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
  }
}
