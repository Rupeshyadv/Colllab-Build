import {configureStore} from '@reduxjs/toolkit';
import authReducer from './authSlice.js'
import roomReducer from './roomSlice.js'
import { 
    persistStore, 
    persistReducer, 
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER
 } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const authPersistConfig = {
    key: "auth",
    storage,
}

const roomPersistConfig = {
    key: "room",
    storage,
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)
const persistedRoomReducer = persistReducer(roomPersistConfig, roomReducer)

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        room: persistedRoomReducer
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
            }
        })
    
})

export const persistor = persistStore(store)