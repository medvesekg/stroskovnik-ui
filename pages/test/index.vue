<template>
  <div>
    <date-range-input v-model="range" />
    <expenses-pie-chart-widget
      :from="range ? range.from : null"
      :to="range ? range.to : null"
      type="shops"
    />
  </div>
</template>

<script>
import DateRangeInput from '@/components/inputs/DateRangeInput'
import AppDatePicker from '@/components/app/AppDatePicker'
import ExpensesPieChart from '@/components/charts/ExpensesPieChart'
import ExpensesPieChartWidget from '@/components/widgets/ExpensesPieChartWidget'

export default {
  components: {
    DateRangeInput,
    AppDatePicker,
    ExpensesPieChart,
    ExpensesPieChartWidget
  },
  data() {
    return {
      date: new Date(),
      range: null
    }
  }
}
</script>

<style></style>
