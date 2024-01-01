<template>
  <div class="d-flex flex-1-1 ma-2 flex-column">
    <LuminoBoxPanel tabsConstrained
                    addButtonEnabled
                    id="project-lumino"
                    @add="onNewProject">
      <LuminoWidget v-if="projects.length <= 0 || showWelcome"
                    :item="{ id: 'project-welcome', name: t('project.welcome.welcome') }"
                    :closable="projects.length > 0"
                    @close="onWelcomeClose">
        <v-container class="ma-4">
          <v-chip prepend-icon="mdi-transit-connection-horizontal"
                  size="large">
            {{ t('project.welcome.project_category') }}
          </v-chip>
          <v-divider class="mt-2 mb-2"></v-divider>
          <v-container class="d-flex ma-0 pa-0">
            <v-btn prepend-icon="mdi-semantic-web"
                   size="x-large"
                   variant="tonal"
                   @click="onNewProject"
                   stacked>
              {{ t('project.types.block') }}
            </v-btn>
          </v-container>
        </v-container>
      </LuminoWidget>
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
    <v-dialog v-model="dialog"
              persistent
              width="auto">
      <v-card>
        <v-card-title class="text-h5">
          {{ t('project.dialog.hint') }}
        </v-card-title>
        <v-card-text>
          {{ t('project.dialog.reload') }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="elevated"
                 @click="onReloadConfirm">
            {{ t('project.dialog.confirm') }}
          </v-btn>
          <v-btn variant="text"
                 @click="onReloadCancel">
            {{ t('project.dialog.cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts" setup>
import BlokOnlyProject from '@/components/BlockOnlyProject.vue'
import { WidgetEvent } from '@/components/lumino/ItemWidget'
import LuminoBoxPanel from '@/components/lumino/LuminoBoxPanel.vue'
import LuminoWidget from '@/components/lumino/LuminoWidget.vue'
import { useAppStore } from '@/store/app'
import { useMenuStore } from '@/store/menu'
import { useProjectStore } from '@/store/project'
import { MenuEvent } from '@/types/menu'
import { Project } from '@W/types/project'
import { defaultId } from '@W/util/SnowflakeId'
import { plainToInstance } from 'class-transformer'
import { storeToRefs } from 'pinia'
import { computed, onDeactivated, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const appStore = useAppStore()

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

const dialog = ref(false)

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
      },
      {
        id: 'project-save',
        nameKey: "project.menu.save",
        name: t("project.menu.save"),
        icon: 'mdi-alpha-s',
        items: undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handler: (_e: MenuEvent) => {
          appStore.saveCurrentProject()
        },
        disabled: canSave
      },
      {
        id: 'project-saveAs',
        nameKey: "project.menu.saveAs",
        name: t("project.menu.saveAs"),
        icon: 'mdi-alpha-a',
        items: undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handler: (_e: MenuEvent) => {
          appStore.saveCurrentProjectAs()
        },
        disabled: canSave
      },
      {
        id: 'project-open',
        nameKey: "project.menu.open",
        name: t("project.menu.open"),
        icon: 'mdi-alpha-o',
        items: undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handler: (_e: MenuEvent) => {
          openProject()
        }
      }
    ]
  })

  // if (projects.value.length <= 0) {
  //   const project = projectStore.newProject('BlockOnly', false)
  //   currentProjectId.value = project.id
  // }
})

const canSave = computed(() => {
  return !!appStore.project.currentProject
})

const showWelcome = ref(true)

const onWelcomeClose = ({ msg, widget, item }) => {
  showWelcome.value = false
}

watch(currentProjectId, (id) => {
  if (id) {
    currentProject.value = projects.value.find(s => s.id === id)
    appStore.project.currentProject = currentProject.value
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
  projectStore.closeProject(item as Project)
  widget.doClose(msg)
  if (projects.value.length <= 0) {
    showWelcome.value = true
  }
}

const onLuminoWidgetActive = ({ msg, widget, item }: WidgetEvent) => {
}

const onProjectNameChanged = (name: String) => {

}

let existHintPromiseResolve: any = undefined

const onReloadConfirm = () => {
  dialog.value = false
  existHintPromiseResolve(true)
}

const onReloadCancel = () => {
  dialog.value = false
  existHintPromiseResolve(false)
}

const openProject = () => {
  window.projectService.openProject().then(async r => {
    if (!r.canceled && r.result && r.project) {
      const obj = JSON.parse(r.project) as {}
      const projectCls = plainToInstance(Project, obj)
      if (projectCls.id && projectCls.name && projectCls.type) {
        projectCls.id = defaultId.nextId() + ''
        // projectCls.project?.id = projectCls.id
        projectCls.name = r.name || projectCls.name
        projectCls.path = r.path
        let exist = projects.value.find(p => (p.path !== undefined && p.path === projectCls.path) && (p.name !== undefined && p.name === projectCls.name))
        if (exist) {
          dialog.value = true
          const p = new Promise((resolve) => {
            existHintPromiseResolve = resolve
          })
          const reload = await p
          if (reload) {
            projectCls.closeable = exist.closeable
            projectCls.index = exist.index
            projectCls.tempIndex = exist.tempIndex
            projectStore.reloadProject(exist.index!, projectCls)
          }
        } else {
          projectCls.closeable = true
          projectStore.addProject(projectCls)
        }
        currentProjectId.value = projectCls.id
      }
    }
  })
}
</script>

<style lang="scss" scoped></style>
