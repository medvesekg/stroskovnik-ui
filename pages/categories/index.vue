<template>
  <div>
    <h1 class="text-center">Kategorije</h1>
    <graphql-table
      :fields="[
        'name',
        'invoice_items_aggregate.aggregate.count',
        'invoice_items_aggregate.aggregate.sum.total'
      ]"
      resource="categories"
    />
  </div>
</template>

<script>
import GraphqlTable from '@/components/GraphqlTable'

export default {
  components: { GraphqlTable }
}
</script>

<style></style>
