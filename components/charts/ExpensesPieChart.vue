<template>
  <div>
    <app-chart v-bind="$attrs" :options="chart" v-on="$listeners" />
    <chart-details-modal
      v-model="dialog.open"
      :from="from"
      :to="to"
      :category-id="dialog.categoryId"
      :shop-id="dialog.shopId"
    />
  </div>
</template>

<script>
import AppChart from '@/components/app/AppChart'
import InvoiceItems from '@/queries/InvoiceItems'
import Categories from '@/queries/Categories'
import Shops from '@/queries/Shops'
import palette from 'google-palette'
import keyBy from 'lodash/keyBy'
import get from 'lodash/get'
import ChartDetailsModal from './ChartDetailsModal'

export const types = {
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
  components: { AppChart, ChartDetailsModal },

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
          from: this.$format.date.databaseDate(this.from),
          to: this.$format.date.databaseDate(this.to)
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
      dialog: {
        open: false,
        shopId: null,
        categoryId: null
      },
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

  watch: {
    '$apollo.loading': {
      handler(loading) {
        this.$emit('loading', loading)
      }
    }
  },

  methods: {
    createPieChart(data) {
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
              label: this.getLabel
            }
          },
          onClick: this.onChartClick
        }
      }
    },

    getLabel(item, data) {
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
      const percent = this.$format.number.percent(value / total)
      value = this.$format.number.currency(value)

      return `${value}  (${percent})`
    },

    onChartClick(event, items) {
      if (items && items[0]) {
        const i = items[0]._index
        const label = items[0]._chart.data.labels[i]

        if (this.type === 'categories') {
          const category = Object.values(this.groups).find(
            category => category.name === label
          )
          this.dialog.shopId = null
          this.dialog.categoryId = category.id
          this.dialog.open = true
        } else if (this.type === 'shops') {
          const shop = Object.values(this.groups).find(
            shop => shop.name === label
          )
          this.dialog.categoryId = null
          this.dialog.shopId = shop.id
          this.dialog.open = true
        }
      }
    }
  }
}
</script>

<style></style>
