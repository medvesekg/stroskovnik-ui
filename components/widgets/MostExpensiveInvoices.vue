<template>
  <v-card>
    <v-app-bar color="accent"
      >Največji računi
      <v-spacer />
      <v-switch
        :input-value="type === 'totalItems' ? true : false"
        :label="type === 'totalItems' ? 'Po št. postavk' : 'Po vsoti'"
        @change="type = $event ? 'totalItems' : 'totalCost'"
      ></v-switch>
    </v-app-bar>
    <v-simple-table>
      <thead>
        <tr>
          <th>Trgovina</th>
          <th>Št. postavk</th>
          <th>Vsota</th>
          <th>Datum</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="invoice in sortedInvoices" :key="invoice.id">
          <td>{{ shops[invoice.shop_id].name }}</td>
          <td>{{ invoice.totals.count }}</td>
          <td>{{ userCurrencyFormat(invoice.totals.sum) }}</td>
          <td>{{ userDateFormat(invoice.date) }}</td>
        </tr>
      </tbody>
    </v-simple-table>
  </v-card>
</template>

<script>
import Invoices from '@/queries/Invoices'
import Shops from '@/queries/Shops'
import { userDateFormat } from '@/format/date'
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
      type: 'totalCost',
      invoices: []
    }
  },

  computed: {
    sortedInvoices() {
      return orderBy(
        this.invoices,
        [this.sorting, this.otherSorting],
        ['desc', 'desc']
      ).slice(0, 5)
    },
    sorting() {
      return this.type === 'totalCost' ? 'totals.sum' : 'totals.count'
    },
    otherSorting() {
      return this.sorting === 'sum' ? 'totals.cost' : 'totals.sum'
    }
  },
  methods: {
    userCurrencyFormat,
    userDateFormat
  }
}
</script>

<style></style>
