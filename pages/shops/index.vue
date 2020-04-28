<template>
  <div>
    <h1 class="text-center">Trgovine</h1>
    <graphql-table
      :fields="['name', 'invoices_aggregate.aggregate.count']"
      resource="shops"
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
