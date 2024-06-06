<template>
  <v-container class="d-flex flex-1-1 pa-2 flex-column">
    <v-form :disabled="connected"
            ref='form'>
      <div class="d-flex w-100 align-center">
        <div class="d-flex flex-1-1">
          <div class="d-flex">
            <slot name="options"
                  :advance="advance"></slot>
          </div>
          <div class="d-flex ma-1"
               v-if="advanceMode">
            <v-btn @click="changeParamsMode"
                   v-if="advance"
                   icon="mdi-chevron-double-left">
            </v-btn>
            <v-btn @click="changeParamsMode"
                   v-else
                   icon="mdi-chevron-double-right">
            </v-btn>
          </div>
          <div class="d-flex ma-1">
            <v-btn @click="disconnect"
                   v-if="connected"
                   icon="mdi-connection"></v-btn>
            <v-btn @click="connect"
                   v-if="!passive && !connected"
                   :disabled="connecting"
                   icon="mdi-check-bold"></v-btn>
          </div>
        </div>
        <v-btn @click="fullDataSwitch"
               v-if="fullData"
               icon="mdi-chevron-double-left">
        </v-btn>
        <v-btn @click="fullDataSwitch"
               v-else
               icon="mdi-chevron-double-right">
        </v-btn>
      </div>
    </v-form>
    <v-container class="pa-0 d-flex flex-1-1 mt-2 mb-4">
      <v-container class="pa-0 d-flex flex-1-1 flex-column ma-0">
        <session-textarea class="flex-1-1 session-data mb-2"
                          :label="t('session.data.label')"
                          v-model="dataAsText"
                          :editable="false"></session-textarea>
        <session-textarea class="session-command-input"
                          v-model="command"
                          v-if="!fullData"
                          @update:model-select="onSelect"
                          :label="t('session.command.label')"></session-textarea>
      </v-container>
      <v-container class="pl-2 pa-0 d-flex flex-column ma-0 session-command-control"
                   v-if="!fullData">
        <v-container class="pa-0 d-flex flex-column flex-1-1">
          <v-checkbox class="flex-0-0"
                      :label="t('session.options.enableTimestamp')"
                      v-model="enableTimestamp"
                      color="primary"
                      hide-details></v-checkbox>
          <v-checkbox class="flex-0-0"
                      :label="t('session.options.enableNewline')"
                      v-model="enableNewline"
                      color="primary"
                      hide-details></v-checkbox>
        </v-container>
        <v-container class="pa-0 d-flex flex-column session-command-input">
          <v-checkbox class="flex-0-0"
                      :label="t('session.options.enableSendSelect')"
                      v-model="enableSendSelect"
                      color="primary"
                      hide-details></v-checkbox>
          <v-radio-group class="flex-0-0"
                         v-model="format"
                         hide-details
                         inline>
            <v-radio label="Hex"
                     value="hex"></v-radio>
            <v-radio label="ASCII"
                     value="ascii"></v-radio>
          </v-radio-group>
          <v-btn class="mt-auto"
                 prepend-icon="mdi-check-bold"
                 density="compact"
                 @click="send"
                 :disabled="!connected"
                 size="default">{{ t('session.command.send') }}</v-btn>
        </v-container>
      </v-container>
    </v-container>
    <v-container class="pa-0 d-flex justify-between"
                 v-if="!hideInfo">
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
import { Block } from '@W/frame/Block'
import { Frame } from '@W/frame/Frame'
import { Buffer } from 'buffer'
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SessionTextarea from './SessionTextarea.vue'

interface Data {
  time: Date,
  data: Uint8Array | string | Block | Frame,
  type: 'in' | 'out' | 'error'
  format: 'hex' | 'ascii'
}

const emits = defineEmits(['connected', 'disconnected'])

const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()
const hexRegex = /^[0-9a-fA-F\r\n]+$/

const { t } = useI18n({ useScope: 'global' })

const props = defineProps(['session', 'advanceMode', 'options', 'passive', 'hideInfo'])

const advance = ref(false)
const connected = ref(props.session.isConnected)
const connecting = ref(false)
const enableTimestamp = ref(true)
const enableNewline = ref(true)
const enableSendSelect = ref(false)
const format = ref<'hex' | 'ascii'>('hex')
const data = ref<Data[]>([])
const dataAsText = ref('')
const command = ref('')
const info = ref('')
const fullData = ref(false)

const form = ref()

onMounted(() => {
  if (connected.value) {
    const session = props.session
    session.addEventListener('data', onData)
    session.addEventListener('echo', onEcho)
    session.addEventListener('close', onClose)
    session.addEventListener('error', onError)
  }
})

const changeParamsMode = () => {
  advance.value = !advance.value
}

const fullDataSwitch = () => {
  fullData.value = !fullData.value
}

const selectCommand = ref<string | undefined>(undefined)

const onSelect = (v: string) => {
  selectCommand.value = v
}

const send = async () => {
  info.value = ''
  const cmd = enableSendSelect.value ? selectCommand.value : command.value
  if (cmd) {
    let d: Uint8Array | null = null
    if (format.value === 'hex') {
      if (cmd.length % 2 === 0 && hexRegex.test(cmd)) {
        d = Buffer.from(cmd, 'hex')
      } else {
        info.value = "Error: Invalid Hex String."
      }
    } else {
      d = textEncoder.encode(cmd)
    }
    if (d) {
      const r = await props.session.send(d)
      onData(cmd, 'out')
    }
  }
}

const onData = (d: Uint8Array | string | Block | Frame, type: 'in' | 'out' | 'error') => {
  // if (data.value.length > 10000) {

  // }
  const r = { time: new Date(), data: d, type, format: format.value }
  data.value.push(r)
  let prefix = '>> '
  if (r.type === 'out') {
    prefix = '<< '
  }
  if (enableTimestamp.value) {
    prefix += `[${(r.time.getHours() + '').padStart(2, '0')}:${(r.time.getMinutes() + '').padStart(2, '0')}:${(r.time.getSeconds() + '').padStart(2, '0')}] `
  }
  if (typeof r.data === 'string') {
    dataAsText.value += prefix + r.data + '\r\n'
  } else {
    let str = ''
    let tempData = r.data as any
    if (tempData.encode) {
      tempData = tempData.encode()
    }
    str = (r.format === 'hex'
      ? Buffer.from(tempData).toString('hex')
      : textDecoder.decode(tempData))
    dataAsText.value += prefix + str + '\r\n'
  }
}

const onEcho = (d: any) => {
  const data = d.data
  onData(data, 'out')
}

const onError = (err: any) => {
  console.log(err)
}

const onClose = () => {
  connected.value = false
  const session = props.session
  session.removeEventListener('data', onData)
  session.removeEventListener('echo', onEcho)
  session.removeEventListener('close', onClose)
  session.removeEventListener('error', onError)
  emits('disconnected')
}

const connect = async () => {
  const res = await form.value.validate()
  if (res.valid) {
    connecting.value = true
    const session = props.session
    session.options = props.options
    session.open().then((r: any) => {
      connecting.value = false
      connected.value = r.result
      info.value = r.err || ''
      if (r.result) {
        emits('connected')
        session.addEventListener('data', onData)
        session.addEventListener('echo', onEcho)
        session.addEventListener('close', onClose)
        session.addEventListener('error', onError)
      }
    }).catch((e: any) => {
      connected.value = false
      connecting.value = false
    })
  }
}

const disconnect = async () => {
  const session = props.session
  session.close().then((r: boolean) => {
    connected.value = !r
    if (r) {
      session.removeEventListener('data', onData)
      session.removeEventListener('echo', onEcho)
      session.removeEventListener('close', onClose)
      session.removeEventListener('error', onError)
      emits('disconnected')
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

.session-command-input,
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
  min-width: 140px;
  max-width: 140px;
}

.session-command-input {
  height: 140px;
}
</style>