<template>
  <v-app dark>
    <v-snackbar
      :value="$store.state.snackbar.message"
      :color="$store.state.snackbar.color"
      :timeout="3000"
      @input="!$event && $store.dispatch('snackbar/reset')"
      top
      right
    >
      {{ $store.state.snackbar.message }}
    </v-snackbar>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          exact
          link
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" app fixed>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-menu v-if="$store.state.user.email" open-on-hover bottom offset-y>
        <template #activator="{on}">
          <div v-on="on">
            {{ $store.state.user.email }}
          </div>
        </template>
        <v-list>
          <v-list-item @click="logout">
            <v-list-item-title>Odjava</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
    <v-footer :fixed="fixed" app> </v-footer>
  </v-app>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/auth'

export default {
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'home',
          title: 'Domov',
          to: '/'
        },
        {
          icon: 'note_add',
          title: 'Dodaj strošek',
          to: '/add_expenses'
        },
        {
          icon: 'attach_money',
          title: 'Stroški',
          to: '/invoice_items'
        },
        {
          icon: 'note',
          title: 'Računi',
          to: '/invoices'
        },
        {
          icon: 'store',
          title: 'Trgovine',
          to: '/shops'
        },
        {
          icon: 'category',
          title: 'Kategorije',
          to: '/categories'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Stroškovnik'
    }
  },
  created() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        user.getIdTokenResult().then(token => {
          // console.log(token)
        })
        this.$store.commit('user/setUser', user)
      } else {
        this.$store.commit('user/resetUser')
      }
    })
  },
  methods: {
    logout() {
      firebase.auth().signOut()
    }
  }
}
</script>
