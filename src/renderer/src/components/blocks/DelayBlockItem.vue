<template >
  <div
       :class="`${direction === 'column' ? 'column' : 'd-flex flex-row'} ${direction === 'column' && hideDetails ? 'column-hide-details' : ''}`">
    <v-text-field v-model="delayBlock.value"
                  type="number"
                  class="mr-1 flex-1-1"
                  :label="t('block.delayBlock.value')"
                  hide-details></v-text-field>
    <v-select v-model="delayBlock.unit"
              class="mr-1 w-11"
              :items="['ms', 's']"
              :label="t('block.delayBlock.unit')"
              density="compact"
              hide-details
              required></v-select>
  </div>
</template>

<script setup lang="ts">
import { Block, DelayBlock } from '@W/frame/Block'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const props = defineProps<{ block: Block, index: number, direction?: 'row' | 'column', hideDetails?: boolean }>()
const delayBlock = props.block as DelayBlock

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