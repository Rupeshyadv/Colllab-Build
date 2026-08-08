import { API } from './axiosInstance.js'

export const loginApi = async (email, username, password) => {

    const formData = {
        email,
        username,
        password
    }

    try {
        const response = await API.post('/users/login', formData)
        return response?.data
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message)
        throw error
    }
}

export const registerApi = async (name = null, username, email, password) => {
    const formData = {
        name,
        username,
        email,
        password
    }

    try {
        const response = await API.post('/users/register', formData)
        return response?.data
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message)
        throw error
    }
}
export const logoutApi = async () => {
    try {
        const response = await API.post('/users/logout')
        return response?.data
    } catch (error) {
        console.error('Logout error:', error.response?.data || error.message)
        throw error
    }
}

export const isUserAuthenticatedApi = async () => {
    try {
        const response = await API.get('/users/auth-check')
        return response?.data
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message)
        throw error
    }
}

export const editUserProfileApi = async (username, profileImg) => {
    const formData = new FormData()
    if (username) formData.append('username', username)
    if (profileImg) formData.append('profileImg', profileImg)

    try {
        const response = await API.put('/users/profile/edit-profile', formData, {
            withCredentials: true,
        })
        return response?.data
    } catch (error) {
        console.error('Edit profile error:', error.response?.data || error.message)
        throw error
    }
}

export const getGoogleOAuthUrlApi = async () => {
    try {
        const response_url = await API.get('/users/auth/google/url')

        return response_url?.data
    } catch (error) {
        console.error('Google OAuth URL error:', error.response?.data || error.message)
        throw error
    }
}