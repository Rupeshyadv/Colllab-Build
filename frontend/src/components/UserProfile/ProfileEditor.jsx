import React, { useState, useRef } from 'react';
import { Camera, Edit3, Check, X } from 'lucide-react';
import { ProfileCircle } from './ProfileCircle';
import { useParams } from 'react-router-dom';

export function ProfileEditor() {
    const username = useParams()
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [tempUsername, setTempUsername] = useState(username);
    const fileInputRef = useRef(null);


    return (
        <div
            className='min-h-screen bg-[#000000] flex items-center justify-center p-4'
        >
            <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-center">
                    <h2 className="text-2xl font-semibold text-white mb-4">Edit Profile</h2>
                    
                    {/* Profile Picture Section */}
                    <div className="relative inline-block">
                        <div 
                            className="w-40 h-40 text-sm rounded-full flex items-center justify-center overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer bg-gradient-to-br from-blue-500 to-cyan-500"
                        >
                            <span className="font-semibold text-white">
                            </span>
                        </div>
                    
                        {/* Photo Actions */}
                        <div className="mt-4 mb-8 flex gap-2 justify-center">
                            <button
                                className="px-3 py-1 bg-black bg-opacity-20 text-white text-lg rounded-full hover:bg-opacity-30 transition-colors"
                            >
                                Change Photo
                            </button>
                        
                        </div>
                    </div>
                </div>

                {/* Username Section */}
                <div className="p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        
                        {/* {isEditingUsername ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={tempUsername}
                                    onChange={(e) => setTempUsername(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    placeholder="Enter username"
                                    maxLength={30}
                                    autoFocus
                                />
                                <button
                                    onClick={handleUsernameSave}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleUsernameCancel}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-800 font-medium">@{username}</span>
                                <button
                                    onClick={handleUsernameEdit}
                                    className="p-1 text-gray-500 hover:text-purple-600 hover:bg-white rounded transition-colors"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            </div>
                        )} */}
                        
                        <p className="text-xs text-gray-500 mt-1">
                            {tempUsername.length}/30 characters
                        </p>
                    </div>

                    {/* Save Button */}
                    <button
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold  transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}