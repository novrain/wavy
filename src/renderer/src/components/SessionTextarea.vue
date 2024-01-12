<template>
  <v-container class="session-textarea pa-0 d-flex flex-1-1 flex-column mr-2">
    <v-textarea class="d-flex flex-1-1"
                :label="label"
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
                 color="red"
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
    <div class="blur-view"
         v-if="props.editable !== false"
         ref="blurViewRef"
         v-html="valueWithSelection">
    </div>
  </v-container>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps(['label', 'modelValue', 'editable', 'autoScroll'])
const emit = defineEmits(['update:modelValue', 'update:modelSelect'])
let innerValue = ref(props.modelValue)

// const blur = ref(false)
const blurViewRef = ref()
let blurViewEl: HTMLTextAreaElement
const valueWithSelection = ref(props.modelValue)

const onFocus = (event: Event) => {
  // blur.value = false
  valueWithSelection.value = textareaEl.value
  emit('update:modelSelect', undefined)
}

const onBlur = (event: Event) => {
  // blur.value = true
}

const autoScrollToEnd = ref(props.autoScroll === undefined ? true : props.autoScroll)

const scrollToEnd = () => {
  if (autoScrollToEnd.value && textareaEl.disabled) {
    textareaEl.scrollTop = textareaEl.scrollHeight
  }
  syncScroll()
}

watch(() => props.modelValue, (newValue) => {
  innerValue.value = newValue
  valueWithSelection.value = newValue
  nextTick(() => {
    scrollToEnd()
  })
})

watch(() => props.autoScroll, (newValue) => {
  autoScrollToEnd.value = newValue === undefined ? true : newValue
  scrollToEnd()
})

watch(() => props.editable, (newValue) => {
  if (textareaEl) {
    textareaEl.disabled = newValue === false ? true : false
  }
})

const update = (value: string) => {
  innerValue.value = value
  valueWithSelection.value = value
  emit('update:modelValue', value)
  syncScroll()
}

const textareaRef = ref()
let textareaEl: HTMLTextAreaElement

const onScrollEnd = (e: Event) => {
  if (!props.autoScroll && textareaEl.disabled) {
    if (textareaEl.scrollTop + textareaEl.clientHeight >= textareaEl.scrollHeight) {
      autoScrollToEnd.value = true
    } else {
      autoScrollToEnd.value = false
    }
  }
}

const syncScroll = () => {
  if (blurViewEl) {
    blurViewEl.scrollTop = textareaEl.scrollTop
  }
}

const onSelect = (event: any) => {
  const target = event.target
  var start = target.selectionStart
  var end = target.selectionEnd
  var text = target.value
  const selection = text.substring(start, end)
  let innerHTML = text.substring(0, start) +
    "<span>" + selection +
    "</span>" + text.substring(end)
  // if (innerHTML.endsWith('\n')) {
  innerHTML += '\n'
  // }
  valueWithSelection.value = innerHTML
  if (blurViewEl) {
    blurViewEl.scrollTop = textareaEl.scrollHeight
  }
  nextTick(() => {
    syncScroll()
  })
  emit('update:modelSelect', selection)
}

onMounted(() => {
  textareaEl = textareaRef.value.$el.querySelector('textarea')
  textareaEl.disabled = props.editable === false ? true : false
  textareaEl.addEventListener('scrollend', onScrollEnd)
  textareaEl.addEventListener('scroll', syncScroll)
  textareaEl.addEventListener('select', onSelect)
  textareaEl.addEventListener('focus', onFocus)
  textareaEl.addEventListener('hover', onFocus)
  textareaEl.addEventListener('blur', onBlur)
  blurViewEl = blurViewRef.value
})

onBeforeUnmount(() => {
  // if (textareaEl.disabled) {
  textareaEl.removeEventListener('scrollend', onScrollEnd)
  textareaEl.removeEventListener('scroll', syncScroll)
  textareaEl.removeEventListener('select', onSelect)
  textareaEl.removeEventListener('focus', onFocus)
  textareaEl.removeEventListener('hover', onFocus)
  textareaEl.removeEventListener('blur', onBlur)
  // }
})

const clear = () => {
  update('')
}

const selectAll = () => {
  textareaEl.disabled = false
  textareaEl!.select()
  if (props.editable === false) {
    textareaEl.disabled = true
  }
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
  window.projectService.saveTextAs(textareaEl.value).then(r => {
    if (!r.result) {
    }
  })
}
</script>

<style lang="scss" scoped>
.session-textarea {
  position: relative;

  .blur-view {
    position: absolute;
    display: block !important;
    top: 0;
    left: 0;
    right: 32px;
    bottom: 0;
    font-size: 12px;
    overflow: auto;
    padding: 10px;
    color: transparent;
    pointer-events: none;
    border-color: transparent;
    white-space: pre-wrap;

    :deep(span) {
      background-color: rgb(var(--v-theme-primary));
      color: rgb(var(--v-theme-on-primary));
    }
  }
}
</style>