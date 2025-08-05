import React from 'react';
import { Shield, Lock, Eye, Bell, LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}

const PrivacyAndPolicy: React.FC = () => {
  const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
      <div className="flex items-center mb-4">
        <Icon className="w-6 h-6 text-blue-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600">{children}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center animate-fade-in">
            Privacy & Policy
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-blue-100 animate-fade-in delay-200">
            Your privacy is our priority. Learn how we protect and manage your information.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="max-w-3xl mx-auto mb-12 animate-slide-in">
          <p className="text-gray-600 text-lg leading-relaxed">
            At our consultancy, we are committed to maintaining the trust and confidence of our visitors and clients. This privacy policy explains how we handle your personal information and data. We update this policy regularly to ensure continued compliance with data protection laws.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <FeatureCard icon={Shield} title="Data Protection">
            We employ industry-standard security measures to protect your personal information from unauthorized access, disclosure, or misuse.
          </FeatureCard>

          <FeatureCard icon={Lock} title="Secure Storage">
            All sensitive data is encrypted and stored on secure servers with regular security audits and updates.
          </FeatureCard>

          <FeatureCard icon={Eye} title="Transparency">
            We are fully transparent about how we collect, use, and process your personal information.
          </FeatureCard>

          <FeatureCard icon={Bell} title="Your Rights">
            You have the right to access, modify, or delete your personal information at any time.
          </FeatureCard>
        </div>

        {/* Detailed Sections */}
        <div className="max-w-3xl mx-auto space-y-12 animate-slide-in">
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Information We Collect</h2>
            <div className="prose text-gray-600">
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal identification information (Name, email address, phone number)</li>
                <li>Professional information (Company name, job title)</li>
                <li>Technical information (IP address, browser type, device information)</li>
                <li>Usage data (How you interact with our services)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use your information to provide and improve our services, communicate with you, and ensure compliance with legal obligations. Specific uses include:
            </p>
            <div className="prose text-gray-600">
              <ul className="list-disc pl-6 space-y-2">
                <li>Providing and personalizing our services</li>
                <li>Processing your requests and transactions</li>
                <li>Sending administrative information and updates</li>
                <li>Improving our website and services</li>
                <li>Conducting research and analysis</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Privacy Rights</h2>
            <p className="text-gray-600 mb-4">
              You have several rights regarding your personal information:
            </p>
            <div className="prose text-gray-600">
              <ul className="list-disc pl-6 space-y-2">
                <li>Right to access your personal data</li>
                <li>Right to correct inaccurate information</li>
                <li>Right to request deletion of your information</li>
                <li>Right to restrict processing of your data</li>
                <li>Right to data portability</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyAndPolicy;