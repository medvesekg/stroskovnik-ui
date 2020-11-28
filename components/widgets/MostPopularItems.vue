<template>
  <v-card>
    <v-app-bar color="accent"
      >Najbolj priljubljeni artikli
      <v-spacer />
      <v-switch
        :input-value="type === 'timesBought' ? true : false"
        :label="type === 'timesBought' ? 'Pogostost' : 'Količina'"
        @change="type = $event ? 'timesBought' : 'totalQuantity'"
      />
    </v-app-bar>
    <v-simple-table>
      <thead>
        <tr>
          <th>Ime</th>
          <th>Kupljeno</th>
          <th>Skupna količina</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>
            <nuxt-link :to="`/products/${encodeURIComponent(item.name)}`">
              {{ item.name }}
            </nuxt-link>
          </td>
          <td>{{ item.timesBought }}x</td>
          <td>{{ item.totalQuantity }}</td>
        </tr>
      </tbody>
    </v-simple-table>
  </v-card>
</template>

<script>
import InvoiceItems from '@/queries/InvoiceItems'
import orderBy from 'lodash/orderBy'

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
    }
  },

  data() {
    return {
      type: 'totalQuantity',
      invoiceItems: []
    }
  },

  computed: {
    groupedItems() {
      return this.invoiceItems.reduce((grouped, item) => {
        if (grouped[item.name] === undefined) {
          grouped[item.name] = {
            name: item.name,
            timesBought: 0,
            totalQuantity: 0
          }
        }
        grouped[item.name].timesBought += 1
        grouped[item.name].totalQuantity += item.quantity
        return grouped
      }, {})
    },
    items() {
      return orderBy(
        Object.values(this.groupedItems),
        [this.type, this.otherType],
        ['desc', 'desc']
      ).slice(0, 5)
    },

    otherType() {
      return this.type === 'totalQuantity' ? 'timesBought' : 'totalQuantioty'
    }
  }
}
</script>

<style></style>
