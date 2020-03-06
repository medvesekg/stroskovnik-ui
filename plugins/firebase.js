import firebase from 'firebase/app'

const firebaseConfig = {
  apiKey: 'AIzaSyBo0k27ZQaEM4gla4it_ugCocsP1WWx2T4',
  authDomain: 'stroskovnik-15929.firebaseapp.com',
  databaseURL: 'https://stroskovnik-15929.firebaseio.com',
  projectId: 'stroskovnik-15929',
  storageBucket: 'stroskovnik-15929.appspot.com',
  messagingSenderId: '405005647639',
  appId: '1:405005647639:web:a615439fb9dbf3ea'
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}
