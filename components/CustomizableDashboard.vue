<template>
  <v-container>
    <v-row v-for="(row, i) in layout" :key="i">
      <v-col v-for="(column, j) in row" :key="j" :cols="column.size">
        <component
          :is="column.component"
          v-bind="mergeWith$attrs(column.props)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import merge from 'lodash/merge'

import ExpensesChartWidget from '@/components/widgets/ExpensesChartWidget'
import ExpensesPieChartWidget from '@/components/widgets/ExpensesPieChartWidget'
import MostExpensiveInvoices from '@/components/widgets/MostExpensiveInvoices'
import MostExpensiveItems from '@/components/widgets/MostExpensiveItems'
import MostPopularItems from '@/components/widgets/MostPopularItems'
import MostPopularShops from '@/components/widgets/MostPopularShops'

export default {
  components: {
    ExpensesChartWidget,
    ExpensesPieChartWidget,
    MostExpensiveInvoices,
    MostExpensiveItems,
    MostPopularItems,
    MostPopularShops
  },

  props: {
    layout: {
      type: Array,
      required: true
    }
  },
  methods: {
    mergeWith$attrs(props) {
      return merge({}, props, this.$attrs)
    }
  }
}
</script>

<style></style>
