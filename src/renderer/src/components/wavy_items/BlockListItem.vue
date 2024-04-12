<template>
  <v-list-item>
    <block-dialog ref="blockDialogRef"
                  mode="edit"
                  :blocks-container="blocksContainer"
                  :block="block"
                  :ref-blocks="refBlocks"
                  :index="index"
                  @cancel="onBlockDialogCancel"
                  @confirm="onBlockDialogConfirm"></block-dialog>
    <template #prepend>
      <v-icon icon="mdi-code-string"
              v-if="block.type === 'String'"></v-icon>
      <v-icon icon="mdi-code-brackets"
              v-if="block.type === 'Decimal'"></v-icon>
      <v-icon icon="mdi-set-merge"
              v-if="block.type === 'Composite'"></v-icon>
    </template>
    <v-list-item-title>
      <span v-tooltip="block.toString()"> {{ block.name }}</span>
    </v-list-item-title>
    <template #append>
      <div class="flex">
        <v-btn icon="mdi-square-edit-outline"
               class="mr-1"
               color="none"
               variant="text"
               @click.stop="onEdit"></v-btn>
        <slot name="append"></slot>
      </div>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { Block, BlocksContainer } from '@W/frame/Block'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BlockDialog from './BlockDialog.vue'
const { t } = useI18n({ useScope: 'global' })

const props = withDefaults(defineProps<{ block: Block, blocksContainer: BlocksContainer, index: number }>(), {
})

const blockDialogRef = ref()

const onBlockDialogCancel = () => {
  blockDialogRef.value.hide()
}

const refBlocks = computed(() => {
  return props.blocksContainer.blocks.filter(f => f.id !== props.block.id)
})

const onBlockDialogConfirm = () => {
  blockDialogRef.value.validate().then((res: any) => {
    if (res.valid) {
      blockDialogRef.value.hide()
      const newBlock = blockDialogRef.value.value()
      props.blocksContainer.replaceBlock(props.index, newBlock)
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