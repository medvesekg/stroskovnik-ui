<template>
  <v-app dark>
    <v-snackbar
      :value="$store.state.snackbar.message"
      :color="$store.state.snackbar.color"
      :timeout="3000"
      top
      right
      @input="!$event && $store.dispatch('snackbar/reset')"
    >
      {{ $store.state.snackbar.message }}
    </v-snackbar>
    <v-navigation-drawer
      v-if="$store.state.auth.user.email"
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
      <v-app-bar-nav-icon
        v-if="$store.state.auth.user.email"
        @click="drawer = !drawer"
      />
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-menu v-if="$store.state.auth.user.email" open-on-hover bottom offset-y>
        <template #activator="{on}">
          <div v-on="on">
            <v-icon class="account-icon">account_circle</v-icon>
            <span class="account-email">{{
              $store.state.auth.user.email
            }}</span>
          </div>
        </template>
        <v-list>
          <v-list-item class="account-email-list-item">
            <v-list-item-title>
              {{ $store.state.auth.user.email }}
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-title>Odjava</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-footer :fixed="fixed" app> </v-footer>
  </v-app>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

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
        },
        {
          icon: 'shopping_cart',
          title: 'Izdelki',
          to: '/products'
        },
        {
          icon: 'analytics',
          title: 'Analiza',
          to: '/analyze'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Gnar'
    }
  },
  created() {
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        let token = await user.getIdToken()
        let idTokenResult = await user.getIdTokenResult()
        let hasuraClaim = idTokenResult.claims['https://hasura.io/jwt/claims']
        this.$store.commit('auth/SET_USER', user)

        if (hasuraClaim) {
          this.$store.commit('auth/SET_TOKEN', token)
          this.$store.commit(
            'auth/SET_ROLE',
            hasuraClaim['x-hasura-default-role']
          )
          this.$apolloHelpers.onLogin(token)
          if (this.$route.query.intended) {
            this.$router.push(this.$route.query.intended || '/')
          }
        } else {
          const metadataRef = firebase
            .database()
            .ref(`metadata/${user.uid}/refreshTime`)

          metadataRef.on('value', async data => {
            if (!data.exists) return
            token = await user.getIdToken(true)
            idTokenResult = await user.getIdTokenResult()
            hasuraClaim =
              idTokenResult.claims['https://hasura.io/jwt/claims'] || {}
            this.$store.commit('auth/SET_TOKEN', token)
            this.$store.commit(
              'auth/SET_ROLE',
              hasuraClaim['x-hasura-default-role']
            )
            this.$apolloHelpers.onLogin(token)
          })
        }
      } else {
        this.$store.dispatch('auth/logout')
      }
    })
  },
  methods: {
    logout() {
      firebase.auth().signOut()
      this.$apolloHelpers.onLogout()
      this.$router.push('/login')
    }
  },
  head() {
    return {
      title: this.title
    }
  }
}
</script>
<style scoped>
@media (min-width: 600px) {
  .account-icon {
    display: none;
  }
  .account-email-list-item {
    display: none;
  }
}

@media (max-width: 600px) {
  .account-email {
    display: none;
  }
}
</style>
