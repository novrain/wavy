<template>
  <div class="d-flex flex-1-1">
    <v-tabs center-active
            next-icon="mdi-arrow-right-bold-box-outline"
            prev-icon="mdi-arrow-left-bold-box-outline"
            show-arrows>

    </v-tabs>
    <v-window class="d-flex flex-1-1">

    </v-window>
  </div>
</template>
<script lang="ts" setup>
import { useMenuStore } from '@/store/menu'
import { MenuEvent } from '@/types/menu'
import { onDeactivated, onMounted, onUnmounted } from 'vue'

const menusStore = useMenuStore()

onMounted(() => {
  menusStore.registerMenu({
    id: 'project-manager',
    name: '工程',
    items: [
      {
        id: 'project-new',
        name: '新建',
        icon: 'mdi-alpha-p',
        items: undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handler: (_e: MenuEvent) => {
          onNewProject()
        },
      }
    ]
  })
})

onDeactivated(() => {

})

onUnmounted(() => {

})

const onNewProject = () => {

}
</script>