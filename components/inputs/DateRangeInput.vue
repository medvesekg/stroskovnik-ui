<template>
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    :nudge-right="40"
    transition="scale-transition"
    offset-y
    min-width="290px"
    max-width="580px"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        :value="displayValue"
        :label="label"
        :disabled="disabled"
        :height="height"
        readonly
        :clearable="clearable"
        hide-details
        @input="$emit('input', { from: null, to: null })"
        v-on="on"
      ></v-text-field>
    </template>
    <app-date-picker
      style="display:inline-block"
      :value="get(value, 'from')"
      :min="min"
      :max="max"
      :type="type"
      @input="onInputFrom"
    /><app-date-picker
      v-if="!single"
      style="display:inline-block"
      :value="get(value, 'to')"
      :min="min"
      :max="max"
      :type="type"
      @input="onInputTo"
    />
  </v-menu>
</template>

<script>
import AppDatePicker from '@/components/app/AppDatePicker'

import get from 'lodash/get'

import format from 'date-fns/format'
import startOfDay from 'date-fns/startOfDay'
import endOfDay from 'date-fns/endOfDay'
import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import startOfYear from 'date-fns/startOfYear'
import endOfYear from 'date-fns/endOfYear'

export default {
  components: { AppDatePicker },

  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      required: false,
      default: () => ({
        from: new Date(),
        to: new Date()
      })
    },
    type: {
      type: String,
      required: false,
      default: 'day',
      validation: v => ['day', 'month', 'year'].includes(v)
    },
    single: {
      type: Boolean,
      required: false,
      default: false
    },

    label: {
      type: String,
      required: false,
      default: ''
    },
    height: {
      type: Number,
      default: null
    },
    max: {
      type: String,
      required: false,
      default: null
    },
    min: {
      type: String,
      required: false,
      default: null
    },
    display: {
      type: String,
      required: false,
      default: undefined
    },
    clearable: {
      type: Boolean,
      required: false,
      default: true
    }
  },

  data() {
    return {
      open: false,

      types: {
        day: {
          pickerType: 'day',
          format: this.$format.date.date,
          from: startOfDay,
          to: endOfDay
        },
        month: {
          pickerType: 'month',
          format: this.$format.date.month,
          from: startOfMonth,
          to: endOfMonth
        },
        year: {
          pickerType: 'year',
          from: startOfYear,
          to: endOfYear
        }
      }
    }
  },

  computed: {
    config() {
      return this.types[this.type]
    },
    displayValue() {
      if (this.display) return this.display

      let displayValue = ''
      if (get(this.value, 'from')) {
        displayValue += this.config.format(this.value.from)
      }
      if (!this.single && (get(this.value, 'from') || get(this.value, 'to'))) {
        displayValue += ' - '
      }

      if (get(this.value, 'to')) {
        displayValue += this.config.format(this.value.to)
      }

      return displayValue
    }
  },

  methods: {
    get,

    onInputFrom(date) {
      const newRange = {
        from: get(this.value, 'from'),
        to: get(this.value, 'to')
      }

      newRange.from = this.config.from(date)

      if (this.single) {
        newRange.to = this.config.to(date)
        this.open = false
      }

      this.$emit('input', newRange)
    },

    onInputTo(date) {
      const newRange = {
        from: get(this.value, 'from'),
        to: get(this.value, 'to')
      }

      newRange.to = this.config.from(date)

      this.$emit('input', newRange)
    }
  }
}
</script>

<style></style>
