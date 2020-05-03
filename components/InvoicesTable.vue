<template>
  <v-data-table
    :headers="headers"
    :items="rows"
    :options.sync="options"
    :footer-props="footerProps"
    :server-items-length="invoicesCount"
    show-expand
    v-bind="$attrs"
  >
    <template #top>
      <v-dialog v-model="deleteConfirmation.dialog" max-width="800">
        <v-card v-if="deleteConfirmation.invoice">
          <v-card-text class="headline text-center"
            >Are you sure you want to delete this
            {{
              shops[deleteConfirmation.invoice.shop_id]
                ? shops[deleteConfirmation.invoice.shop_id].name
                : ''
            }}
            invoice from
            {{ userDateFormat(deleteConfirmation.invoice.date) }} and its
            {{ deleteConfirmation.invoice.items.length || 0 }}
            items?</v-card-text
          >
          <v-card-actions>
            <v-spacer />
            <v-btn color="error" @click="confirmDelete">Delete</v-btn>
            <v-btn @click="cancelDelete">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
    <template #item.data-table-expand="{item: invoice, expand, isExpanded}">
      <v-btn block x-small @click="expand(!isExpanded)">
        <span>
          {{ invoice.items.length || '0' }}
        </span>
        <template>
          <v-icon v-if="isExpanded" small>expand_more</v-icon>
          <v-icon v-else small>expand_less</v-icon>
        </template>
      </v-btn>
    </template>
    <template #item.date="{ item: invoice }">
      <inline-edit
        v-if="editing[invoice.id]"
        v-model="editing[invoice.id].date"
        component="date-input"
      ></inline-edit>
      <span v-else>{{ userDateFormat(invoice.date) }}</span>
    </template>
    <template #item.shop="{ item: invoice }">
      <inline-edit
        v-if="editing[invoice.id]"
        v-model="editing[invoice.id].shop_id"
        component="v-autocomplete"
        :items="Object.values(shops)"
        item-text="name"
        item-value="id"
      />
      <span v-else>
        {{ shops[invoice.shop_id] ? shops[invoice.shop_id].name : 'Unknown' }}
      </span>
    </template>
    <template #item.sum="{item: invoice}">
      {{ invoice.totals ? userCurrencyFormat(invoice.totals.sum) : null }}
    </template>
    <template #item.created_at="{item: invoice}">
      <span :title="userDateTimeFormat(invoice.created_at)">
        {{ relativeToNow(invoice.created_at) }}
      </span>
    </template>
    <template #item.actions="{item: invoice}">
      <template v-if="!editing[invoice.id]">
        <v-btn x-small rounded color="primary" @click="startEdit(invoice)">
          <v-icon x-small>edit</v-icon>
        </v-btn>
        <v-btn
          x-small
          rounded
          color="error"
          @click.stop="
            deleteConfirmation.dialog = true
            deleteConfirmation.invoice = invoice
          "
        >
          <v-icon x-small>delete</v-icon>
        </v-btn>
      </template>
      <template v-else>
        <v-btn x-small rounded color="success" @click="confirmEdit(invoice)">
          <v-icon x-small>check</v-icon>
        </v-btn>
        <v-btn x-small rounded color="default" @click="cancelEdit(invoice)">
          <v-icon x-small>cancel</v-icon>
        </v-btn>
      </template>
    </template>

    <template #expanded-item="{item: invoice}">
      <td colspan="9999" class="pl-5 pt-5 pb-5">
        <invoice-items-table
          :invoice-items="invoice.items"
          :items-per-page="-1"
          dense
          hide-default-footer
          disable-sort
          @update="$apollo.queries.invoices.refetch()"
        />
      </td>
    </template>
  </v-data-table>
</template>

<script>
import gql from 'graphql-tag'
import { userDateFormat } from '@/format/date'
import { userCurrencyFormat } from '@/format/currency'
import { relativeToNow, userDateTimeFormat } from '@/format/datetime'
import Shops from '@/queries/Shops'
import keyBy from 'lodash/keyBy'
import InvoiceItemsTable from '@/components/InvoiceItemsTable'
import InlineEdit from '@/components/InlineEdit'

export default {
  components: { InvoiceItemsTable, InlineEdit },

  props: {
    orderBy: {
      type: Object,
      required: false,
      default: () => ({
        created_at: 'desc'
      })
    },
    limit: {
      type: Number,
      required: false,
      default: 10
    }
  },

  apollo: {
    invoices: {
      query: gql`
        query Invoices($limit: Int, $offset: Int) {
          invoices(
            limit: $limit
            offset: $offset
            order_by: { created_at: desc }
          ) {
            id
            shop_id
            date
            totals {
              sum
            }
            items {
              id
              category_id
              name
              cost
              quantity
              total
            }
            created_at
          }
        }
      `,
      variables() {
        return {
          limit: this.options.itemsPerPage,
          offset: (this.options.page - 1) * this.options.itemsPerPage
        }
      }
    },
    invoicesCount: {
      query: gql`
        query InvoicesCount {
          invoices_aggregate {
            aggregate {
              count
            }
          }
        }
      `,
      update: data => data.invoices_aggregate.aggregate.count
    },
    shops: {
      query: Shops,
      update: data => keyBy(data.shops, 'id')
    }
  },
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
          value: 'sum'
        },
        {
          text: 'Ustvarjeno',
          value: 'created_at'
        },
        {
          text: 'Akcije',
          value: 'actions'
        }
      ],
      options: {
        groupBy: [],
        groupdDesc: [],
        itemsPerPage: 10,
        multiSort: false,
        mustSort: false,
        page: 1,
        sortBy: [],
        sortDesc: []
      },
      footerProps: {
        itemsPerPageOptions: [10, 20, 50]
      },
      invoices: [],
      shops: {},
      editing: {},
      deleteConfirmation: {
        dialog: false,
        invoice: null
      }
    }
  },
  computed: {
    rows() {
      return this.invoices
    }
  },

  methods: {
    userDateFormat,
    userCurrencyFormat,
    relativeToNow,
    userDateTimeFormat,

    startEdit(invoice) {
      this.$set(this.editing, invoice.id, { ...invoice })
    },
    cancelEdit(invoice) {
      this.$delete(this.editing, invoice.id)
    },
    confirmEdit(invoice) {
      const editedInvoice = this.editing[invoice.id]
      this.$apollo
        .mutate({
          mutation: gql`
            mutation UpdateInvoice($id: Int!, $date: date, $shop_id: Int) {
              update_invoices_by_pk(
                pk_columns: { id: $id }
                _set: { date: $date, shop_id: $shop_id }
              ) {
                id
                shop_id
                date
              }
            }
          `,
          variables: {
            id: editedInvoice.id,
            date: editedInvoice.date,
            shop_id: editedInvoice.shop_id
          }
        })
        .then(() => {
          this.$store.dispatch('snackbar/success', 'Updated')
          this.$delete(this.editing, invoice.id)
        })
        .catch(e => {
          this.$store.dispatch('snackbar/error', e.message)
        })
    },
    startDelete(invoice) {
      this.deleteConfirmation.dialog = true
      this.deleteConfirmation.invoice = invoice
    },
    cancelDelete() {
      this.deleteConfirmation.dialog = false
      this.deleteConfirmation.invoice = null
    },
    confirmDelete() {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation DeleteInvoice($id: Int!) {
              delete_invoices_by_pk(id: $id) {
                id
              }
            }
          `,
          variables: {
            id: this.deleteConfirmation.invoice.id
          },
          update: () => {
            const cache = this.$apollo.getClient().cache.data
            for (const query in cache.data) {
              cache.delete(query)
            }
            this.$apollo.queries.invoices.refetch()
            this.$apollo.queries.invoicesCount.refetch()
          }
        })
        .then(() => {
          this.$store.dispatch('snackbar/success', 'Deleted')
        })
        .catch(e => {
          this.$store.dispatch('snackbar/error', e.message)
        })
        .finally(() => {
          this.cancelDelete()
        })
    },
    refresh() {
      const cache = this.$apollo.getClient().cache.data
      for (const query in cache.data) {
        cache.delete(query)
      }
      this.$apollo.queries.invoices.refetch()
      this.$apollo.queries.invoicesCount.refetch()
    }
  }
}
</script>

<style></style>
