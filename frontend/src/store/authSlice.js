import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userData: null,
    isAuthenticated: false,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            state.userData = action.payload
            state.isAuthenticated = true
        },
        register: (state, action) => {
            state.userData = action.payload
            state.isAuthenticated = false
        },
        logout: (state) => {
            state.userData = null
            state.isAuthenticated = false
        },
        updateUserData: (state, action) => {
            state.userData = action.payload
        }
    }
})

export const { login, register, logout, updateUserData } = authSlice.actions
export default authSlice.reducer