<template>
  <v-container class="d-flex flex-1-1 pa-2 flex-column">
    <v-data-table :headers="headers"
                  :items="blocks"
                  v-model="selectedBlocks"
                  show-select
                  density="default"
                  item-value="id"
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
          <v-btn icon="mdi-plus"
                 primary
                 @click="() => onNewBlock(null, -1)"></v-btn>
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
                     @click="() => deleteBlock(index)"></v-btn>
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
import { defaultId } from '@W/util/SnowflakeId'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

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
      minWidth: '300px'
    },
    {
      title: t('project.block.actions'),
      // align: 'center',
      key: 'actions',
      width: '20px'
    },
  ]
})

const blocks = props.project.project?.blocks

const selectedBlocks = ref()

// add block directly?
const onNewBlock = (preItem: Block | null, index: number) => {
  props.project.project?.addBlock(new StringBlock(defaultId.nextId() + '', "s-block"))
}

const deleteBlock = (index: number) => {
  props.project.project?.deleteBlock(index)
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