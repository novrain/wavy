<template>
  <div class="d-flex flex-1-1 ma-2 flex-column">
    <LuminoBoxPanel tabsConstrained
                    addButtonEnabled
                    id="session-lumino"
                    @add="onNewSession">
      <LuminoWidget v-if="sessions.length <= 0 || showWelcome"
                    :item="{ id: 'session-welcome', name: t('session.welcome.welcome') }"
                    :closable="sessions.length > 0"
                    @close="onWelcomeClose">
        <v-container class="ma-4 pa-0">
          <v-chip prepend-icon="mdi-cable-data"
                  size="default">
            {{ t('session.welcome.session_category') }}
          </v-chip>
          <v-divider class="mt-2 mb-2"></v-divider>
          <v-container class="d-flex ma-0 pa-0">
            <v-btn class="mr-2"
                   prepend-icon="mdi-serial-port"
                   size="default"
                   variant="tonal"
                   stacked
                   @click="() => onNewSession('Serial')">
              {{ t('session.types.serial') }}
            </v-btn>
            <v-btn class="mr-2"
                   prepend-icon="mdi-lan-connect"
                   size="default"
                   variant="tonal"
                   stacked
                   @click="() => onNewSession('TCPClient')">
              {{ t('session.types.tcpclient') }}
            </v-btn> <v-btn class="mr-2"
                   prepend-icon="mdi-consolidate"
                   size="default"
                   variant="tonal"
                   stacked
                   @click="() => onNewSession('TCPServer')">
              {{ t('session.types.tcpserver') }}
            </v-btn>
          </v-container>
        </v-container>
      </LuminoWidget>
      <LuminoWidget v-for="s in sessions"
                    :key="s.id"
                    @close="onLuminoWidgetClose"
                    @active="onLuminoWidgetActiveOrShow"
                    @show="onLuminoWidgetActiveOrShow"
                    :item="(s)">
        <component :is="sessionComps[s.type]"
                   :session="s"
                   @nameChanged="onSessionNameChanged" />
      </LuminoWidget>
    </LuminoBoxPanel>
  </div>
</template>
<script lang="ts" setup>
import SerialSession from '@/components/SerialSession.vue'
import TCPClientSession from '@/components/TCPClientSession.vue'
import TCPServerSession from '@/components/TCPServerSession.vue'
import { WidgetEvent } from '@/components/lumino/ItemWidget'
import LuminoBoxPanel from '@/components/lumino/LuminoBoxPanel.vue'
import LuminoWidget from '@/components/lumino/LuminoWidget.vue'
import { useAppStore } from '@/store/app'
import { useMenuStore } from '@/store/menu'
import { useSessionStore } from '@/store/session'
import { MenuEvent } from '@/types/menu'
import { storeToRefs } from 'pinia'
import { onDeactivated, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const appStore = useAppStore()

// @Todo move to where?
import { useSerialStore } from '@/store/serial'
import { Session } from '@/types/session'
import { SessionType } from '@W/types/session'
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
  'Serial': SerialSession,
  'TCPClient': TCPClientSession,
  'TCPServer': TCPServerSession
} as any

const menusStore = useMenuStore()
const sessionStore = useSessionStore()
const { sessions } = storeToRefs(sessionStore)
const { t } = useI18n({ useScope: 'global' })

const currentSession = ref<Session | null | undefined>(null)
const currentSessionId = ref<string | null | undefined>(null)

const showWelcome = ref(true)

//@ts-ignore
const onWelcomeClose = ({ msg, widget, item }) => {
  showWelcome.value = false
}

onMounted(() => {
  menusStore.registerMenu({
    id: 'session-manager',
    nameKey: "session.menu.session",
    name: t("session.menu.session"),
    items: [
      {
        id: 'session-new-serial',
        nameKey: "session.menu.newSerial",
        name: t("session.menu.newSerial"),
        icon: 'mdi-alpha-s',
        items: undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handler: onNewSerialSessionClick,
      },
      {
        id: 'session-new-tcpclient',
        nameKey: "session.menu.newTCPClient",
        name: t("session.menu.newTCPClient"),
        icon: 'mdi-alpha-s',
        items: undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handler: onNewTCPClientSessionClick,
      },
      {
        id: 'session-new-tcpserver',
        nameKey: "session.menu.newTCPServer",
        name: t("session.menu.newTCPServer"),
        icon: 'mdi-alpha-s',
        items: undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handler: onNewTCPServerSessionClick,
      }
    ]
  })
  // if (sessions.value.length <= 0) {
  //   const session = sessionStore.newSession('Serial')
  //   currentSessionId.value = session.id
  // }
  // @Todo move
  listPorts()
})

const onNewSerialSessionClick = (_e: MenuEvent) => {
  onNewSession('Serial')
}

const onNewTCPClientSessionClick = (_e: MenuEvent) => {
  onNewSession('TCPClient')
}

const onNewTCPServerSessionClick = (_e: MenuEvent) => {
  onNewSession('TCPServer')
}

onMounted(() => {
  window.sessionService.onNewSession(onNewSession)
})

onDeactivated(() => {

})

onUnmounted(() => {

})

watch(currentSessionId, (id) => {
  if (id) {
    currentSession.value = sessions.value.find(s => s.id === id)
    appStore.session.currentSession = currentSession.value
  } else {
    const newSession = sessionStore.sessions[0]
    if (newSession) {
      currentSessionId.value = newSession.id
    }
  }
})

const onNewSession = (type?: SessionType) => {
  const session = sessionStore.newSession(type || 'Serial')
  currentSessionId.value = session.id
}

const onLuminoWidgetClose = ({ msg, widget, item }: WidgetEvent) => {
  sessionStore.closeSession(item as Session)
  widget.doClose(msg)
  if (sessions.value.length <= 0) {
    showWelcome.value = true
  }
}

const onLuminoWidgetActiveOrShow = ({ msg, widget, item }: WidgetEvent) => {
  currentSessionId.value = item.id
}

const onSessionNameChanged = ({ session, name }: { session: Session, name: string }) => {
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