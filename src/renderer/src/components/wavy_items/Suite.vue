<template>
  <v-list-group class="group"
                :value="suite.id">
    <template v-slot:activator="{ props }">
      <v-list-item v-bind="props"
                   density="compact"
                   prepend-icon="mdi-format-list-group">
        <v-list-item-title>
          <span>{{ suite.name }}</span>
        </v-list-item-title>
        <wavyItem-dialog ref="wavyItemDialogRef"
                         :project="project"
                         :suite="suite"
                         :wavyItem="wavyItem"
                         @cancel="onWavyItemDialogCancel"
                         @confirm="onWavyItemDialogConfirm"
                         :index="wavyItems.length"></wavyItem-dialog>
        <wavyItem-dialog ref="wavyItemEditDialogRef"
                         mode="edit"
                         :project="project"
                         :wavyItem="suite"
                         :index="index"
                         @cancel="onWavyItemEditDialogCancel"
                         @confirm="onWavyItemEditDialogConfirm"></wavyItem-dialog>
        <div class="flex">
          <v-btn icon="mdi-plus"
                 class="mr-1"
                 color="none"
                 variant="text"
                 @click.stop="onNewWavyItem"></v-btn>
          <v-btn icon="mdi-square-edit-outline"
                 class="mr-1"
                 color="none"
                 variant="text"
                 @click.stop="onEdit"></v-btn>
          <slot name="append"></slot>
        </div>
      </v-list-item>
    </template>
    <template v-for="wavyItem, index in wavyItems"
              :key="'suite-' + wavyItem.id">
      <suite-item v-if="wavyItem.type === 'Suite'"
                  :suite="(wavyItem as Suite)"
                  :parentSuite="suite"
                  :project="project"
                  :index="index">
        <template #append>
          <v-btn icon="mdi-delete"
                 color="none"
                 variant="text"
                 @click.stop="() => onWavyItemDelete(wavyItem, index)"></v-btn>
        </template>
      </suite-item>
      <wavy-list-item v-else
                      :project="project"
                      :suite="suite"
                      :wavyItem="wavyItem"
                      :index="index">
        <template #append>
          <slot name="suite-item-append"
                :wavyItem="wavyItem"
                :index="index"></slot>
          <v-btn icon="mdi-delete"
                 color="none"
                 variant="text"
                 @click.stop="() => onWavyItemDelete(wavyItem, index)"></v-btn>
        </template>
      </wavy-list-item>
    </template>
  </v-list-group>
</template>

<script lang="ts">
export default {
  name: 'suite-item'
}
</script>

<script setup lang="ts">
import { Suite, WavyItem, createWavyItem } from '@W/frame/Frame'
import { Project } from '@W/types/project'
import BitSet from '@W/util/BitSet'
import { defaultId } from '@W/util/SnowflakeId'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import WavyItemDialog from './WavyItemDialog.vue'
import WavyListItem from './WavyListItem.vue'

const { t } = useI18n({ useScope: 'global' })

const props = withDefaults(defineProps<{ suite: Suite, project: Project, parentSuite?: Suite, index: number }>(), {
})

let wavyItems = ref(props.suite.wavyItems)

watch(() => props.suite, (newSuite) => {
  wavyItems.value = newSuite.wavyItems
})


const wavyItemDialogRef = ref()
const wavyItem = ref<WavyItem>()

const tempWavyItemIndexSet = new BitSet(100)

const updateWavyItem = () => {
  const tempIndex = tempWavyItemIndexSet.nextClearBit(0)
  wavyItem.value = createWavyItem('Data', defaultId.nextId() + '', 'wavyItem-' + tempIndex)
  tempWavyItemIndexSet.set(tempIndex)
  wavyItem.value.tempIndex = tempIndex
}

const onNewWavyItem = () => {
  updateWavyItem()
  wavyItemDialogRef.value.show()
}

const onWavyItemDialogCancel = () => {
  tempWavyItemIndexSet.clear(wavyItem.value!.tempIndex!)
  wavyItemDialogRef.value.hide()
}

const onWavyItemDialogConfirm = () => {
  wavyItemDialogRef.value.validate().then((res: any) => {
    if (res.valid) {
      const wavyItem = wavyItemDialogRef.value.value()
      if (wavyItem.tempIndex === undefined) {
        const tempIndex = tempWavyItemIndexSet.nextClearBit(0)
        wavyItem.tempIndex = tempIndex
      }
      tempWavyItemIndexSet.set(wavyItem.tempIndex)
      // wavyItem.project = props.project.project
      props.suite.addWavyItem(wavyItem)
      wavyItemDialogRef.value.hide()
    }
  })
}

const onWavyItemDelete = (wavyItem: WavyItem, index: number) => {
  props.suite.deleteWavyItem(index)
  tempWavyItemIndexSet.clear(wavyItem.tempIndex!)
}


const wavyItemEditDialogRef = ref()

const onWavyItemEditDialogCancel = () => {
  wavyItemEditDialogRef.value.hide()
}

const onWavyItemEditDialogConfirm = () => {
  wavyItemEditDialogRef.value.validate().then((res: any) => {
    if (res.valid) {
      wavyItemEditDialogRef.value.hide()
      const newWavyItem = wavyItemEditDialogRef.value.value()
      // newWavyItem.project = props.project.project
      if (props.parentSuite) {
        props.parentSuite.replaceWavyItem(props.index, newWavyItem)
      } else {
        props.project.project?.replaceWavyItem(props.index, newWavyItem)
      }
    }
  })
}

const onEdit = () => {
  wavyItemEditDialogRef.value.show()
}
</script>

<style lang="scss" scoped></style>