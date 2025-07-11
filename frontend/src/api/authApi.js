import {API} from './axiosInstance.js'

export const loginApi = async (email, password) => {

    const formData = {
        email,
        password
    }

    try {
        const response = await API.post('/users/login', formData)
        return response?.data
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
    }
}

export const registerApi = async (name=null, email, password) => {
    const formData = {
        name,
        email,
        password
    }

    try {
        const response = await API.post('/users/register', formData)
        return response.data
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
    }
}