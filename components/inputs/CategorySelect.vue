<template>
  <app-autocomplete
    v-bind="$attrs"
    :items="categories"
    item-text="name"
    item-value="id"
    label="Kategorija"
    no-data="Izberite kategorijo"
    clearable
    v-on="$listeners"
  />
</template>

<script>
import AppAutocomplete from '@/components/app/AppAutocomplete'
import Categories from '@/queries/Categories'

export default {
  components: { AppAutocomplete },

  apollo: {
    categories: {
      query: Categories,
      update: data => data.categories
    }
  }
}
</script>

<style></style>
