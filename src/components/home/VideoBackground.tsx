// VideoBackground.tsx
import React, { useEffect, useRef } from 'react';
import Video from '../home/assets/loading.mp4'
const VideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

  return (
    <div className="relative w-full h-screen flex items-center md:items-end justify-center md:justify-start">
      <video 
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover z-[-1] brightness-50"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={Video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoBackground;