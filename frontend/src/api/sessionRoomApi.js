import {API} from './axiosInstance'

export const createSessionRoom = async (hostUserId, sessionTitle='Untitled session') => {
    
    try {
        const response = await API.post('/sessions/create-session', {
            hostUserId,
            sessionTitle
        })

        return response.data
    } catch (err) {
        console.error("Create Session Error:", err.response?.data || err.message)
        throw err
    }
    
}

export const getSessionRoom = async (sessionId) => {
    try {
        const response = await API.get(`/sessions/get-session/${sessionId}`)
        
        return response.data
    } catch (err) {
        console.error("Get session errror", err.response?.data || err.message)
        throw err
    }
}