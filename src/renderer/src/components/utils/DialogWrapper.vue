<template>
  <v-dialog v-model="dialog"
            :min-width="minWidth"
            persistent
            :width="width || 'auto'">
    <v-card density="compact">
      <v-card-title>
        {{ title }}
      </v-card-title>
      <v-card-text>
        <slot></slot>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="elevated"
               @click="onConfirm">
          {{ t('dialog.confirm') }}
        </v-btn>
        <v-btn variant="text"
               @click="onCancel">
          {{ t('dialog.cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n({ useScope: 'global' })
defineProps(['title', 'width', 'minWidth'])
const emits = defineEmits(['confirm', 'cancel'])

const dialog = ref(false)

const onConfirm = () => {
  emits('confirm')
}

const onCancel = () => {
  emits('cancel')
}

const show = () => {
  dialog.value = true
}

const hide = () => {
  dialog.value = false
}

defineExpose({
  show,
  hide
})
</script>

<style lang="scss"></style>