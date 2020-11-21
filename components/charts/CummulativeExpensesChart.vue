<template>
  <expenses-chart v-bind="$attrs" :chart-fn="createChart" v-on="$listeners" />
</template>

<script>
import ExpensesChart from '@/components/charts/ExpensesChart'
export default {
  components: { ExpensesChart },

  methods: {
    createChart(sums) {
      return {
        type: 'line',
        data: {
          datasets: [
            {
              data: this.calcualteCummulativeValues(sums),
              lineTension: 0
            }
          ]
        }
      }
    },

    calcualteCummulativeValues(data) {
      let cummulative = 0
      const cummulativeArray = []
      for (const value of data) {
        cummulative += value
        cummulativeArray.push(cummulative)
      }
      return cummulativeArray
    }
  }
}
</script>

<style></style>
