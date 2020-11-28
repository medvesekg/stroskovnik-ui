<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>{{ $route.params.id }}</h1>
        <h2>{{ shops }}</h2>
      </v-col>
      <v-col class="text-right">
        <div class="d-inline-block">
          <date-range-input v-model="range" label="Obdobje" />
        </div>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col>
        <v-card>
          <v-card-title>Cena</v-card-title>
          <v-card-text class="d-flex align-center">
            <span>Običajna cena</span>
            <span class="headline ml-auto">
              <span class="error--text text--lighten-1">{{
                $format.number.decimal2(medianCost)
              }}</span>
              <span>€</span>
            </span>
          </v-card-text>
          <v-card-text class="d-flex align-center">
            <span>Zadnaj cena</span>
            <span class="ml-auto">{{ $format.number.currency(lastCost) }}</span>
          </v-card-text>
          <v-card-text class="d-flex align-center">
            <span>Najnižja cena</span>
            <span class="ml-auto">{{ $format.number.currency(minCost) }}</span>
          </v-card-text>
          <v-card-text class="d-flex align-center">
            <span>Najvišja cena</span>
            <span class="ml-auto">{{ $format.number.currency(maxCost) }}</span>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card>
          <v-card-title>Skupno</v-card-title>

          <v-card-text class="d-flex align-center">
            <span>Skupno št. nakupov</span>
            <span class="headline error--text text--lighten-1 ml-auto">
              {{ timesBought }}
            </span>
          </v-card-text>
          <v-card-text
            class="d-flex align-center"
            :title="$parseFormat.date.databaseDate(lastBought)"
          >
            <span>Zadnji nakup</span>
            <span class="ml-auto">{{
              $parseFormat(lastBought, {
                from: 'date.databaseDate',
                to: 'date.relative'
              })
            }}</span>
          </v-card-text>
          <v-card-text class="d-flex align-center">
            <span>Skupna količina</span>
            <span class="ml-auto">{{ totalQuantity }}</span>
          </v-card-text>
          <v-card-text class="d-flex align-center">
            <span>Skupna vsota</span>
            <span class="ml-auto">{{
              $format.number.currency(totalCost)
            }}</span>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card>
          <v-card-title>Na mesec</v-card-title>

          <v-card-text class="d-flex align-center">
            <span>Povprečno št. nakupov / mesec</span>
            <span class="ml-auto">{{
              $format.number.decimal2(avgTimesBoughtPerMonth)
            }}</span>
          </v-card-text>
          <v-card-text
            class="d-flex align-center"
            :title="$parseFormat.date.databaseDate(lastBought)"
          >
            <span>Povprečna količina / mesec</span>
            <span class="ml-auto">{{
              $format.number.decimal2(avgQuantityPerMonth)
            }}</span>
          </v-card-text>
          <v-card-text class="d-flex align-center">
            <span>Povprečna vsota / mesec</span>
            <span class="ml-auto"
              >{{ $format.number.currency(avgCostPerMonth) }}
            </span>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <app-chart :width="3" :height="1" :options="chart" />

    <graphql-table
      resource="invoice_items"
      :fields="[
        'name',
        'invoice.shop.name',
        'cost',
        'quantity',
        'invoice.date'
      ]"
      :filter="{
        name: { _eq: $route.params.id },
        invoice: {
          date: {
            _gte: this.$format.date.databaseDate(range.from) || null,
            _lte: this.$format.date.databaseDate(range.to) || null
          }
        }
      }"
    />
  </v-container>
</template>

<script>
import gql from 'graphql-tag'
import GraphqlTable from '@/components/GraphqlTable'
import AppChart from '@/components/app/AppChart'
import uniq from 'lodash/uniq'
import uniqBy from 'lodash/uniqBy'
import sum from 'lodash/sum'
import sumBy from 'lodash/sumBy'
import get from 'lodash/get'
import minBy from 'lodash/minBy'
import maxBy from 'lodash/maxBy'
import eachMonthOfInterval from 'date-fns/eachMonthOfInterval'
import { median } from '@/lib/functions'
import DateRangeInput from '@/components/inputs/DateRangeInput.vue'

export default {
  components: { GraphqlTable, AppChart, DateRangeInput },
  apollo: {
    items: {
      query: gql`
        query InvoiceItems($name: String, $from: date, $to: date) {
          invoice_items(
            where: {
              name: { _eq: $name }
              invoice: { date: { _gte: $from, _lte: $to } }
            }
            order_by: { invoice: { date: asc } }
          ) {
            quantity
            total
            invoice {
              id
              date
              shop {
                name
              }
            }
            cost
            category {
              name
            }
          }
        }
      `,
      variables() {
        return {
          name: this.$route.params.id,
          from: this.$format.date.databaseDate(this.range.from) || null,
          to: this.$format.date.databaseDate(this.range.to) || null
        }
      },
      update: data => data.invoice_items || []
    }
  },

  data() {
    return {
      items: [],
      range: {
        from: null,
        to: null
      }
    }
  },

  computed: {
    shops() {
      return uniq(this.items.map(item => item.invoice.shop.name)).join(',')
    },

    medianCost() {
      if (!this.items.length) return 0
      return median(this.items.map(item => item.cost))
    },

    minCost() {
      return get(
        minBy(this.items, item => item.cost),
        'cost',
        0
      )
    },
    maxCost() {
      return get(
        maxBy(this.items, item => item.cost),
        'cost',
        0
      )
    },

    lastCost() {
      return get(this.lastInvoiceItem, 'cost')
    },

    firstInvoiceItem() {
      return minBy(this.items, item =>
        this.$parse.date.databaseDate(item.invoice.date)
      )
    },

    lastInvoiceItem() {
      return maxBy(this.items, item =>
        this.$parse.date.databaseDate(item.invoice.date)
      )
    },

    lastBought() {
      return get(this.lastInvoiceItem, 'invoice.date')
    },
    firstBought() {
      return get(this.firstInvoiceItem, 'invoice.date')
    },
    timesBought() {
      return uniqBy(this.items, item => item.invoice.id).length
    },
    avgTimesBoughtPerMonth() {
      return this.timesBought / this.numOfMonths
    },

    totalQuantity() {
      return sumBy(this.items, item => item.quantity)
    },
    avgQuantityPerMonth() {
      return this.totalQuantity / this.numOfMonths
    },

    totalCost() {
      return sumBy(this.items, item => item.cost * item.quantity)
    },

    avgCostPerMonth() {
      return this.totalCost / this.numOfMonths
    },

    numOfMonths() {
      if (!this.firstBought) return 1
      return eachMonthOfInterval({
        start: new Date(this.firstBought),
        end: new Date()
      }).length
    },

    chart() {
      if (this.items) {
        return {
          type: 'line',
          data: {
            datasets: [
              {
                label: 'Cena',
                data: this.items.map(item => item.cost),
                fill: false,
                borderColor: this.$vuetify.theme.themes.dark.error,
                backgroundColor: this.$vuetify.theme.themes.dark.error,
                lineTension: 0
              }
            ],
            labels: this.items.map(item => {
              const date = this.$parse.date.databaseDate(item.invoice.date)
              return this.$format.date.date(date)
            })
          },
          options: {
            tooltips: {
              callbacks: {
                label: ({ value }) => {
                  return this.$format.number.currency(Number(value))
                },
                title: data => {
                  return data[0].xLabel
                }
              }
            },
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                    callback: val => this.$format.number.currency(Number(val))
                  }
                }
              ],
              xAxes: [
                {
                  ticks: {
                    callback: val => {
                      return val
                    }
                  }
                }
              ]
            },
            onClick: this.onChartClick
          }
        }
      }
      return {}
    }
  },

  methods: {
    onChartClick() {}
  }
}
</script>

<style></style>
