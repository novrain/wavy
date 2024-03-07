<template >
  <div
       :class="`${direction === 'column' ? 'column' : 'd-flex flex-row'} ${direction === 'column' && hideDetails ? 'column-hide-details' : ''}`">
    <v-select :model-value="(computedBlock._blocksComputer.type as ComputerType)"
              @update:model-value="onComputerTypeChange"
              class="mr-1 w-11"
              :items="computerTypes"
              :label="t('block.computedBlock.computerType')"
              density="compact"
              :hide-details="hideDetails"
              required></v-select>
    <v-select v-model="(computedBlock.endian)"
              class="mr-1 w-11"
              :items="['BigEndian', 'LittleEndian']"
              :label="t('block.computedBlock.endian')"
              density="compact"
              :hide-details="hideDetails"
              required></v-select>
    <div class="mt-2">
      <v-tabs v-model="innerMode"
              align-tabs="center">
        <v-tab class="mr-2 ml-2"
               value="computed-frame">{{ t('frame.dataFrame.frameMode') }}</v-tab>
        <v-tab class="mr-2 ml-2"
               value="computed-table">{{ t('frame.dataFrame.tableMode') }}</v-tab>
      </v-tabs>
      <v-window v-model="innerMode">
        <v-window-item key="computed-frame"
                       value="computed-frame">
          <blocks-frame :title="t('frame.dataFrame.blocks')"
                        :include-ref="true"
                        mode="view"
                        :blocks="blocks"
                        :ref-blocks="refBlocks"
                        :selected-blocks="selectedBlocks"
                        @update:selected-blocks="onSelectedBlocksChange">
          </blocks-frame>
        </v-window-item>
        <v-window-item key="computed-table"
                       value="computed-table">
          <blocks-table :title="t('frame.dataFrame.blocks')"
                        :include-ref="true"
                        mode="view"
                        :blocks="blocks"
                        :ref-blocks="refBlocks"
                        :blocksContainer="blocksContainer"
                        :selected-blocks="selectedBlocks"
                        @update:selected-blocks="onSelectedBlocksChange">
          </blocks-table>
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Block } from '@W/frame/Block'
import { ComputerType, createComputer } from '@W/frame/Computer'
import { BlocksContainer, ComputedBlock } from '@W/frame/Frame'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BlocksTable from '../blocks/BlocksContainer.vue'
import BlocksFrame from '../blocks/BlocksFrame.vue'

const { t } = useI18n({ useScope: 'global' })

const props = withDefaults(defineProps<{ block: Block, blocksContainer: BlocksContainer, index: number, direction?: 'row' | 'column', hideDetails?: boolean, mode?: 'computed-table' | 'computed-frame', computerTypes?: ComputerType[], refBlocks?: Block[] }>(),
  {
    mode: 'computed-frame',
    computerTypes: () => ['Empty', 'CRC16'],
    hideDetails: true
  })
const innerMode = ref(props.mode)
const computedBlock = props.block as ComputedBlock

const blocks = computed(() => {
  return props.blocksContainer.blocks.filter((b, i) => i < props.index)
})

const selectedBlocks = computed(() => {
  return computedBlock.blocks.map(i => i.id)
})

const onComputerTypeChange = (type: ComputerType) => {
  computedBlock.blocksComputer = createComputer(type)
}

const onSelectedBlocksChange = (values: string[]) => {
  computedBlock.blocks = values.map(id => blocks.value.find(b => b.id === id))
}
</script>

<style lang="scss" scoped>
.v-input {
  flex-shrink: 0;
  flex-grow: 0;
}

.column {
  .v-input {
    width: auto;
  }
}

.column-hide-details {
  .v-input {
    margin: 10px 0;
  }
}

.w-5 {
  width: 5%;
}

.w-10 {
  width: 10%;
}

.w-13 {
  width: 13%;
}

.w-20 {
  width: 20%;
}
</style>