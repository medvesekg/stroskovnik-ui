<template>
  <v-card>
    <v-card-title>Skupaj</v-card-title>
    <v-card-text class="headline">
      <v-progress-circular
        v-if="$apollo.queries.totalExpenses.loading"
        indeterminate
      />
      <span v-else class="error--text text--lighten-1">{{
        userNumberFormat(totalExpenses, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      }}</span>
      <span class="float-right">€</span>
    </v-card-text>
  </v-card>
</template>

<script>
import TotalExpenses from '@/queries/TotalExpenses.gql'
import { userNumberFormat } from '@/format/number'

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
    totalExpenses: {
      query: TotalExpenses,
      variables() {
        return {
          from: this.from,
          to: this.to
        }
      },
      update: data => data.invoice_items_aggregate.aggregate.sum.total
    }
  },
  methods: {
    userNumberFormat
  }
}
</script>

<style></style>
