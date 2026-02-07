import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Check, Star, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

const PricingPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/payments/plans');
                if (response.data.success) {
                    setPlans(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching plans:', error);
                toast({
                    title: "Error",
                    description: "Failed to load subscription plans",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const handleSelectPlan = (planId) => {
        if (!isAuthenticated) {
            toast({
                title: "Login Required",
                description: "Please login to subscribe to a plan",
            });
            navigate('/login');
            return;
        }
        navigate(`/payment/${planId}`);
    };

    return (
        <>
            <Helmet>
                <title>Premium Membership Plans - Merukulam Matrimony</title>
                <meta name="description" content="Choose the perfect membership plan to find your life partner. Upgrade to premium for exclusive features." />
            </Helmet>

            <div className="min-h-screen bg-gray-50">
                <Navbar />

                {/* Hero Section */}
                <section className="pt-32 pb-20 bg-gradient-to-r from-maroon to-maroon-dark text-white text-center">
                    <div className="max-w-7xl mx-auto px-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold mb-6"
                        >
                            Upgrade to Premium
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-cream/90 max-w-2xl mx-auto"
                        >
                            Get access to contact details, chat features, and more with our value-packed membership plans
                        </motion.p>
                    </div>
                </section>

                {/* Plans Grid */}
                <section className="py-20 -mt-10">
                    <div className="max-w-7xl mx-auto px-4">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {plans.map((plan, index) => (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 ${index === 1 ? 'border-gold transform scale-105 z-10' : 'border-transparent'
                                            }`}
                                    >
                                        {index === 1 && (
                                            <div className="absolute top-0 right-0 bg-gold text-maroon text-xs font-bold px-3 py-1 rounded-bl-lg uppercase">
                                                Most Popular
                                            </div>
                                        )}

                                        <div className="p-8">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                            <div className="flex items-baseline mb-4">
                                                <span className="text-3xl font-bold text-maroon">₹{plan.price}</span>
                                                <span className="text-gray-500 ml-2">/ {plan.duration_months} mo</span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                                            {/* Subscription Status Check */}
                                            {isAuthenticated && useAuth().currentUser?.subscription_plan_id == plan.id ? (
                                                useAuth().currentUser?.subscription_status === 'pending' ? (
                                                    <Button className="w-full py-6 font-bold text-lg mb-8 bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200" disabled>
                                                        Verification Pending
                                                    </Button>
                                                ) : useAuth().currentUser?.subscription_status === 'active' ? (
                                                    <Button className="w-full py-6 font-bold text-lg mb-8 bg-green-100 text-green-700 border border-green-300 hover:bg-green-200" disabled>
                                                        Current Active Plan
                                                    </Button>
                                                ) : (
                                                    <Button variant="outline" className="w-full py-6 font-bold text-lg mb-8" disabled>
                                                        Current Plan
                                                    </Button>
                                                )
                                            ) : (
                                                <Button
                                                    onClick={() => handleSelectPlan(plan.id)}
                                                    className={`w-full py-6 font-bold text-lg mb-8 ${index === 1
                                                        ? 'bg-gradient-to-r from-gold to-yellow-500 text-maroon hover:from-yellow-500 hover:to-gold'
                                                        : 'bg-maroon text-white hover:bg-maroon-dark'
                                                        }`}
                                                >
                                                    {plan.price === 0 && !isAuthenticated ? "Get Started Free" : "Choose Plan"}
                                                </Button>
                                            )}

                                            <ul className="space-y-4">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-start">
                                                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                                        <span className="text-gray-600 text-sm">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Trust Badges */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="flex flex-col items-center">
                                <div className="bg-green-100 p-4 rounded-full mb-4">
                                    <Shield className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Secure Payments</h3>
                                <p className="text-gray-600">Your payment information is encrypted and secure</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="bg-blue-100 p-4 rounded-full mb-4">
                                    <Star className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Premium Benefits</h3>
                                <p className="text-gray-600">Instant access to all premium features</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="bg-purple-100 p-4 rounded-full mb-4">
                                    <Check className="h-8 w-8 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Trusted Service</h3>
                                <p className="text-gray-600">Join thousands of happy paid members</p>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
};

export default PricingPage;
