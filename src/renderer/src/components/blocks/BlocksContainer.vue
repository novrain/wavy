<template>
  <v-container class="d-flex flex-1-1 pa-0 pt-2 pb-2 flex-column">
    <v-data-table :headers="headers"
                  :items="blocks"
                  :model-value="innerSelectedBlocks"
                  @update:model-value="onSelectedBlocksChange"
                  show-select
                  density="default"
                  item-value="id"
                  :items-per-page="-1"
                  hover
                  :search="search"
                  :class="mode === 'view' ? 'block-table block-table-view' : 'block-table'">
      <!-- <template v-slot:headers="{ columns, isSorted, getSortIcon, toggleSort }">
        <tr>
          <template v-for="column in columns"
                    :key="column.key">
            <td class="header">
              <span class="mr-2 cursor-pointer"
                    @click="() => toggleSort(column)">{{ t(column.title)}}</span>
              <template v-if="isSorted(column)">
                <v-icon :icon="getSortIcon(column)"></v-icon>
              </template>
            </td>
          </template>
        </tr>
      </template> -->
      <template v-slot:top>
        <v-toolbar density="compact">
          <span class="ml-4">{{ title }}</span>
          <v-divider class="mx-4"
                     inset
                     vertical></v-divider>
          <v-text-field v-model="search"
                        :label="t('block.block.search')"
                        prepend-inner-icon="mdi-magnify"
                        single-line
                        variant="outlined"
                        hide-details></v-text-field>
          <v-btn v-if="mode === 'edit'"
                 icon="mdi-plus"
                 class="ml-1 mr-1"
                 color="primary"
                 primary
                 @click="() => onNewBlock(null, -1)"></v-btn>
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
                <v-card-actions v-if="mode === 'edit'">
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
      </template>
      <template v-slot:item="{ item, index }">
        <tr v-if="item.type !== 'Delay'">
          <td class="pl-2 pr-2">
            <v-checkbox density="compact"
                        :model-value="innerSelectedBlocks"
                        @update:model-value="onSelectedBlocksChange"
                        multiple
                        :value="item.id"
                        hide-details></v-checkbox>
          </td>
          <table-block-item :blocksContainer="blocksContainer"
                            :block="item"
                            :types="types"
                            :index="index"
                            :ref-blocks="includeRef ? refBlocks : []"
                            @type-change="onTypeChange"></table-block-item>
          <td class="operation">
            <div class='d-flex'
                 v-if="mode === 'edit'">
              <v-btn icon="mdi-plus"
                     class="mr-1"
                     color="none"
                     @click="() => onNewBlock(item, index + 1)"></v-btn>
              <v-btn icon="mdi-minus"
                     class="mr-1"
                     color="none"
                     @click="() => deleteBlock(item, index)"></v-btn>
              <v-btn v-if="includeDelay"
                     class="new-delay"
                     icon="mdi-timer-sand"
                     @click="() => newDelayBlock(item, index + 1)"></v-btn>
              <slot name='block-item-append'
                    :item="item"
                    :index="index" />
            </div>
          </td>
        </tr>
        <tr v-else>
          <td class="pl-2 pr-2">
            <v-checkbox density="compact"
                        :model-value="innerSelectedBlocks"
                        @update:model-value="onSelectedBlocksChange"
                        multiple
                        :value="item.id"
                        hide-details></v-checkbox>
          </td>
          <td>
            {{ t('block.delayBlock.delay') }}
          </td>
          <td>
          </td>
          <td :colspan="2"
              class="td-right">
            <div class="d-flex align-center w-100 justify-end">
              <delay-block-item class="flex-1-1"
                                :block="item"
                                :index="index"></delay-block-item>
              <v-btn v-if="mode === 'edit'"
                     icon="mdi-plus"
                     class="mr-1"
                     color="none"
                     @click="() => onNewBlock(item, index + 1)"></v-btn>
              <v-btn v-if="mode === 'edit'"
                     icon="mdi-minus"
                     class="mr-1"
                     color="none"
                     @click="() => deleteBlock(item, index)"></v-btn>
            </div>
          </td>
        </tr>
      </template>
      <template v-slot:bottom>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup lang="ts">
import DelayBlockItem from '@/components/blocks/DelayBlockItem.vue'
import TableBlockItem from '@/components/blocks/TableBlockItem.vue'
import { Block, BlockType, BlocksContainer, DelayBlock, StringBlock } from '@W/frame/Block'
import BitSet from '@W/util/BitSet'
import { defaultId } from '@W/util/SnowflakeId'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const tempIndexSet = new BitSet(100)

const props = withDefaults(defineProps<{
  title: string,
  blocksContainer: BlocksContainer,
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
    includeComputed: false,
    refBlocks: () => [],
    selectedBlocks: () => [],
    mode: 'edit'
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

const headers = computed(() => {
  return [
    {
      title: t('block.block.name'),
      key: 'name',
      width: '100px',
      sortable: false
    },
    {
      title: t('block.block.type'),
      key: 'type',
      sortable: false,
    },
    {
      title: t('block.block.definition'),
      key: 'definition',
      minWidth: '150px',
      sortable: false,
    },
    {
      title: t('block.block.actions'),
      // align: 'center',
      key: 'actions',
      width: '20px',
      sortable: false,
    },
  ]
})

let container = props.blocksContainer
let blocks = ref(props.blocks || container?.blocks || [])

watch(() => props.blocksContainer, (newContainer) => {
  container = newContainer
  blocks.value = newContainer?.blocks || []
})

const innerSelectedBlocks = ref(props.selectedBlocks || [])

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

// add block directly?
const onNewBlock = (preItem: Block | null, index: number) => {
  const tempIndex = tempIndexSet.nextClearBit(0)
  const newBlock = new StringBlock(defaultId.nextId() + '', 'block-' + tempIndex)
  newBlock.tempIndex = tempIndex
  tempIndexSet.set(tempIndex)
  container?.addBlock(newBlock, index)
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

const onTypeChange = (oldItem: Block, newItem: Block) => {
  innerSelectedBlocks.value = innerSelectedBlocks.value.filter(id => id !== oldItem.id)
  emitChange()
}

const onSelectedBlocksChange = ((values: string[]) => {
  innerSelectedBlocks.value = values
  emitChange()
})
</script>

<style lang="scss" scoped>
.block-table {

  .header {
    cursor: pointer;
  }

  .operation {
    position: relative;

    .new-delay {
      position: absolute;
      bottom: 0;
      right: 5px;
      // transform: translate(0, 50%);
    }
  }

  .td-right {
    text-align: right;
  }

  :deep(.v-selection-control) {
    font-size: 16px;
  }

  :deep(.v-table__wrapper) {

    tr,
    td {
      padding: 1px 5px;
    }
  }
}

.block-table-view {
  :deep(table>tbody>tr>td:not(:first-child)) {
    pointer-events: none;
  }
}
</style>