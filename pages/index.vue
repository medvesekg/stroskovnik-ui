<template>
  <v-row>
    <v-col>
      <v-card>
        <v-container>
          <v-row>
            <v-col class="d-flex align-center">
              <span>
                Dobrodošli v stroškovniku
              </span>
            </v-col>
            <v-col class="d-flex align-center">
              <month-input
                v-model="month"
                :max="maxDate"
                :min="minDate"
                :display="dateRangeDisplay"
                label="Obdobje"
              />
              <v-btn
                class="align-self-end ml-1"
                title="Poljubno obdobje"
                x-small
              >
                <v-icon small>date_range</v-icon>
              </v-btn>
            </v-col>
            <v-spacer />
            <v-col class="d-flex align-end justify-end">
              <v-btn to="/add_expenses" color="secondary" link
                >Dodaj strošek</v-btn
              >
              <!-- <v-btn to="/incomes" color="primary" link>Dodaj dohodek</v-btn> -->
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <expenses-chart :from="from" :to="to" />
              <v-card>
                <v-container>
                  <v-row>
                    <v-col sm="6">
                      <expenses-breakdown-chart
                        :from="from"
                        :to="to"
                        type="categories"
                      />
                    </v-col>
                    <v-col sm="6">
                      <expenses-breakdown-chart
                        :from="from"
                        :to="to"
                        type="shops"
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col sm="6">
                      <top-items :from="from" :to="to" />
                    </v-col>
                    <v-col sm="6">
                      <v-card>
                        <v-app-bar color="accent"
                          >Najbolj priljubljeni artikli
                          <v-spacer />
                          <v-switch
                            v-model="mostPopularItemsType"
                            :label="
                              mostPopularItemsType ? 'Pogostost' : 'Količina'
                            "
                          ></v-switch>
                        </v-app-bar>
                        <v-simple-table>
                          <thead>
                            <tr>
                              <th>Ime</th>
                              <th>Kupljeno</th>
                              <th>Skupna količina</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="item in mostPopularItems" :key="item.id">
                              <td>{{ item.item_name }}</td>
                              <td>{{ item.times_bought }}x</td>
                              <td>{{ item.total_quantity }}</td>
                            </tr>
                          </tbody>
                        </v-simple-table>
                      </v-card>
                    </v-col>
                    <v-col sm="6">
                      <v-card>
                        <v-app-bar color="accent">Najdražji računi</v-app-bar>
                        <v-simple-table>
                          <thead>
                            <tr>
                              <th>Trgovina</th>
                              <th>Datum</th>
                              <th>Vsota</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="item in mostExpensiveInvoices"
                              :key="item.invoice_id"
                            >
                              <td>{{ item.invoice.shop.name }}</td>
                              <td>{{ userDateFormat(item.invoice.date) }}</td>
                              <td>{{ userCurrencyFormat(item.sum) }}</td>
                            </tr>
                          </tbody>
                        </v-simple-table>
                      </v-card>
                    </v-col>
                    <v-col sm="6">
                      <v-card>
                        <v-app-bar color="accent"
                          >Najpogosteje obiskane trgovine
                          <v-spacer />
                          <v-switch
                            v-model="mostPopularShopsType"
                            :label="
                              mostPopularShopsType
                                ? 'Št. postavk'
                                : 'Št.obiskov'
                            "
                          ></v-switch>
                        </v-app-bar>
                        <v-simple-table>
                          <thead>
                            <tr>
                              <th>Trgovina</th>
                              <th>Št. obiskov</th>
                              <th>Št. postavk</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="shop in mostPopularShops" :key="shop.id">
                              <td>{{ shop.name }}</td>
                              <td>{{ shop.times_visited }}</td>
                              <td>{{ shop.items_bought }}</td>
                            </tr>
                          </tbody>
                        </v-simple-table>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-col>
          </v-row>
          <graphql-table :fields="['id', 'name']" resource="shops" />
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import API from '@/api/api'
import invoiceItemsQueries from '@/api/queries/invoice_items'
import invoiceQueries from '@/api/queries/invoices'
import shopQueries from '@/api/queries/shops'
import MonthInput from '@/components/MonthInput'
import ExpensesChart from '@/components/widgets/ExpensesChart'
import ExpensesBreakdownChart from '@/components/widgets/ExpensesBreakdownChart'
import TopItems from '@/components/widgets/TopItems'
import { userDateFormat } from '@/format/date'
import { userCurrencyFormat } from '@/format/currency'
import GraphqlTable from '@/components/GraphqlTable'
import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import format from 'date-fns/format'
import gql from 'graphql-tag'

export default {
  name: 'PageDashboard',

  components: {
    MonthInput,
    ExpensesChart,
    ExpensesBreakdownChart,
    TopItems,
    GraphqlTable
  },

  apollo: {
    minDate: {
      query: gql`
        query MinDate {
          invoices_aggregate {
            aggregate {
              min {
                date
              }
            }
          }
        }
      `,
      update: data => data.invoices_aggregate.aggregate.min.date
    },
    maxDate: {
      query: gql`
        query MaxDate {
          invoices_aggregate {
            aggregate {
              max {
                date
              }
            }
          }
        }
      `,
      update: data => data.invoices_aggregate.aggregate.max.date
    }
  },

  data() {
    return {
      month: new Date(),
      mostPopularItems: [],
      mostPopularItemsType: false,
      mostExpensiveInvoices: [],
      mostPopularShopsType: false,
      mostPopularShops: []
    }
  },

  computed: {
    from() {
      return format(startOfMonth(this.month), 'MM-dd-yyyy')
    },
    to() {
      return format(endOfMonth(this.month), 'MM-dd-yyyy')
    },
    fromD() {
      return startOfMonth(this.month)
    },
    toD() {
      const now = new Date()
      const monthEnd = endOfMonth(this.month)
      return Math.min(now, monthEnd)
    },
    dateRangeDisplay() {
      const from = format(this.fromD, 'd MMM yyyy')
      const to = format(this.toD, 'd MMM yyyy')

      return `${from} - ${to}`
    }
  },

  watch: {
    mostPopularItemsType() {
      this.refreshMostPopularItems(
        this.mostPopularItemsType ? 'times_bought' : 'total_quantity'
      )
    },
    mostPopularShopsType() {
      this.refreshMostPopularShops(
        this.mostPopularShopsType ? 'times_visited' : 'items_bought'
      )
    },
    month: {
      immediate: true,
      handler: function() {
        this.refreshMostExpensiveInvoices()
        this.refreshMostPopularItems(
          this.mostPopularItemsType ? 'times_bought' : 'total_quantity'
        )
        this.refreshMostPopularShops(
          this.mostPopularShopsType ? 'times_visited' : 'items_bought'
        )
      }
    }
  },

  methods: {
    async getMostPopularItems(month, orderBy) {
      const response = await API.query(
        invoiceItemsQueries.mostPopular(month, orderBy)
      )
      return response.item_popularity
    },

    async refreshMostPopularItems(type) {
      this.mostPopularItems = await this.getMostPopularItems(this.month, type)
    },

    async getMostExpensiveInvoices(from, to) {
      const response = await API.query(invoiceQueries.mostExpensive(from, to))
      return response.invoice_sums
    },

    async refreshMostExpensiveInvoices() {
      const from = format(startOfMonth(this.month), 'MM-dd-yyyy')
      const to = format(endOfMonth(this.month), 'MM-dd-yyyy')
      this.mostExpensiveInvoices = await this.getMostExpensiveInvoices(from, to)
    },

    async getMostPopularShops(month, type) {
      const response = await API.query(shopQueries.mostPopular(month, type))
      return response.shop_popularity
    },

    async refreshMostPopularShops(type) {
      this.mostPopularShops = await this.getMostPopularShops(this.month, type)
    },

    userDateFormat,
    userCurrencyFormat
  }
}
</script>

<style></style>
