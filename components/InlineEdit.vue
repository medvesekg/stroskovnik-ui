<template>
  <component
    :is="component"
    v-bind="$attrs"
    style="font-size: 0.875rem;"
    hide-details
    dense
    v-on="$listeners"
  >
    <slot></slot>
  </component>
</template>

<script>
import DateInput from '@/components/DateInput'
import { VAutocomplete, VTextField } from 'vuetify/lib'

export default {
  components: { DateInput, VAutocomplete, VTextField },

  props: {
    component: {
      type: String,
      required: false,
      default: 'v-text-field'
    }
  }
}
</script>

<style></style>
