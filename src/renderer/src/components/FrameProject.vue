<template>
  <v-container class="mt-2 pa-0">
    <v-toolbar density="compact">
      <span class="ml-4">{{ project.name }}</span>
      <v-divider class="mx-4"
                 inset
                 vertical></v-divider>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-play"
             class="ml-1 mr-1"
             color="primary"
             :disabled="!sessionIsConnected || executing"
             @click="executeProject"></v-btn>
      <v-btn icon="mdi-animation-play"
             class="ml-1 mr-1"
             color="primary"
             :disabled="!sessionAvailable || executing"
             @click="executeProjectToAll"></v-btn>
      <v-btn icon="mdi-content-save"
             class="ml-1 mr-1"
             color="primary"
             @click="onSave"></v-btn>
    </v-toolbar>
    <v-list v-model:opened="opened"
            density="compact"
            class="flex-1-1">
      <v-list-group class="group"
                    value="blocks">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props"
                       density="compact"
                       prepend-icon="mdi-semantic-web"
                       :title="t('project.frame.basic_blocks')">
            <block-dialog ref="blockDialogRef"
                          :blocks-container="(project.project as FrameProject)"
                          :block="block"
                          :ref-blocks="blocks"
                          @cancel="onBlockDialogCancel"
                          @confirm="onBlockDialogConfirm"
                          :index="blocks.length"></block-dialog>
            <div class="flex">
              <v-btn icon="mdi-plus"
                     color="primary"
                     variant="text"
                     @click.stop="onNewBlock"></v-btn>
            </div>
          </v-list-item>
        </template>
        <template v-for="block, index in blocks"
                  :key="'project-' + block.id">
          <block-list-item :blocks-container="(project.project as FrameProject)"
                           :block="block"
                           :index="index">
            <template #append>
              <v-btn icon="mdi-delete"
                     color="none"
                     variant="text"
                     @click.stop="() => onBlockDelete(block, index)"></v-btn>
            </template>
          </block-list-item>
        </template>
      </v-list-group>
      <v-list-group class="group"
                    value="frames">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props"
                       density="compact"
                       prepend-icon="mdi-view-array-outline"
                       :title="t('project.frame.frames')">
            <wavy-item-dialog ref="wavyItemDialogRef"
                              :project="project"
                              :wavyItem="wavyItem"
                              @cancel="onWavyItemDialogCancel"
                              @confirm="onWavyItemDialogConfirm"
                              :index="wavyItems.length"></wavy-item-dialog>
            <div class="flex">
              <v-btn icon="mdi-plus"
                     color="primary"
                     variant="text"
                     @click.stop="onNewWavyItem"></v-btn>
            </div>
          </v-list-item>
        </template>
        <template v-for="item, index in wavyItems"
                  :key="'project-' + item.id">
          <suite-vue v-if="item.type === 'Suite'"
                     :suite="(item as Suite)"
                     :project="project"
                     :index="index">
            <template #append>
              <v-btn icon="mdi-play"
                     class="ml-1 mr-1"
                     color="none"
                     variant="text"
                     :disabled="!sessionIsConnected || executing"
                     @click.stop="() => executeWavyItem(item)"></v-btn>
              <v-btn icon="mdi-animation-play"
                     class="ml-1 mr-1"
                     color="none"
                     variant="text"
                     :disabled="!sessionAvailable || executing"
                     @click.stop="() => executeWavyItemToAll(item)"></v-btn>
              <v-btn icon="mdi-delete"
                     color="none"
                     variant="text"
                     @click.stop="() => onWavyItemDelete(item, index)"></v-btn>
            </template>
            <template v-slot:suite-item-append="props">
              <v-btn icon="mdi-play"
                     class="ml-1 mr-1"
                     color="none"
                     variant="text"
                     :disabled="!sessionIsConnected || executing"
                     @click.stop="() => executeWavyItem(props.wavyItem)"></v-btn>
              <v-btn icon="mdi-animation-play"
                     class="ml-1 mr-1"
                     color="none"
                     variant="text"
                     :disabled="!sessionAvailable || executing"
                     @click.stop="() => executeWavyItemToAll(props.wavyItem)"></v-btn>
            </template>
          </suite-vue>
          <wavy-list-item v-else
                          :project="project"
                          :wavy-item="item"
                          :index="index">
            <template #append>
              <v-btn icon="mdi-play"
                     class="ml-1 mr-1"
                     color="none"
                     variant="text"
                     :disabled="!sessionIsConnected || executing"
                     @click.stop="() => executeWavyItem(item)"></v-btn>
              <v-btn icon="mdi-animation-play"
                     class="ml-1 mr-1"
                     color="none"
                     variant="text"
                     :disabled="!sessionAvailable || executing"
                     @click.stop="() => executeWavyItemToAll(item)"></v-btn>
              <v-btn icon="mdi-delete"
                     color="none"
                     variant="text"
                     @click.stop="() => onWavyItemDelete(item, index)"></v-btn>
            </template>
          </wavy-list-item>
        </template>
      </v-list-group>
    </v-list>
  </v-container>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/app'
import { useSessionStore } from '@/store/session'
import { Session } from '@/types/session'
import { Block, createBlock } from '@W/frame/Block'
import { Suite, WavyItem, createWavyItem } from '@W/frame/Frame'
import { FrameProject } from '@W/frame/FrameProject'
import { DefaultExecutor } from '@W/service/executor'
import { Project } from '@W/types/project'
import BitSet from '@W/util/BitSet'
import { defaultId } from '@W/util/SnowflakeId'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BlockDialog from './wavy_items/BlockDialog.vue'
import BlockListItem from './wavy_items/BlockListItem.vue'
import SuiteVue from './wavy_items/Suite.vue'
import WavyItemDialog from './wavy_items/WavyItemDialog.vue'
import WavyListItem from './wavy_items/WavyListItem.vue'

const appStore = useAppStore()

const sessionStore = useSessionStore()

const props = defineProps<{ project: Project }>()

const { t } = useI18n({ useScope: 'global' })

const search = ref('')

const opened = ref(['blocks', 'frames'])

let frameProject = props.project.project
frameProject?.injectContainerToRef()
let blocks = ref(frameProject?.blocks || [])
let wavyItems = ref(frameProject?.wavyItems || [])

watch(() => props.project, (newProject) => {
  frameProject = newProject.project
  blocks.value = frameProject?.blocks || []
  wavyItems.value = frameProject?.wavyItems || []
})

const onSave = () => {
  appStore.saveCurrentProject(props.project)
}

const sessionIsConnected = computed(() => {
  return appStore.session.currentSession && appStore.session.currentSession.isConnected
})

const sessionAvailable = computed(() => {
  return sessionStore.sessions.filter(s => {
    return s.isConnected
  }).length > 0
})

const executing = ref(false)

const executeWavyItem = async (wavyItem: WavyItem) => {
  executing.value = true
  try {
    appStore.session.currentSession
      ? await new DefaultExecutor().executeWavyItemToSession(appStore.session.currentSession as Session, wavyItem)
      : Promise.resolve()
  } catch (e) { }
  executing.value = false
}

const executeWavyItemToAll = async (wavyItem: WavyItem) => {
  executing.value = true
  try {
    await new DefaultExecutor().executeWavyItemToSessions(sessionStore.sessions as Session[], wavyItem)
  } catch (e) { }
  executing.value = false
}

const executeProject = async () => {
  executing.value = true
  try {
    appStore.session.currentSession
      ? await new DefaultExecutor().executeProjectToSession(appStore.session.currentSession as Session, props.project.project as FrameProject)
      : Promise.resolve()
  } catch (e) { }
  executing.value = false
}

const executeProjectToAll = async () => {
  executing.value = true
  try {
    await new DefaultExecutor().executeProjectToSessions(sessionStore.sessions as Session[], props.project.project as FrameProject)
  } catch (e) { }
  executing.value = false
}

// blocks
const blockDialogRef = ref()
const block = ref<Block>()

const tempBlockIndexSet = new BitSet(100)

const updateBlock = () => {
  const tempIndex = tempBlockIndexSet.nextClearBit(0)
  block.value = createBlock('String', defaultId.nextId() + '', 'block-' + tempIndex)
  tempBlockIndexSet.set(tempIndex)
  block.value.tempIndex = tempIndex
}

const onNewBlock = () => {
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
      // block.project = frameProject
      if (block.tempIndex === undefined) {
        const tempIndex = tempBlockIndexSet.nextClearBit(0)
        block.tempIndex = tempIndex
        tempBlockIndexSet.set(tempIndex)
      }
      tempBlockIndexSet.set(block.tempIndex)
      frameProject?.addBlock(block)
      blockDialogRef.value.hide()
    }
  })
}

const onBlockDelete = (block: Block, index: number) => {
  frameProject?.deleteBlock(index)
  tempBlockIndexSet.clear(block.tempIndex!)
}

// WavyItem
const wavyItemDialogRef = ref()
const wavyItem = ref<WavyItem>()

const tempWavyItemIndexSet = new BitSet(100)

const updateWavyItem = () => {
  const tempIndex = tempWavyItemIndexSet.nextClearBit(0)
  wavyItem.value = createWavyItem('Data', defaultId.nextId() + '', 'wavyItem-' + tempIndex)
  tempWavyItemIndexSet.set(tempIndex)
  wavyItem.value.tempIndex = tempIndex
}

const onNewWavyItem = () => {
  updateWavyItem()
  wavyItemDialogRef.value.show()
}

const onWavyItemDialogCancel = () => {
  tempWavyItemIndexSet.clear(wavyItem.value!.tempIndex!)
  wavyItemDialogRef.value.hide()
}

const onWavyItemDialogConfirm = () => {
  wavyItemDialogRef.value.validate().then((res: any) => {
    if (res.valid) {
      const wavyItem = wavyItemDialogRef.value.value()
      // wavyItem.project = frameProject
      if (wavyItem.tempIndex === undefined) {
        const tempIndex = tempWavyItemIndexSet.nextClearBit(0)
        wavyItem.tempIndex = tempIndex
      }
      tempWavyItemIndexSet.set(wavyItem.tempIndex)
      frameProject?.addWavyItem(wavyItem)
      wavyItemDialogRef.value.hide()
    }
  })
}

const onWavyItemDelete = (wavyItem: WavyItem, index: number) => {
  frameProject?.deleteWavyItem(index)
  console.log(wavyItem.tempIndex)
  tempWavyItemIndexSet.clear(wavyItem.tempIndex!)
}

</script>

<style lang="scss" scoped>
:deep(.v-list-item__spacer) {
  width: 10px !important;
}

:deep(.v-icon) {
  font-size: 15px !important;
}

:deep(.v-list-item__content) {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// .group {
//   // background-color: rgba(var(--v-border-color), var(--v-border-opacity));
// }
</style>