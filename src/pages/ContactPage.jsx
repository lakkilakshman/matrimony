import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        setTimeout(() => {
            toast({
                title: "Message Sent!",
                description: "Thank you for contacting us. We'll get back to you soon.",
            });
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
            setIsSubmitting(false);
        }, 1000);
    };

    const contactInfo = [
        {
            icon: Phone,
            title: 'Phone',
            details: ['+91 1234567890', '+91 0987654321'],
            color: 'text-blue-600'
        },
        {
            icon: Mail,
            title: 'Email',
            details: ['info@merukulam.com', 'support@merukulam.com'],
            color: 'text-red-600'
        },
        {
            icon: MapPin,
            title: 'Address',
            details: ['Merukulam Matrimony', 'Hyderabad, Telangana, India'],
            color: 'text-green-600'
        },
        {
            icon: Clock,
            title: 'Working Hours',
            details: ['Monday - Saturday: 9:00 AM - 6:00 PM', 'Sunday: Closed'],
            color: 'text-purple-600'
        }
    ];

    return (
        <>
            <Helmet>
                <title>Contact Us - Merukulam Matrimony</title>
                <meta name="description" content="Get in touch with Merukulam Matrimony. We're here to help you find your perfect match." />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-b from-cream to-white">
                <Navbar />

                {/* Hero Section */}
                <section className="relative pt-32 pb-20 bg-gradient-to-r from-maroon to-maroon-dark text-white overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-64 h-64 bg-gold rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-10 right-10 w-64 h-64 bg-cream rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
                        >
                            Contact Us
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg sm:text-xl text-cream/90 max-w-2xl mx-auto"
                        >
                            We're here to help you on your journey to finding your perfect match. Reach out to us anytime!
                        </motion.p>
                    </div>
                </section>

                {/* Contact Info Cards */}
                <section className="py-16 -mt-10">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {contactInfo.map((info, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-gold/20"
                                >
                                    <div className={`${info.color} mb-4`}>
                                        <info.icon className="h-10 w-10" />
                                    </div>
                                    <h3 className="text-xl font-bold text-maroon mb-3">{info.title}</h3>
                                    {info.details.map((detail, idx) => (
                                        <p key={idx} className="text-gray-600 text-sm mb-1">
                                            {detail}
                                        </p>
                                    ))}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Form Section */}
                <section className="py-16">
                    <div className="max-w-4xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-gold/30"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-3xl md:text-4xl font-bold text-maroon mb-4">Send Us a Message</h2>
                                <p className="text-gray-600">
                                    Fill out the form below and we'll get back to you as soon as possible
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-maroon mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border-2 border-gold/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-gray-900"
                                            placeholder="Your name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-maroon mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border-2 border-gold/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-gray-900"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-maroon mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border-2 border-gold/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-gray-900"
                                            placeholder="+91 1234567890"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-maroon mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border-2 border-gold/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-gray-900"
                                            placeholder="How can we help?"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-maroon mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="6"
                                        className="w-full px-4 py-3 border-2 border-gold/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-gray-900 resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    ></textarea>
                                </div>

                                <div className="text-center">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-gradient-to-r from-maroon to-maroon-dark text-white hover:from-maroon-dark hover:to-maroon px-12 py-6 text-lg font-bold shadow-xl disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            'Sending...'
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-5 w-5" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
};

export default ContactPage;
