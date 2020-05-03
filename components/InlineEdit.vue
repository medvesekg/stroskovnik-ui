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

export default {
  components: { DateInput },

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
