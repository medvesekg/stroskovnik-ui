<template>
  <div>
    <h1 class="text-center">Vsi stroški</h1>
    <graphql-table
      :fields="[
        'invoice.date',
        'invoice.shop.name',
        'name',
        'category.name',
        'quantity',
        'cost',
        'total'
      ]"
      resource="invoice_items"
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
