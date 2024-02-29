<template >
  <td><v-text-field label=""
                  v-model="block.name"
                  hide-details></v-text-field></td>
  <td>
    <v-select :model-value="block.type"
              @update:model-value="onTypeChange"
              :items="types"
              label=""
              density="compact"
              hide-details
              required>
    </v-select>
  </td>
  <td>
    <component :is="blockComps[block.type as string]"
               :blocksContainer="blocksContainer"
               :block="block"
               :refBlocks="refBlocks"
               direction="column"
               :index="index"></component>
  </td>
</template>

<script setup lang="ts">
import { Block, BlockType } from '@W/frame/Block'
import { DataFrame, createBlock } from '@W/frame/Frame'
import { FrameProject } from '@W/frame/FrameProject'
import { defaultId } from '@W/util/SnowflakeId'
import DecimalBlockDefinition from './DecimalBlockDefinition.vue'
import RefBlockItem from './RefBlockItem.vue'
import StringBlockDefinition from './StringBlockDefinition.vue'

const blockComps = {
  "String": StringBlockDefinition,
  "Decimal": DecimalBlockDefinition,
  "Ref": RefBlockItem
} as any

const emits = defineEmits(['typeChange'])

const props = withDefaults(defineProps<{ block: Block, blocksContainer: FrameProject | DataFrame, index: number, types?: BlockType[], refBlocks?: Block[] }>(),
  {
    types: () => ['String', 'Decimal'],
    refBlocks: () => []
  })

const onTypeChange = (type: BlockType | string | null) => {
  const newBlock = createBlock(type as BlockType, defaultId.nextId() + '', props.block.name)
  if (newBlock) {
    props.blocksContainer?.replaceBlock(props.block, newBlock)
    emits('typeChange', props.block, newBlock)
  }
}

</script>

<style lang="scss" scoped></style>