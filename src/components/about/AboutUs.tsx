import img from './assets/digitalmarketing.gif'
import img1 from './assets/graphic.gif'
import img2 from './assets/video.gif'
import img3 from './assets/ui.gif'
import img4 from './assets/animation.gif'
import img5 from './assets/courses.gif'
import img6 from './assets/Group 9099.png'
import img7 from './assets/Group 9099 (1).png'
import img8 from './assets/Group 9099 (2).png'
import img9 from './assets/Group 9099 (3).png'
import { useState, useEffect } from 'react'
import vid from './assets/-c828-4e00-a8e4-183c9a79137c.mp4'
import img18 from  './assets/brain.png'

interface TeamMember {
  profileUrl: string;
  name: string;
  designation: string;
}

const About = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchTeam = async () => {
        try {
          const response = await fetch('https://totem-consultancy-alpha.vercel.app/api/team');
          if (!response.ok) {
            throw new Error('Failed to fetch team data');
          }
          const data: TeamMember[] = await response.json();
          setTeam(data);
          setIsLoading(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setIsLoading(false);
        }
      };
  
      fetchTeam();
    }, []);
  
    if (isLoading) {
      return (
        <section className="py-8 md:py-16 bg-[#faf9f6]">
          <div className="container mx-auto px-4 max-w-[824px]">
            <p className="text-center">Loading team members...</p>
          </div>
        </section>
      );
    }
  
    if (error) {
      return (
        <section className="py-8 md:py-16 bg-[#faf9f6]">
          <div className="container mx-auto px-4 max-w-[824px]">
            <p className="text-center text-red-500">Error: {error}</p>
          </div>
        </section>
      );
    }

  return (
    <div className="w-full min-h-screen bg-[#faf9f6] ">
      <section className="container mx-auto px-4 bg-[#faf9f6]">
  <div className="w-full bg-[#faf9f6] py-8 md:py-16">
    <div className="container mx-auto flex flex-col items-center justify-center px-4">
      <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-8 w-full max-w-6xl">

        {/* Text Content */}
        <div className="flex flex-col w-full md:w-[476px] md:h-[236px] ml-4 md:ml-8 relative md:right-[80px] mb-8 md:mb-0">
          <h2 className="text-[#333333] mb-4 md:mb-8 text-3xl md:text-[44px] font-semibold leading-tight md:leading-[62.7px] text-center md:text-left">
            About Us
          </h2>
          <p className="text-gray-700 font-normal leading-[28px] text-center md:text-justify">
            Established in 2023, Totem Management and Consultancy - Digital marketing Company, Based in Kurukshetra (Haryana), we have a simple mission: to give people and brands complete digital solutions. We provide comprehensive services that are designed to help customers succeed in the digital marketplace, from talent development to branding.
          </p>
        </div>

        {/* Image */}
        {/* Image */}
{/* Image */}
<div className="relative flex items-center justify-center md:justify-start">
  <img
    src={img18}
    alt="Totem Mask"
    className="w-[150px] md:w-[200px] h-auto md:h-[271px] object-contain"
    style={{
      position: 'relative',
      left: '8px', // Moves the image to the right on mobile
    }}
  />
</div>


      </div>
    </div>
  </div>
</section>


<section className="mx-auto px-4 py-8 md:py-16 bg-[#faf9f6]">
  <div className="flex flex-col md:flex-col items-start mx-auto max-w-[824px]">
   {/* "What we do" Heading */}
<h2 className="text-3xl md:text-[35px] font-semibold mb-4 leading-[28.8px] text-center md:text-left">
  What we do
</h2>

{/* Divider */}
<div className="mb-6">
  <div className="h-1 w-48 bg-gradient-to-r from-yellow-300 to-gray-800 mx-auto md:mx-0"></div>
</div>


    {/* First Paragraph (Desktop Only) */}
    <div className="w-[824px] h-[125px] hidden md:block">
      <p className="text-gray-700 leading-relaxed text-justify">
        Totem Management and Consultancy is committed to providing unrivaled value
        to our clients. We are driven by innovation and a commitment to quality.
        We work hard to go above and beyond expectations and reshape industry
        standards with an emphasis on continual improvement.
      </p>
    </div>

    {/* Second Paragraph with Video (Desktop Only) */}
    {/* Second Paragraph with Video */}
<div className="flex flex-col md:flex-row items-start">
  <div className="w-full md:w-[412px] h-auto md:h-[126px]">
    <p className="text-gray-700 leading-relaxed text-justify">
      Empower your brand with tailored digital marketing strategies that drive
      growth, enhance online presence, and connect you with your target
      audience. From SEO to SMM, we ensure measurable results that align with
      your business goals.
    </p>
  </div>
  <video
    src={vid}
    className="hidden md:block w-[378px] h-[212px] md:ml-6 object-contain"
    autoPlay
    muted
    loop
    playsInline
  />
</div>
  </div>

  {/* Services Section */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mx-auto max-w-[824px]">
    <div className="p-6 rounded-lg">
      <img src={img} alt="Digital Marketing" className="w-16 h-16 mb-4 bg-white" />
      <h3 className="font-bold mb-2 text-left">Digital Marketing</h3>
      <p className="text-gray-700 text-justify">
        Boost your brand online presence with our data-driven digital marketing
        strategies, including SEO, SMM, etc.
      </p>
    </div>

    <div className="p-6 rounded-lg">
      <img src={img1} alt="Graphics Design" className="w-16 h-16 mb-4" />
      <h3 className="font-bold mb-2 text-left">Graphics Design</h3>
      <p className="text-gray-700 text-justify">
        Transform your ideas into stunning visuals with our services. We create
        designs that effectively communicate your brand's message.
      </p>
    </div>

    <div className="p-6 rounded-lg">
      <img src={img2} alt="Video Editing" className="w-16 h-16 mb-4" />
      <h3 className="font-bold mb-2 text-left">Video Editing</h3>
      <p className="text-gray-700 text-justify">
        Enhance your footage with our professional video editing services,
        delivering polished, engaging content for any platform.
      </p>
    </div>

    <div className="p-6 rounded-lg">
      <img src={img3} alt="UI/UX Design" className="w-16 h-16 mb-4" />
      <h3 className="font-bold mb-2 text-left">UI/UX Design</h3>
      <p className="text-gray-700 text-justify">
        Design accessible and visually appealing interfaces with UI/UX services.
        We focus on creating those designs that enhance engagement & satisfaction.
      </p>
    </div>

    <div className="p-6 rounded-lg">
      <img src={img4} alt="Animation" className="w-16 h-16 mb-4" />
      <h3 className="font-bold mb-2 text-left">Animation (2D & 3D)</h3>
      <p className="text-gray-700 text-justify">
        Our 2D and 3D animation services are designed to boost your brand's impact
        by creating visually stunning and highly effective animated content.
      </p>
    </div>

    <div className="p-6 rounded-lg">
      <img src={img5} alt="Courses" className="w-16 h-16 mb-4" />
      <h3 className="font-bold mb-2 text-left">Customized Courses</h3>
      <p className="text-gray-700 text-justify">
        Our customized courses are designed to provide you with specialized
        training in key areas of digital and creative industries.
      </p>
    </div>
  </div>
</section>

      <div className="bg-[#fdf9f4] py-10 px-6 md:px-20 ">
  {/* Heading Section */}
  <div className="text-center mb-10">
  <h2 className="text-[44px] font-semibold leading-[62.7px]">
    Our Values
  </h2>
  <p className="text-[16px] font-normal leading-[28px] text-justify md:text-center mt-4 max-w-[600px] mx-auto text-gray-700">
    "Our values center around creativity, integrity, and results-driven innovation 
    to deliver impactful digital marketing solutions that empower brands."
  </p>
</div>


  {/* Cards Section */}
  <div className="flex flex-wrap justify-center gap-6">
    {/* Diversity Card */}
    <div className="bg-white rounded-lg shadow-md p-6 w-[382px] h-[402px]">
      <img src={img6} alt="Diversity Icon" className="w-16 h-16 mb-4" />
      <h3 className="text-[24px] font-semibold leading-[32px] mb-4">
        Diversity
      </h3>
      <p className="text-[16px] font-normal leading-[28px] text-justify text-gray-700">
        "We believe in the power of diverse perspectives, backgrounds, and ideas to
        fuel creativity and innovation. By fostering an inclusive environment, we
        ensure that every voice is heard and valued, leading to stronger, more
        dynamic solutions."
      </p>
    </div>

    {/* Efficiencies Card */}
    <div className="bg-white rounded-lg shadow-md p-6 w-[382px] h-[402px]">
      <img src={img7} alt="Efficiencies Icon" className="w-16 h-16 mb-4" />
      <h3 className="text-[24px] font-semibold leading-[32px] mb-4">
        Efficiencies
      </h3>
      <p className="text-[16px] font-normal leading-[28px] text-justify text-gray-700">
        "Our commitment to efficiency ensures we maximize resources, time, and
        energy in delivering top-quality results. Through streamlined processes and
        smart workflows, we optimize productivity without compromising on excellence."
      </p>
    </div>

    {/* Teamwork & Collaboration Card */}
    <div className="bg-white rounded-lg shadow-md p-6 w-[382px] h-[402px]">
      <img src={img8} alt="Teamwork Icon" className="w-16 h-16 mb-4" />
      <h3 className="text-[24px] font-semibold leading-[32px] mb-4">
        Teamwork & Collaboration
      </h3>
      <p className="text-[16px] font-normal leading-[28px] text-justify text-gray-700">
        "Collaboration is at the heart of everything we do. By working closely
        together, we harness the strengths of our team members, building on each
        other's expertise to deliver innovative and impactful outcomes for our clients."
      </p>
    </div>

    {/* Client Value Creation Card */}
    <div className="bg-white rounded-lg shadow-md p-6 w-[382px] h-[402px]">
      <img src={img9} alt="Client Value Icon" className="w-16 h-16 mb-4" />
      <h3 className="text-[24px] font-semibold leading-[32px] mb-4">
        Client Value Creation
      </h3>
      <p className="text-[16px] font-normal leading-[28px] text-justify text-gray-700">
        "We are dedicated to creating long-term value for our clients by delivering
        tailored, results-driven strategies. Our success is measured by the success
        of our clients, and we go the extra mile to ensure their growth and satisfaction."
      </p>
    </div>
  </div>
</div>


<section className="py-8 md:py-16 bg-[#faf9f6]">
      <div className="container mx-auto px-4 max-w-[824px] bg-[#faf9f6]">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
          Meet Our Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <div key={index} className="text-center">
              <img
                src={member.profileUrl}
                alt={member.name}
                className="w-[140px] md:w-[191px] h-[140px] md:h-[191px] mx-auto mb-4 object-cover rounded-lg"
              />
              <h3 className="font-semibold w-full md:w-[191px] h-auto md:h-[29px]">
                {member.name}
              </h3>
              <p className="text-gray-600">{member.designation}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
    </div>
  );
};

export default About;