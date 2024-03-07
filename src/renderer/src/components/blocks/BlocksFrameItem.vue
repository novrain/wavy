<template>
  <div class="d-flex">
    <block-dialog v-if="mode === 'edit'"
                  ref="blockDialogRef"
                  mode="edit"
                  :blocks-container="blocksContainer"
                  :ref-blocks="refBlocks"
                  :block="block"
                  :types="types"
                  :index="index"
                  @cancel="onBlockDialogCancel"
                  @confirm="onBlockDialogConfirm"></block-dialog>
    <div class='d-flex align-center'
         v-if="isCurrent">
      <v-icon icon="mdi-square-edit-outline"
              class="ml-1 mr-1"
              color="none"
              variant="text"
              @click.stop="onEdit"></v-icon>
      <slot name='prepend'
            :item="block"
            :index="index" />
    </div>
    <v-btn :value="block.id">
      <v-icon icon="mdi-code-string"
              v-if="block.type === 'String'"></v-icon>
      <v-icon icon="mdi-code-brackets"
              v-if="block.type === 'Decimal'"></v-icon>
      <v-icon icon="mdi-timer-sand"
              v-if="block.type === 'Delay'"></v-icon>
      <v-icon icon="mdi-relation-one-to-one"
              v-if="block.type === 'Ref'"></v-icon>
      <v-icon icon="mdi-calculator-variant-outline"
              v-if="block.type === 'Computed'"></v-icon>
      <span v-tooltip="block.toString()">{{ block.type === 'Delay' ? block.toString() : block.name }}</span>
    </v-btn>
    <div class='d-flex align-center'
         v-if="isCurrent">
      <slot name='append'
            :item="block"
            :index="index" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Block, BlockType } from '@W/frame/Block'
import { BlocksContainer } from '@W/frame/Frame'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BlockDialog from '../wavy_items/BlockDialog.vue'
const { t } = useI18n({ useScope: 'global' })

const props = withDefaults(defineProps<{ block: Block, blocksContainer?: BlocksContainer, index: number, refBlocks?: Block[], isCurrent: boolean, types?: BlockType[], mode?: string }>(), {
  types: () => ["String", 'Decimal'],
  mode: 'edit'
})

const blockDialogRef = ref()

const onBlockDialogCancel = () => {
  blockDialogRef.value.hide()
}

const onBlockDialogConfirm = () => {
  blockDialogRef.value.validate().then((res: any) => {
    if (res.valid) {
      blockDialogRef.value.hide()
      const newBlock = blockDialogRef.value.value()
      props.blocksContainer?.replaceBlock(props.index, newBlock)
    }
  })
}

const onEdit = () => {
  blockDialogRef.value.show()
}

</script>

<style lang="scss" scoped>
:deep(.v-icon) {
  font-size: 15px !important;
}
</style>