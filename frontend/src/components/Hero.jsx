import React from 'react';
import { Play, Users, Code, Zap } from 'lucide-react';
import { Typewriter } from 'react-simple-typewriter';

const Hero = () => {
  return (
    <>
      <section className="relative bg-[#000000] min-h-screen flex items-center">
        {/* Background Pattern */}
        {/* <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.03\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" /> */}
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Collab and
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                <Typewriter
                  words={[' build together', ' learn together']}
                  loop={0} 
                  typeSpeed={70}
                  deleteSpeed={50}
                  delaySpeed={1000}
                />
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the power of real-time collaborative coding. Multiple developers, one codebase, infinite possibilities.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">Real-time Collaboration</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700">
                <Code className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-gray-300">Live Code Sync</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Instant Updates</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                Start Coding Now
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gray-800/50 backdrop-blur-sm text-white px-8 py-4 rounded-lg text-lg font-semibold border border-gray-700 hover:bg-gray-700/50 transition-all duration-300">
                <Play className="h-5 w-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">50K+</div>
                <div className="text-gray-400">Active Developers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">1M+</div>
                <div className="text-gray-400">Lines of Code</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">99.9%</div>
                <div className="text-gray-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-gray-400">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
};

export default Hero;