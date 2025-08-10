import { Editor } from '@monaco-editor/react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { setEditorCode } from '../../store/Room/editorSlice.js'
import { getSessionCode, updateSessionCode } from '../../api/sessionRoomApi'
import { debounce } from 'lodash'
import LZString from 'lz-string'
import { toast } from 'react-hot-toast'
import { socket } from '../../services/socket.js'
import { ClientToServerEvents, ServerToClientEvents } from '../../../../server/src/socket/socket.events.js'
import TerminalRoom from './TerminalRoom.jsx'

function EditorRoom() {
  const dispatch = useDispatch()
  const { roomId } = useParams()  
  const { userData } = useSelector((state) => state.auth) 
  const code = useSelector((state) => state.editor.roomCodes[roomId] || '')
  const navigate = useNavigate()

  const editorRef = useRef();
  const cursorRef = useRef();
  const [remoteCursors, setRemoteCursors] = useState({}); // userId -> decorationId

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    // Listen to local cursor changes
    editor.onDidChangeCursorSelection(() => {
      const selection = editor.getSelection();
      cursorRef.current = {
        startLineNumber: selection.startLineNumber,
        startColumn: selection.startColumn,
        endLineNumber: selection.endLineNumber,
        endColumn: selection.endColumn,
      }

      if (selection) {
        socket.emit(ClientToServerEvents.CURSOR_MOVE, {
          roomId,
          cursor: cursorRef.current,
          userId: userData.user.id
        });
      }
    });
  };

  useEffect(() => {
    const handleRemoteCursorUpdate = ({ userId, cursor, color }) => {
      if (!editorRef.current) return;

      const oldDecorations = remoteCursors[userId] || [];

      // Convert cursor JSON back to Monaco Range
      const range = new window.monaco.Range(
        cursor.startLineNumber,
        cursor.startColumn,
        cursor.endLineNumber,
        cursor.endColumn
      );

      // Add remote cursor decoration
      const newDecorations = editorRef.current.deltaDecorations(oldDecorations, [
        {
          range,
          options: {
            className: `remote-cursor ${color}`, // thin cursor
            stickiness: 1, // ensures decoration sticks to text
          },
        },
      ]);

      // Update decoration reference
      setRemoteCursors((prev) => ({
        ...prev,
        [userId]: newDecorations,
      }));
    };

    socket.on(ServerToClientEvents.CURSOR_UPDATE, handleRemoteCursorUpdate);

    return () => {
      socket.off(ServerToClientEvents.CURSOR_UPDATE, handleRemoteCursorUpdate);
    };
  }); 


  // Socket join-room connection 
  useEffect(() => {
    if (!socket.connected) socket.connect()

    socket.emit(ClientToServerEvents.JOIN_ROOM, { roomId, userId: userData.user.id })
    
    // clean up the socket connection when the component unmounts or roomId changes
    return () => {
      if (socket.connected) socket.disconnect()
    }
  }, [roomId, userData.user.id])

  // user joined notification
  useEffect(() => {
    const handleUserJoined = ({ userId }) => {
      toast.success(`User ${userId} joined the room.`)
    }

    socket.on(ServerToClientEvents.USER_JOINED, handleUserJoined)

    return () => {
      socket.off(ServerToClientEvents.USER_JOINED, handleUserJoined)
    }
  }, [roomId])

  // Code sync
  useEffect(() => {
    const handleCodeUpdate = ({ code }) => {
      dispatch(setEditorCode({ roomId, code }))
    }
    socket.on(ServerToClientEvents.CODE_UPDATE, handleCodeUpdate)

    return () => {
      socket.off(ServerToClientEvents.CODE_UPDATE, handleCodeUpdate)
    }
  }, [roomId, dispatch])

  // disappear user's cursor after exit room
  useEffect(() => {
    const handleUserLeft = ({ userId }) => {
      toast.error(`User ${userId} left the room.`);

      if (editorRef.current && remoteCursors[userId]) {
        // Remove the cursor decoration
        editorRef.current.deltaDecorations(remoteCursors[userId], []);

        // Remove from state
        setRemoteCursors((prev) => {
          const { [userId]: _, ...rest } = prev;
          return rest;
        });
      }
    };

    socket.on(ServerToClientEvents.USER_LEFT, handleUserLeft);
    
    return () => {
      socket.off(ServerToClientEvents.USER_LEFT, handleUserLeft);
    };

  }, [remoteCursors, roomId]);

  // fetch code from server
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

  // Update code in server -> debounced 
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
    socket.emit(ClientToServerEvents.LEAVE_ROOM, { roomId, userId: userData.user.id });
    navigate('/dashboard')
  }

  const handleRunCode = () => {
    const codeData = {
      code, 
      language: 'cpp' // or any other language you want to support
    } 

    // clear terminal before running new code to get fresh output
    socket.emit(ClientToServerEvents.CLEAR_TERMINAL, { roomId })

    socket.emit(ClientToServerEvents.START_EXECUTION, { roomId, codeData })

  }   

  return (
    <div className="flex flex-col h-screen w-screen bg-[#000000]">
      <div className="flex items-center justify-end p-1 bg-[#000000] text-white shadow-md space-x-4">
        <button
          onClick={handleRunCode}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm px-2 py-1 rounded-lg ml-2 cursor-pointer"
        >
          Run
        </button>

        <button
          onClick={handleExitRoom}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-2 py-1 rounded-lg ml-2 cursor-pointer"
        >
          Exit Room
        </button>
      </div>


      <div className="flex-1 w-full h-full overflow-hidden">
        <Editor
          height="100%"
          width="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onMount={handleEditorDidMount}
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
      
      <TerminalRoom />
    </div>
  )

}

export default EditorRoom