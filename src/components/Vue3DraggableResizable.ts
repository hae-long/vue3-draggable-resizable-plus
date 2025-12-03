import { defineComponent, ref, toRef, h, Ref, inject, watch } from 'vue'
import {
  initDraggableContainer,
  watchProps,
  initState,
  initParent,
  initLimitSizeAndMethods,
  initResizeHandle
} from './hooks'
import './index.css'
import { getElSize, filterHandles, IDENTITY, convertToPixel, convertFromPixel, getRotatedCursor, getRotatedBoundingBox } from './utils'
import {
  UpdatePosition,
  GetPositionStore,
  ResizingHandle,
  ContainerProvider,
  SetMatchedLine,
  SetActiveElement
} from './types'

export const ALL_HANDLES: ResizingHandle[] = [
  'tl',
  'tm',
  'tr',
  'ml',
  'mr',
  'bl',
  'bm',
  'br'
]

const VdrProps = {
  initW: {
    type: Number,
    default: null
  },
  initH: {
    type: Number,
    default: null
  },
  w: {
    type: Number,
    default: 0
  },
  h: {
    type: Number,
    default: 0
  },
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  },
  draggable: {
    type: Boolean,
    default: true
  },
  resizable: {
    type: Boolean,
    default: true
  },
  disabledX: {
    type: Boolean,
    default: false
  },
  disabledY: {
    type: Boolean,
    default: false
  },
  disabledW: {
    type: Boolean,
    default: false
  },
  disabledH: {
    type: Boolean,
    default: false
  },
  minW: {
    type: Number,
    default: 20
  },
  minH: {
    type: Number,
    default: 20
  },
  active: {
    type: Boolean,
    default: false
  },
  parent: {
    type: Boolean,
    default: false
  },
  handles: {
    type: Array,
    default: ALL_HANDLES,
    validator: (handles: ResizingHandle[]) => {
      return filterHandles(handles).length === handles.length
    }
  },
  classNameDraggable: {
    type: String,
    default: 'draggable'
  },
  classNameResizable: {
    type: String,
    default: 'resizable'
  },
  classNameDragging: {
    type: String,
    default: 'dragging'
  },
  classNameResizing: {
    type: String,
    default: 'resizing'
  },
  classNameActive: {
    type: String,
    default: 'active'
  },
  classNameHandle: {
    type: String,
    default: 'handle'
  },
  lockAspectRatio: {
    type: Boolean,
    default: false
  },
  typeX: {
    type: String,
    default: 'px',
    validator: (value: string) => ['px', '%'].includes(value)
  },
  typeY: {
    type: String,
    default: 'px',
    validator: (value: string) => ['px', '%'].includes(value)
  },
  typeW: {
    type: String,
    default: 'px',
    validator: (value: string) => ['px', '%'].includes(value)
  },
  typeH: {
    type: String,
    default: 'px',
    validator: (value: string) => ['px', '%'].includes(value)
  },
  gridSpacing: {
    type: Number,
    default: 20
  },
  snapToGrid: {
    type: Boolean,
    default: false
  },
  rotatable: {
    type: Boolean,
    default: false
  },
  rotation: {
    type: Number,
    default: 0
  },
  rotationSnap: {
    type: Number,
    default: 0  // 0 means no snap, e.g., 15 for 15-degree snap
  },
  classNameRotateHandle: {
    type: String,
    default: 'rotate-handle'
  }
}

const emits = [
  'activated',
  'deactivated',
  'drag-start',
  'resize-start',
  'dragging',
  'resizing',
  'drag-end',
  'resize-end',
  'rotate-start',
  'rotating',
  'rotate-end',
  'update:w',
  'update:h',
  'update:x',
  'update:y',
  'update:active',
  'update:rotation'
]

const VueDraggableResizable = defineComponent({
  name: 'Vue3DraggableResizable',
  props: VdrProps,
  emits: emits,
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement>()
    const parentSize = initParent(containerRef)
    const containerProps = initState(props, emit, parentSize)
    const provideIdentity = inject('identity', Symbol())
    let containerProvider: ContainerProvider | null = null
    let setActiveElement: SetActiveElement | null = null
    if (provideIdentity === IDENTITY) {
      containerProvider = {
        updatePosition: inject<UpdatePosition>('updatePosition')!,
        getPositionStore: inject<GetPositionStore>('getPositionStore')!,
        disabled: inject<Ref<boolean>>('disabled')!,
        adsorbParent: inject<Ref<boolean>>('adsorbParent')!,
        adsorbCols: inject<number[]>('adsorbCols')!,
        adsorbRows: inject<number[]>('adsorbRows')!,
        setMatchedLine: inject<SetMatchedLine>('setMatchedLine')!
      }
      setActiveElement = inject<SetActiveElement | null>('setActiveElement', null)
    }
    const limitProps = initLimitSizeAndMethods(
      props,
      parentSize,
      containerProps
    )

    // Rotation state - declared early for use in initResizeHandle
    const currentRotation = ref(props.rotation)
    const rotating = ref(false)

    initDraggableContainer(
      containerRef,
      containerProps,
      limitProps,
      toRef(props, 'draggable'),
      emit,
      containerProvider,
      parentSize,
      props,
      () => currentRotation.value
    )
    const resizeHandle = initResizeHandle(
      containerProps,
      limitProps,
      parentSize,
      props,
      emit,
      () => currentRotation.value
    )
    watchProps(props, limitProps, parentSize, containerProps)

    // z-index management
    const originalZIndex = ref<string>('')
    const setZIndex = (zIndex: string) => {
      if (containerRef.value) {
        containerRef.value.style.zIndex = zIndex;
      }
    }

    const activateZIndex = () => {
      if (containerRef.value) {
        // Store original z-index
        originalZIndex.value = containerRef.value.style.zIndex || 'auto'
        // Set z-index to 9999 when active
        setZIndex('9999')
      }
    }

    const deactivateZIndex = () => {
      if (containerRef.value) {
        // Restore original z-index when deactivated
        setZIndex(originalZIndex.value)
      }
    }

    // Helper function to update active element info
    const updateActiveElementInfo = () => {
      if (setActiveElement) {
        setActiveElement({
          id: containerProps.id,
          x: containerProps.left.value,
          y: containerProps.top.value,
          w: containerProps.width.value,
          h: containerProps.height.value,
          rotation: currentRotation.value
        })
      }
    }

    // Watch for active state changes
    watch(() => containerProps.enable.value, (isActive) => {
      if (isActive) {
        activateZIndex()
        updateActiveElementInfo()
      } else {
        deactivateZIndex()
        if (setActiveElement) {
          setActiveElement(null)
        }
      }
    })

    // Watch for position/size changes during drag/resize
    watch(
      [containerProps.left, containerProps.top, containerProps.width, containerProps.height],
      () => {
        if (containerProps.enable.value && (containerProps.dragging.value || containerProps.resizing.value)) {
          updateActiveElementInfo()
        }
      }
    )

    // Watch for rotation changes to update spacing indicator
    watch(currentRotation, () => {
      if (containerProps.enable.value) {
        updateActiveElementInfo()
      }
    })

    // Rotation logic (state already declared above for initResizeHandle)
    let rotateStartAngle = 0
    let rotateStartRotation = 0
    let centerX = 0
    let centerY = 0

    // Watch for external rotation prop changes
    watch(() => props.rotation, (newVal) => {
      if (!rotating.value) {
        currentRotation.value = newVal
      }
    })

    const getAngle = (cx: number, cy: number, px: number, py: number) => {
      const dx = px - cx
      const dy = py - cy
      return Math.atan2(dy, dx) * (180 / Math.PI)
    }

    const rotateHandleDown = (e: MouseEvent | TouchEvent) => {
      if (!props.rotatable) return
      e.stopPropagation()
      e.preventDefault()

      rotating.value = true

      // Get center of element
      if (containerRef.value) {
        const rect = containerRef.value.getBoundingClientRect()
        centerX = rect.left + rect.width / 2
        centerY = rect.top + rect.height / 2
      }

      // Get start angle
      const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX
      const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY
      rotateStartAngle = getAngle(centerX, centerY, pageX, pageY)
      rotateStartRotation = currentRotation.value

      emit('rotate-start', { rotation: currentRotation.value })

      document.addEventListener('mousemove', rotateHandleMove)
      document.addEventListener('mouseup', rotateHandleUp)
      document.addEventListener('touchmove', rotateHandleMove)
      document.addEventListener('touchend', rotateHandleUp)
    }

    const rotateHandleMove = (e: MouseEvent | TouchEvent) => {
      if (!rotating.value) return
      e.preventDefault()

      const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX
      const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY

      const currentAngle = getAngle(centerX, centerY, pageX, pageY)
      let newRotation = rotateStartRotation + (currentAngle - rotateStartAngle)

      // Normalize to 0-360
      newRotation = ((newRotation % 360) + 360) % 360

      // Apply rotation snap if configured
      if (props.rotationSnap > 0) {
        newRotation = Math.round(newRotation / props.rotationSnap) * props.rotationSnap
      }

      currentRotation.value = newRotation
      emit('update:rotation', newRotation)
      emit('rotating', { rotation: newRotation })
    }

    const rotateHandleUp = () => {
      rotating.value = false
      emit('rotate-end', { rotation: currentRotation.value })

      document.removeEventListener('mousemove', rotateHandleMove)
      document.removeEventListener('mouseup', rotateHandleUp)
      document.removeEventListener('touchmove', rotateHandleMove)
      document.removeEventListener('touchend', rotateHandleUp)
    }

    return {
      containerRef,
      containerProvider,
      ...containerProps,
      ...parentSize,
      ...limitProps,
      ...resizeHandle,
      setZIndex,
      activateZIndex,
      deactivateZIndex,
      currentRotation,
      rotating,
      rotateHandleDown
    }
  },
  computed: {
    style(): { [propName: string]: string } {
      let width = this.typeW === '%' ? convertFromPixel(this.width, '%', this.parentWidth) : this.width
      let height = this.typeH === '%' ? convertFromPixel(this.height, '%', this.parentHeight) : this.height
      let top = this.typeY === '%' ? convertFromPixel(this.top, '%', this.parentHeight) : this.top
      let left = this.typeX === '%' ? convertFromPixel(this.left, '%', this.parentWidth) : this.left

      // Limit to 2 decimal places for % units
      if (this.typeW === '%') width = Number(width.toFixed(2))
      if (this.typeH === '%') height = Number(height.toFixed(2))
      if (this.typeY === '%') top = Number(top.toFixed(2))
      if (this.typeX === '%') left = Number(left.toFixed(2))

      const style: { [propName: string]: string } = {
        width: width + this.typeW,
        height: height + this.typeH,
        top: top + this.typeY,
        left: left + this.typeX
      }

      // Add rotation transform if rotatable
      if (this.rotatable && this.currentRotation !== 0) {
        style.transform = `rotate(${this.currentRotation}deg)`
      }

      return style
    },
    klass(): { [propName: string]: string | boolean } {
      return {
        [this.classNameActive]: this.enable,
        [this.classNameDragging]: this.dragging,
        [this.classNameResizing]: this.resizing,
        [this.classNameDraggable]: this.draggable,
        [this.classNameResizable]: this.resizable,
        rotating: this.rotating
      }
    }
  },
  mounted() {
    if (!this.containerRef) return
    this.containerRef.ondragstart = () => false
    const { width, height } = getElSize(this.containerRef)

    // Set initial width
    const initWidth = this.initW !== null ? this.initW : (this.w || width)
    const pixelWidth = convertToPixel(initWidth, this.typeW, this.parentWidth)
    this.setWidth(pixelWidth)

    // Set initial height
    const initHeight = this.initH !== null ? this.initH : (this.h || height)
    const pixelHeight = convertToPixel(initHeight, this.typeH, this.parentHeight)
    this.setHeight(pixelHeight)

    // Set initial position
    const pixelLeft = convertToPixel(this.x, this.typeX, this.parentWidth)
    const pixelTop = convertToPixel(this.y, this.typeY, this.parentHeight)
    this.setLeft(pixelLeft)
    this.setTop(pixelTop)

    // Set initial z-index
    if (this.enable) {
      this.activateZIndex()
    }
    
    if (this.containerProvider) {
      this.containerProvider.updatePosition(this.id, {
        x: this.left,
        y: this.top,
        w: this.width,
        h: this.height
      })
    }
  },
  render() {
    const children = [
      this.$slots.default && this.$slots.default(),
      ...this.handlesFiltered.map((item) => {
        // Calculate rotated cursor if rotatable
        const cursor = this.rotatable && this.currentRotation !== 0
          ? getRotatedCursor(item as ResizingHandle, this.currentRotation)
          : undefined  // Use CSS default cursor

        return h('div', {
          class: [
            'vdr-handle',
            'vdr-handle-' + item,
            this.classNameHandle,
            `${this.classNameHandle}-${item}`
          ],
          style: {
            display: this.enable ? 'block' : 'none',
            ...(cursor ? { cursor } : {})
          },
          onMousedown: (e: MouseEvent) =>
            this.resizeHandleDown(e, <ResizingHandle>item),
          onTouchstart: (e: TouchEvent) =>
            this.resizeHandleDown(e, <ResizingHandle>item)
        })
      })
    ]

    // Add rotate handle if rotatable
    if (this.rotatable) {
      children.push(
        h('div', {
          class: ['vdr-rotate-handle', this.classNameRotateHandle],
          style: { display: this.enable ? 'block' : 'none' },
          onMousedown: this.rotateHandleDown,
          onTouchstart: this.rotateHandleDown
        })
      )
    }

    return h(
      'div',
      {
        ref: 'containerRef',
        class: ['vdr-container', this.klass],
        style: this.style
      },
      children
    )
  }
})

export default VueDraggableResizable
