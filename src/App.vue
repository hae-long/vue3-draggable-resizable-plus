<template>
  <div id="app">
    <div class="app-layout">
      <!-- Left Sidebar Controls -->
      <div class="sidebar">
        <div class="control-section">
          <h3>Component Controls</h3>

          <!-- Component Count Control -->
          <div class="control-group">
            <label>Component Count:</label>
            <input
              type="number"
              v-model.number="componentCount"
              min="1"
              max="20"
              @change="regenerateComponents"
            />
            <button @click="regenerateComponents">Regenerate</button>
          </div>
        </div>

        <!-- Grid Settings Section -->
        <div class="control-section">
          <h3>Grid Settings</h3>

          <!-- Grid Spacing Control -->
          <div class="control-group">
            <label>Grid Spacing (px):</label>
            <input
              type="number"
              v-model.number="gridSpacing"
              min="5"
              max="100"
              step="5"
            />
          </div>

          <!-- Show Grid Toggle -->
          <div class="control-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="showGrid"
              />
              Show Grid
            </label>
          </div>

          <!-- Show Grid Numbers X Toggle -->
          <div class="control-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="showGridNumbersX"
              />
              Show Grid Numbers (X)
            </label>
          </div>

          <!-- Show Grid Numbers Y Toggle -->
          <div class="control-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="showGridNumbersY"
              />
              Show Grid Numbers (Y)
            </label>
          </div>
        </div>

        <!-- Property Editing Panel -->
        <div v-if="selectedComponentId !== null" class="property-panel">
          <h3>Component Properties</h3>
          <div class="property-info">
            <strong>Component ID:</strong> {{ selectedComponentId }}
          </div>

          <div class="property-group">
            <label>X Position:</label>
            <input
              type="number"
              :value="displayPropertyValue('x', selectedComponent.typeX)"
              @input="updatePropertyValue('x', $event)"
              step="0.01"
              :disabled="!selectedComponent.active"
            />
            <select :value="selectedComponent.typeX" @change="handleUnitChange('x', 'typeX', $event)" :disabled="!selectedComponent.active">
              <option value="px">px</option>
              <option value="%">%</option>
            </select>
          </div>

          <div class="property-group">
            <label>Y Position:</label>
            <input
              type="number"
              :value="displayPropertyValue('y', selectedComponent.typeY)"
              @input="updatePropertyValue('y', $event)"
              step="0.01"
              :disabled="!selectedComponent.active"
            />
            <select :value="selectedComponent.typeY" @change="handleUnitChange('y', 'typeY', $event)" :disabled="!selectedComponent.active">
              <option value="px">px</option>
              <option value="%">%</option>
            </select>
          </div>

          <div class="property-group">
            <label>Width:</label>
            <input
              type="number"
              :value="displayPropertyValue('w', selectedComponent.typeW)"
              @input="updatePropertyValue('w', $event)"
              step="0.01"
              :disabled="!selectedComponent.active"
            />
            <select :value="selectedComponent.typeW" @change="handleUnitChange('w', 'typeW', $event)" :disabled="!selectedComponent.active">
              <option value="px">px</option>
              <option value="%">%</option>
            </select>
          </div>

          <div class="property-group">
            <label>Height:</label>
            <input
              type="number"
              :value="displayPropertyValue('h', selectedComponent.typeH)"
              @input="updatePropertyValue('h', $event)"
              step="0.01"
              :disabled="!selectedComponent.active"
            />
            <select :value="selectedComponent.typeH" @change="handleUnitChange('h', 'typeH', $event)" :disabled="!selectedComponent.active">
              <option value="px">px</option>
              <option value="%">%</option>
            </select>
          </div>
        </div>

        <div v-else class="property-panel-placeholder">
          <p>Click a component to edit its properties</p>
        </div>
      </div>

      <!-- Main Draggable Container Area -->
      <div class="main-area">
        <div class="parent">
          <DraggableContainer
            :gridSpacing="gridSpacing"
            :showGrid="showGrid"
            :showGridNumbersX="showGridNumbersX"
            :showGridNumbersY="showGridNumbersY"
          >
            <Vue3DraggableResizable
              v-for="component in components"
              :key="component.id"
              class="drag-node"
              :class="{ 'selected': selectedComponentId === component.id }"
              :style="{ backgroundColor: component.color }"
              :x="component.x"
              :y="component.y"
              :w="component.w"
              :h="component.h"
              :typeX="component.typeX"
              :typeY="component.typeY"
              :typeW="component.typeW"
              :typeH="component.typeH"
              :draggable="true"
              :resizable="true"
              :parent="false"
              :gridSpacing="gridSpacing"
              :snapToGrid="showGrid"
              @click="selectComponent(component.id)"
              @activated="handleActivated(component.id)"
              @deactivated="handleDeactivated(component.id)"
              @update:x="component.x = $event"
              @update:y="component.y = $event"
              @update:w="component.w = $event"
              @update:h="component.h = $event"
              @drag-start="print('drag-start', $event)"
              @resize-start="print('resize-start', $event)"
              @dragging="print('dragging', $event)"
              @resizing="print('resizing', $event)"
              @drag-end="print('drag-end', $event)"
              @resize-end="print('resize-end', $event)"
            >
              <div class="component-content">
                <!-- Component #{{ component.id }}<br/> -->
                <small v-if="showGridNumbersX || showGridNumbersY">
                  Grid: ({{ Math.round(convertToPixel(component.x, component.typeX, parentWidth) / gridSpacing) }},
                  {{ Math.round(convertToPixel(component.y, component.typeY, parentHeight) / gridSpacing) }})
                </small>
              </div>
            </Vue3DraggableResizable>
          </DraggableContainer>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import Vue3DraggableResizable from "./components/Vue3DraggableResizable";
import DraggableContainer from "./components/DraggableContainer";
import { generateRandomColor, convertToPixel, convertFromPixel } from "./components/utils";

export default defineComponent({
  components: { DraggableContainer, Vue3DraggableResizable },
  data() {
    return {
      componentCount: 3,
      components: [],
      selectedComponentId: null,
      parentWidth: 0,
      parentHeight: 0,
      gridSpacing: 70,
      showGrid: true,
      showGridNumbersX: false,
      showGridNumbersY: false,
    };
  },
  computed: {
    selectedComponent() {
      if (this.selectedComponentId === null) return null;
      return this.components.find(c => c.id === this.selectedComponentId);
    }
  },
  mounted() {
    this.regenerateComponents();
    this.measureParentSize();
    // Update parent size on window resize
    window.addEventListener('resize', this.measureParentSize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.measureParentSize);
  },
  methods: {
    convertToPixel,
    convertFromPixel,
    print(val, e) {
      console.log(val, e);
    },

    measureParentSize() {
      // Measure the actual parent container size
      this.$nextTick(() => {
        const parentEl = document.querySelector('.parent');
        if (parentEl) {
          this.parentWidth = parentEl.clientWidth;
          this.parentHeight = parentEl.clientHeight;
          console.log('Parent size:', this.parentWidth, 'x', this.parentHeight);
        }
      });
    },

    regenerateComponents() {
      // Generate new components array with random colors and positions
      // Use timestamp-based IDs to ensure Vue treats them as completely new components
      const timestamp = Date.now();
      this.components = [];
      for (let i = 1; i <= this.componentCount; i++) {
        this.components.push({
          id: `${timestamp}-${i}`,
          x: 10 + (i - 1) * 15,
          y: 10 + (i - 1) * 10,
          w: 20,
          h: 20,
          typeX: '%',
          typeY: '%',
          typeW: '%',
          typeH: '%',
          color: generateRandomColor(),
          active: false // Components start as inactive
        });
      }
      // Reset selection if previously selected component no longer exists
      if (this.selectedComponentId !== null &&
          !this.components.find(c => c.id === this.selectedComponentId)) {
        this.selectedComponentId = null;
      }
    },

    handleActivated(id) {
      const component = this.components.find(c => c.id === id);
      if (component) {
        component.active = true;
        console.log('activated', id);
      }
    },

    handleDeactivated(id) {
      // const component = this.components.find(c => c.id === id);
      // if (component) {
      //   component.active = false;
      //   console.log('deactivated', id);
      // }
    },

    selectComponent(id) {
      this.selectedComponentId = id;
      console.log('Selected component:', id);
    },

    formatPropertyValue(value, type) {
      // Format % values to 2 decimal places, px as integer
      if (type === '%') {
        return Number(value).toFixed(2);
      }
      return Math.round(value);
    },

    displayPropertyValue(key, type) {
      // Display 0 when component is deactivated, otherwise show formatted value
      if (!this.selectedComponent || !this.selectedComponent.active) {
        return 0;
      }
      return this.formatPropertyValue(this.selectedComponent[key], type);
    },

    updatePropertyValue(key, event) {
      // Update property value from input
      if (!this.selectedComponent) return;
      const newValue = parseFloat(event.target.value);
      if (!isNaN(newValue)) {
        this.selectedComponent[key] = newValue;
      }
    },

    handleUnitChange(valueKey, typeKey, event) {
      if (!this.selectedComponent) return;

      const newUnit = event.target.value;
      const oldUnit = this.selectedComponent[typeKey]; // Current unit before change

      // Get parent size based on dimension
      const parentSize = (valueKey === 'x' || valueKey === 'w') ? this.parentWidth : this.parentHeight;

      // Get current value
      const currentValue = this.selectedComponent[valueKey];

      console.log(`Converting ${valueKey}: ${currentValue}${oldUnit} → ${newUnit}`);

      // Convert value if unit changed
      if (oldUnit !== newUnit) {
        let convertedValue;

        if (newUnit === '%') {
          // Convert from px to %
          convertedValue = convertFromPixel(currentValue, '%', parentSize);
        } else {
          // Convert from % to px
          convertedValue = convertToPixel(currentValue, oldUnit, parentSize);
        }

        // Update both the value and the type
        this.selectedComponent[valueKey] = convertedValue;
        this.selectedComponent[typeKey] = newUnit;

        console.log(`Converted to: ${convertedValue}${newUnit}`);
      } else {
        // Just update the type (shouldn't happen but for safety)
        this.selectedComponent[typeKey] = newUnit;
      }
    }
  },
});
</script>
<style lang="less" scoped>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Left Sidebar Styles */
.sidebar {
  width: 320px;
  background-color: #f5f5f5;
  border-right: 1px solid #ddd;
  padding: 20px;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0,0,0,0.05);
}

.control-section {
  margin-bottom: 30px;
}

.control-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #555;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
}

.control-group {
  margin-bottom: 15px;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  font-size: 14px;
  color: #555;
}

.control-group label.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.control-group label.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
}

.control-group input[type="number"] {
  width: 80px;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  margin-right: 8px;
}

.control-group button {
  padding: 6px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.control-group button:hover {
  background-color: #0056b3;
}

/* Property Panel Styles */
.property-panel {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.property-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #555;
  border-bottom: 2px solid #28a745;
  padding-bottom: 8px;
}

.property-info {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
}

.property-group {
  margin-bottom: 12px;
}

.property-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  font-size: 13px;
  color: #555;
}

.property-group input[type="number"] {
  width: 120px;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
  margin-right: 8px;
}

.property-group select {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
  background-color: white;
  cursor: pointer;
}

.property-panel-placeholder {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 30px 15px;
  text-align: center;
  color: #999;
  font-style: italic;
}

/* Main Area Styles */
.main-area {
  flex: 1;
  padding: 20px;
  overflow: auto;
  background-color: #fafafa;
}

.parent {
  width: 100%;
  height: calc(100vh - 40px);
  position: relative;
  border: 2px solid #333;
  background-color: white;
  user-select: none;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);

  ::v-deep {
    .vdr-container {
      border-color: #999;
    }
  }
}

/* Drag Node Styles */
.drag-node {
  //border: 2px solid #666;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  cursor: move;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: #333;
}

.drag-node:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.25);
  border-color: #333;
}

.drag-node.selected {
  //border: 3px solid #007bff;
  box-shadow: 0 0 0 1px rgba(0, 123, 255, 0.25);
  z-index: 9999;
}

.component-content {
  text-align: center;
  font-size: 14px;
  user-select: none;
  pointer-events: none;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .sidebar {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    max-height: 40vh;
    border-right: none;
    border-bottom: 1px solid #ddd;
  }

  .main-area {
    flex: 1;
  }
}
</style>
