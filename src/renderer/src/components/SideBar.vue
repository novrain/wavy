<template>
  <v-navigation-drawer rail
                       :location="location"
                       permanent>
    <v-list nav
            density="compact"
            :selected="selected || sideBarStore.selected"
            @update:selected="onSelected">
      <template v-for="i, index in sideBarStore.items">
        <v-list-item :prepend-icon="i.icon"
                     :value="i.id"></v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>
<script lang="ts" setup>
import { useSideBarStore } from '@/store/sidebar'
import { useI18n } from 'vue-i18n'

defineProps(['location', 'selected'])
const emits = defineEmits(['update:selected'])

const { t } = useI18n()

const sideBarStore = useSideBarStore()

const onSelected = (selected: any) => {
  sideBarStore.selected = selected
  emits('update:selected', selected)
}

</script>

<style lang="scss" scoped></style>