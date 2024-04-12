<template>
  <SessionTemplate :session="session"
                   :passive="true"
                   :advanceMode="false"
                   :hideInfo="true"
                   @disconnected="onDisconnected">
    <template #options="{ advance }">
      <v-container class="pa-0 d-flex justify-start align-center ma-1">
        <v-label class="pr-2">{{ t('session.status.state') }}:</v-label>
        <v-icon icon="mdi-link"
                color="green"
                v-if="connected"></v-icon>
        <v-icon icon="mdi-link-off"
                color="red"
                v-else></v-icon>
      </v-container>
    </template>
  </SessionTemplate>
</template>
<script setup lang="ts">
import { TCPServerClient } from '@/types/session'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SessionTemplate from './SessionTemplate.vue'

const emits = defineEmits(['nameChanged'])

const { t } = useI18n({ useScope: 'global' })

const props = defineProps(['session'])
const clientSession = props.session as TCPServerClient

const connected = ref(clientSession.isConnected)

watch(() => props.session, (newSession) => {
  connected.value = newSession.isConnected
})

const onDisconnected = () => {
  connected.value = false
}
</script>

<style lang="scss" scoped>
.session-control {
  padding-right: 10px;
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