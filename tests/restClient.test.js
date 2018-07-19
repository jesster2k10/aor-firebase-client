/* globals jest, test, expect, jasmine, debugger, describe */
import {
  GET_LIST,
  GET_ONE,
} from 'admin-on-rest'

import firebase from 'firebase'

import { RestClient } from '../src'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000

debugger;

process.on('unhandledRejection', (reason) => {
  console.log('Reason: ' + reason)
})

const firebaseConfig = {
  apiKey: 'AIzaSyDboZ_5T7751rHBh7w32oolSlhPGAHM-cA',
  authDomain: 'aor-firestore-client.firebaseapp.com',
  databaseURL: 'https://aor-firestore-client.firebaseio.com',
  projectId: 'aor-firestore-client',
  storageBucket: 'aor-firestore-client.appspot.com',
  messagingSenderId: '10846156586'
}

const client = RestClient(firebaseConfig, {
  trackedResources: ['posts', 'profiles'],
  persistance: false
})

test('RestClient is defined', () => {
  expect(RestClient).toBeDefined()
})

test('RestClient Get Posts', () => {
  client(GET_LIST, 'posts', {}).then(data => {
    expect(data).toBeDefined()
    expect(data.length).toBeDefined()
    expect(data.length).toBeGreaterThan(1)
  })
})

test('RestClient Get Posts From User 1', () => {
  client(GET_LIST, 'posts', { filters: { userId: 1 } }).then(data => {
    expect(data).toBeDefined()
    expect(data.length).toBeDefined()
    expect(data.length).toBe(10)
  })
})

test('RestClient Get Posts With Text', () => {
  client(GET_LIST, 'posts', { filters: { q: 'vero' } }).then(data => {
    expect(data).toBeDefined()
    expect(data.length).toBeDefined()
    expect(data.length).toBe(10)
  })
})

test('RestClient Get Posts With Impossible Text', () => {
  client(GET_LIST, 'posts', { filters: { q: 'thisisaveryimpossibletext' } }).then(data => {
    expect(data).toBeDefined()
    expect(data.length).toBe(0)
  })
})

describe('RestClient trackedResources', () => {
  test('rejects objects without a name', () => {
    expect(() => {
      RestClient(firebaseConfig, {
        trackedResources: [{notName: 'posts'}],
        persistance: false
      })
    }).toThrow()
  })
  test('accepts objects with a name', async () => {
    const client = RestClient(firebaseConfig, {
      trackedResources: [{name: 'posts'}],
      persistance: false
    })
    const data = await client(GET_ONE, 'posts', { id: '9R4MhlWOkmCjq5ImqE3e' })
    expect(data).toBeDefined()
    expect(data.data).toBeDefined()
    expect(data.data.id).toBe('1')
  })
  // test.only('accepts objects with a name and path', async () => {
  //   const client = RestClient(firebaseConfig, {
  //     trackedResources: [{name: 'posts', path: '/posts'}],
  //     persistance: false
  //   })
  //   const data = await client(GET_ONE, 'posts', { id: 1 })
  //   expect(data).toBeDefined()
  //   expect(data.data).toBeDefined()
  //   expect(data.data.id).toBe('1')
  // })
  // test('rejects paths that do not end with the name', () => {
  //   expect(() => {
  //     RestClient(firebaseConfig, {
  //       trackedResources: [{name: 'posts', path: 'path/to/not_posts'}],
  //       persistance: false
  //     })
  //   }).toThrow()
  // })
})
