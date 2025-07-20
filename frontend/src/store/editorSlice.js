import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    roomCodes: {},      //roomid: code
}

const editorSlice = createSlice({
    name: 'editor',
    initialState,
    reducers: {
        setEditorCode: (state, action) => {
            const { roomId, code } = action.payload
            state.roomCodes[roomId] = code
        },
    }
})

export const { setEditorCode } = editorSlice.actions
export default editorSlice.reducer