import React from 'react';

const DashboardLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6 sm:space-y-8 px-4 py-8 animate-fadeIn bg-white">
      {/* Enhanced Spinner */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-black border-r-black animate-spin"></div>
        <div 
          className="absolute inset-2 rounded-full border-4 border-transparent border-b-gray-400 animate-spin" 
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        ></div>
      </div>
      
      {/* Loading Text */}
      <div className="text-center space-y-2">
        <p className="text-black font-bold text-base sm:text-lg md:text-xl">Loading Admin Dashboard</p>
        <p className="text-gray-500 text-xs sm:text-sm md:text-base">Fetching your data...</p>
      </div>
      
      {/* Progress Indicators */}
      <div className="w-full max-w-xs sm:max-w-sm space-y-3">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="w-2 h-2 rounded-full bg-black animate-pulse flex-shrink-0"></div>
          <span className="text-xs sm:text-sm text-gray-600">Loading orders</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="w-2 h-2 rounded-full bg-black animate-pulse flex-shrink-0" style={{ animationDelay: '0.2s' }}></div>
          <span className="text-xs sm:text-sm text-gray-600">Loading products</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="w-2 h-2 rounded-full bg-black animate-pulse flex-shrink-0" style={{ animationDelay: '0.4s' }}></div>
          <span className="text-xs sm:text-sm text-gray-600">Loading users</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoader;
