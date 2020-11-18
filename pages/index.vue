<template>
  <v-row>
    <v-col>
      <v-card>
        <v-container>
          <v-row>
            <v-col class="d-flex align-center" cols="12" sm="4">
              <span>
                Dobrodošli v stroškovniku
              </span>
            </v-col>
            <v-col class="d-flex align-center" cols="12" sm="4">
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
            <v-col class="d-flex align-end justify-end" cols="12" sm="4">
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
                    <v-col cols="12" sm="6">
                      <expenses-breakdown-chart
                        :from="from"
                        :to="to"
                        type="categories"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <expenses-breakdown-chart
                        :from="from"
                        :to="to"
                        type="shops"
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col sm="12">
                      <most-expensive-items :from="from" :to="to" />
                    </v-col>
                    <v-col sm="6">
                      <most-popular-items :from="from" :to="to" />
                    </v-col>

                    <v-col sm="6">
                      <most-expensive-invoices :from="from" :to="to" />
                    </v-col>
                    <v-col sm="12">
                      <most-popular-shops :from="from" :to="to" />
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
import MonthInput from '@/components/MonthInput'
import ExpensesChart from '@/components/widgets/ExpensesChart'
import ExpensesBreakdownChart from '@/components/widgets/ExpensesBreakdownChart'
import MostExpensiveItems from '@/components/widgets/MostExpensiveItems'
import MostExpensiveInvoices from '@/components/widgets/MostExpensiveInvoices'
import MostPopularShops from '@/components/widgets/MostPopularShops'
import MostPopularItems from '@/components/widgets/FavouriteItems'
import { userDateFormat } from '@/format/date'
import { userCurrencyFormat } from '@/format/currency'
import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import format from 'date-fns/format'
import gql from 'graphql-tag'
import get from 'lodash/get'
import latestDate from 'date-fns/max'
import earliestDate from 'date-fns/min'

export default {
  name: 'PageDashboard',

  components: {
    MonthInput,
    ExpensesChart,
    ExpensesBreakdownChart,
    MostExpensiveItems,
    MostExpensiveInvoices,
    MostPopularItems,
    MostPopularShops
  },

  apollo: {
    minDateInDb: {
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
      update: data => get(data, 'invoices_aggregate.aggregate.min.date')
    },
    maxDateInDb: {
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
      update: data => get(data, 'invoices_aggregate.aggregate.max.date')
    }
  },

  data() {
    return {
      month: new Date()
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
    },
    today() {
      return new Date()
    },
    minDate() {
      const minDate = this.minDateInDb
        ? earliestDate([new Date(this.minDateInDb), this.today])
        : this.today
      return format(minDate, 'yyyy-MM-dd')
    },
    maxDate() {
      const maxDate = this.maxDateInDb
        ? latestDate([new Date(this.maxDateInDb), this.today])
        : this.today
      return format(maxDate, 'yyyy-MM-dd')
    }
  },

  methods: {
    userDateFormat,
    userCurrencyFormat
  }
}
</script>

<style></style>
