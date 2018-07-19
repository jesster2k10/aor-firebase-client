/* globals localStorage */
import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_CHECK } from './reference'
import firebase from 'firebase'

const baseConfig = {
  userProfilePath: '/users/',
  userAdminProp: 'isAdmin',
  localStorageTokenName: 'aorFirebaseClientToken',
  handleAuthStateChange: async (auth, config) => {
    if (auth) {
      const document = await firebase.firestore().collection(config.userProfilePath).doc(auth.uid).get()
      const profile = document.data()

      if (profile && profile[config.userAdminProp]) {
        const firebaseToken = auth.getIdToken()
        let user = { auth, profile, firebaseToken }
        localStorage.setItem(config.localStorageTokenName, firebaseToken)
        return user
      } else {
        firebase.auth().signOut()
        localStorage.removeItem(config.localStorageTokenName)
        throw new Error('sign_in_error')
      }
    } else {
      localStorage.removeItem(config.localStorageTokenName)
      throw new Error('sign_in_error')
    }
  }
}

export default (config = {}) => {
  config = {...baseConfig, ...config}

  const firebaseLoaded = () => new Promise(resolve => {
    firebase.auth().onAuthStateChanged(resolve)
  })

  return async (type, params) => {
    if (type === AUTH_LOGOUT) {
      config.handleAuthStateChange(null, config).catch(() => { })
      return firebase.auth().signOut()
    }

    if (firebase.auth().currentUser) {
      await firebase.auth().currentUser.reload()
    }

    if (type === AUTH_CHECK) {
      await firebaseLoaded()

      if (!firebase.auth().currentUser) {
        throw new Error('sign_in_error')
      }

      return true
    }

    if (type === AUTH_LOGIN) {
      const { username, password, alreadySignedIn } = params
      let auth = firebase.auth().currentUser

      if (!auth || !alreadySignedIn) {
        auth = await firebase.auth().signInWithEmailAndPassword(username, password)
      }

      return config.handleAuthStateChange(auth, config)
    }

    return false
  }
}
