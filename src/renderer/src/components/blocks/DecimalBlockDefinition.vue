<template >
  <div
       :class="`${direction === 'column' ? 'column' : 'd-flex flex-row'} ${direction === 'column' && hideDetails ? 'column-hide-details' : ''}`">
    <v-text-field v-model="decimalBlock.value"
                  class="mr-1 flex-1-1"
                  width="40px"
                  :label="t('block.decimalBlock.value')"
                  :hide-details="hideDetails"></v-text-field>
    <binary-integer-editor class="mb-3"
                           v-model="decimalBlock.value as number"
                           v-if="['UInt8', 'UInt16', 'UInt32', 'UInt64'].includes(decimalBlock.numberType)"
                           :size="((parseInt(decimalBlock.numberType.replaceAll('UInt', '')) / 8) as any)"></binary-integer-editor>
    <v-select v-model="decimalBlock.numberType"
              class="mr-1 w-10"
              :items="['UInt8', 'Int8', 'UInt16', 'Int16', 'UInt32', 'Int32', 'UInt64', 'Int64', 'Float', 'Double']"
              :label="t('block.decimalBlock.numberType')"
              density="compact"
              :hide-details="hideDetails"
              required></v-select>
    <v-select v-model="decimalBlock.encoding"
              class="mr-1 w-10"
              :items="['hex', 'base64', 'ascii']"
              :label="t('block.decimalBlock.encoding')"
              density="compact"
              :hide-details="hideDetails"
              required></v-select>
    <v-select v-model="decimalBlock.endian"
              class="mr-1 w-13"
              :items="['BigEndian', 'LittleEndian']"
              :label="t('block.decimalBlock.endian')"
              density="compact"
              :hide-details="hideDetails"
              required></v-select>
    <v-text-field v-model="decimalBlock.pad"
                  class="mr-1 w-10"
                  :label="t('block.decimalBlock.pad')"
                  :hide-details="hideDetails"></v-text-field>
    <v-select v-model="decimalBlock.padSide"
              class="mr-1 w-10"
              :items="['Start', 'End']"
              :label="t('block.decimalBlock.padSide')"
              density="compact"
              :hide-details="hideDetails"
              required></v-select>
    <v-text-field v-model="decimalBlock.padToLength"
                  class="mr-1 w-10"
                  :label="t('block.decimalBlock.padToLength')"
                  type="number"
                  :hide-details="hideDetails"></v-text-field>
  </div>
</template>

<script setup lang="ts">
import { Block, DecimalBlock } from '@W/frame/Block'
import { useI18n } from 'vue-i18n'
import BinaryIntegerEditor from './BinaryIntegerEditor.vue'

const { t } = useI18n({ useScope: 'global' })

const props = withDefaults(defineProps<{ block: Block, index: number, direction?: 'row' | 'column', hideDetails?: boolean }>(), {
  hideDetails: true
})
const decimalBlock = props.block as DecimalBlock

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