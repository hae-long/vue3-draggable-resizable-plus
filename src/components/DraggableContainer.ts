import { computed, defineComponent, h, provide, reactive, toRef, ref, onMounted, onUnmounted } from 'vue'
import {
  PositionStore,
  Position,
  UpdatePosition,
  GetPositionStore,
  MatchedLine,
  SetMatchedLine
} from './types'
import { IDENTITY } from './utils'

export default defineComponent({
  name: 'DraggableContainer',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    adsorbParent: {
      type: Boolean,
      default: true
    },
    adsorbCols: {
      type: Array,
      default: null
    },
    adsorbRows: {
      type: Array,
      default: null
    },
    referenceLineVisible: {
      type: Boolean,
      default: true
    },
    referenceLineColor: {
      type: String,
      default: '#f00'
    },
    gridSpacing: {
      type: Number,
      default: 20
    },
    showGrid: {
      type: Boolean,
      default: false
    },
    gridColor: {
      type: String,
      default: '#e0e0e0'
    },
    showGridNumbersX: {
      type: Boolean,
      default: false
    },
    showGridNumbersY: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const positionStore = reactive<PositionStore>({})
    const updatePosition: UpdatePosition = (id: string, position: Position) => {
      positionStore[id] = position
    }
    const getPositionStore: GetPositionStore = (excludeId?: string) => {
      const _positionStore = Object.assign({}, positionStore)
      if (excludeId) {
        delete _positionStore[excludeId]
      }
      return _positionStore
    }
    const state = reactive<{
      matchedLine: MatchedLine | null
    }>({
      matchedLine: null
    })
    const matchedRows = computed(
      () => (state.matchedLine && state.matchedLine.row) || []
    )
    const matchedCols = computed(
      () => (state.matchedLine && state.matchedLine.col) || []
    )
    const setMatchedLine: SetMatchedLine = (
      matchedLine: MatchedLine | null
    ) => {
      state.matchedLine = matchedLine
    }
    provide('identity', IDENTITY)
    provide('updatePosition', updatePosition)
    provide('getPositionStore', getPositionStore)
    provide('setMatchedLine', setMatchedLine)
    provide('disabled', toRef(props, 'disabled'))
    provide('adsorbParent', toRef(props, 'adsorbParent'))
    provide('adsorbCols', props.adsorbCols || [])
    provide('adsorbRows', props.adsorbRows || [])

    const gridStyle = computed(() => {
      if (!props.showGrid || props.gridSpacing <= 0) {
        return {}
      }
      return {
        backgroundImage: `
          linear-gradient(to right, ${props.gridColor} 1px, transparent 1px),
          linear-gradient(to bottom, ${props.gridColor} 1px, transparent 1px)
        `,
        backgroundSize: `${props.gridSpacing}px ${props.gridSpacing}px`,
        backgroundOrigin: 'padding-box',
        backgroundPosition: '0 0'
      }
    })

    // Ref and reactive state for measuring container size
    const containerRef = ref<HTMLElement>()
    const containerSize = reactive({
      width: 0,
      height: 0
    })

    // Function to measure container size
    const updateContainerSize = () => {
      if (containerRef.value) {
        const rect = containerRef.value.getBoundingClientRect()
        containerSize.width = rect.width
        containerSize.height = rect.height
      }
    }

    // Browser resize event handler
    let resizeObserver: any = null

    onMounted(() => {
      updateContainerSize()

      // Use ResizeObserver to detect container size changes
      if (containerRef.value && typeof window !== 'undefined' && 'ResizeObserver' in window) {
        resizeObserver = new (window as any).ResizeObserver(() => {
          updateContainerSize()
        })
        resizeObserver.observe(containerRef.value)
      }
    })

    onUnmounted(() => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    })

    return {
      matchedRows,
      matchedCols,
      gridStyle,
      containerRef,
      containerSize
    }
  },
  methods: {
    renderReferenceLine() {
      if (!this.referenceLineVisible) {
        return []
      }
      return [
        ...this.matchedCols.map((item) => {
          return h('div', {
            style: {
              width: '0',
              height: '100%',
              top: '0',
              left: item + 'px',
              borderLeft: `1px dashed ${this.referenceLineColor}`,
              position: 'absolute'
            }
          })
        }),
        ...this.matchedRows.map((item) => {
          return h('div', {
            style: {
              width: '100%',
              height: '0',
              left: '0',
              top: item + 'px',
              borderTop: `1px dashed ${this.referenceLineColor}`,
              position: 'absolute'
            }
          })
        })
      ]
    },
    renderGridNumbers() {
      // Debug: display grid line numbers
      if (!this.showGrid || this.gridSpacing <= 0) {
        return []
      }
      const numbers = []

      // Return empty array if container size has not been measured
      if (!this.containerSize.width || !this.containerSize.height) {
        return []
      }

      // Horizontal grid line numbers (X-axis)
      if (this.showGridNumbersX) {
        const maxGridX = Math.ceil(this.containerSize.width / this.gridSpacing)
        for (let i = 0; i <= maxGridX; i++) {
          const pos = i * this.gridSpacing

          // When both X and Y are enabled, show 0 only on Y-axis (prevent duplicate)
          if (i === 0 && this.showGridNumbersY) continue

          numbers.push(
            h('div', {
              style: {
                position: 'absolute',
                left: (pos - 10) + 'px',
                top: '0px',
                fontSize: '10px',
                color: '#f00',
                backgroundColor: 'rgba(255,255,255,0.7)',
                padding: '2px',
                zIndex: '10000'
              }
            }, `${i}`)
          )
        }
      }

      // Vertical grid line numbers (Y-axis)
      if (this.showGridNumbersY) {
        const maxGridY = Math.ceil(this.containerSize.height / this.gridSpacing)
        for (let i = 0; i <= maxGridY; i++) {
          const pos = i * this.gridSpacing
          numbers.push(
            h('div', {
              style: {
                position: 'absolute',
                left: '0px',
                top: (pos - 5) + 'px',
                fontSize: '10px',
                color: '#f00',
                backgroundColor: 'rgba(255,255,255,0.7)',
                padding: '2px',
                zIndex: '10000'
              }
            }, `${i}`)
          )
        }
      }

      return numbers
    }
  },
  render() {
    return h(
      'div',
      {
        ref: 'containerRef',
        style: {
          width: '100%',
          height: '100%',
          position: 'relative',
          ...this.gridStyle
        }
      },
      [
        this.$slots.default && this.$slots.default(),
        ...this.renderReferenceLine(),
        ...this.renderGridNumbers()
      ]
    )
  }
})
