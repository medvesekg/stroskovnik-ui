import firebase from 'firebase/app'

const firebaseConfig = {
  apiKey: process.env.NUXT_ENV_FIREBASE_API_KEY,
  authDomain: process.env.NUXT_ENV_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NUXT_ENV_FIREBASE_DATABASE_URL,
  projectId: process.env.NUXT_ENV_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NUXT_ENV_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NUXT_ENV_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NUXT_ENV_FIREBASE_AP_ID
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}
