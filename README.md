# aor-firestore-client

An [admin-on-rest](https://github.com/marmelab/admin-on-rest) client for [Firebase Firestore](https://firebase.google.com/docs/firestore/).

[![npm version](https://badge.fury.io/js/aor-firestore-client.svg)](https://badge.fury.io/js/aor-firestore-client)
[![CircleCI](https://circleci.com/gh/sidferreira/aor-firestore-client/tree/master.svg?style=shield)](https://circleci.com/gh/sidferreira/aor-firestore-client/tree/master)
[![CircleCI](https://circleci.com/gh/sidferreira/aor-firestore-client/tree/develop.svg?style=shield)](https://circleci.com/gh/sidferreira/aor-firestore-client/tree/develop)

## Installation

```sh
npm install aor-firestore-client --save

yarn add aor-firestore-client
```

## Difference between [aor-firebase-client](https://github.com/sidferreira/aor-firebase-client)

The only difference between these two is that [aor-firebase-client](https://github.com/sidferreira/aor-firebase-client) relies on [Firebase Realtime Database](https://firebase.google.com/docs/database/)

This library uses [Firebase Cloud Firestore](https://firebase.google.com/docs/firestore/)
The setup is almost identical.

## Usage


### As a parameter of the `<Admin>` component
```js
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'admin-on-rest';
import { RestClient } from 'aor-firestore-client';

const firebaseConfig = {
  apiKey: '<your-api-key>',
  authDomain: '<your-auth-domain>',
  databaseURL: '<your-database-url>',
  storageBucket: '<your-storage-bucket>',
  messagingSenderId: '<your-sender-id>'
};

const clientOptions = {
  timestampFieldNames: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  },
  trackedResources: [{
    name: 'posts', // The name reference to be used in all other places in AOR
    path: 'blog', // The path in the database. If missing will use the name
    public: true,
    uploadFields: [] // The string name of the field
  }, 'contacts'] // A single string assumes path and name as equal, non private and without upload fields
}

const App = () => (
  <Admin restClient={RestClient(trackedResources, clientOptions)} >
    <Resource name="posts" list={PostList} />
    <Resource name="contacts" list={ContactList} />
  </Admin>
);

export default App;
```

### Auth Client
The package lets you manage the login/logout process implementing an optional `authClient` prop of the `Admin` component [(see documentation)](https://marmelab.com/admin-on-rest/Authentication.html).  
It stores a `firebaseToken` in  `localStorage`.
The configuration options available are:

- `userProfilePath`: The database path to user profiles. Defaults to `/users/`. Mind the slashes.

- `userAdminProp`: The database key to point if a user has admin powers. Defaults to `isAdmin`

The final path is: `{userProfilePath}/{uid}/{userAdminProp}`

- `localStorageTokenName`: Local storage identifier to hold the firebase client token, defaults to `aorFirebaseClientToken`

- `handleAuthStateChange`: A way to override the auth process

```js
// in src/App.js
...
import {RestClient, AuthClient} from 'aor-firebase-client';

const firebaseConfig = {
    apiKey: '<your-api-key>',
    authDomain: '<your-auth-domain>',
    databaseURL: '<your-database-url>',
    storageBucket: '<your-storage-bucket>',
    messagingSenderId: '<your-sender-id>'
};

const authConfig = {
    userProfilePath: 'profiles',
    userAdminProp: 'superuser'
}

const App = () => (
    <Admin restClient={RestClient(firebaseConfig)} authClient={AuthClient(authConfig)}>
        <Resource name="posts" list={PostList} />
    </Admin>
);

export default App;
```

**Note:** AuthClient does require using the RestClient in order to initialize firebase. Alternatively, you can opt to not use the RestClient and initialize firebase yourself like this:

```js
import {RestClient, AuthClient} from 'aor-firebase-client';
import firebase from 'firebase';

const firebaseConfig = {
    apiKey: '<your-api-key>',
    authDomain: '<your-auth-domain>',
    databaseURL: '<your-database-url>',
    storageBucket: '<your-storage-bucket>',
    messagingSenderId: '<your-sender-id>'
};

firebase.initializeApp(firebaseConfig);

const App = () => (
    <Admin authClient={AuthClient()}>
        <Resource name="posts" list={PostList} />
    </Admin>
);

export default App;
```

## Changelog

### v0.0.1
  * Update README.md and Package.json

## License

This library is licensed under the [MIT Licence](LICENSE).
