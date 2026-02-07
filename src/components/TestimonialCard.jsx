
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const TestimonialCard = ({ name, image, text, rating = 5 }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-md h-full"
    >
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={image}
          alt={name}
          className="w-16 h-16 rounded-full object-cover border-2 border-gold"
        />
        <div>
          <h4 className="text-maroon font-bold text-lg">{name}</h4>
          <div className="flex space-x-1">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-gold fill-gold" />
            ))}
          </div>
        </div>
      </div>
      <p className="text-gray-700 text-sm italic font-medium leading-relaxed">"{text}"</p>
    </motion.div>
  );
};

export default TestimonialCard;
