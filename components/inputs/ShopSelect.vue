<template>
  <app-autocomplete
    v-bind="$attrs"
    :items="shops"
    item-text="name"
    item-value="id"
    label="Trgovina"
    no-data="Izberite trgovino"
    clearable
    v-on="$listeners"
  />
</template>

<script>
import AppAutocomplete from '@/components/app/AppAutocomplete'
import Shops from '@/queries/Shops'

export default {
  components: { AppAutocomplete },

  apollo: {
    shops: {
      query: Shops,
      update: data => data.shops
    }
  }
}
</script>

<style></style>
