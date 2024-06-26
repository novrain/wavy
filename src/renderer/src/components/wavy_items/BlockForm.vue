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
               :blocks-container="blocksContainer"
               :hide-details="false"
               :index="index"></component>
  </v-form>
</template>

<script setup lang="ts">
import { Block, ComputedBlock as BlockComputed, BlockType, BlocksContainer, createBlock } from '@W/frame/Block'
import { defaultId } from '@W/util/SnowflakeId'
import { ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CompositeBlock from '../blocks/CompositeBlock.vue'
import DecimalBlockDefinition from '../blocks/DecimalBlockDefinition.vue'
import DelayBlockItem from '../blocks/DelayBlockItem.vue'
import RefBlockItem from '../blocks/RefBlockItem.vue'
import StringBlockDefinition from '../blocks/StringBlockDefinition.vue'
import ComputedBlock from './ComputedBlock.vue'
const { t } = useI18n({ useScope: 'global' })

const blockComps = {
  "String": StringBlockDefinition,
  "Decimal": DecimalBlockDefinition,
  "Delay": DelayBlockItem,
  "Ref": RefBlockItem,
  "Computed": ComputedBlock,
  "Composite": CompositeBlock
} as any

const props = withDefaults(defineProps<{ block?: Block, blocksContainer?: BlocksContainer, refBlocks?: Block[], index: number, types?: BlockType[], mode?: 'new' | 'edit' }>(), {
  types: () => ['String', 'Decimal', 'Ref', 'Computed', 'Composite'],
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
  if (type === 'Computed') {
    (innerBlock.value as BlockComputed).blocksContainer = props.blocksContainer!
  }
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