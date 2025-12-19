import React from 'react';

const DashboardLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6 animate-fadeIn">
      {/* Enhanced Spinner */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-black border-r-black animate-spin"></div>
        <div 
          className="absolute inset-2 rounded-full border-4 border-transparent border-b-gray-400 animate-spin" 
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        ></div>
      </div>
      
      {/* Loading Text */}
      <div className="text-center space-y-2">
        <p className="text-black font-bold text-sm sm:text-base">Loading Admin Dashboard</p>
        <p className="text-gray-500 text-xs sm:text-sm">Fetching your data...</p>
      </div>
      
      {/* Progress Indicators */}
      <div className="w-full max-w-xs space-y-3">
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200">
          <div className="w-2 h-2 rounded-full bg-black animate-pulse"></div>
          <span className="text-xs text-gray-600">Loading orders</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200">
          <div className="w-2 h-2 rounded-full bg-black animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <span className="text-xs text-gray-600">Loading products</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200">
          <div className="w-2 h-2 rounded-full bg-black animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          <span className="text-xs text-gray-600">Loading users</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoader;
