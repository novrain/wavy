<template>
  <v-form ref='formRef'>
    <v-row>
      <v-col>
        <v-text-field :label="t('wavyItem.wavyItem.name')"
                      :hide-details="true"
                      v-model="innerWavyItem.name"></v-text-field>
      </v-col>
      <v-col>
        <v-select density="compact"
                  required
                  :label="t('wavyItem.wavyItem.type')"
                  :model-value="innerWavyItem.type"
                  :items="types"
                  :disabled="mode === 'edit'"
                  :hide-details="true"
                  @update:model-value="onTypeChange">
        </v-select>
      </v-col>
    </v-row>
    <component :is="wavyItemComps[innerWavyItem.type as string]"
               :wavyItem="innerWavyItem"
               :ref-blocks="project.project?.blocks"
               :ref-frames="refFrames"
               :index="index"></component>
  </v-form>
</template>

<script setup lang="ts">
import { WavyItem, WavyItemType, createWavyItem } from '@W/frame/Frame'
import { Project } from '@W/types/project'
import { defaultId } from '@W/util/SnowflakeId'
import { computed, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DataFrame from './DataFrame.vue'
import RefFrame from './RefFrame.vue'
const { t } = useI18n({ useScope: 'global' })

const wavyItemComps = {
  "Data": DataFrame,
  "Ref": RefFrame
} as any

const props = withDefaults(defineProps<{ wavyItem?: WavyItem, project: Project, index: number, types?: WavyItemType[], mode?: 'new' | 'edit' }>(), {
  // @ts-ignore
  types: ['Suite', 'Data', 'Ref'],
  mode: 'new',
})

const innerWavyItem = ref(props.wavyItem ? props.wavyItem.clone(true) : createWavyItem('Data', defaultId.nextId() + '', ''))

watch(() => props.wavyItem, (newWavyItem) => {
  if (newWavyItem) {
    innerWavyItem.value = newWavyItem.clone(true)
  }
})

const refFrames = computed(() => {
  return props.project.project?.wavyItems.filter(w => {
    return w.__type !== 'Suite'
  })
})

const formRef = ref()

const onTypeChange = (type: WavyItemType | string | null) => {
  const tempIndex = innerWavyItem.value.tempIndex
  innerWavyItem.value = createWavyItem(type as WavyItemType, defaultId.nextId() + '', innerWavyItem.value.name)
  innerWavyItem.value.tempIndex = tempIndex
}

const validate = async () => {
  return formRef.value.validate()
}

const value = () => {
  return toRaw(innerWavyItem.value)
}

defineExpose({
  validate,
  value
})
</script>

<style lang="scss" scoped></style>