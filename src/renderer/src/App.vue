<template>
  <v-app class="d-flex h-100 w-100">
    <v-main class="d-flex flex-column main">
      <v-toolbar border
                 class="toolbar">
        <v-img v-if="appStore.platform !== 'darwin'"
               :width="32"
               class="flex-0-0 ml-2 mr-2 rounded-circle"
               cover
               src="@/assets/logo.svg" />
        <app-menu v-if="appStore.platform !== 'darwin'" />
        <v-spacer class="drag-space"></v-spacer>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn class="ma-2"
                   v-bind="props"
                   icon='mdi-translate'></v-btn>
          </template>
          <v-list>
            <v-list-item v-for="(item, index) in $i18n.availableLocales"
                         :key="index"
                         :value="index"
                         @click="() => { $i18n.locale = item }">
              <v-list-item-title>{{ t('locale.' + item) }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-switch class="flex-0-0 mr-2"
                  @update:modelValue="onThemeChange"
                  true-icon="mdi-weather-sunny"
                  false-icon="mdi-weather-night"
                  hide-details
                  density="compact"
                  :modelValue="theme.global.name.value === 'light'"
                  inset></v-switch>
        <div v-if="appStore.platform !== 'darwin'"
             class="d-flex">
          <v-btn class="ma-2"
                 icon='mdi-window-minimize'
                 @click="minimize"></v-btn>
          <v-btn class="ma-2"
                 v-if="windowStore.isMaximized"
                 icon="mdi-window-restore"
                 @click="toggleMaximize"></v-btn>
          <v-btn class="ma-2"
                 v-else
                 icon="mdi-window-maximize"
                 @click="toggleMaximize"></v-btn>
          <v-btn class="ma-2"
                 icon="mdi-window-close"
                 @click="closeApp"></v-btn>
        </div>
      </v-toolbar>
      <v-container class="d-flex flex-1-1 ma-0 pa-0 main-content">
        <splitpanes class="default-theme flex-1-1"
                    @resized="onResize">
          <pane :size="sizeOfLeft"
                class="d-flex h-100">
            <session-manager />
          </pane>
          <pane :size="100 - sizeOfLeft"
                class="d-flex h-100">
            <project-manager />
          </pane>
        </splitpanes>
        <side-bar location="right"
                  class="left-sidebar"
                  v-model:selected="sideBarStore.selected" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import AppMenu from '@/components/Menu.vue'
import SideBar from '@/components/SideBar.vue'
import { useAppStore } from '@/store/app'
import { hostWindowStore } from '@/store/hostWindow'
import { useMenuStore } from '@/store/menu'
import ProjectManager from '@/views/ProjectManager.vue'
import SessionManager from '@/views/SessionManager.vue'
//@ts-ignore
import { Pane, Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify/lib/framework.mjs'
import { useSideBarStore } from './store/sidebar'

const { t, locale } = useI18n({ useScope: 'global' })

const appStore = useAppStore()
const windowStore = hostWindowStore()
const menusStore = useMenuStore()

const theme = useTheme()

const onThemeChange = (v: boolean | null) => {
  theme.global.name.value = v ? 'light' : 'dark'
}

if (window.hostWindow) {
  window.hostWindow.platform().then((platform: string) => appStore.platform = platform)
}

onMounted(async () => {
  menusStore.registerMenu({
    id: 'help',
    nameKey: "help.menu.help",
    name: t("help.menu.help"),
    items: [
      {
        id: 'help-github',
        nameKey: "help.menu.github",
        name: t("help.menu.github"),
        icon: 'mdi-github',
        items: undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handler: (_e: any) => {
          if (window.hostWindow) {
            window.hostWindow.openExternal('https://github.com/novrain/wavy')
          }
        },
      }
    ]
  })
  if (window.hostWindow) {
    window.hostWindow.isMaximized().then((isMaximized) => {
      windowStore.isMaximized = isMaximized
    }).catch(e => console.log(e))
    window.hostWindow.onMaximized(() => {
      windowStore.isMaximized = true
    })
    window.hostWindow.onUnMaximized(() => {
      windowStore.isMaximized = false
    })
    window.hostWindow.onClose(() => {
      // check can close 
      window.hostWindow.exit()
    })

    let l = await window.hostWindow.locale()
    if (l.indexOf('-')) {
      l = l.substring(0, l.indexOf('-'))
      locale.value = l
    }
  }
})

const toggleMaximizeStoreOnly = () => {
  windowStore.isMaximized = !windowStore.isMaximized
}

const toggleMaximize = () => {
  toggleMaximizeStoreOnly()
  if (window.hostWindow) {
    window.hostWindow.toggleMaximize()
  }
}

const minimize = () => {
  if (window.hostWindow) {
    window.hostWindow.minimize()
  }
}

const closeApp = () => {
  if (window.hostWindow) {
    window.hostWindow.exit()
  }
}

const sizeOfLeft = ref(60)
const lastSizeOfLeft = ref(sizeOfLeft.value)

const onResize = (sizes: any) => {
  lastSizeOfLeft.value = sizes[0].size
}

const sideBarStore = useSideBarStore()

watch(() => sideBarStore.selected, () => {
  const show = sideBarStore.selected.length
  if (show) {
    sizeOfLeft.value = lastSizeOfLeft.value
  } else {
    sizeOfLeft.value = 100
  }
  console.log(sizeOfLeft.value)
}, { immediate: true })

</script>

<style lang="scss" scoped>
.main {
  padding: 0;

  .toolbar {
    .drag-space {
      height: 100%;
      -webkit-app-region: drag;
    }
  }

  .main-content {
    position: relative;
    background-color: rgb(var(--v-theme-background));

    :deep(.splitpanes),
    :deep(.splitpanes__pane),
    :deep(.splitpanes__pane),
    :deep(.lm-TabBar-tab) {
      background-color: rgb(var(--v-theme-background));
      border-color: rgba(var(--v-border-color), var(--v-border-opacity));
    }

    :deep(.splitpanes__splitter) {
      border-left-color: rgb(var(--v-theme-background));
      background-color: rgba(var(--v-border-color), var(--v-border-opacity));

      &::after,
      &::before {
        background-color: rgb(var(--v-theme-background));
      }
    }

    :deep(.lm-TabBar-tab) {
      border-color: rgba(var(--v-border-color), var(--v-border-opacity));
    }


    :deep(.left-sidebar) {
      position: unset !important;
      width: 40px !important;
      background-color: rgba(var(--v-border-color), var(--v-border-opacity));
    }
  }

  :deep(.v-container) {
    max-width: 100% !important;
  }
}
</style>

<style type="scss">
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
  cursor: pointer !important;
}

::-webkit-scrollbar-track-piece {
  background: transparent;
  cursor: pointer !important;
}

::-webkit-scrollbar-track:hover {
  background: rgba(var(--v-border-color), var(--v-border-opacity));
  cursor: pointer !important;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-border-color), var(--v-border-opacity));
  border: 3px solid transparent;
  background-clip: padding-box;
  border-radius: 5px;
  cursor: pointer !important;

  &:hover {
    background-color: rgba(var(--v-border-color), var(--v-border-opacity));
    cursor: pointer !important;
  }
}
</style>