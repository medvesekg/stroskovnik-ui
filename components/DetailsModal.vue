<template>
  <v-dialog :value="value" @input="$emit('input', $event)">
    <v-card v-if="value">
      <v-card-title class="headline">
        Podrobnosti
        <v-spacer />
        <v-switch
          :input-value="mode === 'items' ? true : false"
          :label="mode === 'items' ? 'Items' : 'Invoices'"
          @change="mode = $event ? 'items' : 'invoices'"
        ></v-switch>
      </v-card-title>
      <v-container>
        <v-row>
          <v-col>
            <graphql-table
              v-if="mode === 'invoices'"
              key="invoices"
              resource="invoices"
              :fields="['shop.name', 'totals.sum', 'date']"
              :filter="{
                shop_id: { _eq: shopId },
                date: {
                  _gte: databaseDateFormat(from),
                  _lte: databaseDateFormat(to)
                },
                items: {
                  category_id: {
                    _eq: categoryId
                  }
                }
              }"
            />
            <graphql-table
              v-else-if="mode === 'items'"
              key="items"
              resource="invoice_items"
              :fields="['name', 'invoice.shop.name', 'total', 'invoice.date']"
              :filter="{
                category_id: { _eq: categoryId },
                invoice: {
                  shop_id: { _eq: shopId },
                  date: {
                    _gte: databaseDateFormat(from),
                    _lte: databaseDateFormat(to)
                  }
                }
              }"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
import { databaseDateFormat } from '@/format/date'
import GraphqlTable from './GraphqlTable'

export default {
  components: { GraphqlTable },
  props: {
    from: {
      type: Date,
      required: false,
      default: null
    },
    to: {
      type: Date,
      required: false,
      default: null
    },
    categoryId: {
      type: [String, Number],
      required: false,
      default: null
    },
    shopId: {
      type: [Number, String],
      required: false,
      default: null
    },
    value: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      mode: 'items'
    }
  },
  methods: {
    databaseDateFormat
  }
}
</script>

<style></style>
