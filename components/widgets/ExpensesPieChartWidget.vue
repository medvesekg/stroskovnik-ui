<template>
  <v-card>
    <v-app-bar color="accent"> Stroški po {{ title }} </v-app-bar>
    <v-container>
      <v-row>
        <v-col>
          <v-skeleton-loader v-if="loading" type="image" />
          <expenses-pie-chart
            v-show="!loading"
            v-bind="$attrs"
            :type="type"
            v-on="$listeners"
            @loading="loading = $event"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import ExpensesPieChart, { types } from '@/components/charts/ExpensesPieChart'

export default {
  components: { ExpensesPieChart },

  props: {
    type: {
      type: String,
      required: true,
      validation: v => Object.keys(types).includes(v)
    }
  },

  data() {
    return {
      loading: false,
      titles: {
        categories: 'kategorijah',
        shops: 'trgovinah'
      }
    }
  },

  computed: {
    title() {
      return types[this.type].name
    }
  }
}
</script>

<style></style>
