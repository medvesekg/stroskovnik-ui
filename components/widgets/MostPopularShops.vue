<template>
  <v-card>
    <v-app-bar color="accent"
      >Najbolj priljubljene trgovine
      <v-spacer />
      <v-switch
        :input-value="type === 'totalItems'"
        :label="type === 'totalItems' ? 'Št. postavk' : 'Št.obiskov'"
        @change="type = $event ? 'totalItems' : 'mostVisited'"
      ></v-switch>
    </v-app-bar>
    <v-simple-table>
      <thead>
        <tr>
          <th>Trgovina</th>
          <th>Št. obiskov</th>
          <th>Št. postavk</th>
          <th>Količina</th>
          <th>Vsota</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="shop in mostPopularShops" :key="shop.id">
          <td>{{ shop.name }}</td>
          <td>{{ shop.timesVisited }}x</td>
          <td>{{ shop.itemsCount }}</td>
          <td>{{ shop.totalQuantity }}</td>
          <td>{{ userCurrencyFormat(shop.sum) }}</td>
        </tr>
      </tbody>
    </v-simple-table>
  </v-card>
</template>

<script>
import Invoices from '@/queries/Invoices'
import Shops from '@/queries/Shops'
import { userCurrencyFormat } from '@/format/currency'
import orderBy from 'lodash/orderBy'
import keyBy from 'lodash/keyBy'

export default {
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

  apollo: {
    invoices: {
      query: Invoices,
      variables() {
        return {
          from: this.from,
          to: this.to
        }
      },
      update: data => data.invoices
    },
    shops: {
      query: Shops,
      update: data => keyBy(data.shops, item => item.id)
    }
  },

  data() {
    return {
      type: 'mostVisited',
      invoices: [],
      shops: []
    }
  },

  computed: {
    mostPopularShops() {
      const grouped = this.invoices.reduce((grouped, invoice) => {
        if (grouped[invoice.shop_id] === undefined) {
          grouped[invoice.shop_id] = {
            name: this.shops[invoice.shop_id].name,
            timesVisited: 0,
            itemsCount: 0,
            totalQuantity: 0,
            sum: 0
          }
        }
        grouped[invoice.shop_id].timesVisited++
        grouped[invoice.shop_id].itemsCount += invoice.totals.count
        grouped[invoice.shop_id].totalQuantity += invoice.totals.quantity
        grouped[invoice.shop_id].sum += invoice.totals.sum
        return grouped
      }, {})

      return orderBy(
        Object.values(grouped),
        [this.sorting, this.otherSorting],
        ['desc', 'desc']
      ).slice(0, 5)
    },

    sorting() {
      return this.type === 'mostVisited' ? 'timesVisited' : 'itemsCount'
    },
    otherSorting() {
      return this.type === 'mostVisited' ? 'itemsCount' : 'timesVisited'
    }
  },
  methods: {
    userCurrencyFormat
  }
}
</script>

<style></style>
