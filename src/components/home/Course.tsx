import digitalMarketingImg from "../home/assets/digitalmarketing.gif";
import graphicsDesignImg from "../home/assets/graphic.gif";
import mediaProductionImg from "../home/assets/media.gif";
import Animate from "../home/assets/animation2.gif";
import { Link } from "react-router-dom";
import { useEffect } from "react";
const courses = [
  
  {
    title: "Digital Marketing",
    description:
      "Boost your online presence with our Digital Marketing Course. Learn to craft strategies that engage your audience and drive measurable success across various platforms.",
    image: digitalMarketingImg,
  },
  {
    title: "Graphics Design",
    description:
      "Unlock your creativity with our Graphics Design Course. Master design principles to create visually appealing content that captures attention and communicates effectively.",
    image: graphicsDesignImg,
  },
  {
    title: "Video Editing",
    description:
      "Transform raw footage into compelling stories with our Video Editing Course. Learn the tools and techniques to craft engaging videos that captivate viewers.",
    image: mediaProductionImg,
  },
  {
    title: "Animation",
    description:
      "Bring ideas to life with our Animation Course. Learn to create visually stunning animations that captivate audiences and communicate your message effectively.",
    image: Animate,
  },
];

const Course = () => {
  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
  return (
    <div className="bg-[#FDF8F3] min-h-screen py-16">
      <div className="max-w-[1280px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold font-open-sans text-[32px] leading-[48px] text-gray-800 md:text-[50px] md:leading-[72px] mb-4">
  Courses
</h1>

          <p className="text-base font-bold text-gray-600">
            Enhance your skills with our customized courses
          </p>
        </div>
        {/* Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 md:gap-y-16 gap-x-4">
          {courses.map((course, index) => (
            <div
              key={index}
              className="bg-white border-2 border-gray-300 rounded-2xl text-center overflow-hidden p-6 sm:p-8 max-w-lg mx-auto"
            >
              {/* Image */}
              <div className="relative w-full h-48 sm:h-52 flex justify-center items-center overflow-hidden">
                <img
                  alt={course.title}
                  className="w-40 h-40 sm:w-52 sm:h-52 object-contain"
                  src={course.image}
                />
              </div>
              {/* Content */}
              <div className="p-4 sm:p-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {course.title}
                </h3>
                <p className="mt-4 text-gray-700 font-sans text-base sm:text-base ">
                  {course.description}
                </p>
                <div className="mt-6 sm:mt-8 flex justify-center">
                  <Link to="/pricing">
                    <button className="w-full sm:w-64 md:w-72 bg-[#333333] text-[#F6DCAB] py-3 px-6 rounded transition-colors duration-300 hover:bg-[#F6DCAB] hover:text-[#333333]">
                      View Pricing
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Course;
