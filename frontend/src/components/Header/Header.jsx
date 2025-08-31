import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from '../../assets/Logo.png'; 
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Logout as LogoutBtn } from '../Auth/Logout'
import { ProfileCircle } from '../UserProfile/ProfileCircle';


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);   // For mobile view

  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <header className="bg-[#000000] backdrop-blur-sm border-b border-[#010c07] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-200">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors duration-200">
              How It Works
            </a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors duration-200">
              About
            </a>
          </nav>

          {/* Desktop CTA */}
          { !isAuthenticated &&
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to={"/login"} 
                className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer">
                Sign In
              </Link>
              <Link
                to={"/register"} 
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-105 cursor-pointer">
                Get Started
              </Link>
            </div>  
          }

          {
            isAuthenticated && <ProfileCircle />
          }

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white transition-colors duration-200"
          >
            {isMenuOpen ? <X className="h-6 w-6 cursor-pointer" /> : <Menu className="h-6 w-6 cursor-pointer" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#000000] backdrop-blur-sm border-t border-[#010c07] mt-2 rounded-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200">
                Features
              </a>
              <a href="#how-it-works" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200">
                How It Works
              </a>
              <a href="#about" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200">
                About
              </a>
              
              { !isAuthenticated && 
                <div className="px-3 py-2 space-y-2">
                  <Link
                    to={"/login"} 
                    className="w-full text-left text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer">
                    Sign In
                  </Link>
                  <Link 
                    to={"/register"}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-300/25 transition-all duration-200 cursor-pointer">
                    Get Started
                  </Link>
                </div>
              }

            {
              isAuthenticated && <ProfileCircle />
            }
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;