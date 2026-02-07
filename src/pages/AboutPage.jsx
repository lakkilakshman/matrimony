import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Heart, Shield, Users, Star, Target, Award, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AboutPage = () => {
    const stats = [
        { number: '10,000+', label: 'Verified Profiles' },
        { number: '500+', label: 'Success Stories' },
        { number: '100%', label: 'Verified Members' },
        { number: '24/7', label: 'Support Available' }
    ];

    const values = [
        {
            icon: Shield,
            title: 'Trust & Safety',
            description: 'Every profile is thoroughly verified to ensure authenticity and safety for all our members.',
            color: 'text-blue-600'
        },
        {
            icon: Heart,
            title: 'Personalized Matching',
            description: 'Our advanced matching algorithm helps you find compatible partners based on your preferences.',
            color: 'text-red-600'
        },
        {
            icon: Users,
            title: 'Community Focus',
            description: 'Dedicated to serving the Merukulam community with culturally relevant matchmaking services.',
            color: 'text-green-600'
        },
        {
            icon: Star,
            title: 'Quality Service',
            description: 'Committed to providing exceptional service and support throughout your journey.',
            color: 'text-yellow-600'
        }
    ];

    const features = [
        'Advanced search filters for precise matching',
        'Verified profiles with background checks',
        'Privacy controls for your personal information',
        'Dedicated customer support team',
        'Mobile-friendly platform',
        'Success story sharing and inspiration'
    ];

    return (
        <>
            <Helmet>
                <title>About Us - Merukulam Matrimony</title>
                <meta name="description" content="Learn about Merukulam Matrimony - India's most trusted matrimony platform for the Merukulam community." />
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
                            About Merukulam Matrimony
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg sm:text-xl text-cream/90 max-w-3xl mx-auto"
                        >
                            India's most trusted matrimony platform dedicated to helping members of the Merukulam community find their perfect life partner
                        </motion.p>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 -mt-10">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg p-6 text-center border-2 border-gold/20 hover:shadow-xl transition-shadow"
                                >
                                    <div className="text-3xl md:text-4xl font-bold text-gold mb-2">{stat.number}</div>
                                    <div className="text-sm md:text-base text-gray-600 font-medium">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Our Story Section */}
                <section className="py-16">
                    <div className="max-w-4xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-maroon mb-6">Our Story</h2>
                            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                                <p>
                                    Merukulam Matrimony was founded with a simple yet powerful vision: to help members of the Merukulam community find their perfect life partner in a safe, trusted, and culturally relevant environment.
                                </p>
                                <p>
                                    Understanding the unique values, traditions, and preferences of our community, we've built a platform that goes beyond simple matchmaking. We focus on creating meaningful connections based on compatibility, shared values, and family traditions.
                                </p>
                                <p>
                                    With thousands of verified profiles and hundreds of success stories, we've become the most trusted matrimony platform for the Merukulam community across India and beyond.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Our Values Section */}
                <section className="py-16 bg-gradient-to-b from-white to-cream">
                    <div className="max-w-7xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-maroon mb-4">Our Core Values</h2>
                            <p className="text-gray-600 text-lg">
                                The principles that guide everything we do
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((value, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-gold/20"
                                >
                                    <div className={`${value.color} mb-4`}>
                                        <value.icon className="h-12 w-12" />
                                    </div>
                                    <h3 className="text-xl font-bold text-maroon mb-3">{value.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16">
                    <div className="max-w-4xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-maroon mb-4">What We Offer</h2>
                            <p className="text-gray-600 text-lg">
                                Features designed to help you find your perfect match
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-md border border-gold/20"
                                >
                                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700 font-medium">{feature}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-16 bg-gradient-to-r from-maroon to-maroon-dark text-white">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <Target className="h-16 w-16 mx-auto mb-6 text-gold" />
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
                            <p className="text-lg md:text-xl text-cream/90 leading-relaxed">
                                To create a trusted, safe, and culturally sensitive platform where members of the Merukulam community can find their ideal life partner, build lasting relationships, and create happy families that honor our traditions and values.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
};

export default AboutPage;
