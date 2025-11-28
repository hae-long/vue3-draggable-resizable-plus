import {
  ContainerProvider,
  ParentSize,
  ReferenceLineMap,
  ResizingHandle
} from './types'
import { ALL_HANDLES } from './Vue3DraggableResizable'

export const IDENTITY = Symbol('Vue3DraggableResizable')

export function getElSize(el: Element) {
  const style = window.getComputedStyle(el)
  return {
    width: parseFloat(style.getPropertyValue('width')),
    height: parseFloat(style.getPropertyValue('height'))
  }
}

function createEventListenerFunction(
  type: 'addEventListener' | 'removeEventListener'
) {
  return <K extends keyof HTMLElementEventMap>(
    el: HTMLElement,
    events: K | K[],
    handler: any
  ) => {
    if (!el) {
      return
    }
    if (typeof events === 'string') {
      events = [events]
    }
    events.forEach((e) => el[type](e, handler, { passive: false }))
  }
}

export const addEvent = createEventListenerFunction('addEventListener')

export const removeEvent = createEventListenerFunction('removeEventListener')

export function filterHandles(handles: ResizingHandle[]) {
  if (handles && handles.length > 0) {
    const result: ResizingHandle[] = []
    handles.forEach((item) => {
      if (ALL_HANDLES.includes(item) && !result.includes(item)) {
        result.push(item)
      }
    })
    return result
  } else {
    return []
  }
}

export function getId() {
  return String(Math.random()).substr(2) + String(Date.now())
}

// Unit conversion functions
/**
 * Converts a value to pixels based on the unit type
 * @param value - The numeric value to convert
 * @param unit - The unit type ('px' or '%')
 * @param parentSize - The parent element size in pixels
 * @returns The value converted to pixels
 * @throws Error if value or parentSize is negative
 */
export function convertToPixel(value: number, unit: string, parentSize: number): number {
  if (value < 0) {
    throw new Error('Value cannot be negative')
  }
  if (parentSize < 0) {
    throw new Error('Parent size cannot be negative')
  }

  if (unit === '%') {
    return (value / 100) * parentSize
  }
  return value
}

/**
 * Converts a pixel value to the specified unit type
 * @param value - The pixel value to convert
 * @param unit - The target unit type ('px' or '%')
 * @param parentSize - The parent element size in pixels
 * @returns The value converted to the target unit (with 2 decimal precision for %)
 * @throws Error if value or parentSize is negative, or parentSize is zero when converting to %
 */
export function convertFromPixel(value: number, unit: string, parentSize: number): number {
  if (value < 0) {
    throw new Error('Value cannot be negative')
  }
  if (parentSize < 0) {
    throw new Error('Parent size cannot be negative')
  }

  if (unit === '%') {
    // Return 0 if parent size is not yet calculated (during initialization)
    if (parentSize === 0) {
      return 0
    }
    const percentValue = (value / parentSize) * 100
    return Number(percentValue.toFixed(2))  // Limit to 2 decimal places
  }
  return value
}

// Unit conversion validation functions
/**
 * Validates if a percentage value is within valid range (0-100)
 * @param value - The percentage value to validate
 * @returns true if value is between 0 and 100 (inclusive), false otherwise
 */
export function validatePercentage(value: number): boolean {
  return value >= 0 && value <= 100
}

/**
 * Validates if a pixel value is within parent bounds
 * @param value - The pixel value to validate
 * @param parentSize - The parent element size in pixels
 * @returns true if value is between 0 and parentSize (inclusive), false otherwise
 * @throws Error if parentSize is negative
 */
export function validatePixel(value: number, parentSize: number): boolean {
  if (parentSize < 0) {
    throw new Error('Parent size cannot be negative')
  }
  return value >= 0 && value <= parentSize
}

// Random color generation
/**
 * Generates a random hex color string
 * @returns A random color in hex format (e.g., '#3A7FE1')
 */
export function generateRandomColor(): string {
  const randomInt = Math.floor(Math.random() * 0xFFFFFF)
  return '#' + randomInt.toString(16).padStart(6, '0').toUpperCase()
}

export function getReferenceLineMap(
  containerProvider: ContainerProvider,
  parentSize: ParentSize,
  id?: string
) {
  if (containerProvider.disabled.value) {
    return null
  }
  const referenceLine = {
    row: [] as number[],
    col: [] as number[]
  }
  const { parentWidth, parentHeight } = parentSize
  referenceLine.row.push(...containerProvider.adsorbRows)
  referenceLine.col.push(...containerProvider.adsorbCols)
  if (containerProvider.adsorbParent.value) {
    referenceLine.row.push(0, parentHeight.value, parentHeight.value / 2)
    referenceLine.col.push(0, parentWidth.value, parentWidth.value / 2)
  }
  const widgetPositionStore = containerProvider.getPositionStore(id)
  Object.values(widgetPositionStore).forEach(({ x, y, w, h }) => {
    referenceLine.row.push(y, y + h, y + h / 2)
    referenceLine.col.push(x, x + w, x + w / 2)
  })
  const referenceLineMap: ReferenceLineMap = {
    row: referenceLine.row.reduce((pre, cur) => {
      return { ...pre, [cur]: { min: cur - 5, max: cur + 5, value: cur } }
    }, {}),
    col: referenceLine.col.reduce((pre, cur) => {
      return { ...pre, [cur]: { min: cur - 5, max: cur + 5, value: cur } }
    }, {})
  }
  return referenceLineMap
}
