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
      ></v-switch>
    </v-app-bar>
    <v-container>
      <v-row>
        <v-col sm="10">
          <v-skeleton-loader
            v-if="$apollo.queries.dailyExpenses.loading"
            type="image"
          />
          <app-chart v-else :options="chart" :width="3" :height="1" />
        </v-col>
        <v-col sm="2">
          <total-expenses :from="from" :to="to" />
          <total-invoices :from="from" :to="to" />
          <total-invoice-items :from="from" :to="to" />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import TotalInvoices from '@/components/widgets/TotalInvoices'
import TotalInvoiceItems from '@/components/widgets/TotalInvoiceItems'
import TotalExpenses from '@/components/widgets/TotalExpenses'
import AppChart from '@/components/AppChart'
import { userCurrencyFormat } from '@/format/currency'

import DailyExpenses from '@/queries/DailyExpenses.gql'

import { userDateFormat } from '@/format/date'
import merge from 'lodash/merge'

export default {
  components: {
    TotalInvoices,
    TotalInvoiceItems,
    TotalExpenses,
    AppChart
  },

  apollo: {
    dailyExpenses: {
      query: DailyExpenses,
      variables() {
        return {
          from: this.from,
          to: this.to
        }
      },
      update: data => data.expenses_by_day
    }
  },

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

  data() {
    return {
      type: 'runningTotal'
    }
  },

  computed: {
    chart() {
      switch (this.type) {
        case 'daily':
          return this.createDailyExpensesChart(this.dailyExpenses)
          break
        case 'runningTotal':
          return this.createRunningTotalChart(this.dailyExpenses)
          break
        default:
          return this.createDailyExpensesChart(this.dailyExpenses)
          break
      }
    }
  },

  methods: {
    createDailyExpensesChart(data) {
      return this.createChart({
        type: 'bar',
        data: {
          datasets: [
            {
              data: data.map(data => data.sum)
            }
          ],
          labels: data.map(data => data.date)
        }
      })
    },
    createRunningTotalChart(data) {
      return this.createChart({
        type: 'line',
        data: {
          datasets: [
            {
              data: this.createRunningTotalFromDailyExpenses(data),
              lineTension: 0
            }
          ],
          labels: data.map(data => data.date)
        }
      })
    },
    createRunningTotalFromDailyExpenses(data) {
      let runningTotal = 0
      const runningTotalArray = []
      for (const item of data) {
        runningTotal += item.sum
        runningTotalArray.push(runningTotal)
      }
      return runningTotalArray
    },

    createChart(options) {
      return merge(
        {
          type: '', // required
          data: {
            datasets: [
              {
                label: 'Stroški',
                data: [], // required
                fill: false,
                borderColor: this.$vuetify.theme.themes.dark.error,
                backgroundColor: this.$vuetify.theme.themes.dark.error
              }
            ],
            labels: [] // required
          },
          options: {
            tooltips: {
              callbacks: {
                label: ({ value }) => userCurrencyFormat(value),
                title: data => userDateFormat(data[0].xLabel)
              }
            },
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                    callback: val => userCurrencyFormat(val)
                  }
                }
              ],
              xAxes: [
                {
                  ticks: {
                    callback: val => userDateFormat(val)
                  }
                }
              ]
            }
          }
        },
        options
      )
    }
  }
}
</script>

<style></style>
