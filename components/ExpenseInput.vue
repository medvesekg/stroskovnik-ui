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
            data-vv-as="Ime artikla"
            data-lpignore="true"
            label="Ime artikla"
            auto-select-first
            @enter="changeFocus('nameInput', 'categoryInput')"
            @input="
              selectProduct($event)
              $emit('input', item)
            "
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
            item-text="name"
            item-value="id"
            data-vv-as="Kategorija"
            label="Kategorija"
            no-data="Izberite kategorijo"
            data-lpignore="true"
            clearable
            @keydown.enter="changeFocus('categoryInput', 'costInput')"
            @input="$emit('input', item)"
          >
          </v-autocomplete>
        </v-flex>

        <v-flex xl1 md1 xs6>
          <v-text-field
            ref="costInput"
            v-model="item.cost"
            v-validate="'required'"
            :error-messages="errors.collect(inputName('cost'))"
            :name="inputName('cost')"
            :disabled="mode === 'view'"
            label="Cena"
            data-vv-as="Cena"
            prefix="€"
            data-lpignore="true"
            @keydown.enter="onCostEnter"
            @input="$emit('input', item)"
          />
        </v-flex>
        <v-flex xl1 md1 xs6>
          <v-text-field
            ref="discountInput"
            v-model="item.discount"
            :error-messages="errors.collect(inputName('discount'))"
            :name="inputName('discount')"
            :disabled="mode === 'view'"
            type="text"
            label="Popust"
            data-vv-as="Popust"
            prefix="€"
            data-lpignore="true"
            @keydown.enter="onDiscountEnter"
            @input="$emit('input', item)"
          />
        </v-flex>
        <v-flex xl1 md1 xs6>
          <v-text-field
            ref="quantityInput"
            v-model="item.quantity"
            v-validate="'required'"
            :error-messages="errors.collect(inputName('quantity'))"
            :name="inputName('quantity')"
            :disabled="mode === 'view'"
            data-vv-as="Količina"
            label="Količina"
            data-lpignore="true"
            @keydown.enter="$emit('end')"
            @input="$emit('input', item)"
          />
        </v-flex>

        <v-flex xl1 md1 xs6>
          <v-text-field
            v-model="total"
            :name="inputName('cost_total')"
            :disabled="true"
            label="Cena skupaj"
            prefix="€"
          />
        </v-flex>
        <v-flex xl1 md1 xs12 text-xs-center>
          <v-btn
            v-if="isDeletable"
            color="error"
            small
            fab
            @click="$emit('remove')"
          >
            <v-icon>delete</v-icon>
          </v-btn>
          <v-btn
            v-if="mode === 'view'"
            color="warning"
            small
            fab
            @click="mode = 'edit'"
          >
            <v-icon>edit</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-container>
  </v-form>
</template>
<script>
import AppCombobox from '@/components/app/AppCombobox'
import debounce from 'lodash/debounce'
import Categories from '@/queries/Categories'
import gql from 'graphql-tag'

export default {
  inject: ['$validator'],

  components: { AppCombobox },

  apollo: {
    categories: {
      query: Categories
    },

    products: {
      query: gql`
        query SearchProducts($search: String, $shop_name: String) {
          invoice_items(
            limit: 5
            where: {
              name: { _ilike: $search }
              invoice: { shop: { name: { _eq: $shop_name } } }
            }
          ) {
            name
            category_id
          }
        }
      `,
      variables() {
        return {
          shop_name: this.shop,
          search: `%${this.search}%`
        }
      },
      debounce: 300,
      skip() {
        return !this.shop
      },
      update: data => data.invoice_items
    }
  },

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
      item: Object.assign({}, this.value),
      categories: []
    }
  },

  computed: {
    isDeletable() {
      return !this.deleteDisabled
    },
    total() {
      const quantity = this.toNumber(this.item.quantity)
      const cost = this.toNumber(this.item.cost)
      const discount = this.toNumber(this.item.discount)
      if (isNaN(quantity) || isNaN(cost) || isNaN(discount)) {
        return 0
      }
      return (quantity * (cost - discount)).toFixed(2)
    },
    itemToEmit() {
      return {
        category_id: this.item.category_id,
        name: this.item.name,
        cost: this.item.cost - this.item.discount,
        quantity: this.item.quantity
      }
    }
  },

  watch: {
    value: {
      deep: true,
      handler: function(item) {
        this.item = Object.assign({}, item)
      }
    }
  },

  created() {
    if (this.autofocus) this.focus()
  },

  methods: {
    changeFocus(from, to) {
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.blurRef(from)
          this.focusRef(to)
        })
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
    async selectProduct(name) {
      const product = this.products.find(product => product.name === name)

      if (!product) return
      if (!this.item.category_id) {
        this.item.category_id = product.category_id
      }
      if (!this.item.cost && this.shop) {
        const lastData = await this.getLastData(name, this.shop)
        if (lastData.cost !== null) {
          this.item.cost = lastData.cost
        }
        if (lastData.category_id) {
          this.item.category_id = lastData.category_id
        }
      }
      this.$emit('input', this.item)
    },
    toNumber(value) {
      if (typeof value === 'string') {
        value = value.replace(',', '.')
      }
      return Number(value)
    },
    onCostEnter() {
      this.focusRef('discountInput')
      if (!this.item.discount) {
        this.item.discount = 0
        this.$emit('input', this.item)
      }
      this.$refs.discountInput.$el.querySelector('input').select()
    },
    onDiscountEnter() {
      this.focusRef('quantityInput')
      if (!this.item.quantity) {
        this.item.quantity = 1
        this.$emit('input', this.item)
      }
      this.$refs.quantityInput.$el.querySelector('input').select()
    },
    getLastData(product, shop) {
      return this.$apollo
        .query({
          query: gql`
            query LastData($product_name: String, $shop_name: String) {
              invoice_items(
                limit: 1
                order_by: { invoice: { date: desc_nulls_last } }
                where: {
                  invoice: { shop: { name: { _eq: $shop_name } } }
                  name: { _eq: $product_name }
                }
              ) {
                name
                category_id
                quantity
                cost
              }
            }
          `,
          variables: {
            product_name: product,
            shop_name: shop
          }
        })
        .then(response => {
          return response.data.invoice_items[0]
        })
    }
  }
}
</script>
