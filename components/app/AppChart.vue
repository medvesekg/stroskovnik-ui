<template>
  <canvas ref="chart" :width="width" :height="height"></canvas>
</template>

<script>
import Chart from 'chart.js'
import cloneDeep from 'lodash/cloneDeep'

export default {
  props: {
    options: {
      type: Object,
      required: true
    },
    height: {
      type: Number,
      required: false,
      default: 1
    },
    width: {
      type: Number,
      required: false,
      default: 1
    }
  },
  data() {
    return {
      chart: null,
      localOptions: cloneDeep(this.options)
    }
  },

  watch: {
    options: {
      deep: true,
      handler: function(options) {
        this.localOptions = cloneDeep(this.options)
      }
    },
    localOptions: {
      handler: function(options) {
        if (this.$refs.chart) {
          if (this.chart) {
            this.chart.destroy()
          }
          this.createChart()
        }
      }
    }
  },

  mounted() {
    this.createChart()
  },

  methods: {
    createChart() {
      const ctx = this.$refs.chart.getContext('2d')
      this.chart = new Chart(ctx, this.localOptions)
    }
  }
}
</script>

<style></style>
