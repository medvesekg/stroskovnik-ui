<template>
  <v-card>
    <v-app-bar color="accent">
      Stroški po dnevih
      <v-spacer />
      <slot></slot>
      <v-switch
        :input-value="type === 'daily'"
        :label="type === 'daily' ? 'Dnevni stroški' : 'Tekoča vsota'"
        @change="type = $event ? 'daily' : 'runningTotal'"
      />
    </v-app-bar>
    <v-container>
      <v-row>
        <v-col cols="12" md="10">
          <template v-if="loading">
            <v-skeleton-loader type="image" />
          </template>
          <template v-show="!loading">
            <expenses-chart
              v-if="type === 'daily'"
              :from="from"
              :to="to"
              group-by="day"
              @loading="loading = $event"
            />
            <cummulative-expenses-chart
              v-else
              :from="from"
              :to="to"
              group-by="day"
              @loading="loading = $event"
            />
          </template>
        </v-col>
        <v-col cols="12" md="2">
          <total-expenses :from="from" :to="to" />
          <total-invoices :from="from" :to="to" />
          <total-invoice-items :from="from" :to="to" />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import ExpensesChart from '@/components/charts/ExpensesChart'
import CummulativeExpensesChart from '@/components/charts/CummulativeExpensesChart'
import TotalInvoices from '@/components/widgets/TotalInvoices'
import TotalInvoiceItems from '@/components/widgets/TotalInvoiceItems'
import TotalExpenses from '@/components/widgets/TotalExpenses'

import DailyExpenses from '@/queries/DailyExpenses.gql'

import merge from 'lodash/merge'

export default {
  components: {
    ExpensesChart,
    CummulativeExpensesChart,
    TotalInvoices,
    TotalInvoiceItems,
    TotalExpenses
  },

  props: {
    from: {
      type: Date,
      required: false,
      default: null
    },
    to: {
      type: Date,
      required: false,
      default: null
    }
  },

  data() {
    return {
      type: 'runningTotal',
      loading: false
    }
  }
}
</script>

<style></style>
