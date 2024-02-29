<template>
  <v-form ref='formRef'>
    <v-text-field :label="t('block.block.name')"
                  v-model="innerBlock.name"></v-text-field>
    <v-select density="compact"
              required
              :label="t('block.block.type')"
              :model-value="innerBlock.type"
              :items="types"
              :disabled="mode === 'edit'"
              :hide-details="false"
              @update:model-value="onTypeChange">
    </v-select>
    <component direction="column"
               :is="blockComps[innerBlock.type as string]"
               :block="innerBlock"
               :ref-blocks="refBlocks"
               :hide-details="false"
               :index="index"></component>
  </v-form>
</template>

<script setup lang="ts">
import { Block, BlockType } from '@W/frame/Block'
import { DataFrame, createBlock } from '@W/frame/Frame'
import { FrameProject } from '@W/frame/FrameProject'
import { defaultId } from '@W/util/SnowflakeId'
import { ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DecimalBlockDefinition from '../blocks/DecimalBlockDefinition.vue'
import DelayBlockItem from '../blocks/DelayBlockItem.vue'
import StringBlockDefinition from '../blocks/StringBlockDefinition.vue'
import RefBlockItem from '../blocks/RefBlockItem.vue'
const { t } = useI18n({ useScope: 'global' })

const blockComps = {
  "String": StringBlockDefinition,
  "Decimal": DecimalBlockDefinition,
  "Delay": DelayBlockItem,
  "Ref": RefBlockItem
} as any

const props = withDefaults(defineProps<{ block?: Block, blocksContainer: FrameProject | DataFrame, refBlocks?: Block[], index: number, types?: BlockType[], mode?: 'new' | 'edit' }>(), {
  types: () => ['String', 'Decimal', 'Ref'],
  mode: 'new',
})

const innerBlock = ref<Block>(props.block ? props.block.clone(true) : createBlock('String', defaultId.nextId() + '', ''))

watch(() => props.block, (newBlock) => {
  if (newBlock) {
    innerBlock.value = newBlock.clone(true)
  }
})

const formRef = ref()

const onTypeChange = (type: BlockType | string | null) => {
  innerBlock.value = createBlock(type as BlockType, defaultId.nextId() + '', innerBlock.value.name)
}

const validate = async () => {
  return formRef.value.validate()
}

const value = () => {
  return toRaw(innerBlock.value)
}

defineExpose({
  validate,
  value
})
</script>

<style lang="scss" scoped></style>