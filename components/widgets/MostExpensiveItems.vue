<template>
  <v-card>
    <v-app-bar color="accent">
      Najdražji artikli
      <v-spacer />
      <v-switch
        :input-value="type === 'total'"
        :label="type === 'single' ? 'Posamično' : 'Skupaj'"
        @change="type = $event ? 'total' : 'single'"
      />
    </v-app-bar>
    <v-simple-table>
      <thead>
        <tr>
          <th>Ime</th>
          <th>Trgovina</th>
          <th>Cena</th>
          <th v-if="type === 'total'">Količina</th>
          <th v-if="type === 'total'">Skupaj</th>
          <th>Datum</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in mostExpensiveItems" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ shopName[item.invoice.shop_id] }}</td>
          <td>{{ userCurrencyFormat(item.cost) }}</td>
          <td v-if="type === 'total'">{{ item.quantity }}</td>
          <td v-if="type === 'total'">
            {{ userCurrencyFormat(item.total) }}
          </td>
          <td>{{ userDateFormat(item.invoice.date) }}</td>
        </tr>
      </tbody>
    </v-simple-table>
  </v-card>
</template>

<script>
import InvoiceItems from '@/queries/InvoiceItems'
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
    shops: {
      query: Shops,
      update: data => keyBy(data.shops, 'id')
    }
  },

  data() {
    return {
      type: 'single',
      invoiceItems: [],
      shops: []
    }
  },
  computed: {
    mostExpensiveItems() {
      return orderBy(
        this.invoiceItems,
        [this.type === 'total' ? 'total' : 'cost'],
        'desc'
      ).slice(0, 5)
    }
  },
  methods: {
    userDateFormat,
    userCurrencyFormat,

    shopName(id) {
      return this.shops[id] ? this.shops[id].name : ''
    }
  }
}
</script>

<style></style>
