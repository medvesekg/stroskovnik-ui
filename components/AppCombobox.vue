<template>
  <v-combobox
    ref="combobox"
    v-bind="$attrs"
    v-on="$listeners"
    @keydown.enter="enterWasPressed = true"
    @input="onInput"
  />
</template>

<script>
export default {
  data() {
    return {
      enterWasPressed: false
    }
  },
  methods: {
    onInput(e) {
      this.$emit('input', e)

      if (this.enterWasPressed) {
        this.enterWasPressed = false

        this.$emit('enter', { key: 'Enter', type: 'key' })
      }
    },
    focus() {
      this.$refs.combobox.focus()
    },
    blur() {
      this.$refs.combobox.blur()
    }
  }
}
</script>

<style></style>
