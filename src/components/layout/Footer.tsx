import React, { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../home/assets/logo.png";

// Define types for routes
interface RouteType {
  name: string;
  path: string;
}

interface SocialType {
  href: string;
  icon: JSX.Element;
  hoverColor: string;
}

const Footer: React.FC = () => {
  // const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(
        "http://localhost:5000/api/test",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
  
      if (response.ok) {
        setEmail(""); // Clear email on success
        console.log("Newsletter subscription successful");
      } else {
        console.error("Newsletter subscription failed:", await response.text());
      }
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // Define routes configuration
  const mainRoutes: RouteType[] = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Projects", path: "/projects" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact", path: "/contact" },
  ];

  const bottomRoutes: RouteType[] = [
    { name: "Home", path: "/" },
    { name: "Team", path: "/team" },
    { name: "Privacy & Policy", path: "/privacy" },
    { name: "Contact", path: "/contact" },
  ];

  const socialLinks: SocialType[] = [
    {
      href: "https://www.facebook.com/profile.php?id=61551952082801&mibextid=ZbWKwL",
      icon: (
        <svg viewBox="0 0 512 512" className="h-6 w-6">
          <path
            fill="currentColor"
            d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"
          />
        </svg>
      ),
      hoverColor: "hover:text-blue-600",
    },
    {
      href: "https://www.instagram.com/totem_management_consultancy/profilecard/",
      icon: (
        <svg viewBox="0 0 448 512" className="h-6 w-6">
          <path
            fill="currentColor"
            d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
          />
        </svg>
      ),
      hoverColor: "hover:text-pink-500",
    },
    {
      href: "https://x.com/totemmangement?t=3EEwzPWxyVaHfKPDIz3Qzw&s=09",
      icon: (
        <svg viewBox="0 0 512 512" className="h-6 w-6">
          <path
            fill="currentColor"
            d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"
          />
        </svg>
      ),
      hoverColor: "hover:text-blue-400",
    },
  ];

  return (
    <>
      {/* Newsletter Section */}
      <div className="py-16 px-6 bg-[#343434] text-white">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Get in Contact with us!</h1>
          <p className="text-lg text-white">
            Receive latest news, updates and many other news every week.
          </p>
        </div>
        <div className="flex justify-center mt-8">
        <div className="relative flex w-full max-w-sm">
        <input
          placeholder="Enter your email address"
          className="w-full h-16 px-6 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 pr-16 text-gray-800"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="absolute right-3 h-12 mt-2 aspect-square bg-[#0072bc] text-white rounded-full flex items-center justify-center hover:bg-blue-700"
          aria-label="Subscribe"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </button>
      </div>
        </div>
      </div>

      {/* Main Footer */}
      <footer className="bg-[#F9F6F0] text-gray-900 py-12 px-6">
        <div className="flex flex-wrap justify-between space-y-8 md:space-y-0">
          {/* Company Info */}
          <div className="w-full md:w-1/3">
            <div className="flex flex-col items-start">
              <img
                alt="Totem Management Logo"
                className="w-32 h-auto mb-4"
                src={Logo}
              />
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail size={20} className="text-gray-900" />
                  <a
                    href="mailto:totemmangement@gmail.com"
                    className="text-lg font-bold hover:underline"
                  >
                    totemmangement@gmail.com
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail size={20} className="text-gray-900" />
                  <a
                    href="mailto:info@totemservices.org"
                    className="text-lg font-bold hover:underline"
                  >
                    info@totemservices.org
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone size={20} className="text-gray-900" />
                  <p className="text-lg font-bold">
                    +91 82784 16000,
                    <br />
                    <span>+91 93508 51909</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pages */}
          <div className="w-full md:w-1/3">
            <h3 className="text-xl font-bold mb-4">Pages</h3>
            <ul className="space-y-2">
              {mainRoutes.map((route) => (
                <li key={route.name}>
                  <Link
                    to={route.path}
                    className="text-lg font-medium hover:underline cursor-pointer"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    {route.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Address and Social */}
          <div className="w-full md:w-1/3">
            <h3 className="text-xl font-bold mb-4">Our Address</h3>
            <p className="text-lg mb-4">
              SCO 10A, Manjha Market, Near Lakshman Chowk, Birala Mandir,
              Kurukshetra, Haryana
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`text-black ${social.hoverColor}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="my-8 border-t border-gray-500" />
        <div className="flex flex-col sm:flex-row text-sm">
          {/* Copyright - First on mobile, second on desktop */}
          <div className="text-center sm:flex-1 order-1 sm:order-2 mb-4 sm:mb-0">
            <p>&copy; 2025 - Totem Management &amp; Consultancy</p>
          </div>

          {/* Navigation Links - Second on mobile, first on desktop */}
          <div className="space-x-4 text-center sm:flex-1 order-2 sm:order-1 mb-4 sm:mb-0">
            {bottomRoutes.map((route) => (
              <Link
                key={route.name}
                to={route.path}
                className="hover:underline cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                {route.name}
              </Link>
            ))}
          </div>

          {/* Developed by - Last on both mobile and desktop */}
          <div className="text-center sm:flex-1 order-3 mb-4 sm:mb-0">
            <p>
              Developed with ❤ By{" "}
              <a
                href="https://wa.me/917992193730"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold hover:text-blue-600 transition-colors"
              >
                ANOVAS
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;