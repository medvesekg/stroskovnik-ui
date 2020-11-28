<template>
  <v-card>
    <v-card-title>Skupaj</v-card-title>
    <v-card-text class="headline">
      <v-progress-circular
        v-if="$apollo.queries.totalExpenses.loading"
        indeterminate
      />
      <span v-else class="error--text text--lighten-1">{{
        $format.number.decimal2(totalExpenses)
      }}</span>
      <span class="float-right">€</span>
    </v-card-text>
  </v-card>
</template>

<script>
import TotalExpenses from '@/queries/TotalExpenses.gql'

export default {
  props: {
    from: {
      type: Date,
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
    totalExpenses: {
      query: TotalExpenses,
      variables() {
        return {
          from: this.$format.date.databaseDate(this.from),
          to: this.$format.date.databaseDate(this.to),
          categoryId: this.categoryId,
          shopId: this.shopId
        }
      },
      update: data => data.invoice_items_aggregate.aggregate.sum.total
    }
  }
}
</script>

<style></style>
