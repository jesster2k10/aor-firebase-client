/* globals jest, test, expect, jasmine, debugger */

import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_CHECK } from 'admin-on-rest'
import firebase from 'firebase'

import { AuthClient } from '../src'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000

debugger;

const firebaseConfig = {
  apiKey: 'AIzaSyDboZ_5T7751rHBh7w32oolSlhPGAHM-cA',
  authDomain: 'aor-firestore-client.firebaseapp.com',
  databaseURL: 'https://aor-firestore-client.firebaseio.com',
  projectId: 'aor-firestore-client',
  storageBucket: 'aor-firestore-client.appspot.com',
  messagingSenderId: '10846156586'
}

firebase.initializeApp(firebaseConfig)

test('AuthClient is defined', () => {
  expect(AuthClient).toBeDefined()
})

test('AuthClient from Non Admin Fails', async () => {
  expect.assertions(1)
  try {
    const data = await AuthClient(AUTH_LOGIN, { username: 'is_not_admin@aor-firebase-client.nu', password: 'is_not_admin' })
    expect(false).toBe(true)
  } catch (error) {
    console.error('😭😭😭', error)
  }
})

test('AuthClient from Admin Succedes', async () => {
  const data = await AuthClient(AUTH_LOGIN, { username: 'is_admin@aor-firebase-client.nu', password: 'is_admin' })
  expect(data).toBeDefined()
})