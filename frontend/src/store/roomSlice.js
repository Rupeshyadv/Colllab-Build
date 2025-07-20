import { createSlice } from "@reduxjs/toolkit";
import {API} from '../api/axiosInstance'

const initialState = {
    rooms: []
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