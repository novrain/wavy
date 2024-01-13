<template>
  <v-container class="d-flex flex-1-1 pa-0 pt-2 pb-2 flex-column">
    <v-data-table :headers="headers"
                  :items="blocks"
                  v-model="selectedBlocks"
                  show-select
                  density="default"
                  item-value="id"
                  :items-per-page="-1"
                  hover
                  :search="search"
                  class="block-table">
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
          <v-text-field v-model="search"
                        :label="t('project.block.search')"
                        prepend-inner-icon="mdi-magnify"
                        single-line
                        variant="outlined"
                        hide-details></v-text-field>
          <v-btn icon="mdi-content-save"
                 class="ml-1 mr-1"
                 color="primary"
                 @click="onSave"></v-btn>
          <v-btn icon="mdi-plus"
                 class="ml-1 mr-1"
                 color="primary"
                 primary
                 @click="() => onNewBlock(null, -1)"></v-btn>
          <v-btn icon="mdi-play"
                 class="mr-1"
                 color="primary"
                 :disabled="selectedBlocks.length <= 0 || !sessionIsConnected"
                 @click="executeSelectedBlocks"></v-btn>
          <v-btn icon="mdi-animation-play"
                 class="mr-1"
                 color="primary"
                 :disabled="selectedBlocks.length <= 0 || !sessionAvailable"
                 @click="executeSelectedBlocksToAll"></v-btn>
          <v-dialog persistent
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
                     class="ml-1 mr-1"
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
        <tr v-if="item.type !== 'Delay'">
          <td class="pl-2 pr-2">
            <v-checkbox density="compact"
                        v-model="selectedBlocks"
                        multiple
                        :value="item.id"
                        hide-details></v-checkbox>
          </td>
          <table-block-item :project="project"
                            :block="item"
                            :index="index"
                            @type-change="onTypeChange"></table-block-item>
          <td class="operation">
            <div class='d-flex'>
              <v-btn icon="mdi-plus"
                     class="mr-1"
                     color="none"
                     @click="() => onNewBlock(item, index + 1)"></v-btn>
              <v-btn icon="mdi-minus"
                     class="mr-1"
                     color="none"
                     @click="() => deleteBlock(item, index)"></v-btn>
              <v-btn icon="mdi-play"
                     class="mr-1"
                     color="none"
                     :disabled="!sessionIsConnected"
                     @click="() => executeBlock(item, index)"></v-btn>
              <v-btn icon="mdi-animation-play"
                     color="none"
                     :disabled="!sessionAvailable"
                     @click="() => executeBlockToAll(item, index)"></v-btn>
              <v-btn class="new-delay"
                     icon="mdi-timer-sand"
                     @click="() => newDelayBlock(item, index + 1)"></v-btn>
            </div>
          </td>
        </tr>
        <tr v-else>
          <td class="pl-2 pr-2">
            <v-checkbox density="compact"
                        v-model="selectedBlocks"
                        multiple
                        :value="item.id"
                        hide-details></v-checkbox>
          </td>
          <td>
            {{ t("project.delayBlock.delay") }}
          </td>
          <td>

          </td>
          <td :colspan="2"
              class="td-right">
            <div class="d-flex align-center w-100 justify-end">
              <delay-block-item class="flex-1-1"
                                :project="project"
                                :block="item"
                                :index="index"></delay-block-item>
              <v-btn icon="mdi-plus"
                     class="mr-1"
                     color="none"
                     @click="() => onNewBlock(item, index + 1)"></v-btn>
              <v-btn icon="mdi-minus"
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
import { useAppStore } from '@/store/app'
import { useSessionStore } from '@/store/session'
import { Session } from '@/types/session'
import { DefaultExecutor } from '@W/service/executor'
import { Block, DelayBlock, StringBlock } from '@W/frame/Block'
import { Project } from '@W/types/project'
import BitSet from '@W/util/BitSet'
import { defaultId } from '@W/util/SnowflakeId'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const tempIndexSet = new BitSet(100)

const appStore = useAppStore()

const sessionStore = useSessionStore()

const props = defineProps<{ project: Project }>()

const { t } = useI18n({ useScope: 'global' })

const search = ref('')

const headers = computed(() => {
  return [
    {
      title: t('project.block.name'),
      key: 'name',
      width: '100px',
      sortable: false
    },
    {
      title: t('project.block.type'),
      key: 'type',
      sortable: false,
    },
    {
      title: t('project.block.definition'),
      key: 'definition',
      minWidth: '150px',
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
  blockOnlyProject?.removeAllBlock()
  tempIndexSet.clearAll()
}

const removeSelected = () => {
  selectedBlocks.value.forEach((block: Block) => {
    blockOnlyProject?.deleteBlock(block)
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
  selectedBlocks.value = selectedBlocks.value.filter(id => id !== item.id)
}

const newDelayBlock = (item: Block, index: number) => {
  const tempIndex = tempIndexSet.nextClearBit(0)
  const newBlock = new DelayBlock(defaultId.nextId() + '', 'block-' + tempIndex)
  newBlock.tempIndex = tempIndex
  tempIndexSet.set(tempIndex)
  blockOnlyProject?.addBlock(newBlock, index)
}

const onTypeChange = (oldItem: Block, newItem: Block) => {
  selectedBlocks.value = selectedBlocks.value.filter(id => id !== oldItem.id)
}

const executeBlock = async (block: Block, index: number) => {
  await appStore.session.currentSession ? new DefaultExecutor().executeBlockToSession(appStore.session.currentSession as Session, block) : Promise.resolve()
}

const executeBlockToAll = async (block: Block, index: number) => {
  await new DefaultExecutor().executeBlockToSessions(sessionStore.sessions as Session[], block)
}

const sessionIsConnected = computed(() => {
  return appStore.session.currentSession && appStore.session.currentSession.isConnected
})

const sessionAvailable = computed(() => {
  return sessionStore.sessions.filter(s => {
    return s.isConnected
  }).length > 0
})

const executeSelectedBlocks = async () => {
  const blocks = selectedBlocks.value.map((id) => {
    return blockOnlyProject?.findBlock(id)
  })
  return appStore.session.currentSession ? new DefaultExecutor().executeBlocksToSession(appStore.session.currentSession as Session, blocks as Block[]) : Promise.resolve()
}

const executeSelectedBlocksToAll = async () => {
  const blocks = selectedBlocks.value.map((id) => {
    return blockOnlyProject?.findBlock(id)
  })
  return new DefaultExecutor().executeBlocksToSessions(sessionStore.sessions as Session[], blocks as Block[])
}
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
</style>