<template>
  <v-data-table
    :headers="headers"
    :items="rows"
    :options.sync="options"
    :footer-props="footerProps"
    :server-items-length="invoiceItemsCount"
    :loading="$apollo.loading"
    v-bind="$attrs"
  >
    <template #top>
      <v-dialog v-model="deleteConfirmation.dialog" max-width="800">
        <v-card v-if="deleteConfirmation.item">
          <v-card-text class="headline text-center"
            >Res želiš izbrisati postavko
            <em>{{ deleteConfirmation.item.name }}</em> z računa?</v-card-text
          >
          <v-card-actions>
            <v-spacer />
            <v-btn color="error" @click="confirmDelete">Izbriši</v-btn>
            <v-btn @click="cancelDelete">Zapri</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
    <template #item.name="{ item }">
      <inline-edit v-if="editing[item.id]" v-model="editing[item.id].name" />
      <span v-else>{{ item.name }}</span>
    </template>
    <template #item.category_id="{ item }">
      <inline-edit
        v-if="editing[item.id]"
        v-model="editing[item.id].category_id"
        :items="Object.values(categories)"
        component="v-autocomplete"
        item-text="name"
        item-value="id"
      ></inline-edit>
      <span v-else>{{
        categories[item.category_id] ? categories[item.category_id].name : ''
      }}</span>
    </template>
    <template #item.cost="{ item }">
      <inline-edit v-if="editing[item.id]" v-model="editing[item.id].cost" />
      <span v-else>{{ $format.number.currency(item.cost) }}</span>
    </template>
    <template #item.quantity="{ item }">
      <inline-edit
        v-if="editing[item.id]"
        v-model="editing[item.id].quantity"
      />
      <span v-else>{{ item.quantity }}</span>
    </template>
    <template #item.total="{ item }">
      <span>
        {{ $format.number.currency(item.total) }}
      </span>
    </template>
    <template #item.actions="{ item }">
      <div v-if="!editing[item.id]" style="white-space:nowrap">
        <v-btn x-small rounded color="primary" @click="startEdit(item)">
          <v-icon x-small>edit</v-icon>
        </v-btn>
        <v-btn x-small rounded color="error" @click="startDelete(item)">
          <v-icon x-small>delete</v-icon>
        </v-btn>
      </div>

      <div v-else style="white-space:nowrap">
        <v-btn x-small rounded color="success" @click="confirmEdit(item)">
          <v-icon x-small>check</v-icon>
        </v-btn>
        <v-btn x-small rounded color="default" @click="cancelEdit(item)">
          <v-icon x-small>cancel</v-icon>
        </v-btn>
      </div>
    </template>
  </v-data-table>
</template>

<script>
import gql from 'graphql-tag'
import InlineEdit from '@/components/InlineEdit'
import Categories from '@/queries/Categories'
import keyBy from 'lodash/keyBy'

export default {
  components: { InlineEdit },

  props: {
    hideFooter: {
      type: Boolean,
      required: false,
      default: false
    },
    invoiceItems: {
      type: Array,
      required: false,
      default: undefined
    },
    itemsPerPage: {
      type: Number,
      required: false,
      default: 10
    }
  },

  apollo: {
    invoiceItemsFromServer() {
      return {
        query: gql`
          query InvoiceItems($limit: Int, $offset: Int) {
            invoice_items(
              limit: $limit
              offset: $offset
              order_by: { id: desc }
            ) {
              id
              category_id
              name
              cost
              quantity
              total
            }
          }
        `,
        variables() {
          return {
            limit: this.options.itemsPerPage,
            offset: (this.options.page - 1) * this.options.itemsPerPage
          }
        },
        update: data => data.invoice_items,
        skip: this.invoiceItems
      }
    },
    invoiceItemsFromServerCount() {
      return {
        query: gql`
          query InvoiceItemsCount {
            invoice_items_aggregate {
              aggregate {
                count
              }
            }
          }
        `,
        update: data => data.invoice_items_aggregate.aggregate.count,
        skip: this.invoiceItems
      }
    },
    categories: {
      query: Categories,
      update: data => keyBy(data.categories, 'id')
    }
  },
  data() {
    return {
      headers: [
        {
          text: 'Postavka',
          value: 'name'
        },
        {
          text: 'Kategorija',
          value: 'category_id'
        },
        {
          text: 'Cena',
          value: 'cost'
        },
        {
          text: 'Količina',
          value: 'quantity'
        },

        {
          text: 'Vsota',
          value: 'total'
        },
        {
          text: 'Akcije',
          value: 'actions'
        }
      ],
      options: {
        groupBy: [],
        groupdDesc: [],
        itemsPerPage: this.itemsPerPage,
        multiSort: false,
        mustSort: false,
        page: 1,
        sortBy: [],
        sortDesc: []
      },
      footerProps: {
        itemsPerPageOptions: [10, 20, 50]
      },
      invoiceItemsFromServer: [],
      invoiceItemsFromServerCount: 0,
      categories: [],
      editing: {},
      deleteConfirmation: {
        dialog: false,
        item: null
      }
    }
  },
  computed: {
    rows() {
      return this.invoiceItems || this.invoiceItemsFromServer
    },
    invoiceItemsCount() {
      return this.invoiceItems
        ? this.invoiceItems.length
        : this.invoiceItemsFromServerCount
    }
  },

  methods: {
    startEdit(item) {
      this.$set(this.editing, item.id, { ...item })
    },
    cancelEdit(item) {
      this.$delete(this.editing, item.id)
    },
    confirmEdit(item) {
      const editedItem = this.editing[item.id]
      this.$apollo
        .mutate({
          mutation: gql`
            mutation InvoiceItem(
              $id: Int!
              $cost: numeric
              $name: String
              $quantity: numeric
              $category_id: Int
            ) {
              update_invoice_items_by_pk(
                pk_columns: { id: $id }
                _set: {
                  cost: $cost
                  name: $name
                  quantity: $quantity
                  category_id: $category_id
                }
              ) {
                id
                category_id
                cost
                invoice_id
                name
                quantity
                total
              }
            }
          `,
          variables: {
            id: editedItem.id,
            cost: editedItem.cost,
            name: editedItem.name,
            quantity: editedItem.quantity,
            category_id: editedItem.category_id
          }
        })
        .then(() => {
          this.$store.dispatch('snackbar/success', 'Updated')
          this.$delete(this.editing, item.id)
          this.$emit('update')
        })
        .catch(e => {
          this.$store.dispatch('snackbar/error', e.message)
        })
    },
    startDelete(item) {
      this.deleteConfirmation.dialog = true
      this.deleteConfirmation.item = item
    },
    cancelDelete(item) {
      this.deleteConfirmation.dialog = false
      this.deleteConfirmation.item = null
    },
    confirmDelete() {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation DeleteInvoiceItem($id: Int!) {
              delete_invoice_items_by_pk(id: $id) {
                id
              }
            }
          `,
          variables: {
            id: this.deleteConfirmation.item.id
          },
          update: () => {
            const cache = this.$apollo.getClient().cache.data
            for (const query in cache.data) {
              cache.delete(query)
            }
            if (!this.invoiceItems) {
              this.$apollo.queries.invoiceItemsFromServer.refetch()
              this.$apollo.queries.invoiceItemsFromServerCount.refetch()
              this.$apollo.queries.shops.refetch()
            }
            this.$emit('update')
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
    }
  }
}
</script>

<style></style>
