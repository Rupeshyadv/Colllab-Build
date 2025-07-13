import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addRoom } from '../store/roomSlice'
import { createSessionRoom } from '../api/sessionRoomApi.js'
 
function CreateRoomPage() {
  const [newRoom, setNewRoom] = useState({
    title: '',
    language: 'javascript',
  })

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userData = useSelector((state) => state.auth.userData)

  const handleCreateRoom = async (e) => {
    e.preventDefault()

    try {
      const sessionRoom = await createSessionRoom(userData.id, newRoom.title, newRoom.language)

      if (!sessionRoom) {
        throw new Error("Session creation failed")
      }

      const roomPayload = {
        id: sessionRoom.id,
        title: newRoom.title,
        language: newRoom.language,
        owner: userData?.name || 'Unkown User'
      }

      dispatch(addRoom(roomPayload))
      navigate('/dashboard')
    } catch (err) {
        console.error("Failed to create room:", err);
    }
  }


return (
    <div className="min-h-screen bg-[#000000]">
      <div className="max-w-2xl mx-auto">

        {/* Create Room Form */} 
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Create New Room</h2>
          
          <form onSubmit={handleCreateRoom} className="space-y-6">

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <textarea
                id="title"
                value={newRoom.title}
                onChange={(e) => setNewRoom({ ...newRoom, title: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe your project or collaboration goal"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Language
                </label>
                <select
                  id="language"
                  value={newRoom.language}
                  onChange={(e) => setNewRoom({ ...newRoom, language: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Create Room
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-lg border border-gray-600 hover:bg-gray-600/50 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateRoomPage