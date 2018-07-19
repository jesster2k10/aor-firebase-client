import '@firebase/firestore'
import firebase from 'firebase'
import Methods from './methods'

import {
  GET_LIST,
  GET_ONE,
  GET_MANY,
  GET_MANY_REFERENCE,
  CREATE,
  UPDATE,
  DELETE
} from './reference'

/**
 * @param {Object[]} options Rest Client configuration options
 * @param {Object} firebaseConfig Options Firebase configuration
 */

const BaseConfiguration = {
  initialQuerytimeout: 10000,
  timestampFieldNames: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  },
  persistance: true
}

export default (firebaseConfig = {}, options = {}) => {
  options = { ...BaseConfiguration, ...options }
  const { timestampFieldNames, trackedResources, initialQuerytimeout } = options

  const resourcesStatus = {}
  const resourcesReferences = {}
  const resourcesData = {}
  const resourcesPaths = {}
  const resourcesUploadFields = {}

  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig)
    firebase.firestore().settings({ timestampsInSnapshots: true })
    if (options.persistance) {
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
    }
  }
  
  /* Functions */
  const upload = options.upload || Methods.upload
  const save = options.save || Methods.save
  const del = options.del || Methods.del
  const getItemID = options.getItemID || Methods.getItemID
  const getOne = options.getOne || Methods.getOne
  const getMany = options.getMany || Methods.getMany

  const firebaseSaveFilter = options.firebaseSaveFilter ? options.firebaseSaveFilter : (data) => data
  const firebaseGetFilter = options.firebaseGetFilter ? options.firebaseGetFilter : (data) => data

  // Sanitize Resources
  trackedResources.map((resource, index) => {
    if (typeof resource === 'string') {
      resource = {
        name: resource,
        path: resource,
        uploadFields: []
      }
      trackedResources[index] = resource
    }

    const { name, path, uploadFields } = resource

    if (!resource.name) {
      throw new Error(`name is missing from resource ${resource}`)
    }
    resourcesUploadFields[name] = uploadFields || []
    resourcesPaths[name] = path || name
    resourcesData[name] = {}
  })

  const initializeResource = ({name, isPublic}, resolve) => {
    let collection = resourcesReferences[name] = firebase.firestore().collection(resourcesPaths[name])
    resourcesData[name] = []

    if (isPublic) {
      subscribeResource(collection, name, resolve)
    } else {
      firebase.auth().onAuthStateChanged(auth => {
        if (auth) {
          subscribeResource(collection, name, resolve)
        }
      })
    }

    setTimeout(resolve, initialQuerytimeout)

    return true
  }

  const subscribeResource = (collection, name, resolve) => {
    collection.onSnapshot(childSnapshot => {
      if (childSnapshot.id === name) {
        const entries = childSnapshot.data() || {}
        console.log(entries)
        Object.keys(entries).map(key => {
          resourcesData[name][key] = firebaseGetFilter(entries[key], name)
        })
        Object.keys(resourcesData[name]).forEach(itemKey => {
          resourcesData[name][itemKey].id = itemKey
          resourcesData[name][itemKey].key = itemKey
        })
        resolve()
      }

      childSnapshot.docChanges().forEach(change => {
        switch (change.type) {
          case 'added':
            resourcesData[name][childSnapshot.id] = firebaseGetFilter(Object.assign({}, {
              id: childSnapshot.id,
              key: childSnapshot.id
            }, childSnapshot.data()), name)
            break
          case 'modified':
            resourcesData[name][childSnapshot.id] = childSnapshot.data()
            break
          case 'removed':
            if (resourcesData[name][childSnapshot.id]) { delete resourcesData[name][childSnapshot.id] }
            break
        }
      })
    })
  }

  trackedResources.map(resource => {
    resourcesStatus[resource.name] = new Promise(resolve => {
      initializeResource(resource, resolve)
    })
  })

  /**
   * @param {string} type Request type, e.g GET_LIST
   * @param {string} resourceName Resource name, e.g. "posts"
   * @param {Object} payload Request parameters. Depends on the request type
   * @returns {Promise} the Promise for a REST response
   */

  return async (type, resourceName, params) => {
    await resourcesStatus[resourceName]
    let result = null
    switch (type) {
      case GET_LIST:
      case GET_MANY:
      case GET_MANY_REFERENCE:
        result = await getMany(params, resourceName, resourcesData[resourceName])
        return result

      case GET_ONE:
        result = await getOne(params, resourceName, resourcesData[resourceName])
        return result

      case DELETE:
        const uploadFields = resourcesUploadFields[resourceName] ? resourcesUploadFields[resourceName] : []
        result = await del(params.id, resourceName, resourcesPaths[resourceName], uploadFields)
        return result

      case UPDATE:
      case CREATE:
        let itemId = getItemID(params, type, resourceName, resourcesPaths[resourceName], resourcesData[resourceName])
        const uploads = resourcesUploadFields[resourceName]
          ? resourcesUploadFields[resourceName]
            .map(field => upload(field, params.data, itemId, resourceName, resourcesPaths[resourceName]))
          : []
        const currentData = resourcesData[resourceName][itemId] || {}
        const uploadResults = await Promise.all(uploads)
        result = await save(itemId, params.data, currentData, resourceName, resourcesPaths[resourceName], firebaseSaveFilter, uploadResults, type === CREATE, timestampFieldNames)
        return result

      default:
        console.error('Undocumented method: ', type)
        return { data: [] }
    }
  }
}
