// pages/Home.jsx
import Header from '../components/layout/Header';
import Hero from '../components/home/Hero';
import MarketingShowcase from '../components/home/MarketingShowcase';
import Services from '../components/home/Services';
import Course from '../components/home/Course';
import Event from '../components/home/Event';
import Activities from '../components/home/Activities';
import Testimonials from '../components/home/Testimonials';

// import loadingVideo from '../components/home/assets/loading.mp4';

export default function Home() {
  return (
    <div className="relative min-h-screen">
      
      <div className="relative z-10">
        <Header />
        <Hero />
      </div>

      {/* Rest of the components */}
      <div className="relative bg-white z-10">
        <MarketingShowcase />
        <Services />
        <Course />
        <Event />
        <Activities />
        <Testimonials />
      </div>
      
    </div>
  );
}
