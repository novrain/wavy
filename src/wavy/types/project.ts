import { FrameProject } from "../frame/FrameProject"

export type ProjectType = 'BlockOnly' | 'Frame'

export interface AbstractProject {
  id: string,
  tempIndex?: number,
  index?: number,
  name?: string,
  type: ProjectType,
  dirty?: boolean,
  closeable?: boolean
  project?: FrameProject
}

// @Todo as a class implements functions.
export interface BlockOnlyProject extends AbstractProject {
}

export type Project = BlockOnlyProject // | FrameProject 
