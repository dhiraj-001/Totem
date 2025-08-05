import d7 from '../Courses/assets/d7.png'
import d8 from '../Courses/assets/d8.png'
import d9 from '../Courses/assets/d9.png'
import d10 from '../Courses/assets/10.png'
import d11 from '../Courses/assets/d11.png'
import d12 from "../Courses/assets/d12.png";
import digital from "../Courses/assets/graphics.png";
import { useEffect } from 'react'
import {Link} from 'react-router-dom'
const Graphics = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      icon: d7,
      title: "Visual Branding",
      description:
        "Our visual branding services create distinctive and cohesive identities that resonate with your target audience. We build features that improve your brand's visibility and leave a lasting impression.",
      iconSize: "w-14 h-14",
    },
    {
      icon: d8,
      title: "Content Creation",
      description:
        "Our content production services create compelling and unique products that are suited to your needs. We create captivating stories and images that pique your audience's attention and strengthen your brand's voice.",
      iconSize: "w-14 h-14",
    },
    {
      icon: d9,
      title: "Social Media Design",
      description:
        "Our social media design services provide eye-catching and effective visuals adapted to numerous platforms. We create engaging content that draws attention and increases your internet visibility.",
      iconSize: "w-14 h-14",
    },
    {
      icon: d10,
      title: "Advertising Design",
      description:
        "Our advertising design services generate appealing images that increase engagement and magnify your message. We provide innovative concepts that attract attention and boost your promotional efforts.",
      iconSize: "w-14 h-14",
    },
    {
      icon: d11,
      title: "Brochures Design",
      description:
        "Our brochure design services provide visually appealing and useful documents that successfully communicate your message. We create layouts and images that draw attention and convey your brand's essence.",
      iconSize: "w-14 h-14",
    },
    {
      icon: d12,
      title: "Printing",
      description:
        "We offer high-quality, colourful prints that bring your designs to life. We guarantee accurate colour reproduction and quality finishes for all of your printing needs.",
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
            alt="Graphics Design Illustration"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="w-full md:w-[612px] h-auto md:h-[223px] flex flex-col justify-center px-4 md:px-0 mt-8 md:mt-0 md:ml-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center md:text-left">Graphics Design</h2>
          <p className="text-gray-600 leading-relaxed text-center md:text-justify mt-4 md:mt-6 text-sm md:text-lg">
            "By leveraging data-driven strategies and cutting-edge technology, we help businesses reach a targeted audience, engage with customers, and drive conversions more efficiently than traditional methods. our services pack a serious punch, from award-winning web design and social media marketing to unique branding and Digital marketing just for your startup. "
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

export default Graphics;