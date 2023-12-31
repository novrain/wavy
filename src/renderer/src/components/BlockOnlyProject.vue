<template>
  <v-container class="d-flex flex-1-1 pa-2 flex-column">
    <v-data-table :headers="headers"
                  :items="blocks"
                  v-model="selectedBlocks"
                  show-select
                  density="default"
                  item-value="id"
                  :items-per-page="-1"
                  hover
                  class="block-table"
                  multi-sort>
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
          <span class="ml-4">{{ t('project.block.blocks') }}</span>
          <v-divider class="mx-4"
                     inset
                     vertical></v-divider>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-content-save"
                 class="ml-2 mr-2"
                 primary
                 @click="onSave"></v-btn>
          <v-btn icon="mdi-plus"
                 class="ml-2 mr-2"
                 primary
                 @click="() => onNewBlock(null, -1)"></v-btn>
          <v-dialog persistent
                    width="auto">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-broom"
                     class="ml-2 mr-2"
                     :disabled="blocks.length <= 0"
                     v-bind="props"
                     color="red">
              </v-btn>
            </template>
            <template v-slot:default="{ isActive }">
              <v-card>
                <v-card-title class="text-h5">
                  {{ t('project.dialog.hint') }}
                </v-card-title>
                <v-card-text>
                  {{ t('project.dialog.clearAll') }}
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn variant="elevated"
                         @click="() => {
                           isActive.value = false
                           clearAll()
                         }">
                    {{ t('project.dialog.confirm') }}
                  </v-btn>
                  <v-btn variant="text"
                         @click="() => isActive.value = false">
                    {{ t('project.dialog.cancel') }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog> <v-dialog persistent
                    width="auto">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-delete-sweep"
                     class="ml-2 mr-2"
                     :disabled="selectedBlocks.length <= 0"
                     v-bind="props"
                     color="red">
              </v-btn>
            </template>
            <template v-slot:default="{ isActive }">
              <v-card>
                <v-card-title class="text-h5">
                  {{ t('project.dialog.hint') }}
                </v-card-title>
                <v-card-text>
                  {{ t('project.dialog.deleteSelected') }}
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn variant="elevated"
                         @click="() => {
                           isActive.value = false
                           removeSelected()
                         }">
                    {{ t('project.dialog.confirm') }}
                  </v-btn>
                  <v-btn variant="text"
                         @click="() => isActive.value = false">
                    {{ t('project.dialog.cancel') }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item="{ item, index }">
        <tr>
          <td class="pl-2 pr-2">
            <v-checkbox density="compact"
                        v-model="selectedBlocks"
                        multiple
                        :value="item.id"
                        hide-details></v-checkbox>
          </td>
          <table-block-item :project="project"
                            :block="item"
                            :index="index"></table-block-item>
          <td>
            <div class='d-flex'>
              <v-btn icon="mdi-plus"
                     class="mr-1"
                     @click="() => onNewBlock(item, index)"></v-btn>
              <v-btn icon="mdi-minus"
                     class="mr-1"
                     @click="() => deleteBlock(item, index)"></v-btn>
              <v-btn icon="mdi-play"
                     :disabled="!sessionIsConnected"
                     @click="() => executeBlock(item, index)"></v-btn>
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
import TableBlockItem from '@/components/blocks/TableBlockItem.vue'
import { useAppStore } from '@/store/app'
import { Block, StringBlock } from '@W/frame/Block'
import { Project } from '@W/types/project'
import BitSet from '@W/util/BitSet'
import { defaultId } from '@W/util/SnowflakeId'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const tempIndexSet = new BitSet(100)

const appStore = useAppStore()

const props = defineProps<{ project: Project }>()

const { t } = useI18n()

const headers = computed(() => {
  return [
    {
      title: t('project.block.name'),
      key: 'name',
      width: '100px'
    },
    {
      title: t('project.block.type'),
      key: 'type',
    },
    {
      title: t('project.block.definition'),
      key: 'definition',
      minWidth: '300px',
      sortable: false,
    },
    {
      title: t('project.block.actions'),
      // align: 'center',
      key: 'actions',
      width: '20px',
      sortable: false,
    },
  ]
})

let blockOnlyProject = props.project.project
let blocks = ref(blockOnlyProject?.blocks)

watch(() => props.project, (newProject) => {
  blockOnlyProject = newProject.project
  blocks.value = blockOnlyProject?.blocks
})

const onSave = () => {
  appStore.saveCurrentProject(props.project)
}

const selectedBlocks = ref([])

const clearAll = () => {
  blockOnlyProject.removeAllBlock()
  tempIndexSet.clearAll()
}

const removeSelected = () => {
  selectedBlocks.value.forEach(block => {
    blockOnlyProject.deleteBlock(block)
    tempIndexSet.clear(block.tempIndex)
  })
  selectedBlocks.value = []
}

// add block directly?
const onNewBlock = (preItem: Block | null, index: number) => {
  const tempIndex = tempIndexSet.nextClearBit(0)
  const newBlock = new StringBlock(defaultId.nextId() + '', 'block-' + tempIndex)
  newBlock.tempIndex = tempIndex
  tempIndexSet.set(tempIndex)
  blockOnlyProject?.addBlock(newBlock, index)
}

const deleteBlock = (item: Block, index: number) => {
  blockOnlyProject?.deleteBlock(index)
  tempIndexSet.clear(item.tempIndex)
}

const executeBlock = (block: Block, index: number) => {
  const data = block.encode()
  if (data) {
    appStore.session.currentSession?.send(data, true, data.toString(block.encoding))
  }
}

const sessionIsConnected = computed(() => {
  return appStore.session.currentSession && appStore.session.currentSession.isConnected
})

</script>

<style lang="scss" scoped>
.block-table {

  .header {
    cursor: pointer;
  }

  :deep(.v-selection-control) {
    font-size: 16px;
  }
}
</style>