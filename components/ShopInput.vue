<template>
  <app-combobox
    ref="combobox"
    :value="value"
    v-validate="'required'"
    :items="shops"
    :error-messages="errors.collect('shop')"
    @input="emitInput"
    :autofocus="autofocus"
    :return-object="false"
    @enter="$emit('enter')"
    name="shop"
    item-text="name"
    item-value="name"
    label="Trgovina"
    hide-no-data
    auto-select-first
  />
</template>

<script>
import AppCombobox from '@/components/AppCombobox'

export default {
  inject: ['$validator'],

  components: { AppCombobox },

  props: {
    value: {
      type: String,
      default: null
    },
    autofocus: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      enterWasPressed: false
    }
  },

  computed: {
    shops() {
      return this.$store.state.shops.shops
    }
  },

  created() {
    this.getShops()
  },

  methods: {
    blur() {
      this.$refs.combobox.blur()
    },
    emitInput(e) {
      this.$emit('input', e)

      if (this.enterWasPressed) {
        this.enterWasPressed = false

        this.$nextTick(() => {
          this.$emit('keydown', { key: 'Enter', type: 'key' })
        })
      }
    },
    getShops() {
      return this.$store.dispatch('shops/getShops')
    }
  }
}
</script>

<style></style>
