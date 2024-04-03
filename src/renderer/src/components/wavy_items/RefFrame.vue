<template>
  <v-row>
    <v-col>
      <v-select v-model="refFrame.refId"
                :items="refFrames"
                item-title="name"
                item-value="id"
                :label="t('frame.refFrame.ref')"
                density="compact"
                hide-details
                required>
      </v-select>
    </v-col>
    <v-col>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { Block } from '@W/frame/Block'
import { Frame, RefFrame, WavyItem } from '@W/frame/Frame'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const props = withDefaults(defineProps<{ wavyItem: WavyItem, index: number, direction?: 'row' | 'column', refBlocks?: Block[], refFrames?: Frame[] }>(), {
  refFrames: () => []
})
const refFrame = props.wavyItem as RefFrame

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