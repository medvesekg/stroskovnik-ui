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
          <v-alert :value="error" type="error">
            {{ error }}
          </v-alert>
          <v-btn @click="login" color="success">
            Prijava
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
      error: ''
    }
  },

  methods: {
    login() {
      firebase
        .auth()
        .signInWithEmailAndPassword(this.form.email, this.form.password)
        .then(event => {
          this.$store.commit('user/setUser', event.user)
          this.$router.push('/')
        })
        .catch(e => {
          this.error = e.message
        })
    }
  }
}
</script>

<style></style>
