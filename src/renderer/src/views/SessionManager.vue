<template>
  <div class="d-flex flex-1-1 mx-2 flex-column">
    <v-tabs center-active
            next-icon="mdi-arrow-right-bold-box-outline"
            prev-icon="mdi-arrow-left-bold-box-outline"
            show-arrows
            height="24px"
            v-model="currentSessionId">
      <v-tab v-for="s in sessions"
             :key="s.id"
             :value="s.id">
        <!-- {{ s.name }} -->
        <template v-slot:default>
          <span class="mr-1">{{ s.name }}</span>
          <span class="mr-1"
                v-if="s.dirty">*</span>
          <v-icon icon="mdi-window-close"
                  class="close"
                  @click="() => onSessionClose(s)"></v-icon>
        </template>
      </v-tab>
    </v-tabs>
    <v-window class="d-flex flex-1-1 w-100"
              v-model="currentSessionId">
      <v-window-item v-for="s in sessions"
                     :key="s.id"
                     :value="s.id">
        <component :is="sessionComps[s.type]"
                   :session="s" />
      </v-window-item>
    </v-window>
  </div>
</template>
<script lang="ts" setup>
import SerialSession from '@/components/SerialSession.vue'
import { useMenuStore } from '@/store/menu'
import { useSessionStore } from '@/store/session'
import { MenuEvent } from '@/types/menu'
import { Session } from '@W/types/session'
import { storeToRefs } from 'pinia'
import { onDeactivated, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

// @Todo move to where?
import { useSerialStore } from '@/store/serial'
const serialStore = useSerialStore()
const { paths } = storeToRefs(serialStore)

const listPorts = async () => {
  if (!window.serialPort) {
    return
  }
  paths.value = await window.serialPort.listPorts()
}
//
const sessionComps = {
  'Serial': SerialSession
} as any

const menusStore = useMenuStore()
const sessionStore = useSessionStore()
const { sessions } = storeToRefs(sessionStore)
const { t } = useI18n()

const currentSession = ref<Session | null | undefined>(null)
const currentSessionId = ref<string | null | undefined>(null)

onMounted(() => {
  menusStore.registerMenu({
    id: 'session-manager',
    nameKey: "session.menu.session",
    name: t("session.menu.session"),
    items: [
      {
        id: 'session-new',
        nameKey: "session.menu.new",
        name: t("session.menu.new"),
        icon: 'mdi-alpha-s',
        items: undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handler: (_e: MenuEvent) => {
          onNewSession()
        },
      }
    ]
  })
  if (sessions.value.length <= 0) {
    const session = sessionStore.newSession('Serial')
    currentSessionId.value = session.id
  }
  // @Todo move
  listPorts()
})

onDeactivated(() => {

})

onUnmounted(() => {

})

watch(currentSessionId, (id) => {
  if (id) {
    currentSession.value = sessions.value.find(s => s.id === id)
  } else {
    const newSession = sessionStore.sessions[0]
    if (newSession) {
      currentSessionId.value = newSession.id
    }
  }
})

const onNewSession = () => {
  const session = sessionStore.newSession('Serial')
  currentSessionId.value = session.id
}

const onSessionClose = (session: Session) => {
  sessionStore.closeSession(session)

}
</script>

<style lang="scss" scoped>
:deep(.v-window__container) {
  width: 100%;
  height: 100%;
}

.close {
  position: absolute;
  right: 5px;
}
</style>