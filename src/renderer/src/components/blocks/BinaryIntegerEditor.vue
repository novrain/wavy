<template>
  <div class="binary d-flex align-center">
    <template v-for="i in [...Array(size * 8).keys()].reverse()">
      <div class="item">
        <span class="index">{{ i + 1 }}</span>
        <span class="bit"
              @click="() => onSwitch(i)">{{ (innerValue >> i) & 1 }}</span>
      </div>
      <v-divider class="divider"
                 vertical></v-divider>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{ modelValue: number, size: 1 | 2 | 4 | 8 }>(),
  {
    modelValue: 0,
    size: 1
  })

const emits = defineEmits(['update:modelValue'])

const innerValue = ref(((props.modelValue || 0) * 1) || 0)

const { t } = useI18n({ useScope: 'global' })

const onSwitch = (index: number) => {
  const v: number = ((innerValue.value >> index) & 1) ^ 1
  if (v) {
    innerValue.value |= (1 << index)
  } else {
    innerValue.value &= ~(1 << index)
  }
  emits('update:modelValue', innerValue.value)
}

watch(() => props.modelValue, (newValue) => {
  innerValue.value = newValue
})
</script>

<style lang="scss" scoped>
.binary {
  font-size: 12px;
  overflow: auto;
  max-width: 100%;

  .item {
    display: flex;
    flex-direction: column;
    text-align: center;

    .index {
      min-width: 15px;
    }

    .bit {
      cursor: pointer;
      width: 100%;
    }
  }

  .divider {
    height: 35px;
    width: 2px;
  }
}
</style>