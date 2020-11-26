<template>
  <customizable-dashboard :layout="$store.state.dashboard.main" />
</template>

<script>
import DateRangeInput from '@/components/inputs/DateRangeInput'
import AppDatePicker from '@/components/app/AppDatePicker'
import ExpensesPieChart from '@/components/charts/ExpensesPieChart'
import ExpensesPieChartWidget from '@/components/widgets/ExpensesPieChartWidget'
import CustomizableDashboard from '@/components/CustomizableDashboard'

export default {
  components: {
    DateRangeInput,
    AppDatePicker,
    ExpensesPieChart,
    ExpensesPieChartWidget,
    CustomizableDashboard
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
