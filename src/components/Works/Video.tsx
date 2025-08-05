import React from 'react';
import img from '../Works/lamp.png';
import { useEffect } from 'react';

interface SquareImageProps {
  
  src?: string;
  alt?: string;
  className?: string;
}

const SquareImage: React.FC<SquareImageProps> = (
  {
    
  src = img,
  alt = "Square image",
  className = ""
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    // Container with max width constraint
    <div className="max-w-[900px] mx-auto mt-20 mb-20">
      {/* Image container maintaining aspect ratio */}
      <div className="relative aspect-square w-full">
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover ${className}`}
        />
      </div>
    </div>
  );
};

export default SquareImage;