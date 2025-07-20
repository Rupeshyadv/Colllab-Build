import { Editor } from '@monaco-editor/react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { setEditorCode } from '../../store/editorSlice'
import { debounce } from 'lodash'

function EditorRoom() {
  const dispatch = useDispatch()
  const { roomId } = useParams()  
  const code  = useSelector((state) => state.editor.roomCodes[roomId] || '')
  
  const handleCodeChange = debounce((value) => {
    const payload = {
      roomId,
      code: value
    }
    dispatch(setEditorCode(payload))
  }, 400)

  return (  
    <Editor
      height="90vh"
      defaultLanguage="javascript"
      theme="vs-dark"
      value={code}
      onChange={handleCodeChange}
    >

    </Editor>
  )
}

export default EditorRoom