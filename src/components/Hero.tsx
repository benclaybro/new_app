import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Battery, PiggyBank } from 'lucide-react';

export const Hero = () => {
  const scrollToDesign = () => {
    const designSection = document.getElementById('design-tool');
    if (designSection) {
      designSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Solar Journey,
            <span className="text-blue-600"> Simplified</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Design your solar system, get instant quotes, and manage your entire project
            through our AI-powered platform. No salespeople, just savings.
          </p>
          
          <div className="mb-16">
            <button 
              onClick={scrollToDesign}
              className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg hover:bg-blue-700 transition-colors"
            >
              Start Your Design
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <Sun className="h-8 w-8 text-yellow-500" />,
                title: "AI-Powered Design",
                description: "Custom solar designs created instantly using advanced AI technology"
              },
              {
                icon: <PiggyBank className="h-8 w-8 text-green-500" />,
                title: "Transparent Pricing",
                description: "Get instant quotes with no hidden fees or pushy sales tactics"
              },
              {
                icon: <Battery className="h-8 w-8 text-blue-500" />,
                title: "Project Tracking",
                description: "Monitor your installation progress in real-time through our dashboard"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 * (index + 1) }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};