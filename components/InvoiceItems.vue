<template>
  <div>
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>
  </div>
</template>

<script>
import InvoiceItems from '@/queries/InvoiceItems.gql'

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
    },

    categoryId: {
      type: [Number, String],
      required: false,
      default: null
    }
  },

  apollo: {
    items: {
      query: InvoiceItems,
      variables() {
        return {
          from: this.from,
          to: this.to,
          categoryId: this.categoryId
        }
      },
      update: data => data.invoice_items
    }
  }
}
</script>

<style></style>
