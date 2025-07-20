import {configureStore} from '@reduxjs/toolkit';
import authReducer from './authSlice.js'
import roomReducer from './roomSlice.js'
import editorReducer from './editorSlice.js'
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

const editorPersistConfig = {
    key: "editor",
    storage,
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)
const persistedRoomReducer = persistReducer(roomPersistConfig, roomReducer)
const persistedEditorReducer = persistReducer(editorPersistConfig, editorReducer)

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        room: persistedRoomReducer,
        editor: persistedEditorReducer,
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
            }
        })
    
})

export const persistor = persistStore(store)