import React from 'react';

const Loader = () => {
  return (
    <div className="flex flex-row gap-2">
      <div className="w-4 h-4 rounded-full bg-red-500 animate-bounce" />
      <div className="w-4 h-4 rounded-full bg-red-500 animate-bounce [animation-delay:-.3s]" />
      <div className="w-4 h-4 rounded-full bg-red-500 animate-bounce [animation-delay:-.5s]" />
    </div>
  );
}

export default Loader;
