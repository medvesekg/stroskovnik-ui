<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm12 md6>
      <v-card class="mb-5">
        <v-toolbar class="headline" color="accent"
          ><v-toolbar-title>Dodaj račun</v-toolbar-title></v-toolbar
        >
        <v-card-text>
          <v-form>
            <v-container fluid pa-0>
              <v-row>
                <v-col xs="6" md="3">
                  <date-input v-model="date" label="Datum računa" />
                </v-col>
                <v-col xs="6" md="3">
                  <shop-input
                    ref="shopInput"
                    v-model="shop"
                    v-validate="'required'"
                    :error-messages="errors.collect('shop')"
                    @enter="addShop"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
          <expense-input
            v-for="(item, index) in stagingItems"
            ref="stagingItems"
            :key="item.uuid"
            v-model="stagingItems[index]"
            :delete-disabled="index === 0"
            :shop="shop"
            class="pl-5"
            @remove="removeItem(index)"
            @end="onEnd(index)"
          />

          <v-form>
            <v-container>
              <v-layout>
                <v-flex class="d-flex">
                  <v-btn color="primary" small fab @click="addNewStagingItem">
                    <v-icon>add</v-icon>
                  </v-btn>
                  <div class="ml-auto">
                    Skupaj
                    <span class="headline ml-2">{{ total.toFixed(2) }} €</span>
                  </div>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>

          <v-form>
            <v-container>
              <v-layout>
                <v-flex lg2 offset-lg10 class="text-lg-right text-xs-center">
                  <v-btn color="primary" @click="commit">Potrdi </v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </v-card-text>
      </v-card>
      <v-card>
        <v-card-title>Zadnjih 10 računov</v-card-title>
        <invoices-table
          ref="recentInvoices"
          :order-by="{ created_at: 'desc' }"
          disable-sort
          :limit="10"
          :items-per-page="10"
          hide-default-footer
        />
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import ExpenseInput from '@/components/ExpenseInput.vue'
import DateInput from '@/components/DateInput.vue'
import ShopInput from '@/components/ShopInput.vue'
import { v4 as uuid } from 'uuid'
import InvoicesTable from '@/components/InvoicesTable'
import Shops from '@/queries/Shops'
import keyBy from 'lodash/keyBy'
import gql from 'graphql-tag'

export default {
  $_veeValidate: {
    validator: 'new'
  },

  components: {
    ExpenseInput,
    DateInput,
    ShopInput,
    InvoicesTable
  },

  apollo: {
    shops: {
      query: Shops,
      update: data => keyBy(data.shops, 'name')
    }
  },

  data() {
    return {
      stagingItems: [this.defaultNewItem()],
      date: this.today(),
      shop: null,
      shops: {}
    }
  },

  computed: {
    total() {
      return this.stagingItems.reduce(
        (sum, item) =>
          sum +
          (this.toNumber(item.cost) - this.toNumber(item.discount)) *
            this.toNumber(item.quantity),
        0
      )
    }
  },

  methods: {
    removeItem(index) {
      this.stagingItems.splice(index, 1)
    },

    async commit() {
      const valid = await this.$validator.validateAll()

      if (valid) {
        try {
          const shop =
            this.shops[this.shop] || (await this.createNewShop(this.shop))

          const invoice = await this.createNewInvoice({
            date: this.date,
            shopId: shop.id
          })

          const invoiceItems = await this.commitItems(invoice.id)
          console.log(invoiceItems)

          this.reset()

          this.$validator.reset()

          this.$refs.recentInvoices.refresh()
          this.$store.dispatch('snackbar/success', 'Račun dodan')
        } catch (e) {
          console.error(e)
          this.$store.dispatch('snackbar/error', e.message)
        }
      }
    },

    createNewInvoice({ date, shopId }) {
      return this.$apollo
        .mutate({
          mutation: gql`
            mutation AddInvoice($date: date, $shop_id: Int) {
              insert_invoices_one(object: { date: $date, shop_id: $shop_id }) {
                id
                date
                shop_id
              }
            }
          `,
          variables: {
            date,
            shop_id: shopId
          }
        })
        .then(response => {
          return response.data.insert_invoices_one
        })
    },

    createNewInvoiceItems(invoiceItems) {
      return this.$apollo
        .mutate({
          mutation: gql`
            mutation InsertInvoiceItems(
              $invoice_items: [invoice_items_insert_input!]!
            ) {
              insert_invoice_items(objects: $invoice_items) {
                affected_rows
              }
            }
          `,
          variables: {
            invoice_items: invoiceItems
          }
        })
        .then(response => {
          return response.data.insert_invoice_items
        })
    },

    // Beacuse there is a bug in Hasura preventing inserting more than 1 row to a
    // table with generated columns this functions serves as a workaround untill
    // the bug is fixed
    createNewInvoiceItemsWorkaround(invoiceItems) {
      const newInvoiceItems = []
      for (const invoiceItem of invoiceItems) {
        const newInvoiceItem = this.createNewInvoiceItems([invoiceItem])
        newInvoiceItems.push(newInvoiceItem)
      }
      return newInvoiceItems
    },

    commitItems(invoiceId) {
      const itemsToInsert = this.stagingItems.map(item => {
        return {
          quantity: this.toNumber(item.quantity),
          name: item.name,
          category_id: item.category_id,
          cost: this.toNumber(item.cost) - this.toNumber(item.discount),
          invoice_id: invoiceId
        }
      })

      return this.createNewInvoiceItemsWorkaround(itemsToInsert)
    },

    today() {
      return new Date().toISOString().substr(0, 10)
    },

    defaultNewItem() {
      return {
        uuid: uuid(),
        name: '',
        category_id: null,
        cost: null,
        quantity: null,
        discount: null
      }
    },

    addNewStagingItem() {
      this.stagingItems.push(this.defaultNewItem())
      this.$nextTick(() => {
        this.$refs.stagingItems[this.$refs.stagingItems.length - 1].focus()
      })
    },
    onEnd(i) {
      if (i === this.stagingItems.length - 1) {
        this.addNewStagingItem()
      } else {
        this.$refs.stagingItems[i + 1].focus()
      }
    },
    addShop() {
      this.$refs.shopInput.blur()
      this.$refs.stagingItems[0].focus()
    },
    toNumber(value) {
      if (typeof value === 'string') {
        value = value.replace(',', '.')
      }
      return Number(value)
    },
    reset() {
      this.stagingItems = [this.defaultNewItem()]
      this.shop = null
      this.date = this.today()
    },

    createNewShop(name) {
      return this.$apollo
        .mutate({
          mutation: gql`
            mutation AddShop($name: String) {
              insert_shops_one(object: { name: $name }) {
                name
                id
              }
            }
          `,
          variables: {
            name: name
          },
          update: (store, { data }) => {
            const cached = store.readQuery({ query: Shops })
            cached.shops.push(data.insert_shops_one)
            store.writeQuery({ query: Shops, data: cached })
          }
        })
        .then(response => {
          return response.data.insert_shops_one
        })
    }
  }
}
</script>
