import React from "react";
import { useNavigate } from "react-router-dom";

// Importing images
import digitalMarketingImg from "../home/assets/digitalmarketing.gif";
import graphicsDesignImg from "../home/assets/graphic.gif";
import mediaProductionImg from "../home/assets/media.gif";
import uiUxDesignImg from "../home/assets/ui.gif";
import animationImg from "../home/assets/animation.gif";
import customizedCoursesImg from "../home/assets/courses.gif";

interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  onClick?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  image,
  onClick,
}) => (
  <div className="bg-[#343434] rounded-2xl text-center overflow-hidden shadow-lg">
    <div className="relative w-full h-56 bg-white rounded-t-2xl flex justify-center items-center overflow-hidden">
      {/* Displaying the image */}
      <img src={image} alt={title} className="w-56 h-56 object-contain" />
    </div>
    <div className="p-6 text-white">
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="mt-4">{description}</p>
      <div className="mt-4">
        <button
          className="w-60 md:w-64 bg-[#FFFF] text-[#333333] py-3 px-6 rounded transition-colors duration-300 hover:bg-[#F6DCAB] hover:text-[#333333]"
          onClick={onClick}
        >
          Explore Now
        </button>
      </div>
    </div>
  </div>
);

const services = [
  {
    title: "Digital Marketing",
    description:
      "Boost your brand's online presence with our data-driven digital marketing strategies, including SEO, SMM, PPC, etc.",
    image: digitalMarketingImg,
  },
  {
    title: "Graphics Design",
    description:
      "Transform your ideas into stunning visuals with our services. We create designs that effectively communicate your brand's message.",
    image: graphicsDesignImg,
  },
  {
    title: "Media Production",
    description:
      "Enhance your footage with our professional video editing services, delivering polished, engaging content for any platform.",
    image: mediaProductionImg,
  },
  {
    title: "UI/UX Design",
    description:
      "Design accessible and visually appealing interfaces with UI/UX Services. We focus on creating those designs that enhance engagement & satisfaction.",
    image: uiUxDesignImg,
  },
  {
    title: "Animation (2D & 3D)",
    description:
      "Bring ideas to life with our Animation Services. Engaging and visually stunning animations that captivate audiences and communicate.",
    image: animationImg,
  },
  {
    title: "Customized Courses",
    description:
      "We design tailored educational experiences that engage learners and meet specific needs for enhanced knowledge and skill development.",
    image: customizedCoursesImg,
  },
];

const Services: React.FC = () => {
  const navigate = useNavigate();

  const handleServiceClick = (title: string) => {
    if (title === "Digital Marketing") {
      navigate("/digital");
    }
    if (title === "Graphics Design") {
      navigate("/graphics");
    }
    if (title === "Media Production") {
      navigate("/media");
    }
    if (title === "UI/UX Design") {
      navigate("/ui");
    }
    if (title === "Animation (2D & 3D)") {
      navigate("/animation");
    }
    if (title === "Customized Courses") {
      navigate("/courses");
    }
  };

  return (
    <div className="bg-[#FFEFD2] py-12 px-6  ">
      <div className="text-center space-y-6">
      <h1 className="font-open-sans font-semibold text-[32px] leading-[38px] tracking-[0.01em] text-gray-800 md:text-[50px] md:leading-[72px] md:mb-8">
  What We Provide
</h1>

      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-7xl mx-auto">
        {services.slice(0, 3).map((service, index) => (
          <ServiceCard
            key={index}
            title={service.title}
            description={service.description}
            image={service.image}
            onClick={() => handleServiceClick(service.title)}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-7xl mx-auto">
        {services.slice(3).map((service, index) => (
          <ServiceCard
            key={index + 3}
            title={service.title}
            description={service.description}
            image={service.image}
            onClick={() => handleServiceClick(service.title)}
          />
        ))}
      </div>
    </div>
  );
};

export default Services;
