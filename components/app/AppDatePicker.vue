<template>
  <v-date-picker
    :value="adaptIn(value)"
    :min="adaptIn(min)"
    :max="adaptIn(max)"
    :show-current="false"
    :type="adapter.pickerType"
    locale="sl-SL"
    v-bind="$attrs"
    v-on="passThruListeners"
    @input="$emit('input', adaptOut($event))"
  />
</template>

<script>
import format from 'date-fns/format'
import parse from 'date-fns/parse'

export default {
  props: {
    value: {
      type: Date,
      required: false,
      default: null
    },
    type: {
      type: String,
      required: false,
      default: 'day',
      validation: v => ['day', 'month', 'year'].includes(v)
    },
    min: {
      type: Date,
      required: false,
      default: null
    },
    max: {
      type: Date,
      required: false,
      default: null
    }
  },

  data() {
    return {
      adapters: {
        day: {
          in: date => this.$format.date.pickerDate(date),
          out: date => this.$parse.date.pickerDate(date),
          pickerType: 'date'
        },
        month: {
          in: date => this.$format.date.pickerMonth(date),
          out: date => this.$parse.date.pickerMonth(date),
          pickerType: 'month'
        },
        year: {
          in: date => this.$format.date.pickerYear(date),
          out: date => this.$parse.date.pickerYear(date),
          pickerType: 'year'
        }
      }
    }
  },

  computed: {
    adapter() {
      return this.adapters[this.type]
    },
    passThruListeners() {
      const listeners = Object.assign({}, this.$listeners)
      delete listeners.input
      return listeners
    }
  },

  methods: {
    adaptIn(value) {
      if (!value) {
        return null
      }
      return this.adapter.in(value)
    },
    adaptOut(value) {
      if (!value) {
        return null
      }
      return this.adapter.out(value)
    }
  }
}
</script>

<style></style>
