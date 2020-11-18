<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12" md="10">
          <v-skeleton-loader
            v-if="$apollo.queries.invoiceItems.loading"
            type="image"
          />
          <app-chart v-else :options="chart" :width="3" :height="1" />
        </v-col>
        <v-col cols="12" md="2">
          <total-expenses
            :from="from"
            :to="to"
            :category-id="categoryId"
            :shop-id="shopId"
          />
          <total-invoices
            :from="from"
            :to="to"
            :category-id="categoryId"
            :shop-id="shopId"
          />
          <total-invoice-items
            :from="from"
            :to="to"
            :category-id="categoryId"
            :shop-id="shopId"
          />
        </v-col>
      </v-row>
    </v-container>
    <details-modal
      v-model="dialog.open"
      :from="dialog.from"
      :to="dialog.to"
      :category-id="categoryId"
      :shop-id="shopId"
    />
  </div>
</template>

<script>
import TotalInvoices from '@/components/widgets/TotalInvoices'
import TotalInvoiceItems from '@/components/widgets/TotalInvoiceItems'
import TotalExpenses from '@/components/widgets/TotalExpenses'
import AppChart from '@/components/AppChart'

import { userCurrencyFormat } from '@/format/currency'
import { userDateFormat } from '@/format/date'

import InvoiceItems from '@/queries/InvoiceItems.gql'

import merge from 'lodash/merge'
import groupBy from 'lodash/groupBy'
import sumBy from 'lodash/sumBy'
import isFunction from 'lodash/isFunction'
import get from 'lodash/get'
import minBy from 'lodash/minBy'
import maxBy from 'lodash/maxBy'

import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import eachDayOfInterval from 'date-fns/eachDayOfInterval'
import eachMonthOfInterval from 'date-fns/eachMonthOfInterval'
import DetailsModal from '../DetailsModal.vue'

export default {
  components: {
    TotalInvoices,
    TotalInvoiceItems,
    TotalExpenses,
    AppChart,
    DetailsModal
  },

  apollo: {
    invoiceItems: {
      query: InvoiceItems,
      variables() {
        return {
          from: this.from,
          to: this.to,
          categoryId: this.categoryId,
          shopId: this.shopId
        }
      },
      update: data => data.invoice_items
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
    },
    groupBy: {
      type: String,
      required: false,
      default: 'day',
      validation: v => ['day', 'week', 'month', 'year'].includes(v)
    },
    cummulative: {
      type: Boolean,
      required: false,
      default: false
    },
    categoryId: {
      type: [Number, String],
      required: false,
      default: null
    },
    shopId: {
      type: [Number, String],
      required: false,
      default: null
    }
  },

  data() {
    return {
      dialog: {
        open: false,
        from: null,
        to: null
      },
      groupBys: {
        day: {
          key: date => userDateFormat(date),
          range: eachDayOfInterval
        },
        week: {
          key: null
        },
        month: {
          key: date => format(startOfMonth(date), 'MMM yyyy'),
          range: eachMonthOfInterval,
          from: label => parse(label, 'MMM yyyy', new Date(0, 0, 0, 0, 0, 0)),
          to: label =>
            endOfMonth(parse(label, 'MMM yyyy', new Date(0, 0, 0, 0, 0, 0)))
        },
        year: {
          key: null
        }
      }
    }
  },

  computed: {
    chart() {
      if (this.cummulative) {
        return this.createRunningTotalChart()
      }
      return this.createInvoiceItemsChart()
    },

    config() {
      return this.groupBys[this.groupBy]
    },

    groupByFunction() {
      return item => this.config.key(this.getDate(item))
    },

    minDate() {
      const minDateItem = minBy(this.invoiceItems, item => this.getDate(item))
      return this.getDate(minDateItem)
    },
    maxDate() {
      const maxDateItem = maxBy(this.invoiceItems, item => this.getDate(item))
      return this.getDate(maxDateItem)
    },

    range() {
      const start = this.from || this.minDate
      const end = this.to || this.maxDate
      if (start && end) {
        return this.config.range({ start, end }).reduce((res, date) => {
          const key = this.config.key(date)
          res[key] = 0
          return res
        }, {})
      }
      return {}
    },

    groupedSums() {
      const grouped = groupBy(this.invoiceItems, this.groupByFunction)

      for (const key in grouped) {
        grouped[key] = sumBy(grouped[key], item => item.total)
      }

      return merge({}, this.range, grouped)
    }
  },

  methods: {
    createInvoiceItemsChart() {
      return this.createChart({
        type: 'bar',
        data: {
          datasets: [
            {
              data: Object.values(this.groupedSums)
            }
          ],
          labels: Object.keys(this.groupedSums)
        }
      })
    },
    createRunningTotalChart(data) {
      return this.createChart({
        type: 'line',
        data: {
          datasets: [
            {
              data: this.createRunningTotalFrominvoiceItems(data),
              lineTension: 0
            }
          ],
          labels: data.map(data => data.invoice.date)
        }
      })
    },
    createRunningTotalFrominvoiceItems(data) {
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
                title: data => data[0].xLabel
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
                    callback: val => val
                  }
                }
              ]
            },
            onClick: this.onChartClick
          }
        },
        options
      )
    },

    onChartClick(event, items) {
      if (items && items[0]) {
        const i = items[0]._index
        const label = items[0]._chart.data.labels[i]

        this.dialog.open = true
        this.dialog.from = this.config.from(label)
        this.dialog.to = this.config.to(label)
      }
    },

    getDate(item) {
      return new Date(item.invoice.date)
    }
  }
}
</script>

<style></style>
