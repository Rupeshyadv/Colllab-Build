import { useState } from 'react';
import { Eye, EyeOff, Github, Mail, Lock, User } from 'lucide-react';
import Logo from '../assets/Logo.png'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { loginApi, registerApi } from '../api/authApi.js'
import { login as authLogin, register as authRegister} from '../store/authSlice.js'

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }
  
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    // SignIn 
    if(isLogin) {
        try {
            const userData = await loginApi(formData.email, formData.password)

            if(userData) {
                dispatch(authLogin(userData))
            }

            navigate('/')
        } catch (error) {
            console.error(error)
        }
    }
    
    // Sign-Up
    else {
        try {
            const userData = await registerApi(formData.name, formData.email, formData.password)

            if(userData) {
                dispatch(authRegister(userData))
            }
        } catch (error) {
            console.error(error)
        }
    }

  }

  return (
    <>
        <div className="relative min-h-screen bg-[#000000] flex items-start justify-center p-4">

            <div className="flex flex-col md:flex-row items-center justify-center gap-10 w-full max-w-6xl"> 

                    {/* Logo and Title div*/}
                <div className="flex-1 flex flex-col items-center md:items-start md:mr-10">
                    <div className="flex items-center justify-center space-x-2 mb-6 md:mb-8">
                        <div className="bg-[#000000] backdrop-blur-sm p-2 rounded-lg">
                        <img
                            src={Logo}
                            alt="Collab-Build Logo"
                            className="h-16 w-16 sm:h-20 sm:w-20 object-cover"
                        />  
                        </div>
                        <span className="text-4xl sm:text-6xl md:text-7xl font-bold text-white">
                            Collab-Build
                        </span>
                    </div>

                </div>

                    {/* Form div */}
                <div className="flex-1 max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl">

                    <div className="flex bg-gray-700/50 rounded-lg p-1 mb-8">
                        <button
                            onClick={() => setIsLogin(false)}
                            className={
                                `flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer
                                ${
                                    !isLogin ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                }`
                            }
                        >
                            Sign Up
                        </button>
                        <button
                            onClick={() => setIsLogin(true)}
                            className={
                                `flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer
                                ${
                                    isLogin ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg': 'text-gray-400 hover:text-white'
                                }`
                            }
                        >
                            Sign In
                        </button>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="space-y-6">
                            {/* Sign-Up render */}
                        {!isLogin && (
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                                    Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>
                        )}

                            {/* Sign-In & Sign-Up both */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your email"
                                    required={true}
                                />
                            </div>
                        </div>

                            {/* Sign-In & Sign-Up both */}
                        <div className="space-y-2"> 
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password    
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                            {/* Sign-In render */}
                        {isLogin && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                        >
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="w-full flex items-center justify-center space-x-2 bg-gray-700/50 text-white py-3 px-4 rounded-lg border border-gray-600 hover:bg-gray-600/50 transition-all duration-200 cursor-pointer"
                        >
                            <Github className="h-5 w-5" />
                            <span>Continue with GitHub</span>
                        </button>
                    </form>

                    {!isLogin && (
                        <p className="mt-6 text-xs text-gray-400 text-center">
                            By creating an account, you agree to our{' '}
                            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                                Privacy Policy
                            </a>
                        </p>
                    )}
                </div>
            </div>
        </div>
    </>
  );
}
