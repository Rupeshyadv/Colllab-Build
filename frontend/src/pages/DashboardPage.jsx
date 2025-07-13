import Logo from '../assets/Logo.png'
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSessionRooms } from '../api/sessionRoomApi';
import { useDispatch } from 'react-redux';
import { addRoom } from '../store/roomSlice';

const DashboardPage = () => {
  const [allRooms, setAllRooms] = useState([])

  const dispatch = useDispatch()
  useEffect(() => {
    const getData = async () => { 
      const rooms = await getSessionRooms()
      setAllRooms(rooms)
      dispatch(addRoom(rooms))
    }

    getData()
  }, [dispatch])

  const getLanguageColor = (language) => {
    const colors = {
      javascript: 'from-yellow-500 to-orange-500',
      typescript: 'from-blue-500 to-cyan-500',
      python: 'from-green-500 to-emerald-500',
      java: 'from-red-500 to-pink-500',
      cpp: 'from-purple-500 to-indigo-500',
      go: 'from-cyan-500 to-blue-500'
    };
    return colors[language] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-[#000000]">
      
      <div className="relative">
        {/* Header */}
        <div className="bg-[#000000] backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className=" p-2 rounded-md">
                    <Link to={"/"}>
                      <img 
                        src={Logo}
                        alt="Collab-Build Logo"
                        className='h-10 w-10 rounded-lg object-cover'
                      />
                    </Link>
                  </div>
                  <span className="text-xl font-bold text-white">Collab-Build</span>
                </div>
              </div>
              
              <Link
                to={'/dashboard/create-room'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>New Room</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content => rooms display*/}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allRooms.map((room) => (
              <div
                key={room.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-105 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getLanguageColor(room.language)} text-white`}>
                    {room.language?.toUpperCase()}
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {room.title}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    by {room.host_user.name}
                  </span>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200 cursor-pointer">
                    Enter Room →
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );

};

export default DashboardPage;