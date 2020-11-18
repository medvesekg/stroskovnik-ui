<template>
  <div>
    <date-range-input v-model="range" label="Date range" />
    <v-autocomplete
      v-model="categoryId"
      :items="categories"
      item-text="name"
      item-value="id"
      label="Kategorija"
      no-data="Izberite kategorijo"
      data-lpignore="true"
      clearable
    />
    <v-autocomplete
      v-model="shopId"
      :items="shops"
      item-text="name"
      item-value="id"
      label="Trgovina"
      no-data="Izberite trgovino"
      data-lpignore="true"
      clearable
    />
    <expenses-chart2
      group-by="month"
      :category-id="categoryId"
      :shop-id="shopId"
      :from="from"
      :to="to"
    />
  </div>
</template>

<script>
import ExpensesChart2 from '@/components/widgets/ExpensesChart2'
import DateRangeInput from '@/components/DateRangeInput'
import Categories from '@/queries/Categories'
import Shops from '@/queries/Shops'
import get from 'lodash/get'

export default {
  components: { ExpensesChart2, DateRangeInput },

  apollo: {
    categories: {
      query: Categories
    },
    shops: {
      query: Shops
    }
  },

  data() {
    return {
      categoryId: null,
      shopId: null,
      range: null
    }
  },

  computed: {
    from() {
      return get(this.range, 'from', null)
    },
    to() {
      return get(this.range, 'to', null)
    }
  }
}
</script>

<style></style>
