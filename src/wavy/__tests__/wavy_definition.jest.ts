import { plainToClass } from 'class-transformer'
import {
  DataBlock,
  DecimalBlock,
  StringBlock
} from '../frame/Block'
import {
  DataFrame,
  RefBlock
} from '../frame/Frame'
import { FrameProject } from '../frame/FrameProject'
import demoPj from './wavy_demo_definition.json'

test('demo project', () => {
  let wavy: FrameProject = plainToClass(FrameProject, demoPj)
  wavy.injectProjectToRef()
  expect(wavy).not.toBeUndefined()
  expect(wavy.name).toEqual(demoPj.name)
  // frames
  expect(wavy._frames).not.toBeUndefined()
  expect(wavy._frames.length).toEqual(demoPj.frames.length)
  let f1Json = demoPj.frames[0]
  let f1BlocksJson = f1Json.blocks
  expect(f1BlocksJson).not.toBeUndefined
  const f1 = wavy.findFrame(f1Json.id)
  expect(f1).not.toBeUndefined()
  expect(f1!.project).toEqual(wavy)
  expect(f1!.name).toEqual(f1Json.name)
  expect(f1 instanceof DataFrame).toBeTruthy()
  const dF1 = f1 as DataFrame
  const f1Blocks = dF1.blocks
  expect(f1Blocks.length).toEqual(f1BlocksJson!.length)
  const rB1 = f1Blocks[0]
  expect(rB1 instanceof RefBlock).toBeTruthy()
  expect(rB1!.id).toEqual(f1BlocksJson![0].id)

  // blocks
  const b1Json = demoPj.blocks[0]
  const b2Json = demoPj.blocks[1]
  const b1 = wavy.findBlock(b1Json.id)
  expect(b1 instanceof DecimalBlock).toBeTruthy()
  const b2 = wavy.findBlock(b2Json.id)
  expect(b2 instanceof StringBlock).toBeTruthy()
  expect((b2 as DataBlock).strValue).toEqual('Hello wavy.')

})
