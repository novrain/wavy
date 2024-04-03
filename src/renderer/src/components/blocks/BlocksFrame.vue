<template>
  <v-container class="d-flex flex-1-1 pa-0 pt-2 pb-2 flex-column block-frame-container ">
    <v-toolbar density="compact">
      <span class="ml-4">{{ title }}</span>
      <v-divider class="mx-4"
                 inset
                 vertical></v-divider>
      <v-btn v-if="mode === 'edit'"
             icon="mdi-plus"
             class="ml-1 mr-1"
             color="primary"
             primary
             @click="() => onNewBlock(null, blocks.length)"></v-btn>
      <v-dialog persistent
                v-if="mode === 'edit'"
                width="auto">
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-broom"
                 class="ml-1 mr-1"
                 :disabled="!blocks || blocks.length <= 0"
                 v-bind="props"
                 color="red">
          </v-btn>
        </template>
        <template v-slot:default="{ isActive }">
          <v-card>
            <v-card-title class="text-h5">
              {{ t('block.dialog.hint') }}
            </v-card-title>
            <v-card-text>
              {{ t('block.dialog.clearAll') }}
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn variant="elevated"
                     @click="() => {
                       isActive.value = false
                       clearAll()
                     }">
                {{ t('block.dialog.confirm') }}
              </v-btn>
              <v-btn variant="text"
                     @click="() => isActive.value = false">
                {{ t('block.dialog.cancel') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
      <v-dialog persistent
                v-if="mode === 'edit'"
                width="auto">
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-delete-sweep"
                 class="ml-1 mr-1"
                 :disabled="innerSelectedBlocks.length <= 0"
                 v-bind="props"
                 color="red">
          </v-btn>
        </template>
        <template v-slot:default="{ isActive }">
          <v-card>
            <v-card-title class="text-h5">
              {{ t('block.dialog.hint') }}
            </v-card-title>
            <v-card-text>
              {{ t('block.dialog.deleteSelected') }}
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn variant="elevated"
                     @click="() => {
                       isActive.value = false
                       removeSelected()
                     }">
                {{ t('block.dialog.confirm') }}
              </v-btn>
              <v-btn variant="text"
                     @click="() => isActive.value = false">
                {{ t('block.dialog.cancel') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
      <slot name='top-append' />
    </v-toolbar>
    <block-dialog v-if="mode === 'edit'"
                  ref="blockDialogRef"
                  mode="new"
                  :blocks-container="blocksContainer"
                  :ref-blocks="refBlocks"
                  :block="block"
                  :types="types"
                  :index="currentIndex"
                  @cancel="onBlockDialogCancel"
                  @confirm="onBlockDialogConfirm"></block-dialog>
    <v-btn-toggle :model-value="innerSelectedBlocks"
                  @update:model-value="onSelectedBlocksChange"
                  multiple
                  variant="outlined"
                  divided
                  class="block-frame overflow-auto pa-0 mt-2 mb-2">
      <template v-for="block, index in blocks"
                v-if="mode === 'edit'"
                :key="'blocks-edit' + block.id">
        <div class="d-flex"
             @mouseenter="currentBlock = block"
             @mouseleave="currentBlock = undefined">
          <blocks-frame-item :block="block"
                             :blocks-container="blocksContainer"
                             :ref-blocks="refBlocks"
                             :mode="mode"
                             :index="index"
                             :is-current="currentBlock === block">
            <template #prepend="props">
              <v-icon icon="mdi-plus"
                      class="mr-1 ml-1"
                      color="none"
                      @click.stop()="() => onNewBlock(block, index)"></v-icon>
              <v-icon v-if="includeDelay"
                      class="new-delay mr-1 ml-1"
                      icon="mdi-timer-sand"
                      @click.stop()="() => newDelayBlock(block, index)"></v-icon>
              <slot name='block-item-prepend'
                    :item="block"
                    :index="index" />
            </template>
            <template #append="props">
              <v-icon icon="mdi-minus"
                      class="mr-1 ml-1"
                      color="none"
                      @click.stop()="() => deleteBlock(block, index)"></v-icon>
              <v-icon icon="mdi-plus"
                      class="mr-1 ml-1"
                      color="none"
                      @click.stop()="() => onNewBlock(block, index + 1)"></v-icon>
              <v-icon v-if="includeDelay"
                      class="new-delay mr-1 ml-1"
                      icon="mdi-timer-sand"
                      @click.stop()="() => newDelayBlock(block, index + 1)"></v-icon>
              <slot name='block-item-append'
                    :item="block"
                    :index="index" />
            </template>
          </blocks-frame-item>
        </div>
      </template>
      <template v-for="block, index in blocks"
                v-else
                :key="'blocks-view-' + block.id">
        <div class="d-flex">
          <blocks-frame-item :block="block"
                             :blocks-container="blocksContainer"
                             :ref-blocks="refBlocks"
                             :mode="mode"
                             :index="index"
                             :is-current="false">
          </blocks-frame-item>
        </div>
      </template>
    </v-btn-toggle>
  </v-container>
</template>

<script setup lang="ts">
import { Block, BlockType, BlocksContainer, DelayBlock, createBlock } from '@W/frame/Block'
import BitSet from '@W/util/BitSet'
import { defaultId } from '@W/util/SnowflakeId'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BlockDialog from '../wavy_items/BlockDialog.vue'
import BlocksFrameItem from './BlocksFrameItem.vue'

const tempIndexSet = new BitSet(100)

const props = withDefaults(defineProps<{
  title: string,
  blocksContainer?: BlocksContainer,
  includeDelay?: boolean,
  includeRef?: boolean,
  includeComputed?: boolean,
  refBlocks?: Block[],
  selectedBlocks?: string[],
  mode?: string,
  blocks?: Block[]
}>(),
  {
    includeRef: false,
    includeDelay: false,
    refBlocks: () => [],
    selectedBlocks: () => [],
    mode: 'edit',
    id: ''
  })

const emits = defineEmits(['update:selectedBlocks'])

const { t } = useI18n({ useScope: 'global' })

const search = ref('')

const types: BlockType[] = ['String', 'Decimal']

if (props.includeDelay) {
  types.push('Delay')
}
if (props.includeRef) {
  types.push('Ref')
}
if (props.includeComputed) {
  types.push('Computed')
}

let container = props.blocksContainer
let blocks = ref(props.blocks || container?.blocks || [])

watch(() => props.blocksContainer, (newContainer) => {
  container = newContainer
  blocks.value = newContainer?.blocks || []
})

const innerSelectedBlocks = ref(props.selectedBlocks || [])
const currentBlock = ref<Block>()

watch(() => props.selectedBlocks, () => {
  innerSelectedBlocks.value = props.selectedBlocks || []
})

const emitChange = () => {
  emits('update:selectedBlocks', innerSelectedBlocks.value)
}

const clearAll = () => {
  container?.removeAllBlock()
  tempIndexSet.clearAll()
  innerSelectedBlocks.value = []
  emitChange()
}

const removeSelected = () => {
  innerSelectedBlocks.value.forEach((id: string) => {
    const block = container?.findBlock(id)
    if (block) {
      container?.deleteBlock(block)
      tempIndexSet.clear(block.tempIndex!)
    }
  })
  innerSelectedBlocks.value = []
  emitChange()
}

const blockDialogRef = ref()
const block = ref<Block>()
const currentIndex = ref(-1)

const tempBlockIndexSet = new BitSet(100)

const updateBlock = () => {
  const tempIndex = tempBlockIndexSet.nextClearBit(0)
  block.value = createBlock('String', defaultId.nextId() + '', 'block-' + tempIndex)
  tempBlockIndexSet.set(tempIndex)
  block.value.tempIndex = tempIndex
}

const onNewBlock = (preBlock: Block | null, index: number) => {
  currentIndex.value = index
  updateBlock()
  blockDialogRef.value.show()
}

const onBlockDialogCancel = () => {
  tempBlockIndexSet.clear(block.value!.tempIndex!)
  blockDialogRef.value.hide()
}

const onBlockDialogConfirm = () => {
  blockDialogRef.value.validate().then((res: any) => {
    if (res.valid) {
      const block = blockDialogRef.value.value()
      if (block.tempIndex === undefined) {
        const tempIndex = tempBlockIndexSet.nextClearBit(0)
        block.tempIndex = tempIndex
        tempBlockIndexSet.set(tempIndex)
      }
      tempBlockIndexSet.set(block.tempIndex)
      container?.addBlock(block, currentIndex.value)
      blockDialogRef.value.hide()
    }
  })
}

const deleteBlock = (item: Block, index: number) => {
  container?.deleteBlock(index)
  tempIndexSet.clear(item.tempIndex!)
  innerSelectedBlocks.value = innerSelectedBlocks.value.filter(id => id !== item.id)
  emitChange()
}

const newDelayBlock = (item: Block, index: number) => {
  const tempIndex = tempIndexSet.nextClearBit(0)
  const newBlock = new DelayBlock(defaultId.nextId() + '', 'block-' + tempIndex)
  newBlock.tempIndex = tempIndex
  tempIndexSet.set(tempIndex)
  container?.addBlock(newBlock, index)
}

// const onTypeChange = (oldItem: Block, newItem: Block) => {
//   selectedBlocks.value = selectedBlocks.value.filter(id => id !== oldItem.id)
// }

const onSelectedBlocksChange = ((values: string[]) => {
  innerSelectedBlocks.value = values
  emitChange()
})
</script>

<style lang="scss" scoped>
.block-frame-container {
  font-size: 14px;

  .block-frame {
    padding-right: 100px;
  }

  :deep(.v-btn-group>div:last-child) {
    margin-right: 100px;
  }
}
</style>