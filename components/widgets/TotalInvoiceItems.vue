<template>
  <v-card>
    <v-card-text>
      <v-progress-circular
        v-if="$apollo.queries.numOfInvoiceItems.loading"
        indeterminate
      />
      <span>
        <span class="error--text text--lighten-1">{{ numOfInvoiceItems }}</span>
        <span class="float-right">postavk</span>
      </span>
    </v-card-text>
  </v-card>
</template>

<script>
import NumOfInvoiceItems from '@/queries/NumOfInvoiceItems.gql'

export default {
  props: {
    from: {
      type: [Date, String],
      required: false,
      default: null
    },
    to: {
      type: [Date, String],
      required: false,
      default: null
    }
  },

  apollo: {
    numOfInvoiceItems: {
      query: NumOfInvoiceItems,
      variables() {
        return {
          from: this.from,
          to: this.to
        }
      },
      update: data => data.invoice_items_aggregate.aggregate.count
    }
  }
}
</script>

<style></style>
