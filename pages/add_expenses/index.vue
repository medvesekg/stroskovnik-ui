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
                    @enter="addShop"
                    v-validate="'required'"
                    :error-messages="errors.collect('shop')"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
          <expense-input
            ref="stagingItems"
            v-for="(item, index) in stagingItems"
            v-model="stagingItems[index]"
            :key="item.uuid"
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
import { v4 as uuid } from 'uuid'

export default {
  $_veeValidate: {
    validator: 'new'
  },

  components: {
    ExpenseInput,
    DateInput,
    RecentExpense,
    ShopInput
  },

  data() {
    return {
      stagingItems: [this.defaultNewItem(), this.defaultNewItem()],
      recentExpenses: [],
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

  watch: {
    stagingItems: {
      deep: true,
      handler: function(stagingItems) {
        if (process.browser) {
          localStorage.setItem(
            'add_expenses',
            JSON.stringify({
              stagingItems: stagingItems,
              shop: this.shop
            })
          )
        }
      }
    },
    shop: {
      handler: function(shop) {
        if (process.browser) {
          localStorage.setItem(
            'add_expenses',
            JSON.stringify({
              stagingItems: this.stagingItems,
              shop: shop
            })
          )
        }
      }
    }
  },

  created() {
    // this.initialize()
    this.fetchRecentExpenses()
  },

  methods: {
    initialize() {
      let saved = null
      if (process.browser) {
        saved = localStorage.getItem('add_expenses')
      }

      if (saved) {
        try {
          saved = JSON.parse(saved)
          this.shop = saved.shop
          this.stagingItems = saved.stagingItems || [this.defaultNewItem()]
        } catch {
          this.reset()
        }
      }
    },

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

        this.reset()

        this.$validator.reset()
      }
    },

    async createNewInvoice(invoice) {
      const response = await API.query(invoiceQueries.create(invoice))
      return response.insert_invoices.returning[0]
    },

    commitItems(invoiceId) {
      const itemsToInsert = this.stagingItems.map(item => {
        return {
          quantity: this.toNumber(item.quantity),
          name: item.name,
          category_id: item.category_id,
          cost: this.toNumber(item.cost),
          invoice_id: invoiceId
        }
      })

      return API.query(invoiceItemsQueries.createMany(itemsToInsert))
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

    async removeRecentItem(id) {
      await API.query(invoiceItemsQueries.delete(id))
      const index = this.recentExpenses.findIndex(item => item.id === id)
      this.recentExpenses.splice(index, 1)
    },
    async updateRecentItem(item) {
      await API.query(invoiceItemsQueries.update(item.id, item))
      this.fetchRecentExpenses()
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
    }
  }
}
</script>
