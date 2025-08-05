import React from "react";
import { useNavigate } from "react-router-dom";

// Import images
import marketingImg from '../home/Courses/assets/digital.png';
import graphicsDesignImg from '../home/Courses/assets/graphics.png';
import videoImg from '../home/Courses/assets/media.png';
import planningImg from '../home/Courses/assets/Planing 1.png';
import animationImg from '../home/Courses/assets/animation.png';
import empathizeImg from '../home/Courses/assets/courses.png';


interface Service {
  title: string;
  description: string;
  items: string[];
  image: any;
  path: string;
}

const Service: React.FC = () => {
  const navigate = useNavigate();

  const services: Service[] = [
    {
      title: "Digital Marketing",
      description:
        "By leveraging data-driven strategies and cutting-edge technology, we can maximize reach & engagement. Our digital marketing experts specialize in driving conversions more efficiently than traditional methods.",
      items: [
        "Branding & Logo",
        "Content Marketing",
        "SEO & Google Ads (PPC)",
        "Social Media Marketing",
        "Lead Generation",
        "Affiliate Marketing",
      ],
      image: marketingImg,
      path: "/digital",
    },
    {
      title: "Graphics Design",
      description:
        "Explore the world of digital marketing, graphic design, and UX/UI development to create visually attractive content that keeps the eye of the target audience.",
      items: [
        "Visual Branding",
        "Content Creation",
        "Social Media Design",
        "Marketing Design",
        "Web Design",
      ],
      image: graphicsDesignImg,
      path: "/graphics",
    },
    {
      title: "Media Production",
      description:
        "Throughout media advertising, video production is the process to produce enjoyable, informative, and interactive videos for business.",
      items: [
        "Scriptwriting",
        "Pre-production",
        "Filming",
        "Editing",
        "Animation",
      ],
      image: videoImg,
      path: "/media",
    },
    {
      title: "UI/UX Design",
      description:
        "A user-friendly and attractive interface ensures that your product looks more professional and is easy to navigate. UI/UX design ensures that the user's journey is smooth, relaxing, and satisfying.",
      items: [
        "Research",
        "Flowchart",
        "Wireframes",
        "Prototype",
        "Development",
      ],
      image: planningImg,
      path: "/ui",
    },
    {
      title: "Animation (2D & 3D)",
      description:
        "Animation has become an increasingly powerful tool for bringing your online marketing efforts to the cutting edge. Our 2D and 3D animation services are designed to create visually stunning content by crafting smooth, visually appealing, and highly effective animations.",
      items: [
        "Script Storyboarding",
        "Modeling & Rigging",
        "Plugin & Animation",
        "Rendering",
        "Architectural Visualization",
        "Product Visualization",
      ],
      image: animationImg,
      path: "/animation",
    },
    {
      title: "Customized Courses",
      description:
        "Our customized courses are designed to provide you with specialized training in key areas of digital and creative industries. Each course is crafted by experts with years of experience.",
      items: [
        "Digital Marketing",
        "Graphics Design",
        "Web Design",
        "Video Editing",
      ],
      image: empathizeImg,
      path: "/courses",
    },
  ];

  

  const handleExplore = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {services.map((service, index) => (
          <div key={index} className="mb-24 last:mb-0">
            <div 
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } items-center gap-12`}
            >
              <div className="lg:w-1/2">
                <img
                  src={service.image}
                  alt={`${service.title} illustration`}
                  className="w-full max-w-lg mx-auto"
                />
              </div>
              <div className="lg:w-1/2">
                <h2 className="text-4xl md:text-4xl font-semibold mb-6">
                  {service.title}
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed text-base text-justify">
                  {service.description}
                </p>
                <ul 
                  className="grid grid-cols-2 gap-3 mb-8 sm:block sm:space-y-3" 
                  aria-label={`${service.title} features`}
                >
                  {service.items.map((item, idx) => (
                    <li 
                      key={idx} 
                      className="flex items-center text-gray-700"
                      aria-label={item}
                    >
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button 
                  className="bg-black text-white px-8 py-2.5 rounded-md hover:bg-gray-800 transition-colors"
                  aria-label={`Explore more about ${service.title}`}
                  onClick={() => handleExplore(service.path)}
                >
                  Explore more
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Service;
