<template>
  <v-list-item>
    <wavyItem-dialog ref="wavyItemDialogRef"
                     mode="edit"
                     :project="project"
                     :wavyItem="wavyItem"
                     :index="index"
                     @cancel="onWavyItemDialogCancel"
                     @confirm="onWavyItemDialogConfirm"></wavyItem-dialog>
    <template #prepend>
      <v-icon icon="mdi-code-brackets"
              v-if="wavyItem.type === 'Data'"></v-icon>
      <v-icon icon="mdi-relation-one-to-one"
              v-if="wavyItem.type === 'Ref'"></v-icon>
    </template>
    <v-list-item-title>
      <span v-tooltip="wavyItem.toString()">{{ wavyItem.name }}</span>
    </v-list-item-title>
    <template #append>
      <div class="flex">
        <v-btn icon="mdi-square-edit-outline"
               class="mr-1"
               color="none"
               variant="text"
               @click.stop="onEdit"></v-btn>
        <slot name="append"></slot>
      </div>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { Suite, WavyItem } from '@W/frame/Frame'
import { Project } from '@W/types/project'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import WavyItemDialog from './WavyItemDialog.vue'
const { t } = useI18n({ useScope: 'global' })

const props = withDefaults(defineProps<{ wavyItem: WavyItem, project: Project, suite?: Suite, index: number }>(), {
})

const wavyItemDialogRef = ref()

const onWavyItemDialogCancel = () => {
  wavyItemDialogRef.value.hide()
}

const onWavyItemDialogConfirm = () => {
  wavyItemDialogRef.value.validate().then((res: any) => {
    if (res.valid) {
      wavyItemDialogRef.value.hide()
      const newWavyItem = wavyItemDialogRef.value.value()
      if (props.suite) {
        props.suite.replaceWavyItem(props.index, newWavyItem)
      } else {
        props.project.project?.replaceWavyItem(props.index, newWavyItem)
      }
    }
  })
}

const onEdit = () => {
  wavyItemDialogRef.value.show()
}

</script>

<style lang="scss" scoped>
:deep(.v-icon) {
  font-size: 15px !important;
}
</style>