import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import b1 from '../Courses/assets/b1.png';
import b2 from '../Courses/assets/b2.png';
import b3 from '../Courses/assets/b3.png';
import b4 from '../Courses/assets/b4.png';

interface Course {
  id: string;
  imageUrl: string;
  name: string;
  timePeriod: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

interface CourseCardProps {
  title: string;
  duration: string;
  price: string;
  imageUrl: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ title, duration, price, imageUrl }) => (
  <div className="w-full max-w-[90%] sm:max-w-[370px] h-[326px] bg-white p-4 sm:p-6 flex flex-col items-center justify-center rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 mx-auto">
    <div className="w-[266px] h-[252px] flex flex-col items-center space-y-6">
      <div className="w-[130px] h-[130px] flex items-center justify-center">
        <img
          src={imageUrl}
          alt={title}
          className="w-[130px] h-[130px] object-contain"
        />
      </div>
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-semibold text-black">{title}</h3>
        <p className="text-lg text-gray-600">{duration}</p>
        <p className="text-xl font-medium text-black">{price}</p>
      </div>
    </div>
  </div>
);

interface AnimationCardProps {
  icon: string;
  title: string;
  description: string;
}

const AnimationCard: React.FC<AnimationCardProps> = ({ icon, title, description }) => (
  <div className="relative bg-[#FDF8F3] border-2 border-gray-300 rounded-tr-3xl p-4 md:p-6 group hover:bg-white hover:scale-105 transition-transform duration-300">
    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#F6DCAB] absolute left-1/2 transform -translate-x-1/2 -top-12 md:-top-16 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
      <img
        alt={`${title} Icon`}
        className="w-14 h-14 object-cover transform transition-transform duration-300"
        src={icon}
      />
    </div>
    <div className="pt-16 md:pt-20">
      <h3 className="text-2xl md:text-3xl font-semibold text-center">
        {title}
      </h3>
      <p className="text-lg md:text-lg text-gray-800 text-center mt-4">
        {description}
      </p>
    </div>
  </div>
);

const CourseGrid: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://totem-consultancy-beta.vercel.app/api/courses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const animationServices = [
    {
      icon: b1,
      title: 'Offline Coaching',
      description:
        'Learn well in offline classes at Totem - Digital Marketing company in Kurukshetra with advance equipments and systems. A face to face interaction with teachers.',
    },
    {
      icon: b2,
      title: 'Certification',
      description:
        'Upon completing the course, you may receive industry-recognized certifications that can enhance your career opportunities.',
    },
    {
      icon: b3,
      title: 'Updated Content',
      description:
        'Totem is expected to continually update its course content to keep pace with the fast-evolving landscape of digital marketing.',
    },
    {
      icon: b4,
      title: 'Ongoing Support',
      description:
        'Totem might offer continuous support and mentorship following the completion of the course.',
    },
  ];

  return (
    <div style={{ backgroundColor: '#FDF8F3' }} className="min-h-screen w-full pb-16 md:pb-36 pt-16 md:pt-20">
      <div className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16 justify-items-center">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              title={course.name}
              duration={course.timePeriod}
              price={`Rs. ${course.price}/-`}
              imageUrl={course.imageUrl}
            />
          ))}
        </div>
        <div className="mt-20 flex justify-center">
          <Link to="/contact">
            <button className="w-60 md:w-48 bg-[#333333] text-[#F6DCAB] py-3 px-6 rounded transition-colors duration-300 hover:bg-[#F6DCAB] hover:text-[#333333]">
              Contact Now
            </button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 mt-20 md:mt-36 mb-16 md:mb-18 bg-[#FDF8F3]">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-24 md:mb-36">
          Why Choose Us !
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-14 gap-y-28 max-w-5xl mx-auto">
          {animationServices.map((service, index) => (
            <AnimationCard key={index} {...service} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseGrid;