<template >
  <div :class="`d-flex ${direction === 'column' ? 'flex-column' : 'flex-row'}`">
    <v-text-field v-model="stringBlock.value"
                  class="mr-1 flex-1-1"
                  width="40px"
                  :label="t('project.stringBlock.value')"
                  hide-details></v-text-field>
    <v-select v-model="stringBlock.encoding"
              class="mr-1 w-11"
              :items="['hex', 'base64', 'ascii']"
              :label="t('project.stringBlock.encoding')"
              density="compact"
              hide-details
              required></v-select>
    <v-text-field v-model="stringBlock.pad"
                  class="mr-1 w-11"
                  :label="t('project.stringBlock.pad')"
                  hide-details></v-text-field>
    <v-select v-model="stringBlock.padSide"
              class="mr-1 w-11"
              :items="['Start', 'End']"
              :label="t('project.stringBlock.padSide')"
              density="compact"
              hide-details
              required></v-select>
    <v-text-field v-model="stringBlock.padToLength"
                  class="mr-1 w-11"
                  :label="t('project.stringBlock.padToLength')"
                  type="number"
                  hide-details></v-text-field>
  </div>
</template>

<script setup lang="ts">
import { Block, StringBlock } from '@W/frame/Block'
import { Project } from '@W/types/project'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{ block: Block, project: Project, index: number, direction?: 'row' | 'column' }>()
const stringBlock = props.block as StringBlock

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

.w-11 {
  width: 11%;
}

.w-20 {
  width: 20%;
}
</style>