import { useState } from 'react';
import { Edit3, Check, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserData } from '../../store/authSlice.js';
import { editUserProfileApi } from '../../api/authApi.js';
import { useNavigate } from 'react-router-dom';
import Spinner from '../Spinner.jsx';

export function ProfileEditor() {
    const { userData } = useSelector((state) => state.auth || {});
    const avatarUrl = userData?.user.avatarUrl || null;
    const initialUsername = userData.user?.username
    const [isPreviewImageOn, setIsPreviewImageOn] = useState(false)
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [profileImg, setProfileImg] = useState(avatarUrl || null)
    const [previewImg, setPreviewImg] = useState(avatarUrl || null)
    const [tempUsername, setTempUsername] = useState(initialUsername)
    const [currUsername, setCurrUsername] = useState(initialUsername)

    const handleImgChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImg(file);

            const reader = new FileReader()
            reader.onload = (e) => {
                const result = e.target?.result
                setPreviewImg(result);
            }
            reader.readAsDataURL(file);
        }
    }

    const handleImgRemove = () => {
        setPreviewImg(null)
        setProfileImg(null)
    }

    const handleUsernameEdit = () => {
        setTempUsername(currUsername)
        setIsEditingUsername(true)
    }    

    const handleUsernameSave = () => {
        if (tempUsername.trim()) {
            setCurrUsername(tempUsername.trim())
            setIsEditingUsername(false)
        }
    }

    const handleUsernameCancel = () => {
        setTempUsername(currUsername)
        setIsEditingUsername(false)
    }

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const handleSaveChanges = async () => {
        try {
            await editUserProfileApi(currUsername, profileImg)
            const payload = {
                user: {
                    avatarUrl: URL.createObjectURL(profileImg) || null,
                    username: currUsername,
                }
            }
            dispatch(updateUserData(payload))
            navigate('/')
        } catch (error) {
            console.error('Error saving profile changes:', error)
        }
    }

    return (
        <>
            <div
                className='min-h-screen bg-[#000000] flex items-center justify-center p-4'
            >
                <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-center">
                        <h2 className="text-2xl font-semibold text-white mb-4">Edit Profile</h2>
                        
                        {/* Profile Picture Section */}
                        <div className="relative inline-block">
                            {
                                previewImg ? (
                                    <div 
                                        onClick={() => setIsPreviewImageOn(true)}
                                        className="w-40 h-40 text-sm rounded-full flex items-center justify-center overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer bg-white"
                                    >
                                        <img 
                                            src={previewImg} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => setIsPreviewImageOn(true)}
                                        className="w-40 h-40 text-sm rounded-full flex items-center justify-center overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer bg-white"
                                    >
                                        <span className="font-semibold text-white">
                                        </span>
                                    </div>
                                )
                            }
                                

                            {
                                isPreviewImageOn && previewImg ?  (
                                    <div
                                        className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
                                        onClick={() => setIsPreviewImageOn(false)} // close when clicking background
                                    >
                                        <div className="relative">
                                            {/* Big DP */}
                                            <div className="w-96 h-96 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-2xl">
                                                <img 
                                                    src={previewImg} 
                                                    alt="Profile Preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Close Button */}
                                            <button
                                                className="absolute top-4 right-4 text-white text-3xl font-bold"
                                                onClick={() => setIsPreviewImageOn(false)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ) : 
                                isPreviewImageOn && !previewImg && (
                                    <div
                                        className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
                                        onClick={() => setIsPreviewImageOn(false)} // close when clicking background
                                    >
                                        <div className="relative">
                                            {/* Big DP */}
                                            <div className="w-96 h-96 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-2xl">
                                                <span className="font-semibold text-gray-500">
                                                </span>
                                            </div>

                                            {/* Close Button */}
                                            <button
                                                className="absolute top-4 right-4 text-white text-3xl font-bold"
                                                onClick={() => setIsPreviewImageOn(false)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                )   
                                
                            }
                        
                            {/* Photo Actions */}
                            <div className="mt-4 mb-8 flex gap-2 justify-center">
                                {
                                    previewImg ? (
                                        <>
                                            <label className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">
                                                change image
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    onChange={handleImgChange}
                                                />
                                            </label>

                                            <button
                                                className="px-3 py-1 bg-[#000000] bg-opacity-20 text-white text-md rounded-full hover:bg-opacity-30 transition-colors"
                                                onClick={handleImgRemove}
                                            >
                                                Remove
                                            </button>
                                        </>

                                    ) : (
                                        <label className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">
                                            Upload image
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                onChange={handleImgChange}
                                            />
                                        </label>
                                    )
                                }
                            
                            </div>
                        </div>
                    </div>

                    {/* Username Section */}
                    <div className="p-6">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            
                            {isEditingUsername ? (
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
                                    <span className="text-gray-800 font-medium">{tempUsername}</span>
                                    <button
                                        onClick={handleUsernameEdit}
                                        className="p-1 text-gray-500 hover:text-purple-600 hover:bg-white rounded transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            
                            <p className="text-xs text-gray-500 mt-1">
                                {tempUsername.length}/30 characters
                            </p>
                        </div>

                        {/* Save Button */}
                        <button
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold  transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                            onClick={handleSaveChanges}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
}