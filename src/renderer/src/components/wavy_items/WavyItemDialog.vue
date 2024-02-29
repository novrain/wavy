<template>
  <dialog-wrapper ref="dialogRef"
                  :title="t(`project.frame.wavyItem_${mode}`)"
                  :width="600"
                  height="90%"
                  @cancel="onCancel"
                  @confirm="onConfirm">
    <wavyItem-form ref="formRef"
                   :wavyItem="wavyItem"
                   :mode="mode"
                   :project="project"
                   :index="index"></wavyItem-form>
  </dialog-wrapper>
</template>

<script setup lang="ts">
import { WavyItem } from '@W/frame/Frame'
import { Project } from '@W/types/project'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DialogWrapper from '../utils/DialogWrapper.vue'
import WavyItemForm from './WavyItemForm.vue'

const { t } = useI18n({ useScope: 'global' })

const props = withDefaults(defineProps<{ wavyItem?: WavyItem, project: Project, index: number, mode?: 'new' | 'edit' }>(), {
  mode: 'new'
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