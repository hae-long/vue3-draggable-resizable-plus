import { computed, defineComponent, h, provide, reactive, toRef, ref, onMounted, onUnmounted } from 'vue'
import {
  PositionStore,
  Position,
  UpdatePosition,
  GetPositionStore,
  MatchedLine,
  SetMatchedLine,
  SpacingIndicator,
  ActiveElementInfo,
  SetActiveElement,
  GetActiveElement
} from './types'
import { IDENTITY, getRotatedBoundingBox } from './utils'

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
    },
    showSpacing: {
      type: Boolean,
      default: true
    },
    spacingColor: {
      type: String,
      default: '#ff6b6b'
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

    // Active element for spacing calculation
    const activeElement = ref<ActiveElementInfo | null>(null)
    const setActiveElement: SetActiveElement = (element: ActiveElementInfo | null) => {
      activeElement.value = element
    }
    const getActiveElement: GetActiveElement = () => activeElement.value
    provide('setActiveElement', setActiveElement)
    provide('getActiveElement', getActiveElement)

    // Calculate spacing indicators between active element and other elements
    const spacingIndicators = computed<SpacingIndicator[]>(() => {
      if (!activeElement.value || !props.showSpacing) return []

      const active = activeElement.value
      const indicators: SpacingIndicator[] = []
      const positions = Object.entries(positionStore).filter(([id]) => id !== active.id)

      // Get rotated bounding box for active element if it has rotation
      const rotation = active.rotation || 0
      let activeLeft: number
      let activeRight: number
      let activeTop: number
      let activeBottom: number
      let activeCenterX: number
      let activeCenterY: number

      if (rotation !== 0) {
        // Use axis-aligned bounding box of rotated element
        const rotatedBounds = getRotatedBoundingBox(active.x, active.y, active.w, active.h, rotation)
        activeLeft = rotatedBounds.minX
        activeRight = rotatedBounds.maxX
        activeTop = rotatedBounds.minY
        activeBottom = rotatedBounds.maxY
        activeCenterX = (rotatedBounds.minX + rotatedBounds.maxX) / 2
        activeCenterY = (rotatedBounds.minY + rotatedBounds.maxY) / 2
      } else {
        // Non-rotated element uses original bounds
        activeLeft = active.x
        activeRight = active.x + active.w
        activeTop = active.y
        activeBottom = active.y + active.h
        activeCenterX = active.x + active.w / 2
        activeCenterY = active.y + active.h / 2
      }

      for (const [, pos] of positions) {
        const otherLeft = pos.x
        const otherRight = pos.x + pos.w
        const otherTop = pos.y
        const otherBottom = pos.y + pos.h

        // Check vertical overlap (for horizontal spacing)
        const verticalOverlap = !(activeBottom < otherTop || activeTop > otherBottom)

        // Check horizontal overlap (for vertical spacing)
        const horizontalOverlap = !(activeRight < otherLeft || activeLeft > otherRight)

        if (verticalOverlap) {
          // Calculate Y position for the indicator (use overlapping area center)
          const overlapTop = Math.max(activeTop, otherTop)
          const overlapBottom = Math.min(activeBottom, otherBottom)
          const indicatorY = (overlapTop + overlapBottom) / 2

          // Horizontal spacing: active is to the left of other
          if (activeRight < otherLeft) {
            const distance = otherLeft - activeRight
            indicators.push({
              type: 'horizontal',
              x: activeRight,
              y: indicatorY,
              length: distance,
              distance
            })
          }
          // Horizontal spacing: active is to the right of other
          else if (activeLeft > otherRight) {
            const distance = activeLeft - otherRight
            indicators.push({
              type: 'horizontal',
              x: otherRight,
              y: indicatorY,
              length: distance,
              distance
            })
          }
        }

        if (horizontalOverlap) {
          // Calculate X position for the indicator (use overlapping area center)
          const overlapLeft = Math.max(activeLeft, otherLeft)
          const overlapRight = Math.min(activeRight, otherRight)
          const indicatorX = (overlapLeft + overlapRight) / 2

          // Vertical spacing: active is above other
          if (activeBottom < otherTop) {
            const distance = otherTop - activeBottom
            indicators.push({
              type: 'vertical',
              x: indicatorX,
              y: activeBottom,
              length: distance,
              distance
            })
          }
          // Vertical spacing: active is below other
          else if (activeTop > otherBottom) {
            const distance = activeTop - otherBottom
            indicators.push({
              type: 'vertical',
              x: indicatorX,
              y: otherBottom,
              length: distance,
              distance
            })
          }
        }
      }

      // Also check spacing to container edges (parent boundaries)
      if (containerSize.width > 0 && containerSize.height > 0) {
        // Left edge
        if (activeLeft > 0) {
          indicators.push({
            type: 'horizontal',
            x: 0,
            y: activeCenterY,
            length: activeLeft,
            distance: activeLeft
          })
        }
        // Right edge
        if (activeRight < containerSize.width) {
          indicators.push({
            type: 'horizontal',
            x: activeRight,
            y: activeCenterY,
            length: containerSize.width - activeRight,
            distance: containerSize.width - activeRight
          })
        }
        // Top edge
        if (activeTop > 0) {
          indicators.push({
            type: 'vertical',
            x: activeCenterX,
            y: 0,
            length: activeTop,
            distance: activeTop
          })
        }
        // Bottom edge
        if (activeBottom < containerSize.height) {
          indicators.push({
            type: 'vertical',
            x: activeCenterX,
            y: activeBottom,
            length: containerSize.height - activeBottom,
            distance: containerSize.height - activeBottom
          })
        }
      }

      return indicators
    })

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
      containerSize,
      spacingIndicators,
      activeElement
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
        const maxGridX = Math.floor(this.containerSize.width / this.gridSpacing)
        // Exclude last value to prevent scrolling
        for (let i = 0; i < maxGridX; i++) {
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
                backgroundColor: 'transparent',
                padding: '2px',
                zIndex: '10000'
              }
            }, `${i}`)
          )
        }
      }

      // Vertical grid line numbers (Y-axis)
      if (this.showGridNumbersY) {
        const maxGridY = Math.floor(this.containerSize.height / this.gridSpacing)
        // Exclude last value to prevent scrolling
        for (let i = 0; i < maxGridY; i++) {
          const pos = i * this.gridSpacing
          numbers.push(
            h('div', {
              style: {
                position: 'absolute',
                left: '0px',
                top: (pos - 5) + 'px',
                fontSize: '10px',
                color: '#f00',
                backgroundColor: 'transparent',
                padding: '2px',
                zIndex: '10000'
              }
            }, `${i}`)
          )
        }
      }

      return numbers
    },
    renderSpacingIndicators() {
      if (!this.showSpacing || !this.activeElement) {
        return []
      }

      return this.spacingIndicators.map((indicator, index) => {
        const isHorizontal = indicator.type === 'horizontal'
        const lineStyle = {
          position: 'absolute',
          backgroundColor: this.spacingColor,
          zIndex: '10001',
          pointerEvents: 'none'
        }

        const labelStyle = {
          position: 'absolute',
          backgroundColor: this.spacingColor,
          color: '#fff',
          fontSize: '10px',
          padding: '2px 4px',
          borderRadius: '2px',
          zIndex: '10002',
          pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }

        if (isHorizontal) {
          // Horizontal line and label
          return h('div', { key: `spacing-h-${index}` }, [
            // Line
            h('div', {
              style: {
                ...lineStyle,
                left: indicator.x + 'px',
                top: (indicator.y - 0.5) + 'px',
                width: indicator.length + 'px',
                height: '1px'
              }
            }),
            // Arrow left
            h('div', {
              style: {
                ...lineStyle,
                left: indicator.x + 'px',
                top: (indicator.y - 4) + 'px',
                width: '1px',
                height: '8px'
              }
            }),
            // Arrow right
            h('div', {
              style: {
                ...lineStyle,
                left: (indicator.x + indicator.length - 1) + 'px',
                top: (indicator.y - 4) + 'px',
                width: '1px',
                height: '8px'
              }
            }),
            // Label
            h('div', {
              style: {
                ...labelStyle,
                left: (indicator.x + indicator.length / 2) + 'px',
                top: (indicator.y - 18) + 'px',
                transform: 'translateX(-50%)'
              }
            }, `${Math.round(indicator.distance)}px`)
          ])
        } else {
          // Vertical line and label
          return h('div', { key: `spacing-v-${index}` }, [
            // Line
            h('div', {
              style: {
                ...lineStyle,
                left: (indicator.x - 0.5) + 'px',
                top: indicator.y + 'px',
                width: '1px',
                height: indicator.length + 'px'
              }
            }),
            // Arrow top
            h('div', {
              style: {
                ...lineStyle,
                left: (indicator.x - 4) + 'px',
                top: indicator.y + 'px',
                width: '8px',
                height: '1px'
              }
            }),
            // Arrow bottom
            h('div', {
              style: {
                ...lineStyle,
                left: (indicator.x - 4) + 'px',
                top: (indicator.y + indicator.length - 1) + 'px',
                width: '8px',
                height: '1px'
              }
            }),
            // Label
            h('div', {
              style: {
                ...labelStyle,
                left: (indicator.x + 8) + 'px',
                top: (indicator.y + indicator.length / 2) + 'px',
                transform: 'translateY(-50%)'
              }
            }, `${Math.round(indicator.distance)}px`)
          ])
        }
      })
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
          overflow: 'hidden',
          ...this.gridStyle
        }
      },
      [
        this.$slots.default && this.$slots.default(),
        ...this.renderReferenceLine(),
        ...this.renderGridNumbers(),
        ...this.renderSpacingIndicators()
      ]
    )
  }
})
