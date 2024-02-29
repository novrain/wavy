<template>
  <dialog-wrapper ref="dialogRef"
                  :title="t(`project.frame.block_${mode}`)"
                  :width="300"
                  @cancel="onCancel"
                  @confirm="onConfirm">
    <block-form ref="formRef"
                :block="block"
                :mode="mode"
                :blocksContainer="blocksContainer"
                :ref-blocks="refBlocks"
                :types="types"
                :index="index"></block-form>
  </dialog-wrapper>
</template>

<script setup lang="ts">
import { Block, BlockType } from '@W/frame/Block'
import { DataFrame } from '@W/frame/Frame'
import { FrameProject } from '@W/frame/FrameProject'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DialogWrapper from '../utils/DialogWrapper.vue'
import BlockForm from './BlockForm.vue'

const { t } = useI18n({ useScope: 'global' })

const props = withDefaults(defineProps<{ block?: Block, blocksContainer: FrameProject | DataFrame, refBlocks?: Block[], index: number, mode?: 'new' | 'edit', types?: BlockType[] }>(), {
  mode: 'new',
  types: () => ['String', 'Decimal']
})

const emits = defineEmits(['confirm', 'cancel'])

const onConfirm = () => {
  emits('confirm')
}

const onCancel = () => {
  emits('cancel')
}

const formRef = ref()
const dialogRef = ref()

const validate = async () => {
  return formRef.value.validate()
}

const show = () => {
  dialogRef.value.show()
}

const hide = () => {
  dialogRef.value.hide()
}

const value = () => {
  return formRef.value.value()
}

defineExpose({
  validate,
  show,
  hide,
  value
})
</script>

<style lang="scss" scoped></style>