참고: 이 저장소는 [a7650/vue3-draggable-resizable/main-branch]의 유지 관리된 fork입니다. 원래 저장소는 2022년 이후로 비활성화된 것으로 보입니다. 개발을 계속하고, 버그를 수정하고, 새로운 기능을 추가하기 위해 fork 했습니다.

<p align="center"><img src="https://github.com/hae-long/vue3-draggable-resizable/blob/main/docs/logo.png" alt="logo"></p>

<h1 align="center">Vue3-Draggable-Resizable</h1>
<div align="center">

[![npm version](https://badge.fury.io/js/vue3-draggable-resizable-plus.svg)](https://www.npmjs.com/package/vue3-draggable-resizable-plus)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)
[![npm](https://img.shields.io/npm/dt/vue3-draggable-resizable-plus.svg?style=flat-square)](https://www.npmjs.com/package/vue3-draggable-resizable-plus)
[![vue version](https://img.shields.io/badge/vue_version->=3-brightgreen.svg?style=flat-square)](https://github.com/hae-long/vue3-draggable-resizable)

</div>

> [Vue3 컴포넌트] 드래그, 크기 조정, 회전이 가능한 컴포넌트로, 충돌 감지, 요소 스냅 정렬, 실시간 참조선, 그리드 스냅, 간격 인디케이터, 단위 변환(px/%)을 지원합니다.

## 문서 목차

- [특징](#특징)
- [사용법](#사용법)
  - [컴포넌트 Props](#props)
  - [컴포넌트 Events](#events)
  - [스냅 정렬 기능 사용하기](#스냅-정렬-기능-사용하기)
  - [그리드 시스템](#그리드-시스템)
  - [간격 인디케이터](#간격-인디케이터)
  - [회전](#회전)
  - [단위 변환 (px/%)](#단위-변환)
  - [유틸리티 함수](#유틸리티-함수)

### 특징

- 드래그와 크기 조정 지원, 각각 개별적으로 활성화/비활성화 가능
- **회전 기능 지원 (스냅 각도 설정 가능)**
- 크기 조정 핸들 커스터마이징 (8개 방향 조작 가능, 각각 활성화/비활성화 가능)
- 부모 노드 내에서 드래그와 크기 조정 제한
- 컴포넌트 내 다양한 클래스명 커스터마이징
- 크기 조정 핸들의 클래스명도 커스터마이징 가능
- 요소 스냅 정렬
- 실시간 참조선
- 사용자 정의 참조선
- **그리드 시스템 및 스냅 투 그리드 기능 (회전된 요소는 중심점 기반 스냅)**
- **간격 인디케이터 (Figma 스타일 요소간 거리 표시)**
- **단위 변환 (px/%) 지원**
- **단위 변환 유틸리티 함수 제공**
- Vue3와 TypeScript 사용

### 사용법

```bash
$ npm install vue3-draggable-resizable-plus
```

use 메서드로 컴포넌트 등록

```js
// >main.js
import { createApp } from 'vue'
import App from './App.vue'
import Vue3DraggableResizable from 'vue3-draggable-resizable-plus'
// 기본 스타일 import 필요
import 'vue3-draggable-resizable-plus/style.css'

// Vue3DraggableResizable이라는 전역 컴포넌트를 얻게 됩니다
createApp(App)
  .use(Vue3DraggableResizable)
  .mount('#app')
```

컴포넌트 내부에서 개별적으로 사용할 수도 있습니다

```js
// >component.js
import { defineComponent } from 'vue'
import Vue3DraggableResizable from 'vue3-draggable-resizable-plus'
// 기본 스타일 import 필요
import 'vue3-draggable-resizable-plus/style.css'

export default defineComponent({
  components: { Vue3DraggableResizable }
  // ...기타
})
```

아래는 vue-template 문법을 사용한 예제입니다

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
        테스트 예제입니다
      </Vue3DraggableResizable>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import Vue3DraggableResizable from 'vue3-draggable-resizable-plus'
// 기본 스타일
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

초기 너비 설정 (px)

```html
<Vue3DraggableResizable :initW="100" />
```

#### initH

type: `Number`<br>
default: `null`<br>

초기 높이 설정 (px)

```html
<Vue3DraggableResizable :initH="100" />
```

#### w

type: `Number`<br>
default: `0`<br>

컴포넌트의 현재 너비. 단위는 `typeW` prop에 따라 결정됩니다.<br>
"v-model:w" 문법을 사용하여 부모 컴포넌트와 동기화할 수 있습니다

```html
<Vue3DraggableResizable v-model:w="100" />
```

#### h

type: `Number`<br>
default: `0`<br>

컴포넌트의 현재 높이. 단위는 `typeH` prop에 따라 결정됩니다.<br>
"v-model:h" 문법을 사용하여 부모 컴포넌트와 동기화할 수 있습니다

```html
<Vue3DraggableResizable v-model:h="100" />
```

#### x

type: `Number`<br>
default: `0`<br>

부모 컨테이너의 왼쪽으로부터의 거리. 단위는 `typeX` prop에 따라 결정됩니다.<br>
"v-model:x" 문법을 사용하여 부모 컴포넌트와 동기화할 수 있습니다

```html
<Vue3DraggableResizable v-model:x="100" />
```

#### y

type: `Number`<br>
default: `0`<br>

부모 컨테이너의 상단으로부터의 거리. 단위는 `typeY` prop에 따라 결정됩니다.<br>
"v-model:y" 문법을 사용하여 부모 컴포넌트와 동기화할 수 있습니다

```html
<Vue3DraggableResizable v-model:y="100" />
```

#### typeX

type: `String`<br>
default: `'px'`<br>
validator: `['px', '%']`

x 위치의 단위 타입. `'px'` 또는 `'%'`를 사용할 수 있습니다.

```html
<Vue3DraggableResizable :x="10" typeX="%" />
```

#### typeY

type: `String`<br>
default: `'px'`<br>
validator: `['px', '%']`

y 위치의 단위 타입. `'px'` 또는 `'%'`를 사용할 수 있습니다.

```html
<Vue3DraggableResizable :y="10" typeY="%" />
```

#### typeW

type: `String`<br>
default: `'px'`<br>
validator: `['px', '%']`

너비의 단위 타입. `'px'` 또는 `'%'`를 사용할 수 있습니다.

```html
<Vue3DraggableResizable :w="50" typeW="%" />
```

#### typeH

type: `String`<br>
default: `'px'`<br>
validator: `['px', '%']`

높이의 단위 타입. `'px'` 또는 `'%'`를 사용할 수 있습니다.

```html
<Vue3DraggableResizable :h="50" typeH="%" />
```

#### minW

type: `Number`<br>
default: `20`<br>

컴포넌트의 최소 너비 (px)

```html
<Vue3DraggableResizable :minW="100" />
```

#### minH

type: `Number`<br>
default: `20`<br>

컴포넌트의 최소 높이 (px)

```html
<Vue3DraggableResizable :minH="100" />
```

#### active

type: `Boolean`<br>
default: `false`<br>

컴포넌트가 현재 활성 상태인지 여부<br>
"v-model:active" 문법을 사용하여 부모 컴포넌트와 동기화할 수 있습니다

```html
<Vue3DraggableResizable v-model:active="true" />
```

#### draggable

type: `Boolean`<br>
default: `true`<br>

컴포넌트를 드래그할 수 있는지 여부

```html
<Vue3DraggableResizable :draggable="true" />
```

#### resizable

type: `Boolean`<br>
default: `true`<br>

컴포넌트의 크기를 조정할 수 있는지 여부

```html
<Vue3DraggableResizable :resizable="true" />
```

#### lockAspectRatio

type: `Boolean`<br>
default: `false`<br>

가로세로 비율을 잠글지 여부를 설정합니다

```html
<Vue3DraggableResizable :lockAspectRatio="true" />
```

#### disabledX

type: `Boolean`<br>
default: `false`<br>

X축 이동을 비활성화할지 여부

```html
<Vue3DraggableResizable :disabledX="true" />
```

#### disabledY

type: `Boolean`<br>
default: `false`<br>

Y축 이동을 비활성화할지 여부

```html
<Vue3DraggableResizable :disabledY="true" />
```

#### disabledW

type: `Boolean`<br>
default: `false`<br>

너비 수정을 비활성화할지 여부

```html
<Vue3DraggableResizable :disabledW="true" />
```

#### disabledH

type: `Boolean`<br>
default: `false`<br>

높이 수정을 비활성화할지 여부

```html
<Vue3DraggableResizable :disabledH="true" />
```

#### parent

type: `Boolean`<br>
default: `false`<br>

드래그와 크기 조정을 부모 노드 내로 제한할지 여부, 즉 컴포넌트가 부모 노드를 벗어나지 않음 (기본값: 비활성화)

```html
<Vue3DraggableResizable :parent="true" />
```

#### handles

type: `Array`<br>
default: `['tl', 'tm', 'tr', 'ml', 'mr', 'bl', 'bm', 'br']`

크기 조정 핸들 정의 (총 8개 방향)

- `tl` : 상단 왼쪽
- `tm` : 상단 중앙
- `tr` : 상단 오른쪽
- `mr` : 중앙 오른쪽
- `ml` : 중앙 왼쪽
- `bl` : 하단 왼쪽
- `bm` : 하단 중앙
- `br` : 하단 오른쪽

```html
<Vue3DraggableResizable :handles="['tl','tr','bl','br']" />
```

#### gridSpacing

type: `Number`<br>
default: `20`<br>

스냅 투 그리드 기능을 위한 그리드 간격 (픽셀)

```html
<Vue3DraggableResizable :gridSpacing="50" />
```

#### snapToGrid

type: `Boolean`<br>
default: `false`<br>

드래그 및 크기 조정 시 그리드에 스냅되도록 활성화

```html
<Vue3DraggableResizable :snapToGrid="true" :gridSpacing="50" />
```

#### rotatable

type: `Boolean`<br>
default: `false`<br>

회전 기능 활성화. 활성화하면 컴포넌트 상단에 회전 핸들이 나타납니다.

```html
<Vue3DraggableResizable :rotatable="true" />
```

#### rotation

type: `Number`<br>
default: `0`<br>

현재 회전 각도 (도 단위). "v-model:rotation"으로 부모 컴포넌트와 동기화할 수 있습니다.

```html
<Vue3DraggableResizable :rotatable="true" v-model:rotation="rotation" />
```

#### rotationSnap

type: `Number`<br>
default: `0`<br>

회전 시 스냅 각도 (도 단위). 0이면 스냅 비활성화. 예를 들어 15로 설정하면 0°, 15°, 30° 등으로 스냅됩니다.

```html
<Vue3DraggableResizable :rotatable="true" :rotationSnap="15" />
```

#### classNameRotateHandle

type: `String`<br>
default: `''`<br>

회전 핸들 요소의 커스텀 클래스명

```html
<Vue3DraggableResizable :rotatable="true" classNameRotateHandle="my-rotate-handle" />
```

#### classNameDraggable

type: `String`<br>
default: `draggable`

컴포넌트가 "드래그 가능"할 때 표시되는 클래스명을 커스터마이징합니다

```html
<Vue3DraggableResizable classNameDraggable="draggable" />
```

#### classNameResizable

type: `String`<br>
default: `resizable`

컴포넌트가 "크기 조정 가능"할 때 표시되는 클래스명을 커스터마이징합니다

```html
<Vue3DraggableResizable classNameResizable="resizable" />
```

#### classNameDragging

type: `String`<br>
default: `dragging`

컴포넌트가 드래그 중일 때 표시되는 클래스명을 정의합니다

```html
<Vue3DraggableResizable classNameDragging="dragging" />
```

#### classNameResizing

type: `String`<br>
default: `resizing`

컴포넌트가 크기 조정 중일 때 표시되는 클래스명을 정의합니다

```html
<Vue3DraggableResizable classNameResizing="resizing" />
```

#### classNameActive

type: `String`<br>
default: `active`

컴포넌트가 활성 상태일 때의 클래스명을 정의합니다

```html
<Vue3DraggableResizable classNameActive="active"></Vue3DraggableResizable>
```

#### classNameHandle

type: `String`<br>
default: `handle`

크기 조정 핸들의 클래스명을 정의합니다

```html
<Vue3DraggableResizable classNameHandle="my-handle" />
```

위 설정은 다음과 같은 크기 조정 핸들 노드를 렌더링합니다 (my-handle-\*)

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

컴포넌트가 비활성 상태에서 활성 상태로 전환될 때 발생

```html
<Vue3DraggableResizable @activated="activatedHandle" />
```

#### deactivated

payload: `-`

컴포넌트가 활성 상태에서 비활성 상태로 전환될 때 발생

```html
<Vue3DraggableResizable @deactivated="deactivatedHandle" />
```

#### drag-start

payload: `{ x: number, y: number }`

컴포넌트가 드래그를 시작할 때 발생

```html
<Vue3DraggableResizable @drag-start="dragStartHandle" />
```

#### dragging

payload: `{ x: number, y: number }`

컴포넌트가 드래그되는 동안 지속적으로 발생

```html
<Vue3DraggableResizable @dragging="draggingHandle" />
```

#### drag-end

payload: `{ x: number, y: number }`

컴포넌트가 드래그를 종료할 때 발생

```html
<Vue3DraggableResizable @drag-end="dragEndHandle" />
```

#### resize-start

payload: `{ x: number, y: number, w: number, h: number }`

컴포넌트가 크기 조정을 시작할 때 발생

```html
<Vue3DraggableResizable @resize-start="resizeStartHandle" />
```

#### resizing

payload: `{ x: number, y: number, w: number, h: number }`

컴포넌트가 크기 조정되는 동안 지속적으로 발생

```html
<Vue3DraggableResizable @resizing="resizingHandle" />
```

#### resize-end

payload: `{ x: number, y: number, w: number, h: number }`

컴포넌트가 크기 조정을 종료할 때 발생

```html
<Vue3DraggableResizable @resize-end="resizeEndHandle" />
```

#### rotate-start

payload: `{ rotation: number }`

컴포넌트가 회전을 시작할 때 발생

```html
<Vue3DraggableResizable :rotatable="true" @rotate-start="rotateStartHandle" />
```

#### rotating

payload: `{ rotation: number }`

컴포넌트가 회전하는 동안 지속적으로 발생

```html
<Vue3DraggableResizable :rotatable="true" @rotating="rotatingHandle" />
```

#### rotate-end

payload: `{ rotation: number }`

컴포넌트가 회전을 종료할 때 발생

```html
<Vue3DraggableResizable :rotatable="true" @rotate-end="rotateEndHandle" />
```

### 스냅 정렬 기능 사용하기

스냅 정렬 기능은 드래그 중에 다른 요소와 자동으로 정렬됩니다. 사용자 정의 정렬 기준선도 설정할 수 있습니다.

이 기능을 사용하려면 다른 컴포넌트를 import해야 합니다.

아래와 같이 Vue3DraggableResizable을 DraggableContainer 안에 배치합니다:

```vue
<template>
  <div id="app">
    <div class="parent">
      <DraggableContainer>
        <Vue3DraggableResizable>
          테스트
        </Vue3DraggableResizable>
        <Vue3DraggableResizable>
          다른 테스트
        </Vue3DraggableResizable>
      </DraggableContainer>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import Vue3DraggableResizable from 'vue3-draggable-resizable-plus'
// 이 컴포넌트는 기본 export가 아닙니다.
// "app.use(Vue3DraggableResizable)"로 등록했다면,
// 여기서 다시 import할 필요가 없습니다. DraggableContainer가 이미 전역 등록되어 있어 바로 사용할 수 있습니다.
import { DraggableContainer } from 'vue3-draggable-resizable-plus'
// 기본 스타일
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

이 props는 DraggableContainer 컴포넌트에 적용됩니다

#### disabled

type: `Boolean`<br>
default: `false`<br>

스냅 정렬 기능을 비활성화합니다

```html
<DraggableContainer :disabled="true">
  <Vue3DraggableResizable>
    테스트
  </Vue3DraggableResizable>
  <Vue3DraggableResizable>
    다른 테스트
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### adsorbParent

type: `Boolean`<br>
default: `true`<br>

부모 컴포넌트와 정렬할지 여부입니다. 활성화하면 요소를 부모 컨테이너 가장자리(부모 컨테이너의 상중하좌중우 변)로 드래그할 때 스냅이 발생하고, 그렇지 않으면 발생하지 않습니다.

```html
<DraggableContainer :adsorbParent="false">
  <Vue3DraggableResizable>
    테스트
  </Vue3DraggableResizable>
  <Vue3DraggableResizable>
    다른 테스트
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### adsorbCols

type: `Array<Number>`<br>
default: `null`<br>

사용자 정의 열 기준선입니다. 요소가 X축에서 이 선들 근처로 드래그될 때 스냅이 발생합니다.

```html
<DraggableContainer :adsorbCols="[10,20,30]">
  <Vue3DraggableResizable>
    테스트
  </Vue3DraggableResizable>
  <Vue3DraggableResizable>
    다른 테스트
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### adsorbRows

type: `Array<Number>`<br>
default: `null`<br>

사용자 정의 행 기준선입니다. 요소가 Y축에서 이 선들 근처로 드래그될 때 스냅이 발생합니다.

```html
<DraggableContainer :adsorbRows="[10,20,30]">
  <Vue3DraggableResizable>
    테스트
  </Vue3DraggableResizable>
  <Vue3DraggableResizable>
    다른 테스트
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### referenceLineVisible

type: `Boolean`<br>
default: `true`<br>

실시간 참조선 표시 여부입니다. 요소가 자동 스냅된 후 참조선이 나타납니다. 필요하지 않으면 이 옵션으로 끌 수 있습니다.

```html
<DraggableContainer :referenceLineVisible="false">
  <Vue3DraggableResizable>
    테스트
  </Vue3DraggableResizable>
  <Vue3DraggableResizable>
    다른 테스트
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### referenceLineColor

type: `String`<br>
default: `#f00`<br>

실시간 참조선의 색상입니다 (기본값: 빨간색)

```html
<DraggableContainer referenceLineColor="#0f0">
  <Vue3DraggableResizable>
    테스트
  </Vue3DraggableResizable>
  <Vue3DraggableResizable>
    다른 테스트
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### showSpacing

type: `Boolean`<br>
default: `true`<br>

활성 요소와 다른 요소/컨테이너 가장자리 사이의 간격 인디케이터를 표시합니다. 측정값이 포함된 거리 선을 표시합니다 (Figma와 유사한 기능).

```html
<DraggableContainer :showSpacing="false">
  <Vue3DraggableResizable>
    테스트
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### spacingColor

type: `String`<br>
default: `#ff6b6b`<br>

간격 인디케이터 선과 텍스트의 색상입니다.

```html
<DraggableContainer spacingColor="#00ff00">
  <Vue3DraggableResizable>
    테스트
  </Vue3DraggableResizable>
</DraggableContainer>
```

### 그리드 시스템

DraggableContainer는 스냅 투 그리드 기능이 포함된 시각적 그리드 시스템을 지원합니다.

#### gridSpacing

type: `Number`<br>
default: `20`<br>

그리드 간격 (픽셀)

```html
<DraggableContainer :gridSpacing="50">
  <Vue3DraggableResizable :snapToGrid="true" :gridSpacing="50">
    테스트
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### showGrid

type: `Boolean`<br>
default: `false`<br>

시각적 그리드 라인 표시

```html
<DraggableContainer :showGrid="true" :gridSpacing="50">
  <Vue3DraggableResizable>
    테스트
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### gridColor

type: `String`<br>
default: `#e0e0e0`<br>

그리드 라인 색상

```html
<DraggableContainer :showGrid="true" gridColor="#ccc">
  <Vue3DraggableResizable>
    테스트
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### showGridNumbersX

type: `Boolean`<br>
default: `false`<br>

X축(가로) 그리드 라인 번호 표시

```html
<DraggableContainer :showGrid="true" :showGridNumbersX="true">
  <Vue3DraggableResizable>
    테스트
  </Vue3DraggableResizable>
</DraggableContainer>
```

#### showGridNumbersY

type: `Boolean`<br>
default: `false`<br>

Y축(세로) 그리드 라인 번호 표시

```html
<DraggableContainer :showGrid="true" :showGridNumbersY="true">
  <Vue3DraggableResizable>
    테스트
  </Vue3DraggableResizable>
</DraggableContainer>
```

### 간격 인디케이터

간격 인디케이터 기능은 활성 요소와 다른 요소 또는 컨테이너 가장자리 사이의 거리 측정값을 표시합니다. Figma와 같은 디자인 도구와 유사한 기능입니다.

```vue
<template>
  <DraggableContainer :showSpacing="true" spacingColor="#ff6b6b">
    <Vue3DraggableResizable>
      요소 1
    </Vue3DraggableResizable>
    <Vue3DraggableResizable>
      요소 2
    </Vue3DraggableResizable>
  </DraggableContainer>
</template>
```

요소가 활성화(선택)되면 간격 인디케이터가 다음을 표시합니다:
- 컨테이너 가장자리까지의 거리 (상, 우, 하, 좌)
- 근처 요소까지의 거리

인디케이터는 드래그, 크기 조정, 회전 작업 중에 자동으로 업데이트됩니다. 회전된 요소의 경우 축 정렬 경계 상자를 기준으로 간격이 계산됩니다.

### 회전

회전 기능을 사용하면 요소를 중심점을 기준으로 회전할 수 있습니다. `rotatable` prop으로 회전을 활성화합니다.

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
      회전 가능한 요소
    </Vue3DraggableResizable>
  </DraggableContainer>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const rotation = ref(0)

    const onRotateStart = (e) => console.log('회전 시작:', e.rotation)
    const onRotating = (e) => console.log('회전 중:', e.rotation)
    const onRotateEnd = (e) => console.log('회전 종료:', e.rotation)

    return { rotation, onRotateStart, onRotating, onRotateEnd }
  }
})
</script>
```

#### 회전 기능 특징

- **회전 핸들**: `rotatable`이 활성화되면 요소 상단에 원형 핸들이 나타납니다
- **각도 스냅**: `rotationSnap` prop을 사용하여 특정 각도로 스냅 (예: 15° 간격)
- **커서 방향**: 크기 조정 핸들 커서가 회전 각도에 따라 자동으로 조정됩니다
- **중심점 그리드 스냅**: 그리드 스냅이 활성화되면 회전된 요소는 중심점을 기준으로 스냅됩니다
- **회전된 상태에서 크기 조정**: 회전 각도에 관계없이 크기 조정이 올바르게 작동하며 앵커 포인트를 유지합니다

### 단위 변환

컴포넌트는 위치와 크기에 대해 `px`와 `%` 단위를 모두 지원합니다. `typeX`, `typeY`, `typeW`, `typeH` props를 사용하여 단위 타입을 지정합니다.

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
      10% 위치에 50% 너비와 높이
    </Vue3DraggableResizable>
  </DraggableContainer>
</template>
```

### 유틸리티 함수

패키지는 애플리케이션에서 사용할 수 있는 단위 변환 유틸리티 함수를 내보냅니다.

```js
import {
  convertToPixel,
  convertFromPixel,
  validatePercentage,
  validatePixel,
  generateRandomColor
} from 'vue3-draggable-resizable-plus'

// 퍼센트를 픽셀로 변환
const pixelValue = convertToPixel(50, '%', 1000) // 500

// 픽셀을 퍼센트로 변환
const percentValue = convertFromPixel(500, '%', 1000) // 50

// 퍼센트 값 검증 (0-100)
const isValidPercent = validatePercentage(50) // true

// 부모 범위 내 픽셀 값 검증
const isValidPixel = validatePixel(100, 500) // true

// 랜덤 HEX 색상 생성
const color = generateRandomColor() // 예: '#3A7FE1'
```

#### convertToPixel(value, unit, parentSize)

단위 타입에 따라 값을 픽셀로 변환합니다.

- `value`: 변환할 숫자 값
- `unit`: 단위 타입 ('px' 또는 '%')
- `parentSize`: 부모 요소의 크기 (픽셀)
- 반환값: 픽셀로 변환된 값

#### convertFromPixel(value, unit, parentSize)

픽셀 값을 지정된 단위 타입으로 변환합니다.

- `value`: 변환할 픽셀 값
- `unit`: 대상 단위 타입 ('px' 또는 '%')
- `parentSize`: 부모 요소의 크기 (픽셀)
- 반환값: 대상 단위로 변환된 값 (%의 경우 소수점 2자리)

#### validatePercentage(value)

퍼센트 값이 유효한 범위(0-100) 내에 있는지 검증합니다.

- `value`: 검증할 퍼센트 값
- 반환값: 값이 0과 100 사이(포함)이면 `true`, 그렇지 않으면 `false`

#### validatePixel(value, parentSize)

픽셀 값이 부모 범위 내에 있는지 검증합니다.

- `value`: 검증할 픽셀 값
- `parentSize`: 부모 요소의 크기 (픽셀)
- 반환값: 값이 0과 parentSize 사이(포함)이면 `true`, 그렇지 않으면 `false`

#### generateRandomColor()

랜덤한 HEX 색상 문자열을 생성합니다.

- 반환값: HEX 형식의 랜덤 색상 (예: '#3A7FE1')
