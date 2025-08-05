import React, { useState, useEffect } from 'react';
import w1 from '../Works/w1.png'
import w2 from '../Works/w2.png'
import w3 from '../Works/w3.png'
import w4 from '../Works/w4.png'
import w5 from '../Works/w5.png'
import w6 from '../Works/w6.png'
import w7 from '../Works/w7.png'


const CarouselWithGrid = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [items, setItems] = useState([
    { id: 1, src: w1 },
    { id: 2, src: w2 },
    { id: 3, src: w3 }
  ]);

  const gridImages = [w4, w5, w6, w7];

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => {
        const newItems = [...prev];
        const firstItem = newItems.shift();
        if (firstItem) newItems.push(firstItem);
        return newItems;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-8 bg-[#FDF8F3] pt-14">
      {/* Carousel Section */}
      <div className="relative w-full h-[400px] md:h-[600px] overflow-hidden ">
        <div className="absolute w-full top-1/2 -translate-y-1/2 flex justify-center items-center">
          {items.map((item, index) => {
            let className = "absolute transition-all duration-700 ease-in-out ";
            let style: React.CSSProperties = { opacity: 0 };

            if (index === 0) {
              className += "w-[200px] h-[200px] md:w-[318px] md:h-[318px]";
              style = { transform: 'translateX(-120%)', opacity: 0.7 };
            } else if (index === 1) {
              className += "w-[300px] h-[300px] md:w-[531px] md:h-[531px] z-10";
              style = { transform: 'translateX(0)', opacity: 1 };
            } else if (index === 2) {
              className += "w-[200px] h-[200px] md:w-[318px] md:h-[318px]";
              style = { transform: 'translateX(120%)', opacity: 0.7 };
            }

            return (
              <div
                key={item.id}
                className={className}
                style={style}
              >
                <img
                  src={item.src}
                  alt={`Slide ${item.id}`}
                  className="w-full h-full rounded-lg shadow-xl object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Section */}
      <div className="w-full px-4">
      <div className="flex flex-wrap justify-center gap-y-6 sm:gap-y-4 md:gap-8 max-w-[1400px] mx-auto">
  <div className="flex flex-col md:flex-row gap-y-6 sm:gap-y-4 md:gap-8 w-full justify-center mt-8 md:mt-20">
    {gridImages.slice(0, 3).map((src, index) => (
      <div key={index} className="w-full md:w-[400px] h-[300px] md:h-[400px]">
        <img
          src={src}
          alt={`Grid ${index + 1}`}
          className="w-full h-full object-cover rounded-lg shadow-lg"
        />
      </div>
    ))}
  </div>
  <div className="flex justify-start w-full ml-0 md:ml-20 mb-20 md:mb-40 mt-4 md:mt-10 gap-y-6 sm:gap-y-12 ">
    <div className="w-full md:w-[400px] h-[300px] md:h-[400px]">
      <img
        src={gridImages[3]}
        alt="Grid 4"
        className="w-full h-full object-cover rounded-lg shadow-lg"
      />
    </div>
  </div>
</div>

      </div>
    </div>
  );
};

export default CarouselWithGrid;