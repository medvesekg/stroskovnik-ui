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
            <v-col>
              <month-input v-model="month" class="mr-10" label="Mesec" />
            </v-col>
            <v-spacer />
            <v-col class="d-flex align-center justify-end">
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
                      <v-card>
                        <v-app-bar color="accent">
                          Stroški po kategorijah
                        </v-app-bar>
                        <v-container>
                          <v-row>
                            <v-col>
                              <app-chart
                                :options="chart2"
                                :width="1"
                                :height="1"
                              />
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-card>
                    </v-col>
                    <v-col sm="6">
                      <v-card>
                        <v-app-bar color="accent">
                          Stroški po trgovinah
                        </v-app-bar>
                        <v-container>
                          <v-row>
                            <v-col>
                              <app-chart
                                :options="chart3"
                                :width="1"
                                :height="1"
                              />
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-card>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col sm="6">
                      <v-card>
                        <v-app-bar color="accent">Najdražji artikli</v-app-bar>
                        <v-simple-table>
                          <thead>
                            <tr>
                              <th>Ime</th>
                              <th>Trgovina</th>
                              <th>Cena</th>
                              <th>Datum</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="item in mostExpensiveItems"
                              :key="item.id"
                            >
                              <td>{{ item.name }}</td>
                              <td>{{ item.invoice.shop.name }}</td>
                              <td>{{ item.cost }} €</td>
                              <td>{{ item.invoice.date }}</td>
                            </tr>
                          </tbody>
                        </v-simple-table>
                      </v-card>
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
                              <td>{{ item.invoice.date }}</td>
                              <td>{{ item.sum }} €</td>
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
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import API from '@/api/api'
import monthlyRunningTotalQueries from '@/api/queries/monthly_running_total'
import expensesByDayQueries from '@/api/queries/expenses_by_day'
import monthlyExpensesBreakdownQueries from '@/api/queries/monthly_expenses_breakdown'
import invoiceItemsQueries from '@/api/queries/invoice_items'
import invoiceQueries from '@/api/queries/invoices'
import shopQueries from '@/api/queries/shops'
import AppChart from '@/components/AppChart'
import MonthInput from '@/components/MonthInput'
import ExpensesChart from '@/components/widgets/ExpensesChart'
import palette from 'google-palette'
import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import format from 'date-fns/format'

export default {
  name: 'PageDashboard',

  components: {
    AppChart,
    MonthInput,
    ExpensesChart
  },

  data() {
    return {
      chart1: {},
      chart2: {},
      chart3: {},
      perDay: false,
      month: new Date(),
      mostExpensiveItems: [],
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
    }
  },

  watch: {
    perDay: {
      handler: function(perDay) {
        if (perDay) {
          this.refreshExpensesByDayChart()
        } else {
          this.refreshMonthlyRunningTotalChart()
        }
      }
    },
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
        this.refreshMonthlyExpensesBreakdownByCategoryChart()
        this.refreshMonthlyExpensesBreakdownByShopChart()
        this.refreshMostExpensiveItems()
        this.refreshMostExpensiveInvoices()
        this.refreshMostPopularItems(
          this.mostPopularItemsType ? 'times_bought' : 'total_quantity'
        )
        this.refreshMostPopularShops(
          this.mostPopularShopsType ? 'times_visited' : 'items_bought'
        )
        if (this.perDay) {
          this.refreshExpensesByDayChart()
        } else {
          this.refreshMonthlyRunningTotalChart()
        }
      }
    }
  },

  methods: {
    async getMonthlyRunningTotal(month) {
      const response = await API.query(
        monthlyRunningTotalQueries.forMonth(month)
      )
      return response.monthly_running_total
    },

    async refreshMonthlyRunningTotalChart() {
      const data = await this.getMonthlyRunningTotal(this.month)
      this.chart1 = this.createLineChart(data)
    },

    async getExpensesByDay(month) {
      const response = await API.query(expensesByDayQueries.forMonth(month))
      return response.expenses_by_day
    },

    async refreshExpensesByDayChart() {
      const data = await this.getExpensesByDay(this.month)
      this.chart1 = this.createLineChart(data)
    },

    async getMonthlyExpensesBreakdownByCategory(month) {
      const response = await API.query(
        monthlyExpensesBreakdownQueries.byCategory(month)
      )
      return response.monthly_expenses_breakdown_by_category
    },

    async refreshMonthlyExpensesBreakdownByCategoryChart() {
      const data = await this.getMonthlyExpensesBreakdownByCategory(this.month)
      this.chart2 = this.createPieChart(data)
    },

    async getMonthlyExpensesBreakdownByShop(month) {
      const response = await API.query(
        monthlyExpensesBreakdownQueries.byShop(month)
      )
      return response.monthly_expenses_breakdown_by_shop
    },

    async refreshMonthlyExpensesBreakdownByShopChart(month) {
      const data = await this.getMonthlyExpensesBreakdownByShop(this.month)
      this.chart3 = this.createPieChart(data)
    },

    async getMostExpensiveItems(from, to) {
      const response = await API.query(
        invoiceItemsQueries.mostExpensive(from, to)
      )
      return response.invoice_items
    },

    async refreshMostExpensiveItems() {
      const from = format(startOfMonth(this.month), 'MM-dd-yyyy')
      const to = format(endOfMonth(this.month), 'MM-dd-yyyy')
      this.mostExpensiveItems = await this.getMostExpensiveItems(from, to)
    },

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

    createLineChart(data) {
      return {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Stroški',
              data: data.map(data => data.sum),
              fill: false,
              borderColor: this.$vuetify.theme.themes.dark.error,
              backgroundColor: this.$vuetify.theme.themes.dark.error
            }
          ],
          labels: data.map(data => data.date)
        },
        options: {
          tooltips: {
            callbacks: {
              label: ({ value }) => value + ' €'
            }
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  callback: val => val + ' €'
                }
              }
            ]
          }
        }
      }
    },
    createPieChart(data) {
      return {
        type: 'pie',
        data: {
          datasets: [
            {
              data: data.map(data => data.sum),
              backgroundColor: palette('mpn65', 65).map(color => '#' + color)
            }
          ],
          labels: data.map(data => data.name)
        },
        options: {
          tooltips: {
            callbacks: {
              label: (item, data) => {
                const value = data.datasets[item.datasetIndex].data[item.index]
                const label = data.labels[item.index]
                return `${label}: ${value} €`
              }
            }
          }
        }
      }
    }
  }
}
</script>

<style></style>
