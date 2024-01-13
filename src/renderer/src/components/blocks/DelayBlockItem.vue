<template >
  <div :class="`d-flex ${direction === 'column' ? 'flex-column' : 'flex-row'}`">
    <v-text-field v-model="delayBlock.value"
                  type="number"
                  class="mr-1 flex-1-1"
                  :label="t('project.delayBlock.value')"
                  hide-details></v-text-field>
    <v-select v-model="delayBlock.unit"
              class="mr-1 w-11"
              :items="['ms', 's']"
              :label="t('project.delayBlock.unit')"
              density="compact"
              hide-details
              required></v-select>
  </div>
</template>

<script setup lang="ts">
import { Block, DelayBlock } from '@W/frame/Block'
import { Project } from '@W/types/project'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const props = defineProps<{ block: Block, project: Project, index: number, direction?: 'row' | 'column' }>()
const delayBlock = props.block as DelayBlock

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