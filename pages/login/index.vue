<template>
  <v-layout row justify-center align-center>
    <v-flex sm6>
      <v-card>
        <v-container>
          <v-row>
            <v-card-title class="headline">Prijava</v-card-title>
          </v-row>
          <v-row>
            <v-alert v-if="error" type="error">
              {{ error }}
            </v-alert>
          </v-row>
          <v-row class="justify-center">
            <v-btn @click="googleLogin" :loading="loading" color="primary">
              Prijava z Google računom
            </v-btn>
          </v-row>
        </v-container>
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
    googleLogin() {
      const googleProvider = new firebase.auth.GoogleAuthProvider()

      firebase
        .auth()
        .signInWithPopup(googleProvider)
        .then(event => {
          console.log(event)
          this.error = ''
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
