import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  message, 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4 px-4">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} rounded-full border-2 border-gray-200 opacity-50`} />
        
        {/* Spinning ring */}
        <div
          className={`${sizeClasses[size]} rounded-full border-2 border-transparent border-t-black border-r-black absolute top-0 left-0 animate-spin`}
          style={{
            animationDuration: '1s',
          }}
        />

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-black rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      {message && (
        <div className="text-center">
          <p className="text-sm sm:text-base font-semibold text-gray-900">{message}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Please wait...</p>
        </div>
      )}
    </div>
  );
};

export default Spinner;
