<template>
  <v-row>
    <v-col>
      <v-card>
        <v-card-title>Dobrodošli v stroškovniku</v-card-title>
        <v-container>
          <v-row>
            <v-col>
              <v-card>
                <v-app-bar color="accent">
                  Stroški ta mesec
                  <v-spacer />
                  <v-switch
                    v-model="perDay"
                    :label="perDay ? 'Dnevni stroški' : 'Tekoča vsota'"
                  ></v-switch>
                </v-app-bar>
                <v-container>
                  <v-row>
                    <v-col sm="10">
                      <app-chart :options="chart1" :width="3" :height="1" />
                    </v-col>
                    <v-col sm="2">
                      <v-card>
                        <v-card-title>Skupaj</v-card-title>
                        <v-card-text class="headline">
                          <v-progress-circular
                            v-if="total === null"
                            indeterminate
                          />
                          <span>
                            <span class="error--text text--lighten-1">{{
                              total
                            }}</span>
                            <span class="float-right">€</span>
                          </span>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col sm="4">
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
                    <v-col sm="4">
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
                </v-container>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-card-actions>
          <v-btn to="/add_expenses" color="secondary" link>Dodaj strošek</v-btn>
          <!-- <v-btn to="/incomes" color="primary" link>Dodaj dohodek</v-btn> -->
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import API from '@/api/api'
import invoiceItemsQueries from '@/api/queries/invoice_items'
import AppChart from '@/components/AppChart'
import palette from 'google-palette'

export default {
  components: { AppChart },
  data() {
    return {
      total: null,
      chart1: {},
      chart2: {},
      chart3: {},
      perDay: false
    }
  },

  watch: {
    perDay: {
      immediate: true,
      handler: function(perDay) {
        let query = invoiceItemsQueries.monthlyRunningTotal()
        if (perDay) {
          query = invoiceItemsQueries.expensesByDay()
        }

        API.query(query).then(response => {
          let result = null
          if (perDay) {
            result = response.expenses_by_day
          } else {
            result = response.monthly_running_total
          }
          this.chart1 = this.createLineChart(result)
        })
      }
    }
  },

  created() {
    API.query(invoiceItemsQueries.thisMonthSum()).then(r => {
      this.total = r.monthly_running_total[0].sum || 0
    })
    API.query(invoiceItemsQueries.monthlyCostBreakdown()).then(r => {
      this.chart2 = this.createPieChart(r.monthly_expenses_breakdown)
    })
    API.query(invoiceItemsQueries.monthlyCostBreakdownByShop()).then(r => {
      this.chart3 = this.createPieChart(r.monthly_expenses_breakdown_by_shop)
    })
  },

  methods: {
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
