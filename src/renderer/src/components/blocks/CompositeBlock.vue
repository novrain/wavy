<template>
  <div class="mt-2">
    <v-tabs v-model="innerMode"
            align-tabs="center">
      <v-tab class="mr-2 ml-2"
             value="frame">{{ t('frame.dataFrame.frameMode') }}</v-tab>
      <v-tab class="mr-2 ml-2"
             value="table">{{ t('frame.dataFrame.tableMode') }}</v-tab>
    </v-tabs>
    <v-window v-model="innerMode">
      <v-window-item key="frame"
                     value="frame">
        <blocks-frame :title="t('frame.dataFrame.blocks')"
                      :include-ref="true"
                      :include-computed="true"
                      :ref-blocks="refBlocks"
                      :blocksContainer="(block as CompositeBlock)"
                      v-model:selected-blocks="selectedBlocks">
        </blocks-frame>
      </v-window-item>
      <v-window-item key="table"
                     value="table">
        <blocks-container :title="t('frame.dataFrame.blocks')"
                          :include-ref="true"
                          :include-computed="true"
                          :ref-blocks="refBlocks"
                          :blocksContainer="(block as CompositeBlock)"
                          v-model:selected-blocks="selectedBlocks">
        </blocks-container>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import { Block, CompositeBlock } from '@W/frame/Block'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BlocksContainer from '../blocks/BlocksContainer.vue'
import BlocksFrame from '../blocks/BlocksFrame.vue'

const props = withDefaults(defineProps<{ block: Block, refBlocks?: Block[], mode?: 'table' | 'frame', index: number }>(),
  {
    refBlocks: () => [] as Block[],
    mode: 'frame'
  })

const innerMode = ref(props.mode)

const { t } = useI18n({ useScope: 'global' })

const selectedBlocks = ref([])

</script>

<style lang="scss" scoped></style>