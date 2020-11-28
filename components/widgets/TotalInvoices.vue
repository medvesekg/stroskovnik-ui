<template>
  <v-card>
    <v-card-text>
      <v-progress-circular
        v-if="$apollo.queries.numOfInvoices.loading"
        indeterminate
      />
      <span>
        <span class="error--text text--lighten-1">{{ numOfInvoices }}</span>
        <span class="float-right">računov</span>
      </span>
    </v-card-text>
  </v-card>
</template>

<script>
import NumOfInvoices from '@/queries/NumOfInvoices.gql'

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
    },
    categoryId: {
      type: [Number, String],
      required: false,
      default: null
    },
    shopId: {
      type: [Number, String],
      required: false,
      default: null
    }
  },

  apollo: {
    numOfInvoices: {
      query: NumOfInvoices,
      variables() {
        return {
          from: this.$format.date.databaseDate(this.from) || null,
          to: this.$format.date.databaseDate(this.to) || null,
          categoryId: this.categoryId,
          shopId: this.shopId
        }
      },
      update: data => data.invoices_aggregate.aggregate.count
    }
  }
}
</script>

<style></style>
