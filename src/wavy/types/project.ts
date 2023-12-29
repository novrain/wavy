import { Type } from 'class-transformer'
import 'reflect-metadata'
import { FrameProject } from "../frame/FrameProject"

export type ProjectType = 'BlockOnly' | 'Frame'

export class Project {
  id: string
  tempIndex?: number | undefined
  index?: number | undefined
  name?: string | undefined
  dirty?: boolean | undefined
  closeable?: boolean | undefined

  @Type(() => FrameProject)
  project?: FrameProject | undefined
  path?: string | undefined

  constructor(id: string, readonly type: ProjectType) {
    this.id = id
  }
}
