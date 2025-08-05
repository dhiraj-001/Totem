import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Header2 from './components/layout/Header2';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import DigitalMarketing from './components/home/Courses/DigitalMarketing';
import Graphics from '../src/components/home/Courses/Graphics';
import Media from '../src/components/home/Courses/Media';
import Animation from '../src/components/home/Courses/Animation';
import CourseHome from '../src/components/home/Courses/CourseHome';
import UI from '../src/components/home/Courses/UI';
import Pricing from './components/home/Courses/Pricing';
import GraphicWork from '../src/components/Works/GraphicWork';
import Video from './components/Works/Video';
import Eventportfolio from './components/Works/Eventportfolio';
import VideoEditingPortfolio from './components/Works/VideoEditingPortfolio';
import PrivacyPolicy from './components/about/PrivacyPolicy';
import Team from './components/about/Team';
import WhatsAppButton from './components/home/WhatsAppButton';
// import Chatbot from './components/Chatbot/Chatbot';
import ProjectDetail from './components/projects/ProjectDetail'; // Add this import
import VideoEditing from './VideoEditing';
import ChatWidget from './Chatbot';

function ConditionalHeader() {
  const location = useLocation();
  return location.pathname === '/' ? <Header /> : <Header2 />;
}

function ConditionalFooter() {
  return <Footer />;
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ConditionalHeader />
      <ChatWidget chatbotId="dcc9c0b0-7307-4e33-9552-263b3c49e605" />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:id" element={<ProjectDetail />} /> {/* Add this new route */}
           <Route path="/video-editing" element={<VideoEditing />} /> 
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />}/>
          <Route path="/digital" element={<DigitalMarketing />} />
          <Route path="/graphics" element={<Graphics/>} />
          <Route path="/media" element={<Media />} />
          <Route path="/animation" element={<Animation />} />
          <Route path="/courses" element={<CourseHome />} />
          <Route path="/ui" element={<UI />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/graphicwork" element={<GraphicWork/>} />
          <Route path="/video" element={<Video/>} />
          <Route path="/eventportfolio" element={<Eventportfolio/>} />
          <Route path="/videoeditingportfolio" element={<VideoEditingPortfolio/>} />
          <Route path="/privacy" element={<PrivacyPolicy/>} />
          <Route path="/team" element={<Team/>} />
        </Routes>
      </main>
      <ConditionalFooter />
      <WhatsAppButton/>
      
    </div>
  );
}

export default App;