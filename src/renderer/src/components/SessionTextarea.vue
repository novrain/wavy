<template>
  <v-textarea :label="label"
              ref="textareaRef"
              :modelValue="innerValue"
              @update:modelValue="update"
              variant="outlined"
              hide-details
              no-resize>
    <template v-slot:append-inner>
      <v-container class="pa-0 d-flex flex-column">
        <v-btn class="mb-1"
               variant="tonal"
               icon="mdi-broom"
               @click="clear"></v-btn>
        <v-btn class="mb-1"
               variant="tonal"
               icon="mdi-check-all"
               @click="selectAll"></v-btn>
        <v-btn class="mb-1"
               variant="tonal"
               icon="mdi-content-copy"
               @click="copy"></v-btn>
        <v-btn variant="tonal"
               icon="mdi-content-save-all-outline"
               @click="save"></v-btn>
      </v-container>
    </template>
  </v-textarea>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps(['label', 'modelValue', 'editable'])
const emit = defineEmits(['update:modelValue'])
let innerValue = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  innerValue.value = newValue
})

watch(() => props.editable, (newValue) => {
  if (textareaEl) {
    textareaEl.disabled = newValue === false ? true : false
  }
})

const update = (value: string) => {
  innerValue.value = value
  emit('update:modelValue', value)
}

const textareaRef = ref()
let textareaEl: HTMLTextAreaElement

onMounted(() => {
  textareaEl = textareaRef.value.$el.querySelector('textarea')
  textareaEl.disabled = props.editable === false ? true : false
})

const clear = () => {
  update('')
}

const selectAll = () => {
  textareaEl.disabled = false
  textareaEl!.select()
  textareaEl.disabled = true
}

const copy = async () => {
  const start = textareaEl.selectionStart
  const end = textareaEl.selectionEnd
  if (start >= end) {
    return
  }
  const text = textareaEl.value.substring(start, end)
  await navigator.clipboard.writeText(text)
}

const save = async () => {

}
</script>

<style lang="scss" scoped></style>