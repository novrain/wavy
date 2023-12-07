import { contextBridge } from 'electron'
import DefaultHostWindowService from './service/HostWindowService'
import DefaultSerialPortService from './service/SerialPortService'

// host window
contextBridge.exposeInMainWorld('hostWindow', DefaultHostWindowService)

// serial port

contextBridge.exposeInMainWorld('serialPort', DefaultSerialPortService) 