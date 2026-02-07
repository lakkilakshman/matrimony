
import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-md hover:shadow-xl transition-all h-full"
    >
      <div className="bg-maroon/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-maroon" />
      </div>
      <h3 className="text-xl font-bold text-maroon mb-2">{title}</h3>
      <p className="text-gray-700 text-sm font-medium leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
