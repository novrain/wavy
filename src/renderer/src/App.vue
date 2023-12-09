<template>
  <v-app class="d-flex h-100 w-100">
    <v-main class="d-flex flex-column">
      <v-toolbar border>
        <v-img :width="32"
               class="flex-0-0 ml-2 mr-2 rounded-circle"
               cover
               src="@/assets/logo.svg" />
        <app-menu />
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
      </v-toolbar>
      <splitpanes class="default-theme flex-1-1">
        <pane size="100"
              class="d-flex h-100">
          <session-manager />
        </pane>
        <!-- <pane class="d-flex h-100">
          <project-manager />
        </pane> -->
      </splitpanes>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import AppMenu from '@/components/Menu.vue'
import SessionManager from '@/views/SessionManager.vue'
// @ts-ignore
import { Pane, Splitpanes } from 'splitpanes'
import { onMounted } from 'vue'
// import ProjectManager from '@/views/ProjectManager.vue'
import { hostWindowStore } from '@/store/hostWindow'
import { useMenuStore } from '@/store/menu'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const windowStore = hostWindowStore()
const menusStore = useMenuStore()

onMounted(async () => {
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
  }
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
          window.hostWindow.openExternal('https://github.com/novrain/wavy')
        },
      }
    ]
  })
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

</script>

<style lang="scss" scoped>
.drag-space {
  height: 100%;
  -webkit-app-region: drag;
}

:deep(.v-container) {
  max-width: 100% !important;
}
</style>