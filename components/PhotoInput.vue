<template>
  <div>
    <input
      ref="input"
      type="file"
      accept="image/*"
      capture="environment"
      hidden
      @change="upload"
    />
    <v-menu v-if="value" offset-y>
      <template #activator="{ on }">
        <v-btn
          :loading="loading"
          :color="value ? 'success' : 'default'"
          v-on="on"
        >
          <v-icon>add_a_photo</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item :href="value.url" target="_blank">
          Poglej
        </v-list-item>
        <v-list-item @click="$refs.input.click()">
          Zamenjaj
        </v-list-item>
        <v-list-item @click="deletePhoto">
          Izbriši
        </v-list-item>
      </v-list>
    </v-menu>
    <v-btn
      v-else
      :loading="loading"
      :color="value ? 'success' : 'default'"
      @click="$refs.input.click()"
    >
      <v-icon>add_a_photo</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { v4 as uuid } from 'uuid'
import firebase from 'firebase/app'
import 'firebase/storage'

export default {
  props: {
    value: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      loading: false
    }
  },
  methods: {
    upload() {
      this.loading = true
      const input = this.$refs.input
      const file = input.files[0]
      if (file) {
        const fileNameComponents = file.name.split('.')
        const extension = fileNameComponents[fileNameComponents.length - 1]
        const firebaseFileName = `${uuid()}.${extension}`
        const folderRef = firebase
          .storage()
          .ref()
          .child('temp')
        const fileRef = folderRef.child(firebaseFileName)

        fileRef.put(file).then(snapshot => {
          snapshot.ref.getDownloadURL().then(url => {
            this.loading = false
            this.$emit('input', {
              url: url,
              path: snapshot.ref.fullPath
            })
          })
        })
      }
    },
    deletePhoto() {
      this.loading = true
      firebase
        .storage()
        .ref()
        .child(this.value.path)
        .delete()
        .then(() => {
          this.loading = false
          this.$emit('input', null)
        })
    }
  }
}
</script>

<style></style>
