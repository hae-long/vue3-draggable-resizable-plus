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
import { getElSize, filterHandles, IDENTITY, convertToPixel, convertFromPixel } from './utils'
import {
  UpdatePosition,
  GetPositionStore,
  ResizingHandle,
  ContainerProvider,
  SetMatchedLine
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
  'update:w',
  'update:h',
  'update:x',
  'update:y',
  'update:active'
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
    }
    const limitProps = initLimitSizeAndMethods(
      props,
      parentSize,
      containerProps
    )
    initDraggableContainer(
      containerRef,
      containerProps,
      limitProps,
      toRef(props, 'draggable'),
      emit,
      containerProvider,
      parentSize,
      props
    )
    const resizeHandle = initResizeHandle(
      containerProps,
      limitProps,
      parentSize,
      props,
      emit
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

    // Watch for active state changes
    watch(() => containerProps.enable.value, (isActive) => {
      if (isActive) {
        activateZIndex()
      } else {
        deactivateZIndex()
      }
    })
    
    return {
      containerRef,
      containerProvider,
      ...containerProps,
      ...parentSize,
      ...limitProps,
      ...resizeHandle,
      setZIndex,
      activateZIndex,
      deactivateZIndex
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
      
      return {
        width: width + this.typeW,
        height: height + this.typeH,
        top: top + this.typeY,
        left: left + this.typeX
      }
    },
    klass(): { [propName: string]: string | boolean } {
      return {
        [this.classNameActive]: this.enable,
        [this.classNameDragging]: this.dragging,
        [this.classNameResizing]: this.resizing,
        [this.classNameDraggable]: this.draggable,
        [this.classNameResizable]: this.resizable
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
    return h(
      'div',
      {
        ref: 'containerRef',
        class: ['vdr-container', this.klass],
        style: this.style
      },
      [
        this.$slots.default && this.$slots.default(),
        ...this.handlesFiltered.map((item) =>
          h('div', {
            class: [
              'vdr-handle',
              'vdr-handle-' + item,
              this.classNameHandle,
              `${this.classNameHandle}-${item}`
            ],
            style: { display: this.enable ? 'block' : 'none' },
            onMousedown: (e: MouseEvent) =>
              this.resizeHandleDown(e, <ResizingHandle>item),
            onTouchstart: (e: TouchEvent) =>
              this.resizeHandleDown(e, <ResizingHandle>item)
          })
        )
      ]
    )
  }
})

export default VueDraggableResizable
