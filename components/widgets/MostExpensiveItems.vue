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
          <td>{{ shopName(item.invoice.shop_id) }}</td>
          <td>{{ $format.number.currency(item.cost) }}</td>
          <td v-if="type === 'total'">{{ item.quantity }}</td>
          <td v-if="type === 'total'">
            {{ $format.number.currency(item.total) }}
          </td>
          <td>
            {{
              $parseFormat(item.invoice.date, {
                from: 'date.databaseDate',
                to: 'date.date'
              })
            }}
          </td>
        </tr>
      </tbody>
    </v-simple-table>
  </v-card>
</template>

<script>
import InvoiceItems from '@/queries/InvoiceItems'
import Shops from '@/queries/Shops'
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
          from: this.$format.date.databaseDate(this.from),
          to: this.$format.date.databaseDate(this.to)
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
    shopName(id) {
      return this.shops[id] ? this.shops[id].name : ''
    }
  }
}
</script>

<style></style>
