import { CheckSquare } from "lucide-react";
import Img1 from "../home/assets/hero-image-1.png";
import Img2 from "../home/assets/hero-image-2.png";
import Img3 from "../home/assets/hero-image-3.png";
import Img4 from "../home/assets/hero-image-4.png";

const MarketingShowcase = () => {
  const features = [
    "Get Start with us",
    "Get high quality content",
    "Reach to maximum audience.",
  ];

  const marketingItems = [
    {
      image: Img1,
      alt: "Sports Dance Day",
    },
    {
      image: Img2,
      alt: "Shake Mix",
    },
    {
      image: Img3,
      alt: "Pizza Offer",
    },
    {
      image: Img4,
      alt: "Food Special",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center py-12 -z-20">
      <div className="flex flex-col lg:flex-row items-stretch gap-8 w-full max-w-[1200px] mx-auto px-4">
        {/* Left Section */}
        <div className="w-full lg:w-[45%] bg-[#FFEFD2] rounded-lg p-8 flex flex-col h-auto">
          <div className="flex flex-col justify-center h-full py-4">
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug text-center lg:text-justify">
                Empower Your Brand With Our Result-Driven Digital Marketing
                Agency
              </h1>
              <p className="text-base md:text-lg text-gray-700 text-justify lg:text-left">
                Strategies that can empower your brand
                <br className="hidden lg:block" />
                <span className="lg:inline">
                  and reach the maximum audience.
                </span>
              </p>
              <ul className="space-y-4 pt-6">
                {features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start sm:items-center gap-3"
                  >
                    <CheckSquare className="h-6 w-6 text-gray-800 flex-shrink-0" />
                    <span className="text-lg text-gray-800">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full lg:w-[45%]">
          <div className="grid grid-cols-2 gap-4">
            {marketingItems.map((item, index) => (
              <div key={index} className="relative overflow-hidden rounded-lg">
                <div className="aspect-square">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingShowcase;
