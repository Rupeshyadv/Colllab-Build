import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    rooms: []
}

const roomSlice = createSlice({
    name: 'rooms',
    initialState,
    reducers: {
        addRoom: (state, action) => {
            console.log('Adding room:', action.payload);
            state.rooms.push(action.payload)
        },
    }
})

export const { addRoom } = roomSlice.actions
export default roomSlice.reducer