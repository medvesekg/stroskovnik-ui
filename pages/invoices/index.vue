<template>
  <v-data-table :headers="headers" :items="invoices">
    <template #item.shop="{item}">
      {{ item.shop.name }}
    </template>
    <template #item.cost_total="{item: invoice}">
      {{
        invoice.items
          .reduce((sum, item) => {
            return sum + item.quantity * item.cost
          }, 0)
          .toFixed(2)
      }}
      €
    </template>
  </v-data-table>
</template>

<script>
import API from '@/api/api'

export default {
  data() {
    return {
      headers: [
        {
          text: 'Datum računa',
          value: 'date'
        },
        {
          text: 'Trgovina',
          value: 'shop'
        },
        {
          text: 'Vsota',
          value: 'cost_total'
        }
      ],
      invoices: []
    }
  },
  created() {
    API.query(
      `{
  invoices(where: {items: {name: {_is_null: false}}}) {
    id
    date
    shop {
      name
    }
    items {
      cost
      quantity
    }
  }
} `
    ).then(response => {
      this.invoices = response.invoices
    })
  }
}
</script>

<style></style>
