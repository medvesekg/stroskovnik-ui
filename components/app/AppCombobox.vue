<template>
  <v-combobox
    ref="combobox"
    v-bind="$attrs"
    v-on="$listeners"
    @keydown.enter="enter"
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
    enter() {
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.$nextTick(() => {
            this.$emit('enter')
          })
        })
      })
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
