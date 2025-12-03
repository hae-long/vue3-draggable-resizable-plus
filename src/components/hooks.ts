import { onMounted, onUnmounted, ref, watch, Ref, computed } from 'vue'
import {
  getElSize,
  filterHandles,
  getId,
  getReferenceLineMap,
  addEvent,
  removeEvent,
  convertToPixel,
  convertFromPixel,
  transformDelta,
  rotatePoint
} from './utils'
import {
  ContainerProvider,
  MatchedLine,
  ReferenceLineMap,
  ResizingHandle
} from './types'

type HandleEvent = MouseEvent | TouchEvent

export function useState<T>(initialState: T): [Ref<T>, (value: T) => T] {
  const state = ref(initialState) as Ref<T>
  const setState = (value: T): T => {
    state.value = value
    return value
  }
  return [state, setState]
}

export function initState(props: any, emit: any, parentSize?: ReturnType<typeof initParent>) {
  const [width, setWidth] = useState<number>(props.initW || 0)
  const [height, setHeight] = useState<number>(props.initH || 0)
  const [left, setLeft] = useState<number>(props.x)
  const [top, setTop] = useState<number>(props.y)
  const [enable, setEnable] = useState<boolean>(props.active)
  const [dragging, setDragging] = useState<boolean>(false)
  const [resizing, setResizing] = useState<boolean>(false)
  const [resizingHandle, setResizingHandle] = useState<ResizingHandle>('')
  const [resizingMaxWidth, setResizingMaxWidth] = useState<number>(Infinity)
  const [resizingMaxHeight, setResizingMaxHeight] = useState<number>(Infinity)
  const [resizingMinWidth, setResizingMinWidth] = useState<number>(props.minW)
  const [resizingMinHeight, setResizingMinHeight] = useState<number>(props.minH)
  const aspectRatio = computed(() => height.value / width.value)
  watch(
    width,
    (newVal) => {
      const emitVal = parentSize && props.typeW === '%' 
        ? convertFromPixel(newVal, '%', parentSize.parentWidth.value) 
        : newVal
      emit('update:w', emitVal)
    }
  )
  watch(
    height,
    (newVal) => {
      const emitVal = parentSize && props.typeH === '%' 
        ? convertFromPixel(newVal, '%', parentSize.parentHeight.value) 
        : newVal
      emit('update:h', emitVal)
    }
  )
  watch(top, (newVal) => {
    const emitVal = parentSize && props.typeY === '%' 
      ? convertFromPixel(newVal, '%', parentSize.parentHeight.value) 
      : newVal
    emit('update:y', emitVal)
  })
  watch(left, (newVal) => {
    const emitVal = parentSize && props.typeX === '%' 
      ? convertFromPixel(newVal, '%', parentSize.parentWidth.value) 
      : newVal
    emit('update:x', emitVal)
  })
  watch(enable, (newVal, oldVal) => {
    emit('update:active', newVal)
    if (!oldVal && newVal) {
      emit('activated')
    } else if (oldVal && !newVal) {
      emit('deactivated')
    }
  })
  watch(
    () => props.active,
    (newVal: boolean) => {
      setEnable(newVal)
    }
  )
  return {
    id: getId(),
    width,
    height,
    top,
    left,
    enable,
    dragging,
    resizing,
    resizingHandle,
    resizingMaxHeight,
    resizingMaxWidth,
    resizingMinWidth,
    resizingMinHeight,
    aspectRatio,
    setEnable,
    setDragging,
    setResizing,
    setResizingHandle,
    setResizingMaxHeight,
    setResizingMaxWidth,
    setResizingMinWidth,
    setResizingMinHeight,
    setWidth: (val: number) => setWidth(Math.floor(val)),
    setHeight: (val: number) => setHeight(Math.floor(val)),
    setTop: (val: number) => setTop(Math.floor(val)),
    setLeft: (val: number) => setLeft(Math.floor(val))
  }
}

export function initParent(containerRef: Ref<HTMLElement | undefined>) {
  const parentWidth = ref(0)
  const parentHeight = ref(0)
  let resizeObserver: any = null

  const updateParentSize = () => {
    if (containerRef.value && containerRef.value.parentElement) {
      const { width, height } = getElSize(containerRef.value.parentElement)
      parentWidth.value = width
      parentHeight.value = height
    }
  }

  onMounted(() => {
    updateParentSize()

    // Use ResizeObserver to detect parent element size changes
    if (containerRef.value?.parentElement && typeof window !== 'undefined' && 'ResizeObserver' in window) {
      const ResizeObserverConstructor = (window as any).ResizeObserver
      resizeObserver = new ResizeObserverConstructor(() => {
        updateParentSize()
      })
      resizeObserver.observe(containerRef.value.parentElement)
    }
  })

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  })

  return {
    parentWidth,
    parentHeight
  }
}

export function initLimitSizeAndMethods(
  props: any,
  parentSize: ReturnType<typeof initParent>,
  containerProps: ReturnType<typeof initState>
) {
  const {
    width,
    height,
    left,
    top,
    resizingMaxWidth,
    resizingMaxHeight,
    resizingMinWidth,
    resizingMinHeight
  } = containerProps
  const { setWidth, setHeight, setTop, setLeft } = containerProps
  const { parentWidth, parentHeight } = parentSize
  const limitProps = {
    minWidth: computed(() => {
      return resizingMinWidth.value
    }),
    minHeight: computed(() => {
      return resizingMinHeight.value
    }),
    maxWidth: computed(() => {
      let max = Infinity
      if (props.parent) {
        max = Math.min(parentWidth.value, resizingMaxWidth.value)
      }
      return max
    }),
    maxHeight: computed(() => {
      let max = Infinity
      if (props.parent) {
        max = Math.min(parentHeight.value, resizingMaxHeight.value)
      }
      return max
    }),
    minLeft: computed(() => {
      return props.parent ? 0 : -Infinity
    }),
    minTop: computed(() => {
      return props.parent ? 0 : -Infinity
    }),
    maxLeft: computed(() => {
      return props.parent ? parentWidth.value - width.value : Infinity
    }),
    maxTop: computed(() => {
      return props.parent ? parentHeight.value - height.value : Infinity
    })
  }
  const limitMethods = {
    setWidth(val: number) {
      if (props.disabledW) {
        return width.value
      }
      return setWidth(
        Math.min(
          limitProps.maxWidth.value,
          Math.max(limitProps.minWidth.value, val)
        )
      )
    },
    setHeight(val: number) {
      if (props.disabledH) {
        return height.value
      }
      return setHeight(
        Math.min(
          limitProps.maxHeight.value,
          Math.max(limitProps.minHeight.value, val)
        )
      )
    },
    setTop(val: number) {
      if (props.disabledY) {
        return top.value
      }
      return setTop(
        Math.min(
          limitProps.maxTop.value,
          Math.max(limitProps.minTop.value, val)
        )
      )
    },
    setLeft(val: number) {
      if (props.disabledX) {
        return left.value
      }
      return setLeft(
        Math.min(
          limitProps.maxLeft.value,
          Math.max(limitProps.minLeft.value, val)
        )
      )
    }
  }
  return {
    ...limitProps,
    ...limitMethods
  }
}

const DOWN_HANDLES: (keyof HTMLElementEventMap)[] = ['mousedown', 'touchstart']
const UP_HANDLES: (keyof HTMLElementEventMap)[] = ['mouseup', 'touchend']
const MOVE_HANDLES: (keyof HTMLElementEventMap)[] = ['mousemove', 'touchmove']

function getPosition(e: HandleEvent) {
  if ('touches' in e) {
    return [e.touches[0].pageX, e.touches[0].pageY]
  } else {
    return [e.pageX, e.pageY]
  }
}

export function initDraggableContainer(
  containerRef: Ref<HTMLElement | undefined>,
  containerProps: ReturnType<typeof initState>,
  limitProps: ReturnType<typeof initLimitSizeAndMethods>,
  draggable: Ref<boolean>,
  emit: any,
  containerProvider: ContainerProvider | null,
  parentSize: ReturnType<typeof initParent>,
  props: any,
  getRotation?: () => number
) {
  const { left: x, top: y, width: w, height: h, dragging, id } = containerProps
  const {
    setDragging,
    setEnable,
    setResizing,
    setResizingHandle
  } = containerProps
  const { setTop, setLeft } = limitProps
  // Store position at drag start (not updated during drag)
  let lstX = 0
  let lstY = 0
  let lstPageX = 0
  let lstPageY = 0
  let referenceLineMap: ReferenceLineMap | null = null
  const documentElement = document.documentElement
  const _unselect = (e: HandleEvent) => {
    const target = e.target
    if (!containerRef.value?.contains(<Node>target)) {
      setEnable(false)
      setDragging(false)
      setResizing(false)
      setResizingHandle('')
    }
  }
  const handleUp = () => {
    setDragging(false)
    // document.documentElement.removeEventListener('mouseup', handleUp)
    // document.documentElement.removeEventListener('mousemove', handleDrag)
    removeEvent(documentElement, UP_HANDLES, handleUp)
    removeEvent(documentElement, MOVE_HANDLES, handleDrag)
    referenceLineMap = null
    if (containerProvider) {
      containerProvider.updatePosition(id, {
        x: x.value,
        y: y.value,
        w: w.value,
        h: h.value
      })
      containerProvider.setMatchedLine(null)
    }
  }
  const handleDrag = (e: MouseEvent) => {
    e.preventDefault()
    if (!(dragging.value && containerRef.value)) return
    const [pageX, pageY] = getPosition(e)

    // Calculate total delta from drag start position
    const deltaX = pageX - lstPageX
    const deltaY = pageY - lstPageY
    let newLeft = lstX + deltaX
    let newTop = lstY + deltaY

    if (props.snapToGrid && props.gridSpacing > 0) {
      const grid = props.gridSpacing
      const rotation = getRotation ? getRotation() : 0

      let snappedLeft: number
      let snappedTop: number

      if (rotation !== 0) {
        // Rotated element: snap center point to grid
        const centerX = newLeft + w.value / 2
        const centerY = newTop + h.value / 2
        const snappedCenterX = Math.round(centerX / grid) * grid
        const snappedCenterY = Math.round(centerY / grid) * grid
        snappedLeft = snappedCenterX - w.value / 2
        snappedTop = snappedCenterY - h.value / 2
      } else {
        // Non-rotated: snap edges to grid (Figma/Sketch style)
        // X-axis: choose between left and right edge, whichever is closer to grid
        const leftToGrid = Math.round(newLeft / grid) * grid
        const rightEdge = newLeft + w.value
        const rightToGrid = Math.round(rightEdge / grid) * grid

        const leftDist = Math.abs(newLeft - leftToGrid)
        const rightDist = Math.abs(rightEdge - rightToGrid)

        if (leftDist <= rightDist) {
          snappedLeft = leftToGrid
        } else {
          snappedLeft = rightToGrid - w.value
        }

        // Y-axis: choose between top and bottom edge, whichever is closer to grid
        const topToGrid = Math.round(newTop / grid) * grid
        const bottomEdge = newTop + h.value
        const bottomToGrid = Math.round(bottomEdge / grid) * grid

        const topDist = Math.abs(newTop - topToGrid)
        const bottomDist = Math.abs(bottomEdge - bottomToGrid)

        if (topDist <= bottomDist) {
          snappedTop = topToGrid
        } else {
          snappedTop = bottomToGrid - h.value
        }
      }

      // Apply snapped values
      const finalX = setLeft(snappedLeft)
      const finalY = setTop(snappedTop)

      if (containerProvider) {
        containerProvider.setMatchedLine(null)
      }

      const emitX = props.typeX === '%' ? convertFromPixel(finalX, '%', parentSize.parentWidth.value) : finalX
      const emitY = props.typeY === '%' ? convertFromPixel(finalY, '%', parentSize.parentHeight.value) : finalY
      emit('dragging', { x: emitX, y: emitY })
    } else if (referenceLineMap !== null && containerProvider) {
      // Apply reference line alignment
      const widgetSelfLine = {
        col: [newLeft, newLeft + w.value / 2, newLeft + w.value],
        row: [newTop, newTop + h.value / 2, newTop + h.value]
      }
      const matchedLine: unknown = {
        row: widgetSelfLine.row
          .map((i, index) => {
            let match = null
            Object.values(referenceLineMap!.row).forEach((referItem) => {
              if (i >= referItem.min && i <= referItem.max) {
                match = referItem.value
              }
            })
            if (match !== null) {
              if (index === 0) {
                newTop = match
              } else if (index === 1) {
                newTop = Math.floor(match - h.value / 2)
              } else if (index === 2) {
                newTop = Math.floor(match - h.value)
              }
            }
            return match
          })
          .filter((i) => i !== null),
        col: widgetSelfLine.col
          .map((i, index) => {
            let match = null
            Object.values(referenceLineMap!.col).forEach((referItem) => {
              if (i >= referItem.min && i <= referItem.max) {
                match = referItem.value
              }
            })
            if (match !== null) {
              if (index === 0) {
                newLeft = match
              } else if (index === 1) {
                newLeft = Math.floor(match - w.value / 2)
              } else if (index === 2) {
                newLeft = Math.floor(match - w.value)
              }
            }
            return match
          })
          .filter((i) => i !== null)
      }
      containerProvider.setMatchedLine(matchedLine as MatchedLine)

      const finalX = setLeft(newLeft)
      const finalY = setTop(newTop)
      const emitX = props.typeX === '%' ? convertFromPixel(finalX, '%', parentSize.parentWidth.value) : finalX
      const emitY = props.typeY === '%' ? convertFromPixel(finalY, '%', parentSize.parentHeight.value) : finalY
      emit('dragging', { x: emitX, y: emitY })
    } else {
      // No grid snap or reference line
      const finalX = setLeft(newLeft)
      const finalY = setTop(newTop)
      const emitX = props.typeX === '%' ? convertFromPixel(finalX, '%', parentSize.parentWidth.value) : finalX
      const emitY = props.typeY === '%' ? convertFromPixel(finalY, '%', parentSize.parentHeight.value) : finalY
      emit('dragging', { x: emitX, y: emitY })
    }
  }
  const handleDown = (e: HandleEvent) => {
    if (!draggable.value) return
    setDragging(true)

    // Store position at drag start
    lstX = x.value
    lstY = y.value
    lstPageX = getPosition(e)[0]
    lstPageY = getPosition(e)[1]

    addEvent(documentElement, MOVE_HANDLES, handleDrag)
    addEvent(documentElement, UP_HANDLES, handleUp)
    if (containerProvider && !containerProvider.disabled.value) {
      referenceLineMap = getReferenceLineMap(containerProvider, parentSize, id)
    }
  }
  watch(dragging, (cur, pre) => {
    if (!pre && cur) {
      // Convert to % if unit type is %
      const emitX = props.typeX === '%' ? convertFromPixel(x.value, '%', parentSize.parentWidth.value) : x.value
      const emitY = props.typeY === '%' ? convertFromPixel(y.value, '%', parentSize.parentHeight.value) : y.value
      emit('drag-start', { x: emitX, y: emitY })
      setEnable(true)
      setDragging(true)
    } else {
      // Convert to % if unit type is %
      const emitX = props.typeX === '%' ? convertFromPixel(x.value, '%', parentSize.parentWidth.value) : x.value
      const emitY = props.typeY === '%' ? convertFromPixel(y.value, '%', parentSize.parentHeight.value) : y.value
      emit('drag-end', { x: emitX, y: emitY })
      setDragging(false)
    }
  })
  onMounted(() => {
    const el = containerRef.value
    if (!el) return
    el.style.left = x + 'px'
    el.style.top = y + 'px'
    // document.documentElement.addEventListener('mousedown', _unselect)
    // el.addEventListener('mousedown', handleDown)
    addEvent(documentElement, DOWN_HANDLES, _unselect)
    addEvent(el, DOWN_HANDLES, handleDown)
  })
  onUnmounted(() => {
    if (!containerRef.value) return
    // document.documentElement.removeEventListener('mousedown', _unselect)
    // document.documentElement.removeEventListener('mouseup', handleUp)
    // document.documentElement.removeEventListener('mousemove', handleDrag)
    removeEvent(documentElement, DOWN_HANDLES, _unselect)
    removeEvent(documentElement, UP_HANDLES, handleUp)
    removeEvent(documentElement, MOVE_HANDLES, handleDrag)
  })
  return { containerRef }
}

export function initResizeHandle(
  containerProps: ReturnType<typeof initState>,
  limitProps: ReturnType<typeof initLimitSizeAndMethods>,
  parentSize: ReturnType<typeof initParent>,
  props: any,
  emit: any,
  getRotation?: () => number
) {
  const { setWidth, setHeight, setLeft, setTop } = limitProps
  const { width, height, left, top, aspectRatio } = containerProps
  const {
    setResizing,
    setResizingHandle,
    setResizingMaxWidth,
    setResizingMaxHeight,
    setResizingMinWidth,
    setResizingMinHeight
  } = containerProps
  const { parentWidth, parentHeight } = parentSize
  // Store position/size at resize start (not updated during resize)
  let lstW = 0
  let lstH = 0
  let lstX = 0
  let lstY = 0
  let lstPageX = 0
  let lstPageY = 0
  let tmpAspectRatio = 1
  let idx0 = ''
  let idx1 = ''
  // Store center position at resize start (for rotation-aware resizing)
  let lstCenterX = 0
  let lstCenterY = 0
  const documentElement = document.documentElement
  const resizeHandleDrag = (e: HandleEvent) => {
    e.preventDefault()
    let [_pageX, _pageY] = getPosition(e)

    // Calculate total delta from resize start position
    let deltaX = _pageX - lstPageX
    let deltaY = _pageY - lstPageY

    // Transform delta based on rotation
    const rotation = getRotation ? getRotation() : 0
    if (rotation !== 0) {
      const transformed = transformDelta(deltaX, deltaY, rotation)
      deltaX = transformed.dx
      deltaY = transformed.dy
    }

    let _deltaX = deltaX
    let _deltaY = deltaY

    // Aspect ratio lock handling
    if (props.lockAspectRatio) {
      deltaX = Math.abs(deltaX)
      deltaY = deltaX * tmpAspectRatio
      if (idx0 === 't') {
        if (_deltaX < 0 || (idx1 === 'm' && _deltaY < 0)) {
          deltaX = -deltaX
          deltaY = -deltaY
        }
      } else {
        if (_deltaX < 0 || (idx1 === 'm' && _deltaY < 0)) {
          deltaX = -deltaX
          deltaY = -deltaY
        }
      }
    }

    // Calculate new dimensions
    let newWidth = lstW
    let newHeight = lstH
    let newLeft = lstX
    let newTop = lstY

    if (idx0 === 't') {
      newHeight = lstH - deltaY
      newTop = lstY + deltaY
    } else if (idx0 === 'b') {
      newHeight = lstH + deltaY
    }
    if (idx1 === 'l') {
      newWidth = lstW - deltaX
      newLeft = lstX + deltaX
    } else if (idx1 === 'r') {
      newWidth = lstW + deltaX
    }

    // Apply minimum size constraints BEFORE position calculation
    // This prevents the anchor point from moving when hitting min size
    const minW = props.minW as number
    const minH = props.minH as number
    if (newWidth < minW) {
      newWidth = minW
    }
    if (newHeight < minH) {
      newHeight = minH
    }

    // When rotated, we need to adjust position to keep the anchor point (opposite corner) fixed
    if (rotation !== 0) {
      // The key insight: when resizing a rotated rectangle, the anchor point
      // (opposite corner in local space) must remain fixed in screen space.
      //
      // Algorithm:
      // 1. Calculate anchor point position in local space (relative to center)
      // 2. The rotated anchor point in screen space = center + rotate(localAnchor, rotation)
      // 3. After resize, calculate new center so anchor stays in same screen position

      const rad = rotation * Math.PI / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)

      // Determine anchor point offsets in local coordinate (before rotation)
      // For each handle, the anchor is the opposite corner/edge
      let anchorLocalX = 0  // offset from center in local X
      let anchorLocalY = 0  // offset from center in local Y

      // Vertical anchor offset (for height changes)
      if (idx0 === 't') {
        // Dragging top edge, anchor is bottom (positive Y in local space)
        anchorLocalY = lstH / 2
      } else if (idx0 === 'b') {
        // Dragging bottom edge, anchor is top (negative Y in local space)
        anchorLocalY = -lstH / 2
      }

      // Horizontal anchor offset (for width changes)
      if (idx1 === 'l') {
        // Dragging left edge, anchor is right (positive X in local space)
        anchorLocalX = lstW / 2
      } else if (idx1 === 'r') {
        // Dragging right edge, anchor is left (negative X in local space)
        anchorLocalX = -lstW / 2
      }

      // Calculate anchor point position in screen space (before resize)
      // screenAnchor = center + rotate(localAnchor, rotation)
      const anchorScreenX = lstCenterX + anchorLocalX * cos - anchorLocalY * sin
      const anchorScreenY = lstCenterY + anchorLocalX * sin + anchorLocalY * cos

      // Calculate new anchor point offset in local space (after resize)
      let newAnchorLocalX = 0
      let newAnchorLocalY = 0

      if (idx0 === 't') {
        newAnchorLocalY = newHeight / 2
      } else if (idx0 === 'b') {
        newAnchorLocalY = -newHeight / 2
      }

      if (idx1 === 'l') {
        newAnchorLocalX = newWidth / 2
      } else if (idx1 === 'r') {
        newAnchorLocalX = -newWidth / 2
      }

      // Calculate new center so that anchor remains at same screen position
      // anchorScreenX = newCenterX + newAnchorLocalX * cos - newAnchorLocalY * sin
      // anchorScreenY = newCenterY + newAnchorLocalX * sin + newAnchorLocalY * cos
      // Solving for newCenter:
      const newCenterX = anchorScreenX - (newAnchorLocalX * cos - newAnchorLocalY * sin)
      const newCenterY = anchorScreenY - (newAnchorLocalX * sin + newAnchorLocalY * cos)

      // Calculate new left/top from new center
      newLeft = newCenterX - newWidth / 2
      newTop = newCenterY - newHeight / 2
    }

    // Apply the new values through limit functions
    setWidth(newWidth)
    setHeight(newHeight)
    setLeft(newLeft)
    setTop(newTop)

    // Apply grid snap for resize
    if (props.snapToGrid && props.gridSpacing > 0) {
      const grid = props.gridSpacing
      const minW = props.minW
      const minH = props.minH

      if (rotation !== 0) {
        // Rotated element: snap center point to grid
        const centerX = left.value + width.value / 2
        const centerY = top.value + height.value / 2
        const snappedCenterX = Math.round(centerX / grid) * grid
        const snappedCenterY = Math.round(centerY / grid) * grid
        left.value = snappedCenterX - width.value / 2
        top.value = snappedCenterY - height.value / 2
      } else {
        // Non-rotated: snap edges to grid
        // Left/top edge handles (tl, tm, ml)
        // Use opposite edge as fixed anchor to check minW/minH
        if (idx1 === 'l') {
          const fixedRightEdge = lstX + lstW
          const snappedLeft = Math.round(left.value / grid) * grid
          const newWidthSnapped = fixedRightEdge - snappedLeft
          // Only apply snap if new width >= minW
          if (newWidthSnapped >= minW) {
            left.value = snappedLeft
            width.value = newWidthSnapped
          }
        }
        if (idx0 === 't') {
          const fixedBottomEdge = lstY + lstH
          const snappedTop = Math.round(top.value / grid) * grid
          const newHeightSnapped = fixedBottomEdge - snappedTop
          // Only apply snap if new height >= minH
          if (newHeightSnapped >= minH) {
            top.value = snappedTop
            height.value = newHeightSnapped
          }
        }

        // Right/bottom edge handles (br, bm, mr)
        if (idx1 === 'r') {
          const rightEdge = left.value + width.value
          const snappedRight = Math.round(rightEdge / grid) * grid
          const newWidthSnapped = snappedRight - left.value
          if (newWidthSnapped >= minW) {
            setWidth(newWidthSnapped)
          }
        }
        if (idx0 === 'b') {
          const bottomEdge = top.value + height.value
          const snappedBottom = Math.round(bottomEdge / grid) * grid
          const newHeightSnapped = snappedBottom - top.value
          if (newHeightSnapped >= minH) {
            setHeight(newHeightSnapped)
          }
        }
      }
    }

    // Emit with unit conversion
    const emitX = props.typeX === '%' ? convertFromPixel(left.value, '%', parentWidth.value) : left.value
    const emitY = props.typeY === '%' ? convertFromPixel(top.value, '%', parentHeight.value) : top.value
    const emitW = props.typeW === '%' ? convertFromPixel(width.value, '%', parentWidth.value) : width.value
    const emitH = props.typeH === '%' ? convertFromPixel(height.value, '%', parentHeight.value) : height.value
    emit('resizing', { x: emitX, y: emitY, w: emitW, h: emitH })
  }
  const resizeHandleUp = () => {
    // Convert to % if unit type is %
    const emitX = props.typeX === '%' ? convertFromPixel(left.value, '%', parentWidth.value) : left.value
    const emitY = props.typeY === '%' ? convertFromPixel(top.value, '%', parentHeight.value) : top.value
    const emitW = props.typeW === '%' ? convertFromPixel(width.value, '%', parentWidth.value) : width.value
    const emitH = props.typeH === '%' ? convertFromPixel(height.value, '%', parentHeight.value) : height.value
    emit('resize-end', {
      x: emitX,
      y: emitY,
      w: emitW,
      h: emitH
    })
    setResizingHandle('')
    setResizing(false)
    setResizingMaxWidth(Infinity)
    setResizingMaxHeight(Infinity)
    setResizingMinWidth(props.minW)
    setResizingMinHeight(props.minH)
    // document.documentElement.removeEventListener('mousemove', resizeHandleDrag)
    // document.documentElement.removeEventListener('mouseup', resizeHandleUp)
    removeEvent(documentElement, MOVE_HANDLES, resizeHandleDrag)
    removeEvent(documentElement, UP_HANDLES, resizeHandleUp)
  }
  const resizeHandleDown = (e: HandleEvent, handleType: ResizingHandle) => {
    if (!props.resizable) return
    e.stopPropagation()
    setResizingHandle(handleType)
    setResizing(true)

    const [pageX, pageY] = getPosition(e)

    idx0 = handleType[0]
    idx1 = handleType[1]
    if (props.lockAspectRatio) {
      if (['tl', 'tm', 'ml', 'bl'].includes(handleType)) {
        idx0 = 't'
        idx1 = 'l'
      } else {
        idx0 = 'b'
        idx1 = 'r'
      }
    }
    let minHeight = props.minH as number
    let minWidth = props.minW as number
    if (props.lockAspectRatio) {
      if (minHeight / minWidth > aspectRatio.value) {
        minWidth = minHeight / aspectRatio.value
      } else {
        minHeight = minWidth * aspectRatio.value
      }
    }
    setResizingMinWidth(minWidth)
    setResizingMinHeight(minHeight)
    if (props.parent) {
      let maxHeight =
        idx0 === 't' ? top.value + height.value : parentHeight.value - top.value
      let maxWidth =
        idx1 === 'l' ? left.value + width.value : parentWidth.value - left.value
      if (props.lockAspectRatio) {
        if (maxHeight / maxWidth < aspectRatio.value) {
          maxWidth = maxHeight / aspectRatio.value
        } else {
          maxHeight = maxWidth * aspectRatio.value
        }
      }
      setResizingMaxHeight(maxHeight)
      setResizingMaxWidth(maxWidth)
    }

    // Store position/size at resize start
    lstW = width.value
    lstH = height.value
    lstX = left.value
    lstY = top.value
    lstPageX = pageX
    lstPageY = pageY
    tmpAspectRatio = aspectRatio.value
    // Store center position for rotation-aware resizing
    lstCenterX = left.value + width.value / 2
    lstCenterY = top.value + height.value / 2
    // Convert to % if unit type is %
    const emitX = props.typeX === '%' ? convertFromPixel(left.value, '%', parentWidth.value) : left.value
    const emitY = props.typeY === '%' ? convertFromPixel(top.value, '%', parentHeight.value) : top.value
    const emitW = props.typeW === '%' ? convertFromPixel(width.value, '%', parentWidth.value) : width.value
    const emitH = props.typeH === '%' ? convertFromPixel(height.value, '%', parentHeight.value) : height.value
    emit('resize-start', {
      x: emitX,
      y: emitY,
      w: emitW,
      h: emitH
    })
    // document.documentElement.addEventListener('mousemove', resizeHandleDrag)
    // document.documentElement.addEventListener('mouseup', resizeHandleUp)
    addEvent(documentElement, MOVE_HANDLES, resizeHandleDrag)
    addEvent(documentElement, UP_HANDLES, resizeHandleUp)
  }
  onUnmounted(() => {
    // document.documentElement.removeEventListener('mouseup', resizeHandleDrag)
    // document.documentElement.removeEventListener('mousemove', resizeHandleUp)
    removeEvent(documentElement, UP_HANDLES, resizeHandleUp)
    removeEvent(documentElement, MOVE_HANDLES, resizeHandleDrag)
  })
  const handlesFiltered = computed(() =>
    props.resizable ? filterHandles(props.handles) : []
  )
  return {
    handlesFiltered,
    resizeHandleDown
  }
}

export function watchProps(
  props: any,
  limits: ReturnType<typeof initLimitSizeAndMethods>,
  parentSize: ReturnType<typeof initParent>,
  containerProps?: ReturnType<typeof initState>
) {
  const { setWidth, setHeight, setLeft, setTop } = limits
  watch(
    () => props.w,
    (newVal: number) => {
      // Ignore prop changes during drag/resize to prevent feedback loop
      if (containerProps?.dragging.value || containerProps?.resizing.value) return
      const pixelValue = convertToPixel(newVal, props.typeW, parentSize.parentWidth.value)
      setWidth(pixelValue)
    }
  )
  watch(
    () => props.h,
    (newVal: number) => {
      // Ignore prop changes during drag/resize to prevent feedback loop
      if (containerProps?.dragging.value || containerProps?.resizing.value) return
      const pixelValue = convertToPixel(newVal, props.typeH, parentSize.parentHeight.value)
      setHeight(pixelValue)
    }
  )
  watch(
    () => props.x,
    (newVal: number) => {
      // Ignore prop changes during drag/resize to prevent feedback loop
      if (containerProps?.dragging.value || containerProps?.resizing.value) return
      const pixelValue = convertToPixel(newVal, props.typeX, parentSize.parentWidth.value)
      setLeft(pixelValue)
    }
  )
  watch(
    () => props.y,
    (newVal: number) => {
      // Ignore prop changes during drag/resize to prevent feedback loop
      if (containerProps?.dragging.value || containerProps?.resizing.value) return
      const pixelValue = convertToPixel(newVal, props.typeY, parentSize.parentHeight.value)
      setTop(pixelValue)
    }
  )
}
