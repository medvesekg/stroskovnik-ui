<template>
  <div>
    <date-range-input v-model="range" type="month" single />
  </div>
</template>

<script>
import DateRangeInput from '@/components/inputs/DateRangeInput'
import AppDatePicker from '@/components/app/AppDatePicker'

export default {
  components: { DateRangeInput, AppDatePicker },
  data() {
    return {
      date: new Date(),
      range: null
    }
  }
}
</script>

<style></style>
