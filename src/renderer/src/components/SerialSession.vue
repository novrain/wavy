<template>
  <v-container class="d-flex flex-1-1 pa-2 flex-column">
    <v-form :disabled="connected"
            ref='form'>
      <div class="d-flex">
        <div class="d-flex">
          <v-label class="mr-1">{{ t('serial.options.pathName') }}:</v-label>
          <v-select class="session-control session-path"
                    v-model="options.path"
                    :items="paths"
                    :rules="[(v: string) => !!v || t('serial.rules.pathIsRequired')]"
                    :label="t('serial.rules.pathIsRequired')"
                    density="compact"
                    flat
                    variant="solo"
                    :single-line="true"
                    required>
          </v-select>
        </div>
        <div class="d-flex">
          <v-label class="mr-1">{{ t('serial.options.baudRate') }}:</v-label>
          <v-select class="session-control"
                    v-model="options.baudRate"
                    :items="baudRates"
                    label="Baud Rate"
                    density="compact"
                    flat
                    variant="solo"
                    :single-line="true">
          </v-select>
        </div>
        <div class="d-flex"
             v-if="advance">
          <v-label class="mr-1">{{ t('serial.options.dataBits') }}:</v-label>
          <v-select class="session-control"
                    v-model="options.dataBits"
                    :items="dataBits"
                    label="Byte Size"
                    density="compact"
                    flat
                    variant="solo"
                    :single-line="true">
          </v-select>
        </div>
        <div class="d-flex"
             v-if="advance">
          <v-label class="mr-1">{{ t('serial.options.parity') }}:</v-label>
          <v-select class="session-control"
                    v-model="options.parity"
                    :items="parties"
                    label="Parity"
                    density="compact"
                    flat
                    variant="solo"
                    :single-line="true">
          </v-select>
        </div>
        <div class="d-flex"
             v-if="advance">
          <v-label class="mr-1">{{ t('serial.options.stopBits') }}:</v-label>
          <v-select class="session-control"
                    v-model="options.stopBits"
                    :items="stopBits"
                    label="Stop Bits"
                    density="compact"
                    flat
                    variant="solo"
                    :single-line="true">
          </v-select>
        </div>
        <div class="d-flex ma-1">
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
          <v-btn @click="listPorts"
                 icon="mdi-refresh"></v-btn>
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
    <v-container class="pa-0 d-flex flex-1-1 flex-column mt-2 mb-4 session-data">
      <session-textarea class=""
                        :label="t('session.data.label')"
                        v-model="dataAsText"
                        :editable="false"></session-textarea>
    </v-container>
    <v-container class="pa-0 d-flex align-center mb-4 session-command">
      <session-textarea class="session-command-input"
                        v-model="command"
                        @update:model-select="onSelect"
                        :label="t('session.command.label')"></session-textarea>
      <v-container class="pa-0 d-flex flex-column h-100 session-command-control">
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
import { useSerialStore } from '@/store/serial'
import { SERIAL_BAUD_RATES, SERIAL_DATA_BITS, SERIAL_PARITIES, SERIAL_STOP_BITS, createDefaultSerialOptions } from '@W/types/session'
import { Buffer } from 'buffer'
import { storeToRefs } from 'pinia'
import { onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SessionTextarea from './SessionTextarea.vue'

const emits = defineEmits(['nameChanged'])

const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()
const hexRegex = /^[0-9a-fA-F\r\n]+$/

const { t } = useI18n({ useScope: 'global' })

const serialStore = useSerialStore()
const { paths } = storeToRefs(serialStore)

const props = defineProps(['session'])

const options = reactive(Object.assign(createDefaultSerialOptions(), props.session.options))

const baudRates = SERIAL_BAUD_RATES
const dataBits = SERIAL_DATA_BITS
const stopBits = SERIAL_STOP_BITS
const parties = SERIAL_PARITIES

const advance = ref(false)
const connected = ref(false)
const enableTimestamp = ref(true)
const enableNewline = ref(true)
const enableSendSelect = ref(false)
const format = ref('hex')
const data = ref<{ t: Date, d: Uint8Array | string }[]>([])
const dataAsText = ref('')
const command = ref('')
const info = ref('')

const form = ref()

const changeParamsMode = () => {
  advance.value = !advance.value
}

const listPorts = async () => {
  if (!window.serialPort) {
    return
  }
  paths.value = await window.serialPort.listPorts()
}

watch(paths, (newPaths) => {
  const values = (newPaths || [])
  if (!options.path || values.indexOf(options.path) < 0) {
    options.path = values[0]
  }
}, { immediate: true })

const selectCommand = ref<string | undefined>(undefined)

const onSelect = (v: string) => {
  selectCommand.value = v
}

const send = async () => {
  if (!window.serialPort) {
    return
  }
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

const onData = (d: Uint8Array | string, type: 'in' | 'out' | 'error') => {
  // if (data.value.length > 10000) {

  // }
  const r = { t: new Date(), d: d }
  // data.value.push(r)
  let prefix = '>> '
  if (type === 'out') {
    prefix = '<< '
  }
  if (enableTimestamp.value) {
    prefix += `[${(r.t.getHours() + '').padStart(2, '0')}:${(r.t.getMinutes() + '').padStart(2, '0')}:${(r.t.getSeconds() + '').padStart(2, '0')}] `
  }
  if (typeof d === 'string') {
    dataAsText.value += prefix + d + '\r\n'
  } else {
    dataAsText.value += prefix
      + (format.value === 'hex'
        ? Buffer.from(d).toString('hex')
        : textDecoder.decode(d)) + '\r\n'
  }
}

const onEcho = (d: any) => {
  const raw = d.raw
  onData(raw, 'out')
}

const onError = (err: any) => {
  console.log(err)
}

const onClose = () => {
  connected.value = false
}

const connect = async () => {
  if (!window.serialPort) {
    return
  }
  const res = await form.value.validate()
  if (res.valid) {
    const session = props.session
    session.options = options
    session.open().then((r: any) => {
      connected.value = r.result
      info.value = r.err || ''
      if (r.result) {
        // props.session.name = options.path
        emits('nameChanged', { session: props.session, name: options.path })
        session.addEventListener('data', onData)
        session.addEventListener('echo', onEcho)
        session.addEventListener('close', onClose)
        session.addEventListener('error', onError)
      }
    }).catch((e: any) => { console.log(e) })
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

.session-path {
  width: 120px;
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