<template>
  <total-expenses :from="date" />
</template>

<script>
import TotalExpenses from '@/components/widgets/TotalExpenses'

export default {
  components: {
    TotalExpenses
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
