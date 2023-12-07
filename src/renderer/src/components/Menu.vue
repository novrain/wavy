<template>
  <div class="d-inline-flex justify-start">
    <v-menu v-for="(m) in menusStore.menuRoot?.items"
            :key="m?.id">
      <template v-slot:activator="{ props }">
        <v-btn variant="text"
               class="btn mr-3"
               v-bind="props">
          {{ m?.nameKey ? t(m?.nameKey) : m?.name }}
        </v-btn>
      </template>
      <v-list nav
              :min-width="100"
              :lines="false">
        <v-list-item v-for="(item) in m?.items"
                     :key="item?.id"
                     :value="item"
                     @click="() => {
                       if (item?.handler) {
                         item?.handler({ menu: item })
                       }
                     }">
          <template v-slot:prepend
                    v-if="item?.icon">
            <v-icon :icon="item?.icon"></v-icon>
          </template>
          <v-list-item-title>{{ item?.nameKey ? t(item?.nameKey) : item?.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>
<script lang="ts" setup>
import { useMenuStore } from '@/store/menu'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const menusStore = useMenuStore()
</script>

<style lang="scss">
.menu {
  gap: 10px;

}

.btn {
  line-height: 12px;
}
</style>