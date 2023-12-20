<template>
  <div class="d-flex flex-1-1 ma-2 flex-column">
    <LuminoBoxPanel tabsConstrained>
      <LuminoWidget v-for="p in projects"
                    :key="p.id"
                    @close="onLuminoWidgetClose"
                    @active="onLuminoWidgetActive"
                    :closable="p.closeable"
                    :item="p">
        <component :is="projectComps[p.type]"
                   :project="p"
                   @nameChanged="onProjectNameChanged" />
      </LuminoWidget>
    </LuminoBoxPanel>
  </div>
</template>
<script lang="ts" setup>
import BlokOnlyProject from '@/components/BlockOnlyProject.vue'
import { WidgetEvent } from '@/components/lumino/ItemWidget'
import LuminoBoxPanel from '@/components/lumino/LuminoBoxPanel.vue'
import LuminoWidget from '@/components/lumino/LuminoWidget.vue'
import { useMenuStore } from '@/store/menu'
import { useProjectStore } from '@/store/project'
import { MenuEvent } from '@/types/menu'
import { Project } from '@W/types/project'
import { storeToRefs } from 'pinia'
import { onDeactivated, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

//
const projectComps = {
  'BlockOnly': BlokOnlyProject
} as any

const menusStore = useMenuStore()
const projectStore = useProjectStore()
const { projects } = storeToRefs(projectStore)
const { t } = useI18n()

const currentProject = ref<Project | null | undefined>(null)
const currentProjectId = ref<string | null | undefined>(null)

onMounted(() => {
  menusStore.registerMenu({
    id: 'project-manager',
    nameKey: "project.menu.project",
    name: t("project.menu.project"),
    items: [
      {
        id: 'project-new',
        nameKey: "project.menu.new",
        name: t("project.menu.new"),
        icon: 'mdi-alpha-p',
        items: undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handler: (_e: MenuEvent) => {
          onNewProject()
        },
      }
    ]
  })

  if (projects.value.length <= 0) {
    const project = projectStore.newProject('BlockOnly', false)
    currentProjectId.value = project.id
  }
})

watch(currentProjectId, (id) => {
  if (id) {
    currentProject.value = projects.value.find(s => s.id === id)
  } else {
    const newProject = projectStore.projects[0]
    if (newProject) {
      currentProjectId.value = newProject.id
    }
  }
})

onDeactivated(() => {

})

onUnmounted(() => {

})

const onNewProject = () => {
  const project = projectStore.newProject('BlockOnly')
  currentProjectId.value = project.id
}

const onLuminoWidgetClose = ({ msg, widget, item }: WidgetEvent) => {
  widget.doClose(msg)
}

const onLuminoWidgetActive = ({ msg, widget, item }: WidgetEvent) => {
}

const onProjectNameChanged = (name: String) => {

}
</script>

<style lang="scss" scoped></style>