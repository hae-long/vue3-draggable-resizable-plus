import { Ref } from 'vue'

export interface Position {
  x: number
  y: number
  w: number
  h: number
}

// Unit type
export type Unit = 'px' | '%'

// Value type with unit
export interface ValueWithUnit {
  value: number
  unit: Unit
}

// Position type with unit
export interface PositionWithUnit {
  x: ValueWithUnit
  y: ValueWithUnit
  w: ValueWithUnit
  h: ValueWithUnit
}

export interface PositionStore {
  [propName: string]: Position
}

export type UpdatePosition = (id: string, position: Position) => void

export type GetPositionStore = (excludeId?: string) => PositionStore

export interface ContainerProvider {
  updatePosition: UpdatePosition
  getPositionStore: GetPositionStore
  setMatchedLine: SetMatchedLine
  disabled: Ref<boolean>
  adsorbParent: Ref<boolean>
  adsorbCols: number[]
  adsorbRows: number[]
}

export interface MatchedLine {
  row: number[]
  col: number[]
}
export type SetMatchedLine = (matchedLine: MatchedLine | null) => void

export type ResizingHandle =
  | 'tl'
  | 'tm'
  | 'tr'
  | 'ml'
  | 'mr'
  | 'bl'
  | 'bm'
  | 'br'
  | ''

export interface ParentSize {
  parentWidth: Ref<number>
  parentHeight: Ref<number>
}

export type ReferenceLineMap = Record<
  'col' | 'row',
  {
    [propName: number]: Record<'min' | 'max' | 'value', number>
  }
>
