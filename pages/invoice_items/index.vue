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
    <template #item.cost="{item}"> {{ item.cost }} € </template>
    <template #item.cost_total="{item}">
      {{ item.cost * item.quantity }} €
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
          text: 'Količina',
          value: 'quantity'
        },
        {
          text: 'Cena',
          value: 'cost'
        },
        {
          text: 'Cena skupaj',
          value: 'cost_total'
        }
      ],
      items: []
    }
  },
  created() {
    API.query(
      `{
      invoice_items(order_by: {invoice: {date: desc, id: desc}, id: asc}, limit: 1000) {
        id
        quantity
        cost
        name
        category {
          id
          name
          category_group {
            id
            name
          }
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
