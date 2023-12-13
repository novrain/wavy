<template>
  <div class="d-flex flex-1-1 ma-2 flex-column">
    <LuminoBoxPanel>
      <LuminoWidget v-for="s in sessions"
                    :key="s.id"
                    @close="onLuminoWidgetClose"
                    @active="onLuminoWidgetActive"
                    :item="s">
        <component :is="sessionComps[s.type]"
                   :session="s"
                   @nameChanged="onSessionNameChanged" />
      </LuminoWidget>
    </LuminoBoxPanel>
  </div>
</template>
<script lang="ts" setup>
import LuminoBoxPanel from '@/components/lumino/LuminoBoxPanel.vue'
import LuminoWidget from '@/components/lumino/LuminoWidget.vue'
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

const onLuminoWidgetClose = ({ msg, widget, item }) => {
  sessionStore.closeSession(item)
  widget.doClose(msg)
}

const onLuminoWidgetActive = ({ msg, widget, item }) => {
  currentSessionId.value = item.id
}

const onSessionNameChanged = ({ session, name }) => {
  sessionStore.setSessionName(session, name)
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