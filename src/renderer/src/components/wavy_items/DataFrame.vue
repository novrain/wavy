<template>
  <v-row>
    <v-col>
      <v-text-field v-model="(wavyItem as DataFrame).preDelay"
                    type="number"
                    class="mr-1 flex-1-1"
                    :label="t('frame.preDelay')"
                    hide-details></v-text-field>
    </v-col>
    <v-col>
      <v-text-field v-model="(wavyItem as DataFrame).postDelay"
                    type="number"
                    class="mr-1 flex-1-1"
                    :label="t('frame.postDelay')"
                    hide-details></v-text-field>
    </v-col>
  </v-row>
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
                      :ref-blocks="refBlocks"
                      :blocksContainer="(wavyItem as DataFrame)">
        </blocks-frame>
      </v-window-item>
      <v-window-item key="table"
                     value="table">
        <blocks-container :title="t('frame.dataFrame.blocks')"
                          :include-ref="true"
                          :ref-blocks="refBlocks"
                          :blocksContainer="(wavyItem as DataFrame)">
        </blocks-container>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import { DataFrame, Frame, WavyItem } from '@W/frame/Frame'
import { useI18n } from 'vue-i18n'
import BlocksContainer from '../blocks/BlocksContainer.vue'
import BlocksFrame from '../blocks/BlocksFrame.vue'
import { Block } from '@W/frame/Block'
import { ref } from 'vue'

const props = withDefaults(defineProps<{ wavyItem: WavyItem, refBlocks?: Block[], refFrames?: Frame[], mode?: 'table' | 'frame', index: number }>(),
  {
    refBlocks: () => [] as Block[],
    mode: 'frame'
  })

const innerMode = ref(props.mode)

const { t } = useI18n({ useScope: 'global' })

</script>

<style lang="scss" scoped></style>