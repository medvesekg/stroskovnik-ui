<template>
  <v-container>
    <h1>{{ $route.params.id }}</h1>
    <h2>{{ shops }}</h2>

    <v-row>
      <v-col>
        <v-card>
          <v-card-text class="d-flex align-center">
            <span>Običajna cena</span>
            <span class="headline ml-auto">
              <span class="error--text text--lighten-1">{{
                $format.number.decimal2(medianCost)
              }}</span>
              <span>€</span>
            </span>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col class="d-flex align-center body-2">
        <span>
          Najnižja cena
        </span>
        <span class="ml-auto">
          {{ $format.number.currency(minCost) }}
        </span>
      </v-col>
      <v-col class="d-flex align-center body-2">
        <span>Najvišja cena</span>
        <span class="ml-auto">
          {{ $format.number.currency(maxCost) }}
        </span>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex align-center body-2">
        <span>Skupno št. nakupov</span>
        <span class="ml-auto">
          {{ timesBought }}
        </span>
      </v-col>
      <v-col class="d-flex align-center body-2">
        <span>Zadnji nakup</span>
        <span
          class="ml-auto"
          :title="
            $parseFormat(lastBought, {
              from: 'date.databaseDate',
              to: 'date.date'
            })
          "
        >
          {{
            $parseFormat(lastBought, {
              from: 'date.databaseDate',
              to: 'date.relative'
            })
          }}
        </span>
      </v-col>
      <v-col class="d-flex align-center body-2">
        <span>Skupna količina</span>
        <span class="ml-auto"
          >{{ totalQuantity }} ({{ $format.number.currency(totalCost) }})</span
        >
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
        name: { _eq: $route.params.id }
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
import { median } from '@/lib/functions'

export default {
  components: { GraphqlTable, AppChart },
  apollo: {
    items: {
      query: gql`
        query InvoiceItems($name: String) {
          invoice_items(
            where: { name: { _eq: $name } }
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
          name: this.$route.params.id
        }
      },
      update: data => data.invoice_items
    }
  },

  data() {
    return {
      items: []
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
    timesBought() {
      return uniqBy(this.items, item => item.invoice.id).length
    },
    lastBought() {
      return get(
        maxBy(this.items, item =>
          this.$parse.date.databaseDate(item.invoice.date)
        ),
        'invoice.date'
      )
    },

    totalQuantity() {
      return sumBy(this.items, item => item.quantity)
    },

    totalCost() {
      return sumBy(this.items, item => item.cost * item.quantity)
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
