import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinSessionRoom } from '../../api/sessionRoomApi';

const JoinRoom = () => {
  const [roomId, setRoomId] = useState('')

  const navigate = useNavigate()  
  const handleJoinByRoomId = async () => {
    if (roomId.trim()) {
        const data = await joinSessionRoom(roomId)

        navigate(`/room/${roomId}`)
    }
  };

  return (
 
    <div className="bg-[#000000] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Enter room id"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        onClick={handleJoinByRoomId}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                    >
                        Join Room
                    </button>
                </div>
            </div>
        </div>
    </div>

  );
};

export default JoinRoom;