import Img1 from '../Galary/assets/1.png'
import Img2 from '../Galary/assets/2.png'
import Img4 from '../Galary/assets/4.png'
import Img5 from '../Galary/assets/5.png'

const Gallery = () => {
  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50">
        
      <div className="grid grid-cols-3 gap-4 mt-16 mb-16">
        {/* Left column */}
        <div className="space-y-4">
          <div className="w-full aspect-[388/259] bg-gray-200 rounded-lg overflow-hidden">
            <img
              src= {Img1}
              alt="Gallery image 1"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full aspect-[388/259] bg-gray-200 rounded-lg overflow-hidden">
            <img
              src= {Img2}
              alt="Gallery image 2"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full aspect-[388/259] bg-gray-200 rounded-lg overflow-hidden">
            <img
              src={Img2}
              alt="Gallery image 3"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Middle column */}
        <div className="space-y-4">
          <div className="w-full aspect-[397/405] bg-gray-200 rounded-lg overflow-hidden">
            <img
              src={Img4}
              alt="Gallery image 4"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full aspect-[397/405] bg-gray-200 rounded-lg overflow-hidden">
            <img
              src={Img4}
              alt="Gallery image 5"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="w-full aspect-[388/258] bg-gray-200 rounded-lg overflow-hidden">
            <img
              src={Img5}
              alt="Gallery image 6"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full aspect-[388/258] bg-gray-200 rounded-lg overflow-hidden">
            <img
              src={Img5}
              alt="Gallery image 7"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full aspect-[388/258] bg-gray-200 rounded-lg overflow-hidden">
            <img
              src={Img5}
              alt="Gallery image 8"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;