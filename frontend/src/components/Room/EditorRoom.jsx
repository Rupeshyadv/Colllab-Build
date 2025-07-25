import { Editor } from '@monaco-editor/react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { setEditorCode } from '../../store/editorSlice'
import { getSessionCode, updateSessionCode } from '../../api/sessionRoomApi'
import { debounce } from 'lodash'
import LZString from 'lz-string'
import { toast } from 'react-hot-toast'
import { socket } from '../../services/socket.js'
import { ClientToServerEvents, ServerToClientEvents } from '../../../../server/src/socket/socket.events.js'

function EditorRoom() {
  const dispatch = useDispatch()
  const { roomId } = useParams()  
  const code = useSelector((state) => state.editor.roomCodes[roomId] || '')
  const navigate = useNavigate()

  // Socket connection 
  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }

    // emit join 
    socket.emit(ClientToServerEvents.JOIN_ROOM, { roomId })

    const handleUserJoined = ({ userId }) => {
      toast.success(`User ${userId} joined the room.`)
    }

    const handleCodeUpdate = ({ code }) => {
      dispatch(setEditorCode({ roomId, code }))
    }

    const handleUserLeft = ({ userId }) => {
      toast.error(`User ${userId} left the room.`)
    }   

    socket.on(ServerToClientEvents.USER_JOINED, handleUserJoined)
    socket.on(ServerToClientEvents.CODE_UPDATE, handleCodeUpdate)
    socket.on(ServerToClientEvents.USER_LEFT, handleUserLeft)
    
    // clean up the socket connection when the component unmounts or roomId changes
    return () => {
      if (socket.connected) {
        socket.emit(ClientToServerEvents.LEAVE_ROOM, { roomId })
        socket.off(ServerToClientEvents.USER_JOINED, handleUserJoined)
        socket.off(ServerToClientEvents.CODE_UPDATE, handleCodeUpdate)
        socket.off(ServerToClientEvents.USER_LEFT, handleUserLeft)
        
        socket.disconnect()
      }
    }
  }, [roomId, dispatch])

  useEffect(() => {
    const fetchSessionCode = async () => {
      try {
        const { code: compressedCode } = await getSessionCode(roomId)
        const decompressedCode = LZString.decompressFromUTF16(compressedCode || '')
        dispatch(setEditorCode({ roomId, code: decompressedCode }))
      } catch (err) {
        console.error('Failed to fetch code:', err)
      }
    }
    fetchSessionCode()
  }, [roomId, dispatch])

  const handleCodeChange = useMemo( () => {
    return debounce( async (value) => {
      const payload = {
        roomId,
        code: value
      }

      dispatch(setEditorCode(payload))

      // Broadcast the code change to other users in the room
      socket.emit(ClientToServerEvents.CODE_CHANGE, payload)

      const compressedCode = LZString.compressToUTF16(value)
      await updateSessionCode(roomId, compressedCode)
    }, 2000)
  }, [roomId, dispatch])

  const handleExitRoom = () => {    
    navigate('/dashboard')
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#000000]">
      <div className="flex items-center justify-end p-1 bg-[#000000] text-white shadow-md">
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExitRoom}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-2 py-1 rounded-lg ml-2 cursor-pointer"
          >
            Exit Room
          </button>
        </div>
      </div>

      <div className="flex-1 w-full h-full overflow-hidden">
        <Editor
          height="100%"
          width="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          options={{
            fontSize: 15,
            minimap: { enabled: false },
            wordWrap: 'on',
            automaticLayout: true,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  )

}

export default EditorRoom