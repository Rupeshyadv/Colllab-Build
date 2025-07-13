import { createSlice } from "@reduxjs/toolkit";
import {API} from '../api/axiosInstance'

const initialState = {
    rooms: [
        // test data 
        {
            id: '2',
            title: 'Analyzing customer data using pandas and matplotlib',
            language: 'python',
            host_user: 'Michael Chen',
        },
        {
            id: '4',
            name: 'Algorithm Study Group',
            title: 'Solving LeetCode problems and discussing algorithms',
            language: 'java',
            host: 'Alex Kim',
        }
    ]
}

const roomSlice = createSlice({
    name: 'rooms',
    initialState,
    reducers: {
        addRoom: (state, action) => {
            state.rooms.push(action.payload)
        },
    }
})

export const { addRoom } = roomSlice.actions
export default roomSlice.reducer