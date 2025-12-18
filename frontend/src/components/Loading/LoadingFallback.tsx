import React from 'react';
import Spinner from './Spinner';

const LoadingFallback: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Spinner size="lg" message="Loading page..." />
    </div>
  );
};

export default LoadingFallback;
