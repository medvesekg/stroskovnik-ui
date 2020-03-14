<template>
  <app-combobox
    ref="combobox"
    v-bind="$attrs"
    v-on="$listeners"
    :items="shops"
    :return-object="false"
    name="shop"
    item-text="name"
    item-value="name"
    label="Trgovina"
    hide-no-data
    auto-select-first
  />
</template>

<script>
import AppCombobox from '@/components/AppCombobox'

export default {
  components: { AppCombobox },

  computed: {
    shops() {
      return this.$store.state.shops.shops
    }
  },

  created() {
    this.getShops()
  },

  methods: {
    blur() {
      this.$refs.combobox.blur()
    },
    getShops() {
      return this.$store.dispatch('shops/getShops')
    }
  }
}
</script>

<style></style>
