<template>
  <v-card>
    <v-app-bar color="accent"> Stroški po {{ name }} </v-app-bar>
    <v-container>
      <v-row>
        <v-col>
          <v-skeleton-loader
            v-if="$apollo.queries.invoiceItems.loading"
            type="image"
          />
          <app-chart v-else :options="chart" :width="1" :height="1" />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import AppChart from '@/components/AppChart'
import InvoiceItems from '@/queries/InvoiceItems'
import Categories from '@/queries/Categories'
import Shops from '@/queries/Shops'
import { userCurrencyFormat } from '@/format/currency'
import { userPercentFormat } from '@/format/number'
import palette from 'google-palette'
import keyBy from 'lodash/keyBy'
import get from 'lodash/get'

const types = {
  categories: {
    name: 'kategorijah',
    query: Categories,
    attributePath: ['category_id']
  },
  shops: {
    name: 'trgovinah',
    query: Shops,
    attributePath: ['invoice', 'shop_id']
  }
}

export default {
  components: { AppChart },

  props: {
    type: {
      type: [String],
      required: true,
      validator: prop => {
        return Object.keys(types).includes(prop)
      }
    },
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

  apollo: {
    invoiceItems: {
      query: InvoiceItems,
      variables() {
        return {
          from: this.from,
          to: this.to
        }
      },
      update: data => data.invoice_items
    },
    groups: {
      query() {
        return this.types[this.type].query
      },
      update(data) {
        return keyBy(data[this.type], item => item.id)
      }
    }
  },

  data() {
    return {
      types: types,
      groups: {},
      invoiceItems: []
    }
  },

  computed: {
    name() {
      return this.types[this.type].name
    },
    attributePath() {
      return this.types[this.type].attributePath
    },
    breakdown() {
      return this.invoiceItems.reduce((breakdown, item) => {
        const groupId = get(item, this.attributePath)
        if (breakdown[groupId] === undefined) {
          breakdown[groupId] = 0
        }
        breakdown[groupId] += item.total
        return breakdown
      }, {})
    },
    chart() {
      const data = []
      for (const groupId in this.breakdown) {
        data.push({
          name: get(this.groups, [groupId, 'name'], null),
          sum: this.breakdown[groupId]
        })
      }
      return this.createPieChart(data)
    }
  },

  methods: {
    createPieChart(data) {
      // const total = data.reduce((sum, item) => (sum += item.sum), 0)
      return {
        type: 'pie',
        data: {
          datasets: [
            {
              data: data.map(data => data.sum),
              backgroundColor: palette('mpn65', 65).map(color => '#' + color)
            }
          ],
          labels: data.map(data => data.name)
        },
        options: {
          tooltips: {
            callbacks: {
              title: (items, data) => data.labels[items[0].index],
              label: (item, data) => {
                const hiddenIndexes = Object.values(
                  data.datasets[item.datasetIndex]._meta
                )[0]
                  .data.filter(item => item.hidden)
                  .map(item => item._index)

                let value = data.datasets[item.datasetIndex].data[item.index]
                const total = data.datasets[item.datasetIndex].data.reduce(
                  (sum, value, idx) => {
                    if (hiddenIndexes.includes(idx)) return sum
                    return (sum += value)
                  }
                )
                const percent = userPercentFormat(value / total)
                value = userCurrencyFormat(value)

                return `${value}  (${percent})`
              }
            }
          }
        }
      }
    }
  }
}
</script>

<style></style>
