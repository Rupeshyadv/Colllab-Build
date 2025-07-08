import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    rooms: [
        // test data 
        {
        id: '1',
        name: 'React E-commerce Project',
        description: 'Building a modern e-commerce platform with React and Node.js',
        language: 'javascript',
        owner: 'Sarah Johnson',
        },
        {
        id: '2',
        name: 'Python Data Analysis',
        description: 'Analyzing customer data using pandas and matplotlib',
        language: 'python',
        owner: 'Michael Chen',
        },
        {
        id: '4',
        name: 'Algorithm Study Group',
        description: 'Solving LeetCode problems and discussing algorithms',
        language: 'java',
        owner: 'Alex Kim',
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