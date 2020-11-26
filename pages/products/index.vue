<template>
  <graphql-table
    resource="products_view"
    :fields="[
      'name',
      'shop_name',
      'average_cost',
      'total_quantity',
      'times_bought',
      'category_name',
      'deviation'
    ]"
  >
    <template #item.name="{item}">
      <nuxt-link :to="`/products/${encodeURIComponent(item.name)}`">
        {{ item.name }}
      </nuxt-link>
    </template>
  </graphql-table>
</template>

<script>
import gql from 'graphql-tag'
import GraphqlTable from '@/components/GraphqlTable'
export default {
  components: { GraphqlTable }
}
</script>

<style></style>
