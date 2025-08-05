import React from 'react';
import Img from '../home/assets/our act.png'

const Activities: React.FC = () => {
  return (
    <div className="text-center space-y-6 bg-[#FDF8F3] px-4 md:px-0">
      {/* <h1 className="text-3xl font-semibold font-open-sans text-[32px] leading-[40px] text-gray-800 md:text-[47px] md:leading-[56px] mb-16 md:mb-12">
  Our Activities
</h1> */}

      <div className="mt-8 md:mt-12 flex justify-center w-full md:w-[1350px] mx-auto">
        <img 
          alt="Activity" 
          className="w-full md:w-[1500px] h-auto md:h-[1600px] object-cover rounded-xl" 
          src={Img}
        />
      </div>
    </div>
  );
};

export default Activities;