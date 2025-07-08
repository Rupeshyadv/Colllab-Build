import React, { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import Logo from '../assets/Logo.png'

const Dashboard = () => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    language: 'javascript',
  });

  const [rooms] = useState([
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
  ]);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    setShowCreateRoom(false);
    setNewRoom({
      name: '',
      description: '',
      language: 'javascript',
    });
    rooms.push(newRoom)
  };

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

  if (showCreateRoom) {
    return (
      <div className="min-h-screen bg-[#000000]">
        <div className="max-w-2xl mx-auto">

          {/* Create Room Form */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Room</h2>
            
            <form onSubmit={handleCreateRoom} className="space-y-6">
              <div>
                <label htmlFor="roomName" className="block text-sm font-medium text-gray-300 mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  id="roomName"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter room name"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
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
                  onClick={() => setShowCreateRoom(false)}
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
                        <img 
                            src={Logo}
                            alt="Collab-Build Logo"
                            className='h-10 w-10 rounded-lg object-cover'
                        />
                    </div>
                    <span className="text-xl font-bold text-white">Collab-Build</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowCreateRoom(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>New Room</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-105 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getLanguageColor(room.language)} text-white`}>
                    {room.language.toUpperCase()}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-200">
                  {room.name}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {room.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    by {room.owner}
                  </span>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200 cursor-pointer">
                    Join Room →
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

export default Dashboard;