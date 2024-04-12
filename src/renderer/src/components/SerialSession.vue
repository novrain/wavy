<template>
  <SessionTemplate @connected="onConnected"
                   :session="session"
                   :options="options"
                   :advanceMode="true">
    <template #options="{ advance }">
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
        <v-btn @click="listPorts"
               icon="mdi-refresh"></v-btn>
      </div>
    </template>
  </SessionTemplate>
</template>
<script setup lang="ts">
import { useSerialStore } from '@/store/serial'
import { SERIAL_BAUD_RATES, SERIAL_DATA_BITS, SERIAL_PARITIES, SERIAL_STOP_BITS, createDefaultSerialOptions } from '@W/types/session'
import { storeToRefs } from 'pinia'
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SessionTemplate from './SessionTemplate.vue'

const emits = defineEmits(['nameChanged'])

const { t } = useI18n({ useScope: 'global' })

const serialStore = useSerialStore()
const { paths } = storeToRefs(serialStore)

const props = defineProps(['session'])

const options = reactive(Object.assign(createDefaultSerialOptions(), props.session.options))

const baudRates = SERIAL_BAUD_RATES
const dataBits = SERIAL_DATA_BITS
const stopBits = SERIAL_STOP_BITS
const parties = SERIAL_PARITIES

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

const onConnected = () => {
  emits('nameChanged', { session: props.session, name: options.path })
}
</script>

<style lang="scss" scoped>
.session-control {
  padding-right: 10px;
}

.session-path {
  width: 120px;
}
</style>