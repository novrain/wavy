<template>
  <v-container class="d-flex flex-1-1 pa-2 flex-column">
    <v-form :disabled="connected"
            ref='form'>
      <div class="d-flex">
        <div class="d-flex">
          <v-label class="mr-1">{{ t('tcpServer.options.port') }}:</v-label>
          <v-number-input v-model="options.port"
                          class="mr-1 w-11 session-control session-port"
                          :max="65535"
                          :min="1"
                          :step="1"
                          :hide-details="true"
                          color="#033"
                          :rules="[
                            (v: string) => !!v || t('tcpServer.rules.portIsRequired'),
                            (v: string) => !!v && parseInt(v) > 0 && parseInt(v) < 65536 || t('tcpServer.rules.portMinMax'),
                          ]"
                          required>
          </v-number-input>
        </div>
        <div class="d-flex ma-1">
          <v-btn @click="disconnect"
                 v-if="connected"
                 icon="mdi-connection"></v-btn>
          <v-btn @click="connect"
                 v-else
                 icon="mdi-check-bold"></v-btn>
        </div>
      </div>
    </v-form>
    <LuminoBoxPanel tabsConstrained
                    id="tcp-server-session-lumino">
      <LuminoWidget v-for="s in clients"
                    :key="s.id"
                    @close="onLuminoWidgetClose"
                    @active="onLuminoWidgetActiveOrShow"
                    @show="onLuminoWidgetActiveOrShow"
                    :item="(s)">
        <TCPServerClientVue :session="s" />
      </LuminoWidget>
    </LuminoBoxPanel>
    <v-container class="pa-0 d-flex justify-between">
      <v-container class="pa-0 d-flex justify-start">
        <v-label class="pr-2">{{ t('session.status.info') }}</v-label>
        <v-label>{{ info }}</v-label>
      </v-container>
      <v-container class="pa-0 d-flex justify-end">
        <v-label class="pr-2">{{ t('session.status.state') }}:</v-label>
        <v-icon icon="mdi-link"
                color="green"
                v-if="connected"></v-icon>
        <v-icon icon="mdi-link-off"
                color="red"
                v-else></v-icon>
      </v-container>
    </v-container>
  </v-container>
</template>
<script setup lang="ts">
import LuminoBoxPanel from '@/components/lumino/LuminoBoxPanel.vue'
import LuminoWidget from '@/components/lumino/LuminoWidget.vue'
import { TCPServerClient, TCPServerSession } from '@/types/session'
import { createDefaultTCPServerOptions } from '@W/types/session'
import { onUnmounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import TCPServerClientVue from './TCPServerClient.vue'
import { WidgetEvent } from './lumino/ItemWidget'

const emits = defineEmits(['nameChanged'])

const { t } = useI18n({ useScope: 'global' })

const props = defineProps(['session'])
const serverSession = props.session as TCPServerSession
const clients = reactive(serverSession.clients)

const options = reactive(Object.assign(createDefaultTCPServerOptions(), serverSession.options))

const connected = ref(false)
const info = ref('')

const form = ref()
const currentClientId = ref<string | null | undefined>(null)

const onLuminoWidgetClose = ({ msg, widget, item }: WidgetEvent) => {
  serverSession.deleteClient(item.id)
}

const onLuminoWidgetActiveOrShow = ({ msg, widget, item }: WidgetEvent) => {
  currentClientId.value = item.id
}

const onError = (err: any) => {
  console.log(err)
}

const onClose = () => {
  connected.value = false
}

const onConnection = (client: any) => {
  const c = new TCPServerClient(client.id, client.remoteAddress, client.remotePort, serverSession, clients.length + 1)
  c.isConnected = true
  serverSession.addClient(c)
}

const connect = async () => {
  if (!window.tcpServer) {
    return
  }
  const res = await form.value.validate()
  if (res.valid) {
    const session = serverSession
    session.removeEventListener('close', onClose)
    session.removeEventListener('connection', onConnection)
    session.removeEventListener('error', onError)
    session.options = options
    session.open().then((r: any) => {
      connected.value = r.result
      info.value = r.err || ''
      if (r.result) {
        // serverSession.name = options.path
        emits('nameChanged', { session: serverSession, name: `Server: ${options.port}` })
        session.addEventListener('close', onClose)
        session.addEventListener('connection', onConnection)
        session.addEventListener('error', onError)
      }
    }).catch((e: any) => { console.log(e) })
  }
}

const disconnect = async () => {
  const session = serverSession
  session.close().then((r: boolean) => {
    connected.value = !r
    if (r) {
      session.removeEventListener('close', onClose)
      session.removeEventListener('connection', onConnection)
      session.removeEventListener('error', onError)
    }
  })
    .catch((e: any) => { console.log(e) })
}

onUnmounted(disconnect)
</script>

<style lang="scss" scoped>
.session-control {
  padding-right: 10px;
}

:deep(.v-number-input__control .v-btn) {
  background-color: transparent !important;
}

.session-ip {
  width: 120px;
}

.session-port {
  width: 100px;
}

.session-command,
.session-data {
  :deep(.v-input__control) {
    flex: 1;

    textarea {
      padding: 10px;
      height: 100%;
    }
  }
}

.session-command-control {
  width: 140px;
}

.session-command-input {
  height: 140px;
}
</style>