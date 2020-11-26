<template>
  <app-combobox
    ref="combobox"
    v-bind="$attrs"
    :items="shops"
    :return-object="false"
    name="shop"
    item-text="name"
    item-value="name"
    label="Trgovina"
    hide-no-data
    auto-select-first
    v-on="$listeners"
  />
</template>

<script>
import AppCombobox from '@/components/app/AppCombobox'
import Shops from '@/queries/Shops'

export default {
  components: { AppCombobox },

  apollo: {
    shops: {
      query: Shops
    }
  },

  data() {
    return {
      shops: []
    }
  },

  methods: {
    blur() {
      this.$refs.combobox.blur()
    }
  }
}
</script>

<style></style>
