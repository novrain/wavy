<template >
  <div
       :class="`${direction === 'column' ? 'column' : 'd-flex flex-row'} ${direction === 'column' && hideDetails ? 'column-hide-details' : ''}`">
    <v-text-field v-model="stringBlock.value"
                  class="mr-1 flex-1-1"
                  width="40px"
                  :label="t('block.stringBlock.value')"
                  :hide-details="hideDetails"></v-text-field>
    <v-select v-model="stringBlock.encoding"
              class="mr-1 w-11"
              :items="['hex', 'base64', 'ascii']"
              :label="t('block.stringBlock.encoding')"
              density="compact"
              :hide-details="hideDetails"
              required></v-select>
    <v-text-field v-model="stringBlock.pad"
                  class="mr-1 w-11"
                  :label="t('block.stringBlock.pad')"
                  :hide-details="hideDetails"></v-text-field>
    <v-select v-model="stringBlock.padSide"
              class="mr-1 w-11"
              :items="['Start', 'End']"
              :label="t('block.stringBlock.padSide')"
              density="compact"
              :hide-details="hideDetails"
              required></v-select>
    <v-text-field v-model="stringBlock.padToLength"
                  class="mr-1 w-11"
                  :label="t('block.stringBlock.padToLength')"
                  type="number"
                  :hide-details="hideDetails"></v-text-field>
  </div>
</template>

<script setup lang="ts">
import { Block, StringBlock } from '@W/frame/Block'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const props = withDefaults(defineProps<{ block: Block, index: number, direction?: 'row' | 'column', hideDetails?: boolean }>(), {
  hideDetails: true
})
const stringBlock = props.block as StringBlock

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

.w-11 {
  width: 11%;
}

.w-20 {
  width: 20%;
}
</style>