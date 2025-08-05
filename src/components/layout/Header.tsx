import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import LogoDesktop from "../home/assets/logo2.png";
import LogoMobile from "../home/assets/logo.png";
import emailjs from "@emailjs/browser";

// Add type definition at the top
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Modified Meta Pixel initialization
  useEffect(() => {
    // Create fbq function if it doesn't exist
    const fbq = function() {
      // @ts-ignore
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    
    if (!window.fbq) {
      window.fbq = fbq;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [] as any[];
    }

    // Load the script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }

    // Initialize and track
    window.fbq('init', '2412627795746465');
    window.fbq('track', 'PageView');
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const service = form.service.value;
    const message = form.message.value;

    const templateParams = {
      name,
      email,
      service,
      message,
    };

    emailjs
    .send(
      "service_52wf8so", // Replace with your EmailJS service ID
      "template_l889yux", // Replace with your EmailJS template ID
      templateParams,
      "4uNPbbh4mrwY7kIYa" // Replace with your EmailJS public key
    )
      .then(
        (result) => {
          console.log("Email successfully sent!", result.text);
          alert("Message sent successfully!");
          form.reset();
          // Track form submission
          window.fbq('track', 'Lead');
        },
        (error) => {
          console.error("Error sending email:", error.text);
          alert("Failed to send the message. Please try again.");
        }
      );
  };

  return (
    <>
      <header className="absolute w-full z-40 py-4 px-6 bg-white md:bg-transparent">
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2412627795746465&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <picture>
              <source media="(max-width: 768px)" srcSet={LogoMobile} />
              <img src={LogoDesktop} alt="Totem Logo" className="h-12 w-auto" />
            </picture>
          </Link>

          <button
            className="md:hidden text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ color: isMenuOpen ? "red" : "#111827" }}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-8">
              <Link
                to="/"
                className="text-white hover:text-gray-200 font-medium"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-white hover:text-gray-200 font-medium"
              >
                About
              </Link>
              <Link
                to="/services"
                className="text-white hover:text-gray-200 font-medium"
              >
                Services
              </Link>
              <Link
                to="/projects"
                className="text-white hover:text-gray-200 font-medium"
              >
                Projects
              </Link>
              <Link
                to="/gallery"
                className="text-white hover:text-gray-200 font-medium"
              >
                Gallery
              </Link>
              <Link
                to="/contact"
                className="text-white hover:text-gray-200 font-medium"
              >
                Contact
              </Link>
            </nav>

            <button
              onClick={() => setShowForm(true)}
              className="bg-white text-gray-900 px-6 py-2.5 rounded hover:bg-gray-100 transition-colors font-medium"
            >
              Get Started
            </button>
          </div>

          {isMenuOpen && (
            <nav className="absolute top-16 left-0 w-full bg-white text-gray-900 shadow-md md:hidden flex flex-col items-center py-4 gap-4">
              <Link
                to="/"
                className="hover:text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="hover:text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/services"
                className="hover:text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                to="/projects"
                className="hover:text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Projects
              </Link>
              <Link
                to="/gallery"
                className="hover:text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </Link>
              <Link
                to="/contact"
                className="hover:text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Contact Form */}
      {showForm && (
        <div className="fixed top-1/2 right-0 -translate-y-1/2 h-[550px] w-full lg:w-[400px] bg-white z-50 overflow-y-auto transition-transform duration-300 transform rounded-l-lg">
          <button
            onClick={() => setShowForm(false)}
            className="absolute top-4 right-4 text-black hover:text-gray-600"
          >
            ✕
          </button>
          <form className="p-4 mt-10" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm text-black mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-transparent outline-none transition-all text-black"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-black mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-transparent outline-none transition-all text-black"
                  required
                />
              </div>

              <div>
                <label htmlFor="service" className="block text-sm text-black mb-1">
                  Service you are Interested in
                </label>
                <input
                  type="text"
                  id="service"
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-transparent outline-none transition-all text-black"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm text-black mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-transparent outline-none transition-all text-black resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white px-6 py-2 text-lg font-medium rounded-lg hover:bg-gray-900 transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}