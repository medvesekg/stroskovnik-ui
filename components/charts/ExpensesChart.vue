<template>
  <div>
    <v-skeleton-loader
      v-if="$apollo.queries.invoiceItems.loading"
      type="image"
    />
    <app-chart v-else :options="chart" :width="3" :height="1" />

    <chart-details-modal
      v-model="dialog.open"
      :from="dialog.from"
      :to="dialog.to"
      :category-id="categoryId"
      :shop-id="shopId"
    />
  </div>
</template>

<script>
import AppChart from '@/components/app/AppChart'

import InvoiceItems from '@/queries/InvoiceItems.gql'

import merge from 'lodash/merge'
import groupBy from 'lodash/groupBy'
import sumBy from 'lodash/sumBy'
import sum from 'lodash/sum'
import isFunction from 'lodash/isFunction'
import get from 'lodash/get'
import minBy from 'lodash/minBy'
import maxBy from 'lodash/maxBy'

import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import endOfDay from 'date-fns/endOfDay'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import eachDayOfInterval from 'date-fns/eachDayOfInterval'
import eachMonthOfInterval from 'date-fns/eachMonthOfInterval'
import gql from 'graphql-tag'
import ChartDetailsModal from './ChartDetailsModal'

export default {
  components: {
    AppChart,
    ChartDetailsModal
  },

  apollo: {
    invoiceItems: {
      query: gql`
        query InvoiceItems(
          $from: date
          $to: date
          $categoryId: Int
          $shopId: Int
        ) {
          invoice_items(
            where: {
              invoice: {
                date: { _gte: $from, _lte: $to }
                shop_id: { _eq: $shopId }
              }
              category_id: { _eq: $categoryId }
            }
            order_by: { invoice: { date: asc } }
          ) {
            total
            invoice {
              date
              shop_id
            }
          }
        }
      `,
      variables() {
        return {
          from: this.from ? this.$format.date.databaseDate(this.from) : null,
          to: this.to ? this.$format.date.databaseDate(this.to) : null,
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
    categoryId: {
      type: [Number, String],
      required: false,
      default: null
    },
    shopId: {
      type: [Number, String],
      required: false,
      default: null
    },
    chartFn: {
      type: Function,
      required: false,
      default: () => ({})
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
          key: date => this.$format.date.date(date),
          range: eachDayOfInterval,
          from: label => parse(label, 'd. M. yyyy', new Date(0, 0, 0, 0, 0, 0)),
          to: label =>
            endOfDay(parse(label, 'd. M. yyyy', new Date(0, 0, 0, 0, 0, 0)))
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
      return merge(
        this.defaultChart(),
        this.chartFn(Object.values(this.groupedSums))
      )
    },

    config() {
      return this.groupBys[this.groupBy]
    },

    groupByFunction() {
      return item => this.config.key(this.getDate(item))
    },

    minDate() {
      if (this.invoiceItems && this.invoiceItems.count) {
        const minDateItem = minBy(this.invoiceItems, item => this.getDate(item))
        return this.getDate(minDateItem)
      }
      return null
    },
    maxDate() {
      if (this.invoiceItems && this.invoiceItems.count) {
        const maxDateItem = maxBy(this.invoiceItems, item => this.getDate(item))
        return this.getDate(maxDateItem)
      }
      return null
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
    },

    average() {
      const sums = Object.values(this.groupedSums)
      return sums.length ? sum(sums) / sums.length : 0
    }
  },

  watch: {
    average() {
      this.$emit('average', this.average)
    },
    '$apollo.loading': {
      handler: function(loading) {
        this.$emit('loading', loading)
      }
    }
  },

  methods: {
    defaultChart() {
      return {
        type: 'bar',
        data: {
          datasets: [
            {
              label: 'Stroški',
              data: Object.values(this.groupedSums),
              fill: false,
              borderColor: this.$vuetify.theme.themes.dark.error,
              backgroundColor: this.$vuetify.theme.themes.dark.error
            }
          ],
          labels: Object.keys(this.groupedSums)
        },
        options: {
          tooltips: {
            callbacks: {
              label: ({ value }) => {
                return this.$format.number.currency(Number(value))
              },
              title: data => data[0].xLabel
            }
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  callback: val => this.$format.number.currency(val)
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
      }
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
