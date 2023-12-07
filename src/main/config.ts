import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'
import { app } from 'electron'

export function loadConfig(): any {

  const configPath = path.join(app.getPath('userData'), 'wavy.yaml')
  if (fs.existsSync(configPath)) {
    return yaml.load(fs.readFileSync(configPath, 'utf8'))
  } else {
    return {}
  }
}
