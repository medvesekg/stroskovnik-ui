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
        <v-flex xl1 lg1 xs12>
          <date-input
            v-model="item.invoice.shop.name"
            name="shopInput"
            disabled
            label="Trgovina"
          />
        </v-flex>
        <v-flex xl4 lg3 xs12>
          <v-text-field
            ref="nameInput"
            v-model="item.name"
            :autofocus="autofocus"
            :disabled="!editing"
            @keydown.enter="focusNextInput"
            label="Ime artikla"
          />
        </v-flex>
        <v-flex xl2 lg2 xs12>
          <v-autocomplete
            v-model="item.category_id"
            :items="categories"
            @keydown.native.enter="focusNextInput"
            :disabled="!editing"
            item-text="name"
            item-value="id"
            placeholder="Kategorija"
            label="Kategorija"
          >
          </v-autocomplete>
        </v-flex>

        <v-flex xl1 lg1 xs12>
          <v-text-field
            v-model="item.cost"
            :disabled="!editing"
            @keydown.native.enter="addItem"
            label="Cena"
            prefix="€"
          />
        </v-flex>
        <v-flex xl1 lg1 xs12>
          <v-text-field
            v-model="item.quantity"
            :disabled="!editing"
            @keydown.enter="focusNextInput"
            label="Količina"
          />
        </v-flex>
        <v-flex xl1 lg1 xs12>
          <v-text-field
            v-model="total"
            @keydown.native.enter="addItem"
            disabled
            label="Cena skupaj"
            prefix="€"
          />
        </v-flex>
        <v-flex v-if="!editing" xl1 lg1 xs12 text-xs-center>
          <v-btn @click="editing = true" color="warning" small fab>
            <v-icon>edit</v-icon>
          </v-btn>
        </v-flex>
        <v-flex v-if="editing" xl2 lg1 xs12 text-xs-center>
          <v-btn @click="cancel" color="gray" small fab>
            <v-icon>cancel</v-icon>
          </v-btn>
          <v-btn @click="update" color="success" small fab>
            <v-icon>check</v-icon>
          </v-btn>
          <v-btn @click="remove" color="error" small fab>
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
