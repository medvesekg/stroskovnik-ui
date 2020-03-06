<template>
  <v-menu
    v-model="datePicker"
    :close-on-content-click="false"
    :nudge-right="40"
    transition="scale-transition"
    offset-y
    min-width="290px"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        :value="value"
        :label="label"
        :disabled="disabled"
        :height="height"
        @input="$emit('input', $event)"
        v-on="on"
        readonly
      ></v-text-field>
    </template>
    <v-date-picker :value="value" @input="onInput" />
  </v-menu>
</template>

<script>
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
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
  methods: {
    onInput(event) {
      this.datePicker = false
      this.$emit('input', event)
    }
  }
}
</script>

<style></style>
