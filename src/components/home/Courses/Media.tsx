import d13 from "../Courses/assets/d13.png";
import d14 from "../Courses/assets/d14.png";
import d15 from "../Courses/assets/d15.png";
import d16 from "../Courses/assets/d16.png";
import d17 from "../Courses/assets/d17.png";
import d18 from "../Courses/assets/d18.png";
import digital from "../Courses/assets/media.png";
import { useEffect } from "react";
import {Link} from 'react-router-dom'
const Media = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      icon: d13,
      title: "ScriptWriting",
      description:
        "We provide expert scriptwriting services to bring your vision to life with engaging and impactful storytelling. We make sure your story is organized creatively and clearly from concept to completion to enable a smooth animation process.",
      iconSize: "w-14 h-14",
    },
    {
      icon: d14,
      title: "StoryBoarding",
      description:
        "We offer storyboarding services to visually outline your concepts and ensure a seamless narrative flow. We provide expert storyboarding and scriptwriting services to create gripping tales that convey your vision.",
      iconSize: "w-14 h-14",
    },
    {
      icon: d15,
      title: "Filming/Recording",
      description:
        "We deliver top-notch filming services to capture stunning visuals and bring your project to life with clarity and creativity.",
      iconSize: "w-14 h-14",
    },
    {
      icon: d16,
      title: "Editing",
      description:
        "We provide accurate editing services to improve your video. Convert your unprocessed stuff into a polished, polished finished result.",
      iconSize: "w-14 h-14",
    },
    {
      icon: d17,
      title: "Photography",
      description:
        "We offer expert photography services to produce breathtaking images. Improve your brand with powerful, high-quality photos.",
      iconSize: "w-14 h-14",
    },
    {
      icon: d18,
      title: "Animation",
      description:
        "We produce engrossing animations that give your concepts life. Use creative and captivating visual storytelling to elevate your project.",
      iconSize: "w-14 h-14",
    },
  ];

  return (
    <div className="flex flex-col bg-[#FDF8F3]">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-8 bg-[#FAF9F6] md:ml-16 md:mr-20">
        <div className="w-[250px] md:w-[408.89px] h-auto md:h-[269.97px] mt-8 md:mt-16 md:mr-16 order-first md:order-last">
          <img
            src={digital}
            alt="Media Production Illustration"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="w-full md:w-[612px] h-auto md:h-[223px] flex flex-col justify-center px-4 md:px-0 mt-8 md:mt-0 md:ml-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center md:text-left">Media Production</h2>
          <p className="text-gray-600 leading-relaxed text-center md:text-justify mt-4 md:mt-6 text-sm md:text-lg">
            "Throughout digital advertising, video production is the process to produce enjoyable, informative, and interactive videos for audiences."
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 md:px-8 lg:px-16 mt-24 md:mt-48 mb-16 md:mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-24 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <div
              key={index}
              className="relative bg-[#FDF8F3] border-2 border-gray-300 rounded-tr-3xl p-4 md:p-6 group hover:bg-white hover:scale-105 transition-transform duration-300"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#F6DCAB] absolute left-1/2 transform -translate-x-1/2 -top-12 md:-top-16 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <img
                  alt={`${service.title} Icon`}
                  className={`${service.iconSize} object-cover transform transition-transform duration-300`}
                  src={service.icon}
                />
              </div>
              <div className="pt-16 md:pt-20">
                <h3 className="text-xl md:text-3xl font-semibold text-center">
                  {service.title}
                </h3>
                <p className="text-sm md:text-lg text-gray-800 text-center mt-4">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 px-4 mb-24">
        <Link to="/contact">
          <button className="w-60 md:w-48 bg-[#333333] text-[#F6DCAB] py-3 px-6 rounded transition-colors duration-300 hover:bg-[#F6DCAB] hover:text-[#333333]">
            Get In Touch
          </button>
        </Link>
        <Link to="/graphicwork">
          <button className="w-60 md:w-48 bg-[#333333] text-[#F6DCAB] py-3 px-6 rounded transition-colors duration-300 hover:bg-[#F6DCAB] hover:text-[#333333]">
            Link to Work
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Media;