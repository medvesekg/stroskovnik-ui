<template>
  <div>
    <v-menu
      v-model="datePicker"
      :close-on-content-click="false"
      :nudge-right="40"
      transition="scale-transition"
      offset-y
      min-width="580px"
      max-width="580px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          :value="displayValue"
          :label="label"
          :disabled="disabled"
          :height="height"
          readonly
          clearable
          hide-details
          @input="$emit('input', $event)"
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker
        style="display:inline-block"
        :value="fromDate"
        :show-current="false"
        :min="min"
        :max="max"
        type="month"
        @input="onInput('from', $event)"
      /><v-date-picker
        style="display:inline-block"
        :value="toDate"
        :show-current="false"
        :min="min"
        :max="max"
        type="month"
        @input="onInput('to', $event)"
      />
    </v-menu>
  </div>
</template>

<script>
import get from 'lodash/get'
import format from 'date-fns/format'

export default {
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
    }
  },

  data() {
    return {
      datePicker: false
    }
  },

  computed: {
    displayValue() {
      if (this.display) return this.display

      let displayValue = ''
      if (this.fromDate) {
        displayValue += this.fromDate + ' - '
      }
      if (this.toDate) {
        displayValue += this.toDate
      }
      return displayValue
    },
    fromDate() {
      const value = get(this.value, 'from')
      return value ? format(value, 'yyyy-MM') : null
    },
    toDate() {
      const value = get(this.value, 'to')
      return value ? format(value, 'yyyy-MM') : null
    },
    maxDate() {
      return 1
    },
    minDate() {
      return 1
    }
  },

  methods: {
    onInput(type, event) {
      const newRange = { ...this.value }
      newRange[type] = new Date(event)
      this.$emit('input', newRange)
    }
  }
}
</script>

<style></style>
