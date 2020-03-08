<template>
  <v-data-table :headers="headers" :items="items">
    <template #item.date="{item}">
      {{ item.invoice.date }}
    </template>
    <template #item.shop="{item}">
      {{ item.invoice.shop.name }}
    </template>
    <template #item.category="{item}">
      {{ item.category.name }}
    </template>
    <template #item.subcategory="{item}">
      {{ item.subcategory.name }}
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
          text: 'Ime artikla',
          value: 'name'
        },
        {
          text: 'Kategorija',
          value: 'category'
        },
        {
          text: 'Podkategorija',
          value: 'subcategory'
        },
        {
          text: 'Količina',
          value: 'amount'
        },
        {
          text: 'Cena skupaj',
          value: 'cost'
        }
      ],
      items: []
    }
  },
  created() {
    API.query(
      `{
      invoice_items(order_by: {invoice: {date: desc, id: desc}, id: asc}, limit: 20) {
        id
        amount
        category {
          name
        }
        cost
        invoice_id
        name
        subcategory {
          name
        }
        invoice {
          date
          shop {
            name
          }
        }
      }
    }`
    ).then(response => {
      this.items = response.invoice_items
    })
  }
}
</script>

<style></style>
