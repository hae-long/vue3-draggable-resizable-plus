Note: This is a maintained fork of [a7650/vue3-draggable-resizable/main-branch]. The original repository seems to be inactive since 2022. I have forked it to continue development, fix bugs, and add new features.

<p align="center"><img src="https://github.com/hae-long/vue3-draggable-resizable/blob/main/docs/logo.png" alt="logo"></p>

<h1 align="center">Vue3-Draggable-Resizable</h1>
<div align="center">

[![npm version](https://badge.fury.io/js/vue3-draggable-resizable-plus.svg)](https://www.npmjs.com/package/vue3-draggable-resizable-plus)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)
[![npm](https://img.shields.io/npm/dt/vue3-draggable-resizable-plus.svg?style=flat-square)](https://www.npmjs.com/package/vue3-draggable-resizable-plus)
[![vue version](https://img.shields.io/badge/vue_version->=3-brightgreen.svg?style=flat-square)](https://github.com/hae-long/vue3-draggable-resizable)

</div>

> [Vue3 Component] Draggable, resizable and rotatable component for vue3, with support for collision detection, element snap alignment, real-time reference lines, grid snap, spacing indicators and unit conversion (px/%).

[한국어 문서](https://github.com/hae-long/vue3-draggable-resizable/blob/main/docs/document_kr.md)

## Table of Contents

- [Features](#features)
- [Usage](#usage)
  - [Props](#props)
  - [Events](#events)
  - [Use adsorption alignment](#use-adsorption-alignment)
  - [Grid System](#grid-system)
  - [Spacing Indicators](#spacing-indicators)
  - [Rotation](#rotation)
  - [Unit Conversion (px/%)](#unit-conversion)
  - [Utility Functions](#utility-functions)

### Features

- Draggable and resizable
- **Rotatable with snap angle support**
- Define handles for resizing
- Restrict movement and size in parent node
- Customize various class names
- Provide your own markup for handles
- Adsorption alignment
- Reference line
- **Grid system with snap-to-grid (supports rotated elements with center-point snap)**
- **Spacing indicators between elements (Figma-like)**
- **Unit conversion (px/%) support**
- **Utility functions for unit conversion**

### Usage

```bash
$ npm install vue3-draggable-resizable-plus
```

Register the Vue3DraggableResizable

```js
// >main.js
import { createApp } from 'vue'
import App from './App.vue'
import Vue3DraggableResizable from 'vue3-draggable-resizable-plus'
// default styles
import 'vue3-draggable-resizable-plus/style.css'

// You will have a global component named "Vue3DraggableResizable"
createApp(App)
  .use(Vue3DraggableResizable)
  .mount('#app')
```

You can also use it separately within the component

```js
// >component.js
import { defineComponent } from 'vue'
import Vue3DraggableResizable from 'vue3-draggable-resizable-plus'
// default styles
import 'vue3-draggable-resizable-plus/style.css'

export default defineComponent({
  components: { Vue3DraggableResizable }
  // ...other
})
```

Here is a complete example of using "vue-template"

```vue
<template>
  <div id="app">
    <div class="parent">
      <Vue3DraggableResizable
        :initW="110"
        :initH="120"
        v-model:x="x"
        v-model:y="y"
        v-model:w="w"
        v-model:h="h"
        v-model:active="active"
        :typeX="typeX"
        :typeY="typeY"
        :typeW="typeW"
        :typeH="typeH"
        :draggable="true"
        :resizable="true"
        @activated="print('activated')"
        @deactivated="print('deactivated')"
        @drag-start="print('drag-start')"
        @resize-start="print('resize-start')"
        @dragging="print('dragging')"
        @resizing="print('resizing')"
        @drag-end="print('drag-end')"
        @resize-end="print('resize-end')"
      >
        This is a test example
      </Vue3DraggableResizable>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import Vue3DraggableResizable from 'vue3-draggable-resizable-plus'
// default styles
import 'vue3-draggable-resizable-plus/style.css'
export default defineComponent({
  components: { Vue3DraggableResizable },
  data() {
    return {
      x: 100,
      y: 100,
      h: 25,
      w: 25,
      typeX: 'px',
      typeY: 'px',
      typeW: '%',
      typeH: '%',
      active: false
    }
  },
  methods: {
    print(val) {
      console.log(val)
    }
  }
})
</script>
<style>
.parent {
  width: 200px;
  height: 200px;
  position: absolute;
  top: 100px;
  left: 100px;
  border: 1px solid #000;
  user-select: none;
}
</style>
```

### Props

#### initW

type: `Number`<br>
default: `null`<br>

Set initial width(px)

```html
<Vue3DraggableResizable :initW="100" />
```

#### initH

type: `Number`<br>
default: `null`<br>

Set initial height(px)

```html
<Vue3DraggableResizable :initH="100" />
```

#### w

type: `Number`<br>
default: `0`<br>

Current width of the container. Unit depends on `typeW` prop.<br>
You can use "v-model:w" to keeps it up-to-date

```html
<Vue3DraggableResizable v-model:w="100" />
```

#### h

type: `Number`<br>
default: `0`<br>

Current height of the container. Unit depends on `typeH` prop.<br>
You can use "v-model:h" to keeps it up-to-date

```html
<Vue3DraggableResizable v-model:h="100" />
```

#### x

type: `Number`<br>
default: `0`<br>

Current left position of the container. Unit depends on `typeX` prop.<br>
You can use "v-model:x" to keeps it up-to-date

```html
<Vue3DraggableResizable v-model:x="100" />
```

#### y

type: `Number`<br>
default: `0`<br>

The current top position of the container. Unit depends on `typeY` prop.<br>
You can use "v-model:y" to keeps it up-to-date

```html
<Vue3DraggableResizable v-model:y="100" />
```

#### typeX

type: `String`<br>
default: `'px'`<br>
validator: `['px', '%']`

Unit type for x position. Can be `'px'` or `'%'`.

```html
<Vue3DraggableResizable :x="10" typeX="%" />
```

#### typeY

type: `String`<br>
default: `'px'`<br>
validator: `['px', '%']`

Unit type for y position. Can be `'px'` or `'%'`.

```html
<Vue3DraggableResizable :y="10" typeY="%" />
```

#### typeW

type: `String`<br>
default: `'px'`<br>
validator: `['px', '%']`

Unit type for width. Can be `'px'` or `'%'`.

```html
<Vue3DraggableResizable :w="50" typeW="%" />
```

#### typeH

type: `String`<br>
default: `'px'`<br>
validator: `['px', '%']`

Unit type for height. Can be `'px'` or `'%'`.

```html
<Vue3DraggableResizable :h="50" typeH="%" />
```

#### minW

type: `Number`<br>
default: `20`<br>

Minimum width(px)

```html
<Vue3DraggableResizable :minW="100" />
```

#### minH

type: `Number`<br>
default: `20`<br>

Minimum height(px)

```html
<Vue3DraggableResizable :minH="100" />
```

#### active

type: `Boolean`<br>
default: `false`<br>

Indicates whether the component is selected.<br>
You can use "v-model:active" to keeps it up-to-date

```html
<Vue3DraggableResizable v-model:active="true" />
```

#### draggable

type: `Boolean`<br>
default: `true`<br>

Defines the component can be draggable or not

```html
<Vue3DraggableResizable :draggable="true" />
```

#### resizable

type: `Boolean`<br>
default: `true`<br>

Defines the component can be resizable or not

```html
<Vue3DraggableResizable :resizable="true" />
```

#### lockAspectRatio

type: `Boolean`<br>
default: `false`<br>

The `lockAspectRatio` property is used to lock aspect ratio.

```html
<Vue3DraggableResizable :lockAspectRatio="true" />
```

#### disabledX

type: `Boolean`<br>
default: `false`<br>

Defines the component can be moved on x-axis or not

```html
<Vue3DraggableResizable :disabledX="true" />
```

#### disabledY

type: `Boolean`<br>
default: `false`<br>

Defines the component can be moved on y-axis or not

```html
<Vue3DraggableResizable :disabledY="true" />
```

#### disabledW

type: `Boolean`<br>
default: `false`<br>

Defines the component's width can be modified or not

```html
<Vue3DraggableResizable :disabledW="true" />
```

#### disabledH

type: `Boolean`<br>
default: `false`<br>

Defines the component's height can be modified or not

```html
<Vue3DraggableResizable :disabledH="true" />
```

#### parent

type: `Boolean`<br>
default: `false`<br>

Restrict movement and size within its parent node

```html
<Vue3DraggableResizable :parent="true" />
```

#### handles

type: `Array`<br>
default: `['tl', 'tm', 'tr', 'ml', 'mr', 'bl', 'bm', 'br']`

Define the array of handles to restrict the element resizing

- `tl` : Top left
- `tm` : Top middle
- `tr` : Top right
- `mr` : Middle right
- `ml` : Middle left
- `bl` : Bottom left
- `bm` : Bottom middle
- `br` : Bottom right

```html
<Vue3DraggableResizable :handles="['tl','tr','bl','br']" />
```

#### gridSpacing

type: `Number`<br>
default: `20`<br>

Grid spacing in pixels for snap-to-grid feature.

```html
<Vue3DraggableResizable :gridSpacing="50" />
```

#### snapToGrid

type: `Boolean`<br>
default: `false`<br>

Enable snap-to-grid during drag and resize operations.

```html
<Vue3DraggableResizable :snapToGrid="true" :gridSpacing="50" />
```

#### rotatable

type: `Boolean`<br>
default: `false`<br>

Enable rotation functionality. When enabled, a rotation handle appears above the component.

```html
<Vue3DraggableResizable :rotatable="true" />
```

#### rotation

type: `Number`<br>
default: `0`<br>

Current rotation angle in degrees. You can use "v-model:rotation" to keep it up-to-date.

```html
<Vue3DraggableResizable :rotatable="true" v-model:rotation="rotation" />
```

#### rotationSnap

type: `Number`<br>
default: `0`<br>

Snap angle in degrees during rotation. Set to 0 to disable snap. For example, 15 will snap to 0°, 15°, 30°, etc.

```html
<Vue3DraggableResizable :rotatable="true" :rotationSnap="15" />
```

#### classNameRotateHandle

type: `String`<br>
default: `''`<br>

Custom class name for the rotation handle element.

```html
<Vue3DraggableResizable :rotatable="true" classNameRotateHandle="my-rotate-handle" />
```

#### classNameDraggable

type: `String`<br>
default: `draggable`

Used to set the custom `class` of a draggable-resizable component when `draggable` is enable.

```html
<Vue3DraggableResizable classNameDraggable="draggable" />
```

#### classNameResizable

type: `String`<br>
default: `resizable`

Used to set the custom `class` of a draggable-resizable component when `resizable` is enable.

```html
<Vue3DraggableResizable classNameResizable="resizable" />
```

#### classNameDragging

type: `String`<br>
default: `dragging`

Used to set the custom `class` of a draggable-resizable component when is dragging.

```html
<Vue3DraggableResizable classNameDragging="dragging" />
```

#### classNameResizing

type: `String`<br>
default: `resizing`

Used to set the custom `class` of a draggable-resizable component when is resizing.

```html
<Vue3DraggableResizable classNameResizing="resizing" />
```

#### classNameActive

type: `String`<br>
default: `active`

Used to set the custom `class` of a draggable-resizable component when is active.

```html
<Vue3DraggableResizable classNameActive="active" />
```

#### classNameHandle

type: `String`<br>
default: `handle`

Used to set the custom common `class` of each handle element.

```html
<Vue3DraggableResizable classNameHandle="my-handle" />
```

following handle nodes will be rendered

```html
...
<div class="vdr-handle vdr-handle-tl my-handle my-handle-tl"></div>
<div class="vdr-handle vdr-handle-tm my-handle my-handle-tm"></div>
<div class="vdr-handle vdr-handle-tr my-handle my-handle-tr"></div>
<div class="vdr-handle vdr-handle-ml my-handle my-handle-mr"></div>
...
```

### Events

#### activated

payload: `-`

```html
<Vue3DraggableResizable @activated="activatedHandle" />
```

#### deactivated

payload: `-`

```html
<Vue3DraggableResizable @deactivated="deactivatedHandle" />
```

#### drag-start

payload: `{ x: number, y: number }`

```html
<Vue3DraggableResizable @drag-start="dragStartHandle" />
```

#### dragging

payload: `{ x: number, y: number }`

```html
<Vue3DraggableResizable @dragging="draggingHandle" />
```

#### drag-end

payload: `{ x: number, y: number }`

```html
<Vue3DraggableResizable @drag-end="dragEndHandle" />
```

#### resize-start

payload: `{ x: number, y: number, w: number, h: number }`

```html
<Vue3DraggableResizable @resize-start="resizeStartHandle" />
```

#### resizing

payload: `{ x: number, y: number, w: number, h: number }`

```html
<Vue3DraggableResizable @resizing="resizingHandle" />
```

#### resize-end

payload: `{ x: number, y: number, w: number, h: number }`

```html
<Vue3DraggableResizable @resize-end="resizeEndHandle" />
```

#### rotate-start

payload: `{ rotation: number }`

```html
<Vue3DraggableResizable :rotatable="true" @rotate-start="rotateStartHandle" />
```

#### rotating

payload: `{ rotation: number }`

```html
<Vue3DraggableResizable :rotatable="true" @rotating="rotatingHandle" />
```

#### rotate-end

payload: `{ rotation: number }`

```html
<Vue3DraggableResizable :rotatable="true" @rotate-end="rotateEndHandle" />
```

### Use-adsorption-alignment

You need to import another component to use the "adsorption alignment" feature.

This can be used as follows.

```vue
<template>
  <div id="app">
    <div class="parent">
      <DraggableContainer>
        <Vue3DraggableResizable>
          Test
        </Vue3DraggableResizable>
        <Vue3DraggableResizable>
          Another test
        </Vue3DraggableResizable>
      </DraggableContainer>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import Vue3DraggableResizable from 'vue3-draggable-resizable-plus'
// This component is not exported by default
// If you used "app.use(Vue3DraggableResizable)", then you don't need to import it, you can use it directly.
import { DraggableContainer } from 'vue3-draggable-resizable-plus'
// default styles
import 'vue3-draggable-resizable-plus/style.css'
export default defineComponent({
  components: { Vue3DraggableResizable, DraggableContainer }
})
</script>
<style>
.parent {
  width: 200px;
  height: 200px;
  position: absolute;
  top: 100px;
  left: 100px;
  border: 1px solid #000;
  user-select: none;
}
</style>
```

### DraggableContainer Props

These props apply to DraggableContainer

#### disabled

type: `Boolean`<br>
default: `false`<br>

Disable adsorption alignment feature

```html
<DraggableContainer :disabled="true">
  <Vue3DraggableResizable>
    Test
  </Vue3DraggableResizable>
  <Vue3DraggableResizable>
    Another test
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### adsorbParent

type: `Boolean`<br>
default: `true`<br>

Adsorption near parent component

```html
<DraggableContainer :adsorbParent="false">
  <Vue3DraggableResizable>
    Test
  </Vue3DraggableResizable>
  <Vue3DraggableResizable>
    Another test
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### adsorbCols

type: `Array<Number>`<br>
default: `null`<br>

Custom guides(column)

```html
<DraggableContainer :adsorbCols="[10,20,30]">
  <Vue3DraggableResizable>
    Test
  </Vue3DraggableResizable>
  <Vue3DraggableResizable>
    Another test
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### adsorbRows

type: `Array<Number>`<br>
default: `null`<br>

Custom guides(row)

```html
<DraggableContainer :adsorbRows="[10,20,30]">
  <Vue3DraggableResizable>
    Test
  </Vue3DraggableResizable>
  <Vue3DraggableResizable>
    Another test
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### referenceLineVisible

type: `Boolean`<br>
default: `true`<br>

Reference line visible

```html
<DraggableContainer :referenceLineVisible="false">
  <Vue3DraggableResizable>
    Test
  </Vue3DraggableResizable>
  <Vue3DraggableResizable>
    Another test
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### referenceLineColor

type: `String`<br>
default: `#f00`<br>

Reference line color

```html
<DraggableContainer referenceLineColor="#0f0">
  <Vue3DraggableResizable>
    Test
  </Vue3DraggableResizable>
  <Vue3DraggableResizable>
    Another test
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### showSpacing

type: `Boolean`<br>
default: `true`<br>

Show spacing indicators between active element and other elements/container edges. Displays distance lines with measurements (Figma-like feature).

```html
<DraggableContainer :showSpacing="false">
  <Vue3DraggableResizable>
    Test
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### spacingColor

type: `String`<br>
default: `#ff6b6b`<br>

Color of the spacing indicator lines and text.

```html
<DraggableContainer spacingColor="#00ff00">
  <Vue3DraggableResizable>
    Test
  </Vue3DraggableResizable>
</DraggableContainer>
```

### Grid System

DraggableContainer supports a visual grid system with snap-to-grid functionality.

#### gridSpacing

type: `Number`<br>
default: `20`<br>

Grid spacing in pixels

```html
<DraggableContainer :gridSpacing="50">
  <Vue3DraggableResizable :snapToGrid="true" :gridSpacing="50">
    Test
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### showGrid

type: `Boolean`<br>
default: `false`<br>

Show visual grid lines

```html
<DraggableContainer :showGrid="true" :gridSpacing="50">
  <Vue3DraggableResizable>
    Test
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### gridColor

type: `String`<br>
default: `#e0e0e0`<br>

Grid line color

```html
<DraggableContainer :showGrid="true" gridColor="#ccc">
  <Vue3DraggableResizable>
    Test
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### showGridNumbersX

type: `Boolean`<br>
default: `false`<br>

Show grid line numbers on X-axis (horizontal)

```html
<DraggableContainer :showGrid="true" :showGridNumbersX="true">
  <Vue3DraggableResizable>
    Test
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### showGridNumbersY

type: `Boolean`<br>
default: `false`<br>

Show grid line numbers on Y-axis (vertical)

```html
<DraggableContainer :showGrid="true" :showGridNumbersY="true">
  <Vue3DraggableResizable>
    Test
  </Vue3DraggableResizable>
</DraggableContainer>
```

### Spacing Indicators

The spacing indicators feature shows distance measurements between the active element and other elements or container edges, similar to design tools like Figma.

```vue
<template>
  <DraggableContainer :showSpacing="true" spacingColor="#ff6b6b">
    <Vue3DraggableResizable>
      Element 1
    </Vue3DraggableResizable>
    <Vue3DraggableResizable>
      Element 2
    </Vue3DraggableResizable>
  </DraggableContainer>
</template>
```

When an element is active (selected), the spacing indicators will display:
- Distance to container edges (top, right, bottom, left)
- Distance to nearby elements

The indicators automatically update during drag, resize, and rotation operations. For rotated elements, spacing is calculated based on the axis-aligned bounding box.

### Rotation

The rotation feature allows elements to be rotated around their center point. Enable rotation with the `rotatable` prop.

```vue
<template>
  <DraggableContainer>
    <Vue3DraggableResizable
      :rotatable="true"
      v-model:rotation="rotation"
      :rotationSnap="15"
      @rotate-start="onRotateStart"
      @rotating="onRotating"
      @rotate-end="onRotateEnd"
    >
      Rotatable element
    </Vue3DraggableResizable>
  </DraggableContainer>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const rotation = ref(0)

    const onRotateStart = (e) => console.log('Rotation started:', e.rotation)
    const onRotating = (e) => console.log('Rotating:', e.rotation)
    const onRotateEnd = (e) => console.log('Rotation ended:', e.rotation)

    return { rotation, onRotateStart, onRotating, onRotateEnd }
  }
})
</script>
```

#### Rotation Features

- **Rotation Handle**: A circular handle appears above the element when `rotatable` is enabled
- **Angle Snap**: Use `rotationSnap` prop to snap to specific angles (e.g., 15° intervals)
- **Cursor Direction**: Resize handle cursors automatically adjust based on rotation angle
- **Center-point Grid Snap**: When grid snap is enabled, rotated elements snap based on their center point
- **Rotated Resize**: Resizing works correctly regardless of rotation angle, maintaining the anchor point

### Unit Conversion

The component supports both `px` and `%` units for position and size. Use the `typeX`, `typeY`, `typeW`, and `typeH` props to specify the unit type.

```vue
<template>
  <DraggableContainer>
    <Vue3DraggableResizable
      :x="10"
      :y="10"
      :w="50"
      :h="50"
      typeX="%"
      typeY="%"
      typeW="%"
      typeH="%"
    >
      50% width and height at 10% position
    </Vue3DraggableResizable>
  </DraggableContainer>
</template>
```

### Utility Functions

The package exports utility functions for unit conversion that you can use in your application.

```js
import {
  convertToPixel,
  convertFromPixel,
  validatePercentage,
  validatePixel,
  generateRandomColor
} from 'vue3-draggable-resizable-plus'

// Convert percentage to pixels
const pixelValue = convertToPixel(50, '%', 1000) // 500

// Convert pixels to percentage
const percentValue = convertFromPixel(500, '%', 1000) // 50

// Validate percentage value (0-100)
const isValidPercent = validatePercentage(50) // true

// Validate pixel value within parent bounds
const isValidPixel = validatePixel(100, 500) // true

// Generate random hex color
const color = generateRandomColor() // e.g., '#3A7FE1'
```

#### convertToPixel(value, unit, parentSize)

Converts a value to pixels based on the unit type.

- `value`: The numeric value to convert
- `unit`: The unit type ('px' or '%')
- `parentSize`: The parent element size in pixels
- Returns: The value converted to pixels

#### convertFromPixel(value, unit, parentSize)

Converts a pixel value to the specified unit type.

- `value`: The pixel value to convert
- `unit`: The target unit type ('px' or '%')
- `parentSize`: The parent element size in pixels
- Returns: The value converted to the target unit (with 2 decimal precision for %)

#### validatePercentage(value)

Validates if a percentage value is within valid range (0-100).

- `value`: The percentage value to validate
- Returns: `true` if value is between 0 and 100 (inclusive), `false` otherwise

#### validatePixel(value, parentSize)

Validates if a pixel value is within parent bounds.

- `value`: The pixel value to validate
- `parentSize`: The parent element size in pixels
- Returns: `true` if value is between 0 and parentSize (inclusive), `false` otherwise

#### generateRandomColor()

Generates a random hex color string.

- Returns: A random color in hex format (e.g., '#3A7FE1')
