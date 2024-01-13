<template >
  <td><v-text-field v-model="block.name"
                  hide-details></v-text-field></td>
  <td>
    <v-select :value="block.type"
              @update:model-value="onTypeChange"
              :items="['String', 'Decimal']"
              label=""
              density="compact"
              hide-details
              required>
    </v-select>
  </td>
  <td>
    <component :is="blockComps[block.type as string]"
               :project="project"
               :block="block"
               direction="column"
               :index="index"></component>
  </td>
</template>

<script setup lang="ts">
import { Block, BlockType, createBlock } from '@W/frame/Block'
import { Project } from '@W/types/project'
import { defaultId } from '@W/util/SnowflakeId'
import DecimalBlockDefinition from './DecimalBlockDefinition.vue'
import StringBlockDefinition from './StringBlockDefinition.vue'

const blockComps = {
  "String": StringBlockDefinition,
  "Decimal": DecimalBlockDefinition
} as any

const emits = defineEmits(['typeChange'])

const props = defineProps<{ block: Block, project: Project, index: number }>()

const onTypeChange = (type: BlockType | string | null) => {
  const newBlock = createBlock(type as BlockType, defaultId.nextId() + '', props.block.name)
  if (newBlock) {
    props.project.project?.replaceBlock(props.block, newBlock)
    emits('typeChange', props.block, newBlock)
  }
}

</script>

<style lang="scss" scoped></style>