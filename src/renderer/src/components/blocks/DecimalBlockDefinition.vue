<template >
  <div :class="`d-flex ${direction === 'column' ? 'flex-column' : 'flex-row'}`">
    <v-text-field v-model="decimalBlock.value"
                  class="mr-1 flex-1-1"
                  width="40px"
                  :label="t('project.decimalBlock.value')"
                  hide-details></v-text-field>
    <v-select v-model="decimalBlock.numberType"
              class="mr-1 w-10"
              :items="['UInt8', 'Int8', 'UInt16', 'Int16', 'UInt32', 'Int32', 'UInt64', 'Int64', 'Float', 'Double']"
              :label="t('project.decimalBlock.numberType')"
              density="compact"
              hide-details
              required></v-select>
    <v-select v-model="decimalBlock.encoding"
              class="mr-1 w-10"
              :items="['hex', 'base64', 'ascii']"
              :label="t('project.decimalBlock.encoding')"
              density="compact"
              hide-details
              required></v-select>
    <v-select v-model="decimalBlock.endian"
              class="mr-1 w-13"
              :items="['BigEndian', 'LittleEndian']"
              :label="t('project.decimalBlock.endian')"
              density="compact"
              hide-details
              required></v-select>
    <v-text-field v-model="decimalBlock.pad"
                  class="mr-1 w-10"
                  :label="t('project.decimalBlock.pad')"
                  hide-details></v-text-field>
    <v-select v-model="decimalBlock.padSide"
              class="mr-1 w-10"
              :items="['Start', 'End']"
              :label="t('project.decimalBlock.padSide')"
              density="compact"
              hide-details
              required></v-select>
    <v-text-field v-model="decimalBlock.padToLength"
                  class="mr-1 w-10"
                  :label="t('project.decimalBlock.padToLength')"
                  type="number"
                  hide-details></v-text-field>
  </div>
</template>

<script setup lang="ts">
import { Block, DecimalBlock } from '@W/frame/Block'
import { Project } from '@W/types/project'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{ block: Block, project: Project, index: number, direction?: 'row' | 'column' }>()
const decimalBlock = props.block as DecimalBlock

</script>

<style lang="scss" scoped>
.v-input {
  flex-shrink: 0;
  flex-grow: 0;
}

.flex-column {
  .v-input {
    margin: 10px;
    width: auto;
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