import React from 'react'
import { Admin, Resource, Delete } from 'admin-on-rest'
import { RestClient, AuthClient } from 'aor-firestore-client'

import { PostList, PostEdit, PostCreate } from './Posts'
import { UserList } from './Users'

const firebaseConfig = {
  apiKey: 'AIzaSyDboZ_5T7751rHBh7w32oolSlhPGAHM-cA',
  authDomain: 'aor-firestore-client.firebaseapp.com',
  databaseURL: 'https://aor-firestore-client.firebaseio.com',
  projectId: 'aor-firestore-client',
  storageBucket: 'aor-firestore-client.appspot.com',
  messagingSenderId: '10846156586'
}

const trackedResources = ['posts', 'profiles']

const shouldUseAuth = !(window && window.location && window.location.search && window.location.search === '?security=0')

const App = () => (
  <Admin restClient={RestClient(firebaseConfig, { trackedResources })} authClient={shouldUseAuth ? AuthClient : null} >
    <Resource name='posts' list={PostList} edit={PostEdit} create={PostCreate} remove={Delete} />
    <Resource name='profiles' list={UserList} />
  </Admin>
)

export default App
