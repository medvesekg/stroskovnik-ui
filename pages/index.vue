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
              <date-range-input
                v-model="range"
                label="Obdobje"
                type="month"
                single
                :display="displayRange"
                :clearable="false"
              />
            </v-col>
            <v-spacer />
            <v-col class="d-flex align-end justify-end" cols="12" sm="4">
              <v-btn to="/add_expenses" color="secondary" link
                >Dodaj strošek</v-btn
              >
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <customizable-dashboard
                :layout="$store.state.dashboard.main"
                :from="from"
                :to="to"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import DateRangeInput from '@/components/inputs/DateRangeInput'
import CustomizableDashboard from '@/components/CustomizableDashboard'

import startOfMonth from 'date-fns/startOfMonth'

export default {
  name: 'PageDashboard',

  components: {
    DateRangeInput,
    CustomizableDashboard
  },

  apollo: {
    /*
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
    */
  },

  data() {
    return {
      range: {
        from: startOfMonth(new Date()),
        to: new Date()
      }
    }
  },

  computed: {
    now() {
      return new Date()
    },
    from() {
      return this.range.from
    },
    to() {
      return this.range.to
    },
    displayRange() {
      const format = this.$format.date.dateExt
      const range = this.range
      return `${format(range.from)} - ${format(range.to)}`
    }
  }
}
</script>

<style></style>
