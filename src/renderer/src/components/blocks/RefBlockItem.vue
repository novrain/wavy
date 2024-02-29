<template >
  <div
       :class="`${direction === 'column' ? 'column' : 'd-flex flex-row'} ${direction === 'column' && hideDetails ? 'column-hide-details' : ''}`">
    <v-select v-model="refBlock.refId"
              class="mr-1 w-11"
              :items="refBlocks"
              item-title="name"
              item-value="id"
              :label="t('block.refBlock.ref')"
              density="compact"
              hide-details
              required></v-select>
  </div>
</template>

<script setup lang="ts">
import { Block } from '@W/frame/Block'
import { RefBlock } from '@W/frame/Frame'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const props = withDefaults(defineProps<{ block: Block, index: number, direction?: 'row' | 'column', refBlocks?: Block[], hideDetails?: boolean }>(), {
  refBlocks: () => []
})
const refBlock = props.block as RefBlock

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