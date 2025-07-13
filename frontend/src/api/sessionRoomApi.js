import {API} from './axiosInstance'

export const createSessionRoom = async (hostUserId, title='Untitled session', language) => {
    
    try {
        const response = await API.post('/sessions/create-session', {
            hostUserId,
            title,
            language
        })

        return response.data
    } catch (err) {
        console.error("Create Session Error:", err.response?.data || err.message)
        throw err
    }
    
}

export const getSessionRooms = async () => {
    try {
        const response = await API.get('/sessions/get-sessions')
        
        return response.data
    } catch (err) {
        console.error("Get session errror", err.response?.data || err.message)
        throw err
    }
}