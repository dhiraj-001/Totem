import React from "react";
import PricingIcon from "../home/assets/pricing-icon.jpg";
import DesignIcon from "../home/assets/design.svg";
import MilestoneIcon from "../home/assets/milestone.svg";

const Event: React.FC = () => {
  return (
    <div className="py-12 px-4 md:px-6 bg-[#FDF8F3] min-h-screen">
      {/* Title Section */}
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-semibold font-open-sans text-[32px] leading-[40px] text-gray-800 md:text-[50px] md:leading-[58px] sm:mb-4">
          Event Management
        </h1>
      </div>

      {/* Image Section */}
      <div className="text-center mt-8 md:mt-14 px-4 md:px-0">
        <img
          src="https://res.cloudinary.com/dgagkq1cs/image/upload/v1736820300/DSC_9279_3_lcjdzc.svg"
          alt="Event Management"
          className="w-full md:w-[1200px] h-auto md:h-[800px] object-cover rounded-2xl mx-auto"
        />
      </div>

      {/* Features Section */}
      <div className="bg-[#FFEFD2] p-6 md:p-8 text-black w-full flex flex-col gap-10  justify-between items-start rounded-2xl mt-12 md:mt-20 mb-12 md:mb-20 space-y-0 md:space-y-4 md:space-x-8">
        <div className="text-4xl font-semibold font-open-sans text-[32px] leading-[40px] text-gray-800 md:text-[50px] md:leading-[58px] flex justify-center w-full">
          <h1>Why We !</h1>
        </div>

        <div className="flex gap-4 flex-col md:flex-row">
          {/* Easy Peasy Pricing */}
          <div className="flex gap-4 md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 w-full md:w-1/3">
            <img
              src={PricingIcon}
              alt="Pricing Icon"
              className="w-16 h-16 md:w-[120px] md:h-[120px]"
            />
            <div className=" md:text-left">
              <h3 className="text-xl md:text-2xl font-semibold">
                Easy Peasy Pricing
              </h3>
              <p className="mt-2 md:mt-4 text-base md:text-lg">
                Stop going cross-eyed over complex pricing tiers. Our pricing
                plans are so easy, a kindergartener could understand them.
              </p>
            </div>
          </div>

          {/* Unique Design */}
          <div className="flex gap-4 md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 w-full md:w-1/3">
            <img
              src={DesignIcon}
              alt="Design Icon"
              className="w-16 h-16 md:w-[120px] md:h-[120px]"
            />
            <div className=" md:text-left">
              <h3 className="text-xl md:text-2xl font-semibold">
                Unique Design
              </h3>
              <p className="mt-2 md:mt-4 text-base md:text-lg">
                There are no cookie-cutter designs here. Your branding, ads, and
                website will stand out from the competition.
              </p>
            </div>
          </div>
          {/* Achieve Milestone */}
          <div className="flex gap-4  md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 w-full md:w-1/3">
            <img
              src={MilestoneIcon}
              alt="Milestone Icon"
              className="w-16 h-16 md:w-[120px] md:h-[120px]"
            />
            <div className=" md:text-left">
              <h3 className="text-xl md:text-2xl font-semibold">
                Achieve Milestone
              </h3>
              <p className="mt-2 md:mt-4 text-base md:text-lg">
                Achieve remarkable milestones with us through creativity, and
                strategic coordination.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event;
