<template>
  <div>
    <v-menu
      v-model="datePicker"
      :close-on-content-click="false"
      :nudge-right="40"
      transition="scale-transition"
      offset-y
      min-width="290px"
      max-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          :value="displayValue"
          :label="label"
          :disabled="disabled"
          :height="height"
          @input="$emit('input', $event)"
          v-on="on"
          readonly
          hide-details
        ></v-text-field>
      </template>
      <v-date-picker
        :value="monthPickerValue"
        @input="onInput"
        :show-current="false"
        type="month"
      />
    </v-menu>
  </div>
</template>

<script>
import format from 'date-fns/format'

export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Date,
      required: false,
      default: null
    },
    label: {
      type: String,
      required: false,
      default: ''
    },
    height: {
      type: Number,
      default: null
    }
  },

  data() {
    return {
      datePicker: false
    }
  },

  computed: {
    displayValue() {
      return format(this.value, 'MMM yyyy')
    },
    monthPickerValue() {
      return format(this.value, 'yyyy-MM')
    }
  },

  methods: {
    onInput(event) {
      this.datePicker = false
      this.$emit('input', new Date(event))
    }
  }
}
</script>

<style></style>
