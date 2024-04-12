<template>
  <SessionTemplate @connected="onConnected"
                   :session="session"
                   :options="options"
                   :advanceMode="false">
    <template #options="{ advance }">
      <div class="d-flex ip-field">
        <v-label class="mr-1">{{ t('tcpClient.options.ip') }}:</v-label>
        <v-text-field v-model="options.ip"
                      class="mr-1 w-11 session-control session-ip"
                      :hide-details="true"
                      :rules="[(v: string) => !!v || t('tcpClient.rules.ipIsRequired')]"
                      required>
        </v-text-field>
      </div>
      <div class="d-flex">
        <v-label class="mr-1">{{ t('tcpClient.options.port') }}:</v-label>
        <v-number-input v-model="options.port"
                        class="mr-1 w-11 session-control session-port"
                        :max="65535"
                        :min="1"
                        :step="1"
                        :hide-details="true"
                        color="#033"
                        :rules="[
                          (v: string) => !!v || t('tcpClient.rules.portIsRequired'),
                          (v: string) => !!v && parseInt(v) > 0 && parseInt(v) < 65536 || t('tcpClient.rules.portMinMax'),
                        ]"
                        required>
        </v-number-input>
      </div>
    </template>
  </SessionTemplate>
</template>
  
<script setup lang="ts">
import { createDefaultTCPClientOptions } from '@W/types/session'
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import SessionTemplate from './SessionTemplate.vue'

const emits = defineEmits(['nameChanged'])

const { t } = useI18n({ useScope: 'global' })

const props = defineProps(['session'])

const options = reactive(Object.assign(createDefaultTCPClientOptions(), props.session.options))

const onConnected = () => {
  emits('nameChanged', { session: props.session, name: `${options.ip}:${options.port}` })
}
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
</style>