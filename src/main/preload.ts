import { contextBridge } from 'electron'
import DefaultHostWindowService from './service/bridge/HostWindowService'
import DefaultProjectService from './service/bridge/ProjectService'
import DefaultSerialPortService from './service/bridge/SerialPortService'

// host window
contextBridge.exposeInMainWorld('hostWindow', DefaultHostWindowService)

// serial port
contextBridge.exposeInMainWorld('serialPort', DefaultSerialPortService)

// file service
contextBridge.exposeInMainWorld('projectService', DefaultProjectService)
