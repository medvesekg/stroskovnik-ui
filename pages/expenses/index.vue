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
                    @keydown.enter="addShop"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
          <expense-input
            ref="stagingItems"
            v-for="(item, index) in stagingItems"
            v-model="stagingItems[index]"
            :key="index"
            :delete-disabled="index === 0"
            :shop="shop"
            @remove="removeItem(index)"
            @end="onEnd(index)"
            class="pl-5"
          />

          <v-form>
            <v-container>
              <v-layout>
                <v-flex class="d-flex">
                  <v-btn @click="addNewStagingItem" color="primary" small fab>
                    <v-icon>add</v-icon>
                  </v-btn>
                  <div class="ml-auto">
                    Skupaj <span class="headline ml-2">{{ total }} €</span>
                  </div>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>

          <v-form>
            <v-container>
              <v-layout>
                <v-flex lg2 offset-lg10 class="text-lg-right text-xs-center">
                  <v-btn @click="commit" color="primary">Potrdi </v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </v-card-text>
      </v-card>
      <v-card>
        <v-toolbar color="accent">
          <v-toolbar-title class="headline">Zadnji stroški</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <recent-expense
            v-for="(item, index) in recentExpenses"
            :key="index"
            :data-item="item"
            @remove="removeRecentItem"
            @update="updateRecentItem"
          />
        </v-card-text>
        <v-card-actions> </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import ExpenseInput from '@/components/ExpenseInput.vue'
import DateInput from '@/components/DateInput.vue'
import RecentExpense from '@/components/RecentExpense.vue'
import ShopInput from '@/components/ShopInput.vue'
import API from '@/api/api'
import invoiceItemsQueries from '@/api/queries/invoice_items'
import invoiceQueries from '@/api/queries/invoices'

export default {
  components: {
    ExpenseInput,
    DateInput,
    RecentExpense,
    ShopInput
  },

  data() {
    return {
      stagingItems: [this.defaultNewItem()],
      recentExpenses: [],
      graphQLEndpoint:
        'https://stroskovnik-graphql.herokuapp.com/v1alpha1/graphql',
      date: this.today(),
      shop: null
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

  created() {
    this.fetchRecentExpenses()
  },

  methods: {
    fetchRecentExpenses() {
      return API.query(invoiceItemsQueries.recent(10)).then(response => {
        this.recentExpenses = response.invoice_items
      })
    },

    removeItem(index) {
      this.stagingItems.splice(index, 1)
    },

    async commit() {
      const valid = await this.$validator.validateAll()

      if (valid) {
        const shop = await this.$store.dispatch(
          'shops/firstOrCreate',
          this.shop
        )

        const invoice = await this.createNewInvoice({
          date: this.date,
          shop_id: shop.id
        })

        await this.commitItems(invoice.id)

        this.fetchRecentExpenses()

        this.stagingItems = [this.defaultNewItem()]

        this.$validator.reset()
      }
    },

    async createNewInvoice(invoice) {
      const response = await API.query(invoiceQueries.create(invoice))
      return response.insert_invoices.returning[0]
    },

    commitItems(invoiceId) {
      return new Promise((resolve, reject) => {
        const itemsToAdd = this.stagingItems.map(item => {
          const cost = this.toNumber(item.cost) - this.toNumber(item.discount)

          return `{
            quantity: ${item.quantity}, 
            name: "${item.name}", 
            category_id: ${item.category_id}, 
            cost: ${cost},
            invoice_id: ${invoiceId},
          }`
        })

        const gql = {
          query: `mutation {
            insert_invoice_items(objects: [${itemsToAdd.join(',')}]) {
              affected_rows
            }
          }`
        }

        this.$axios
          .post(this.graphQLEndpoint, gql)
          .then(response => {
            resolve(response)
          })
          .catch(e => {
            reject(e)
          })
      })
    },

    today() {
      return new Date().toISOString().substr(0, 10)
    },

    defaultNewItem() {
      return {
        name: '',
        category_id: null,
        cost: null,
        quantity: null,
        discount: null
      }
    },

    removeRecentItem(id) {
      const gql = {
        query: `mutation {
          delete_invoice_items(where: {id: {_eq: ${id}}}) {
            affected_rows
          }
        }`
      }
      this.$axios.post(this.graphQLEndpoint, gql).then(() => {
        this.fetchRecentExpenses()
      })
    },
    updateRecentItem(item) {
      const gql = {
        query: `mutation {
          update_invoice_items(where: {id: {_eq: ${item.id}}},
             _set: {
               quantity: ${item.quantity}, 
               category_id: ${item.category_id}, 
               cost: ${item.cost}, 
               name: "${item.name}", 
               }) {
            affected_rows
          }
        }`
      }
      this.$axios.post(this.graphQLEndpoint, gql).then(() => {
        this.fetchRecentExpenses()
      })
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
    }
  },
  $_veeValidate: {
    validator: 'new'
  }
}
</script>
