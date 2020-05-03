<template>
  <v-form>
    <v-container>
      <v-layout row wrap>
        <v-flex xl1 lg1 xs12>
          <date-input
            v-model="item.invoice.date"
            disabled
            label="Datum računa"
          />
        </v-flex>
        <v-flex xl2 lg2 xs12>
          <date-input
            v-model="item.invoice.shop.name"
            name="shopInput"
            disabled
            label="Trgovina"
          />
        </v-flex>
        <v-flex xl3 lg3 xs12>
          <v-text-field
            ref="nameInput"
            v-model="item.name"
            :autofocus="autofocus"
            :disabled="!editing"
            label="Ime artikla"
            @keydown.enter="focusNextInput"
          />
        </v-flex>
        <v-flex xl2 lg2 xs12>
          <v-autocomplete
            v-model="item.category_id"
            :items="categories"
            :disabled="!editing"
            item-text="name"
            item-value="id"
            placeholder="Kategorija"
            label="Kategorija"
            @keydown.native.enter="focusNextInput"
          >
          </v-autocomplete>
        </v-flex>

        <v-flex xl1 lg1 xs12>
          <v-text-field
            v-model="item.cost"
            :disabled="!editing"
            label="Cena"
            prefix="€"
            @keydown.native.enter="addItem"
          />
        </v-flex>
        <v-flex xl1 lg1 xs12>
          <v-text-field
            v-model="item.quantity"
            :disabled="!editing"
            label="Količina"
            @keydown.enter="focusNextInput"
          />
        </v-flex>
        <v-flex xl1 lg1 xs12>
          <v-text-field
            v-model="total"
            disabled
            label="Cena skupaj"
            prefix="€"
            @keydown.native.enter="addItem"
          />
        </v-flex>
        <v-flex v-if="!editing" xl1 lg1 xs12 text-xs-center>
          <v-btn color="warning" small fab @click="editing = true">
            <v-icon>edit</v-icon>
          </v-btn>
        </v-flex>
        <v-flex v-if="editing" xl2 lg1 xs12 text-xs-center>
          <v-btn color="gray" small fab @click="cancel">
            <v-icon>cancel</v-icon>
          </v-btn>
          <v-btn color="success" small fab @click="update">
            <v-icon>check</v-icon>
          </v-btn>
          <v-btn color="error" small fab @click="remove">
            <v-icon>delete</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-container>
  </v-form>
</template>
<script>
import DateInput from '@/components/DateInput'

export default {
  components: { DateInput },

  props: {
    dataItem: {
      type: Object,
      default: () => ({})
    },
    mode: {
      type: String,
      default: ''
    },
    autofocus: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      editing: false,
      item: Object.assign({}, this.dataItem)
    }
  },

  computed: {
    categories() {
      return this.$store.state.categories.all
    },
    total() {
      return this.toNumber(this.item.cost) * this.toNumber(this.item.quantity)
    }
  },

  watch: {
    dataItem() {
      this.item = Object.assign({}, this.dataItem)
    }
  },

  methods: {
    focus() {
      this.$refs.nameInput.focus()
    },

    focusNextInput(event) {
      const currentInput = event.target
      const inputs = this.$el.querySelectorAll('input')

      const currentInputIndex = Array.from(inputs).findIndex(
        input => input === currentInput
      )

      const nextInput = inputs[currentInputIndex + 1]

      if (nextInput) {
        nextInput.focus()
        nextInput.click()
        currentInput.blur()
      }
    },

    validate() {
      for (const property in this.item) {
        if (!this.item[property]) {
          return false
        }
      }
      return true
    },
    remove() {
      this.editing = false
      this.$emit('remove', this.item.id)
    },
    update() {
      this.editing = false
      this.$emit('update', this.item)
    },
    cancel() {
      this.editing = false
      this.item = Object.assign({}, this.dataItem)
    },
    toNumber(value) {
      if (typeof value === 'string') {
        value = value.replace(',', '.')
      }
      return Number(value)
    }
  }
}
</script>
