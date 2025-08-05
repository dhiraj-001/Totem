import e1 from './e1.png'
import e2 from './e2.png'
import e3 from './e3.png'
import e4 from './e4.png'
import e5 from './e5.png'
import { useEffect } from 'react'
const ImageGallery = () => {
  useEffect(() => {
        window.scrollTo(0, 0);
      }, []);
  return (
    <div className="max-w-7xl mx-auto p-4 mt-20 mb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Left column with two stacked images */}
        <div className="flex flex-col gap-4">
          <div className="relative w-full pb-[67.36%]"> {/* 390/579 ≈ 67.36% */}
            <img
              src={e1}
              alt="Gallery image 1"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="relative w-full pb-[67.36%]">
            <img
              src={e2}
              alt="Gallery image 2"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right column with single image */}
        <div className="relative w-full pb-[63.21%]"> {/* 366/579 ≈ 63.21% */}
          <img
            src={e3}
            alt="Gallery image 3"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Bottom full-width images */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full pb-[66.61%]"> {/* 826/1240 ≈ 66.61% */}
          <img
            src={e4}
            alt="Gallery image 4"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="relative w-full pb-[66.69%]"> {/* 827/1240 ≈ 66.69% */}
          <img
            src={e5}
            alt="Gallery image 5"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;