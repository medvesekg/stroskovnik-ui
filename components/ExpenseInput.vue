<template>
  <v-form>
    <v-container>
      <v-layout row wrap>
        <v-flex xl4 md3 xs12>
          <app-combobox
            ref="nameInput"
            v-model="item.name"
            v-validate="'required'"
            :items="products.map(product => product.name)"
            :error-messages="errors.collect(inputName('name'))"
            :name="inputName('name')"
            :disabled="mode === 'view'"
            :search-input.sync="search"
            @enter="changeFocus('nameInput', 'categoryInput')"
            @input="
              selectProduct($event)
              $emit('input', item)
            "
            data-vv-as="Ime artikla"
            data-lpignore="true"
            label="Ime artikla"
            auto-select-first
          />
        </v-flex>
        <v-flex xl2 md2 xs6>
          <v-autocomplete
            ref="categoryInput"
            v-model="item.category_id"
            v-validate="'required'"
            :items="categories"
            :error-messages="errors.collect(inputName('category'))"
            :name="inputName('category')"
            :disabled="mode === 'view'"
            @keydown.enter="changeFocus('categoryInput', 'subcategoryInput')"
            @input="$emit('input', item)"
            label="Kategorija"
            data-vv-as="Kategorija"
            item-text="name"
            item-value="id"
          >
          </v-autocomplete>
        </v-flex>
        <v-flex xl2 md2 xs6>
          <v-autocomplete
            ref="subcategoryInput"
            v-model="item.subcategory_id"
            v-validate="'required'"
            :items="selectedCategorySubcategories"
            :error-messages="errors.collect(inputName('subcategory'))"
            :name="inputName('subcategory')"
            :disabled="mode === 'view'"
            @keydown.enter="changeFocus('subcategoryInput', 'quantityInput')"
            @input="$emit('input', item)"
            item-text="name"
            item-value="id"
            data-vv-as="Podkategorija"
            label="Podkategorija"
            no-data="Izberite kategorijo"
          >
          </v-autocomplete>
        </v-flex>
        <v-flex xl1 md1 xs6>
          <v-text-field
            ref="quantityInput"
            v-model="item.amount"
            v-validate="'required'"
            :error-messages="errors.collect(inputName('amount'))"
            :name="inputName('amount')"
            :disabled="mode === 'view'"
            @keydown.enter="focusRef('costInput')"
            @input="$emit('input', item)"
            data-vv-as="Količina"
            label="Količina"
          />
        </v-flex>
        <v-flex xl2 md2 xs6>
          <v-text-field
            ref="costInput"
            v-model="item.cost"
            v-validate="'required'"
            :error-messages="errors.collect(inputName('cost'))"
            :name="inputName('cost')"
            :disabled="mode === 'view'"
            @keydown.enter="$emit('end')"
            @input="$emit('input', item)"
            cast-to="number"
            label="Cena skupaj"
            data-vv-as="Cena skupaj"
            prefix="€"
          />
        </v-flex>
        <v-flex xl1 md1 xs12 text-xs-center>
          <v-btn
            v-if="isDeletable"
            @click="$emit('remove')"
            color="error"
            small
            fab
          >
            <v-icon>delete</v-icon>
          </v-btn>
          <v-btn
            v-if="mode === 'view'"
            @click="mode = 'edit'"
            color="warning"
            small
            fab
          >
            <v-icon>edit</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-container>
  </v-form>
</template>
<script>
import API from '@/api/api'
import invoiceItemQueries from '@/api/queries/invoice_items'
import AppCombobox from '@/components/AppCombobox'
import debounce from 'lodash/debounce'

export default {
  inject: ['$validator'],

  components: { AppCombobox },

  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    mode: {
      type: String,
      default: 'edit'
    },
    deleteDisabled: {
      type: Boolean,
      default: false
    },
    autofocus: {
      type: Boolean,
      default: false
    },
    shop: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      datePicker: false,
      search: null,
      products: [],
      item: Object.assign({}, this.value)
    }
  },

  computed: {
    isDeletable() {
      return !this.deleteDisabled
    },
    categories() {
      return this.$store.state.categories.all
    },
    selectedCategory() {
      return this.categories.find(
        category => category.id === this.item.category_id
      )
    },
    selectedCategorySubcategories() {
      return this.selectedCategory ? this.selectedCategory.subcategories : []
    }
  },

  watch: {
    search: {
      handler: debounce(function(q) {
        if (!q) return
        API.query(invoiceItemQueries.search(q)).then(response => {
          this.products = response.invoice_items
        })
      }, 200)
    },
    value: {
      handler: function(item) {
        this.item = Object.assign({}, item)
      }
    }
  },

  created() {
    this.$store.dispatch('categories/getCategories')

    if (this.autofocus) this.focus()
  },

  methods: {
    changeFocus(from, to) {
      this.$nextTick(() => {
        this.blurRef(from)
        this.focusRef(to)
      })
    },
    focusRef(ref) {
      this.$refs[ref].focus()
    },
    blurRef(ref) {
      this.$refs[ref].blur()
    },
    focus() {
      this.$refs.nameInput.focus()
    },
    inputName(name) {
      return name + this.$vnode.key
    },
    selectProduct(name) {
      const product = this.products.find(product => product.name === name)

      if (!product) return
      if (!this.item.category_id) {
        this.item.category_id = product.category_id
        this.$emit('input', this.item)
      }
      if (!this.item.subcategory_id) {
        this.item.subcategory_id = product.subcategory_id
        this.$emit('input', this.item)
      }
      if (!this.item.amount && !this.item.cost && this.shop) {
        API.query(invoiceItemQueries.lastCost(name, this.shop)).then(
          response => {
            if (response.invoice_items.length) {
              this.item.cost = response.invoice_items[0].cost
              this.item.amount = response.invoice_items[0].amount
              this.$emit('input', this.item)
            }
          }
        )
      }
    }
  }
}
</script>
