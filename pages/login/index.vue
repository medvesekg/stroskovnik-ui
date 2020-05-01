<template>
  <v-layout row justify-center align-center>
    <v-flex sm6>
      <v-card>
        <v-card-title class="headline">Prijava</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="form.email"
              label="Email"
              required
            ></v-text-field>
            <v-text-field
              v-model="form.password"
              label="Password"
              type="password"
              required
            ></v-text-field>
          </v-form>
          <v-alert v-if="error" type="error">
            {{ error }}
          </v-alert>
          <v-btn @click="login" :loading="loading" color="primary">
            Prijava
          </v-btn>
          <v-btn
            @click="googleLogin"
            :loading="loading"
            class="float-right"
            color="primary"
          >
            Prijava z Google računom
          </v-btn>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/auth'

export default {
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      error: '',
      loading: false
    }
  },

  methods: {
    login() {
      this.loading = true
      firebase
        .auth()
        .signInWithEmailAndPassword(this.form.email, this.form.password)
        .then(event => {
          this.error = ''
          // this.$store.commit('user/setUser', event.user) // In default.vue
          // this.$router.push('/')
        })
        .catch(e => {
          this.error = e.message
        })
        .finally(() => {
          this.loading = false
        })
    },
    googleLogin() {
      const googleProvider = new firebase.auth.GoogleAuthProvider()

      firebase
        .auth()
        .signInWithPopup(googleProvider)
        .then(event => {
          this.error = ''
          // this.$store.commit('user/setUser', event.user) // In auth observer in default.vue
          // this.$router.push('/')
        })
        .catch(e => {
          this.error = e.message
        })
    }
  }
}
</script>

<style></style>
