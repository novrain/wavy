<template>
  <blocks-container :title="t('project.block.blocks')"
                    :include-delay="true"
                    :blocksContainer="(project.project as FrameProject)"
                    @update:selected-blocks="onSelectedBlocksChange">
    <template v-slot:top-append>
      <v-btn icon="mdi-content-save"
             class="ml-1 mr-1"
             color="primary"
             @click="onSave"></v-btn>
      <v-btn icon="mdi-play"
             class="mr-1"
             color="primary"
             :disabled="selectedBlocks.length <= 0 || !sessionIsConnected || executing"
             @click="executeSelectedBlocks"></v-btn>
      <v-btn icon="mdi-animation-play"
             class="mr-1"
             color="primary"
             :disabled="selectedBlocks.length <= 0 || !sessionAvailable || executing"
             @click="executeSelectedBlocksToAll"></v-btn>
    </template>
    <template v-slot:block-item-append="props">
      <v-btn icon="mdi-play"
             class="mr-1"
             color="none"
             :disabled="!sessionIsConnected"
             @click="() => executeBlock(props.item, props.index)"></v-btn>
      <v-btn icon="mdi-animation-play"
             color="none"
             :disabled="!sessionAvailable"
             @click="() => executeBlockToAll(props.item, props.index)"></v-btn>
    </template>
  </blocks-container>
</template>

<script setup lang="ts">
import BlocksContainer from '@/components/blocks/BlocksContainer.vue'
import { useAppStore } from '@/store/app'
import { useSessionStore } from '@/store/session'
import { Session } from '@/types/session'
import { Block } from '@W/frame/Block'
import { FrameProject } from '@W/frame/FrameProject'
import { DefaultExecutor } from '@W/service/executor'
import { Project } from '@W/types/project'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const appStore = useAppStore()

const sessionStore = useSessionStore()

const props = defineProps<{ project: Project }>()

const { t } = useI18n({ useScope: 'global' })

let blockOnlyProject = props.project.project
let blocks = ref(blockOnlyProject?.blocks)

watch(() => props.project, (newProject) => {
  blockOnlyProject = newProject.project
  blocks.value = blockOnlyProject?.blocks
})

const onSave = () => {
  appStore.saveCurrentProject(props.project)
}

const selectedBlocks = ref<string[]>([])

const onSelectedBlocksChange = (values: string[]) => {
  selectedBlocks.value = values
}

const executing = ref(false)

const executeBlock = async (block: Block, index: number) => {
  executing.value = true
  try {
    appStore.session.currentSession
      ? await new DefaultExecutor().executeBlockToSession(appStore.session.currentSession as Session, block)
      : Promise.resolve()
  } catch (e) { }
  executing.value = false
}

const executeBlockToAll = async (block: Block, index: number) => {
  executing.value = true
  try {
    await new DefaultExecutor().executeBlockToSessions(sessionStore.sessions as Session[], block)
  } catch (e) { }
  executing.value = false
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
  executing.value = true
  const blocks = selectedBlocks.value.map((id) => {
    return blockOnlyProject?.findBlock(id)
  })
  appStore.session.currentSession
    ? await new DefaultExecutor().executeBlocksToSession(appStore.session.currentSession as Session, blocks as Block[])
    : Promise.resolve()
  executing.value = false
}

const executeSelectedBlocksToAll = async () => {
  executing.value = true
  const blocks = selectedBlocks.value.map((id) => {
    return blockOnlyProject?.findBlock(id)
  })
  await new DefaultExecutor().executeBlocksToSessions(sessionStore.sessions as Session[], blocks as Block[])
  executing.value = false
}
</script>

<style lang="scss" scoped></style>