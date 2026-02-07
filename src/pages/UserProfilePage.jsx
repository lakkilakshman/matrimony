
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  Edit, Trash2, Eye, LayoutDashboard, CreditCard, Heart, MessageCircle,
  MapPin, Calendar, Check, X, Loader2, Send, Search, User as UserIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import UserSidebar from '@/components/UserSidebar';
import EditProfileForm from '@/components/EditProfileForm';
import ImageUpload from '@/components/ImageUpload';
import { getReceivedInterests, getSentInterests, acceptInterest, rejectInterest } from '@/services/interestsService';
import { getConversations, getMessages, sendMessage } from '@/services/messageService';
import api from '@/services/api';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const UserProfilePage = () => {
  const { currentUser, updateProfile, refreshCurrentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Force refresh user data on mount to catch subscription updates
  useEffect(() => {
    const refreshData = async () => {
      try {
        await refreshCurrentUser();
      } catch (err) {
        console.error("Failed to refresh user data", err);
      }
    };
    refreshData();
  }, []);

  // For Plans Tab
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);

  // For Album Tab
  const [userImages, setUserImages] = useState([]);
  const [receivedInterests, setReceivedInterests] = useState([]);
  const [interestsLoading, setInterestsLoading] = useState(false);
  // For Messages Tab
  const [connections, setConnections] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch photos on mount
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const profileId = currentUser?.profile_id || currentUser?.id;
        if (profileId) {
          const response = await api.get(`/profiles/${profileId}/photos`);
          if (response && response.success && Array.isArray(response.data)) {
            setUserImages(response.data);
          } else if (currentUser?.photo) {
            // Fallback to legacy photo if no album photos
            setUserImages([{
              id: 'legacy-photo',
              url: currentUser.photo,
              isPrimary: true,
              uploadedAt: new Date().toISOString()
            }]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch photos:', error);
      }
    };

    if (currentUser) {
      fetchPhotos();
    }
  }, [currentUser]);

  // Fetch received interests
  const fetchInterests = async () => {
    setInterestsLoading(true);
    try {
      const response = await getReceivedInterests();
      if (response && response.success && Array.isArray(response.data)) {
        setReceivedInterests(response.data);
      } else {
        setReceivedInterests([]);
      }
    } catch (error) {
      console.error('Failed to fetch interests:', error);
    } finally {
      setInterestsLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const [sentRes, receivedRes, convRes] = await Promise.all([
        getSentInterests(),
        getReceivedInterests(),
        getConversations()
      ]);

      const acceptedSent = (sentRes?.success && Array.isArray(sentRes.data))
        ? sentRes.data.filter(i => i.status === 'accepted').map(i => ({
          other_user_id: i.user_id, // Use the user_id from profiles table
          first_name: i.first_name || i.firstName,
          last_name: i.last_name || i.lastName,
          profile_photo: i.profile_photo || i.profilePhoto,
          id: i.id // interest id
        }))
        : [];

      const acceptedReceived = (receivedRes?.success && Array.isArray(receivedRes.data))
        ? receivedRes.data.filter(i => i.status === 'accepted').map(i => ({
          other_user_id: i.user_id, // Use the user_id from profiles table
          first_name: i.first_name || i.firstName,
          last_name: i.last_name || i.lastName,
          profile_photo: i.profile_photo || i.profilePhoto,
          id: i.id // interest id
        }))
        : [];

      const activeConversations = (convRes?.success && Array.isArray(convRes.data)) ? convRes.data : [];

      // Combine and deduplicate connections
      const allConnections = [...acceptedSent, ...acceptedReceived];
      const uniqueConnections = Array.from(new Map(allConnections.map(item => [item.other_user_id, item])).values());

      // Merge with conversation data
      const displayList = uniqueConnections.map(conn => {
        const conv = activeConversations.find(c => c.other_user_id === conn.other_user_id);
        return {
          ...conn,
          last_message: conv ? conv.last_message : 'Start a conversation',
          last_message_at: conv ? conv.last_message_at : null,
          unread_count: conv ? conv.unread_count : 0,
          isOnline: Math.random() > 0.7 // Mock online status for demo
        };
      });

      // Sort by last message time or name
      displayList.sort((a, b) => {
        if (a.last_message_at && b.last_message_at) return new Date(b.last_message_at) - new Date(a.last_message_at);
        if (a.last_message_at) return -1;
        if (b.last_message_at) return 1;
        return 0;
      });

      setConnections(displayList);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    }
  };

  const fetchChatMessages = async (otherUserId) => {
    setChatLoading(true);
    try {
      const response = await getMessages(otherUserId);
      if (response && response.success && Array.isArray(response.data)) {
        setChatMessages(response.data);
      } else {
        setChatMessages([]);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    if (currentUser?.subscription_status !== 'active' && currentUser?.role !== 'admin') {
      toast({
        title: "Premium Feature",
        description: "Please upgrade to a premium plan to send messages.",
        variant: "destructive"
      });
      return;
    }

    setSendingMessage(true);
    try {
      const response = await sendMessage(selectedConversation.other_user_id, newMessage);
      if (response && response.success) {
        setChatMessages([...chatMessages, {
          id: Date.now(),
          sender_id: currentUser.id,
          message: newMessage,
          sent_at: new Date().toISOString()
        }]);
        setNewMessage('');
        // Refresh conversations to show last message
        fetchConnections();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    } finally {
      setSendingMessage(false);
    }
  };


  useEffect(() => {
    if (activeTab === 'interests') {
      fetchInterests();
    } else if (activeTab === 'messages') {
      fetchConnections();
    } else if (activeTab === 'plan') {
      fetchPlans();
    }
  }, [activeTab]);

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      console.log('Fetching plans from /payments/plans...');
      // Use the same endpoint as PricingPage
      const response = await api.get('/payments/plans');
      console.log('Plans API response:', response);
      if (response && response.success) {
        setPlans(response.data);
      } else {
        console.error('Plans API returned unsuccessful response:', response);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive"
      });
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      fetchChatMessages(selectedConversation.other_user_id);
      // Poll for new messages every 5 seconds
      const interval = setInterval(() => fetchChatMessages(selectedConversation.other_user_id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);


  const handleAcceptInterest = async (id, name) => {
    try {
      const response = await acceptInterest(id);
      if (response && response.success) {
        toast({
          title: 'Interest Accepted!',
          description: `You have accepted ${name}'s interest.`
        });
        setReceivedInterests(receivedInterests.map(i => i.id === id ? { ...i, status: 'accepted' } : i));
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to accept interest', variant: 'destructive' });
    }
  };

  const handleRejectInterest = async (id) => {
    try {
      const response = await rejectInterest(id);
      if (response && response.success) {
        toast({ title: 'Interest Rejected', description: 'Request has been rejected.' });
        setReceivedInterests(receivedInterests.map(i => i.id === id ? { ...i, status: 'rejected' } : i));
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reject interest', variant: 'destructive' });
    }
  };

  const handleImagesChange = (newImages) => {
    setUserImages(newImages);
    // Auto-save when images change in Album tab
    updateProfile({
      ...currentUser,
      images: newImages
    });
  };

  const handleDelete = () => {
    toast({
      title: '🚧 Feature Not Implemented',
      description: 'Profile deletion functionality coming soon!'
    });
  };

  const formatLabel = (value) => {
    if (!value) return 'N/A';
    return value.toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gold/20 p-6 flex items-start gap-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gold/20 flex-shrink-0">
                <img
                  src={getFullImageUrl(userImages.find(img => img.isPrimary)?.url || userImages[0]?.url) || "https://via.placeholder.com/150"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-maroon">{currentUser?.firstName} {currentUser?.lastName}</h2>
                    <p className="text-gray-500">ID: {currentUser?.matrimonyId || currentUser?.matrimony_id || 'N/A'}</p>

                    <div className="mt-2 flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${currentUser?.subscriptionStatus === 'active'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gold/20 text-maroon'
                        }`}>
                        {(currentUser?.planName || currentUser?.plan_name || 'Free Plan')}
                        {currentUser?.subscriptionStatus === 'active' && ' - Active'}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setActiveTab('edit-profile')}
                    variant="outline"
                    size="sm"
                    className="border-gold text-maroon hover:bg-gold/10"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Age</p>
                    <p className="font-medium text-gray-800">{currentUser?.age} Years</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium text-gray-800">{currentUser?.city}, {currentUser?.state}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Education</p>
                    <p className="font-medium text-gray-800">{formatLabel(currentUser?.education || currentUser?.education_level || currentUser?.educationLevel)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Info Sections (Reusing the previous layout structure inside the tab) */}
            <div className="bg-white rounded-xl shadow-sm border border-gold/20 p-8 space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold text-maroon mb-4 border-b border-gold/10 pb-2">Basic Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-800">{currentUser?.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Mobile</span>
                    <span className="font-medium text-gray-800">{currentUser?.mobile}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Date of Birth</span>
                    <span className="font-medium text-gray-800">
                      {currentUser?.dateOfBirth || currentUser?.date_of_birth
                        ? new Date(currentUser?.dateOfBirth || currentUser?.date_of_birth).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Marital Status</span>
                    <span className="font-medium text-gray-800">{formatLabel(currentUser?.maritalStatus || currentUser?.marital_status)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Bio</span>
                    <span className="font-medium text-gray-800 col-span-2 mt-1">{currentUser?.bio || 'No bio added'}</span>
                  </div>
                </div>
              </div>

              {/* Physical Attributes - Added Missing Section */}
              <div>
                <h2 className="text-lg font-semibold text-maroon mb-4 border-b border-gold/10 pb-2">Physical Attributes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Height</span>
                    <span className="font-medium text-gray-800">{currentUser?.height || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Weight</span>
                    <span className="font-medium text-gray-800">{currentUser?.weight || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Complexion</span>
                    <span className="font-medium text-gray-800">{currentUser?.complexion || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Gender</span>
                    <span className="font-medium text-gray-800 capitalize">{currentUser?.gender || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Religious Info */}
              <div>
                <h2 className="text-lg font-semibold text-maroon mb-4 border-b border-gold/10 pb-2">Religious Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Religion</span>
                    <span className="font-medium text-gray-800">{currentUser?.religion || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Caste</span>
                    <span className="font-medium text-gray-800">{currentUser?.caste || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Raasi</span>
                    <span className="font-medium text-gray-800 capitalize">{currentUser?.raasi || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Star</span>
                    <span className="font-medium text-gray-800 capitalize">{currentUser?.star || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Birth Time</span>
                    <span className="font-medium text-gray-800">{currentUser?.birthTime || currentUser?.birth_time || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Birth Place</span>
                    <span className="font-medium text-gray-800">{currentUser?.birthPlace || currentUser?.birth_place || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div>
                <h2 className="text-lg font-semibold text-maroon mb-4 border-b border-gold/10 pb-2">Professional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Education</span>
                    <span className="font-medium text-gray-800">{formatLabel(currentUser?.education || currentUser?.education_level || currentUser?.educationLevel)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Occupation</span>
                    <span className="font-medium text-gray-800 capitalize">{formatLabel(currentUser?.occupation || currentUser?.occupation_category || currentUser?.occupationCategory)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Company</span>
                    <span className="font-medium text-gray-800">{currentUser?.company || currentUser?.company_name || currentUser?.companyName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Annual Income</span>
                    <span className="font-medium text-gray-800">{formatLabel(currentUser?.annualIncome || currentUser?.annual_income || currentUser?.income)}</span>
                  </div>
                </div>
              </div>

              {/* Family Details - Added Missing Section */}
              <div>
                <h2 className="text-lg font-semibold text-maroon mb-4 border-b border-gold/10 pb-2">Family Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Father's Occupation</span>
                    <span className="font-medium text-gray-800">{formatLabel(currentUser?.fatherOccupation || currentUser?.father_occupation || 'N/A')}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Mother's Occupation</span>
                    <span className="font-medium text-gray-800">{formatLabel(currentUser?.motherOccupation || currentUser?.mother_occupation || 'N/A')}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Brothers</span>
                    <span className="font-medium text-gray-800">{currentUser?.brothers || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Sisters</span>
                    <span className="font-medium text-gray-800">{currentUser?.sisters || 0}</span>
                  </div>
                </div>
              </div>

              {/* Location Details - Added Missing Section */}
              <div>
                <h2 className="text-lg font-semibold text-maroon mb-4 border-b border-gold/10 pb-2">Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Address</span>
                    <span className="font-medium text-gray-800 col-span-2">{currentUser?.permanentAddress || currentUser?.permanent_address || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">City</span>
                    <span className="font-medium text-gray-800">{currentUser?.city || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">State</span>
                    <span className="font-medium text-gray-800">{currentUser?.state || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'edit-profile':
        return <EditProfileForm onCancel={() => setActiveTab('profile')} onSuccess={() => setActiveTab('profile')} />;

      case 'album':
        const pid = currentUser?.profile_id || currentUser?.id;

        if (!pid) {
          return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">
              Error: User Profile ID missing. Please log out and login again.
            </div>
          );
        }

        return (
          <div className="bg-white rounded-xl shadow-sm border border-gold/20 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-maroon mb-2">My Album</h2>
              <p className="text-gray-500">Manage your profile photos. You can upload up to 5 photos.</p>
            </div>

            <ImageUpload
              images={userImages}
              onImagesChange={handleImagesChange}
              maxImages={5}
              profileId={pid}
            />
          </div>
        );

      case 'plan':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm border border-gold/20 p-12 text-center">
            <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="h-10 w-10 text-maroon" />
            </div>
            <h2 className="text-2xl font-bold text-maroon mb-4">Membership Plans</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">Upgrade to premium to unlock messaging, view contact numbers, and get better visibility.</p>

            {plansLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 text-maroon animate-spin" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {plans.length > 0 ? (
                  plans.map((plan, index) => (
                    <div
                      key={plan.id}
                      className={`border-2 rounded-xl p-6 transition-colors relative overflow-hidden ${plan.price > 0
                        ? 'border-gold bg-gold/5'
                        : 'border-gray-200 hover:border-maroon'
                        }`}
                    >
                      {plan.price > 0 && (
                        <div className="absolute top-0 right-0 bg-gold text-maroon text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
                      )}

                      <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                      <p className="text-3xl font-bold text-maroon mb-4">
                        ₹{plan.price}
                        <span className="text-sm font-normal text-gray-500">/{plan.duration_months}mo</span>
                      </p>

                      <ul className="text-sm text-left space-y-2 mb-6">
                        {plan.features?.map((feature, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-green-500">✓</span> {feature}
                          </li>
                        ))}
                      </ul>

                      {/* Check subscription status */}
                      {currentUser?.subscription_plan_id == plan.id ? (
                        currentUser?.subscription_status === 'pending' ? (
                          <Button variant="outline" className="w-full border-yellow-500 text-yellow-600 bg-yellow-50" disabled>
                            Verification Pending
                          </Button>
                        ) : currentUser?.subscription_status === 'active' ? (
                          <Button variant="outline" className="w-full bg-green-50 text-green-700 border-green-200" disabled>
                            Current Active Plan
                          </Button>
                        ) : (
                          // Expired or other status
                          <Button variant="outline" className="w-full" disabled>
                            Current Plan
                          </Button>
                        )
                      ) : (
                        // Not the current plan
                        // Check if this plan is the user's current plan (including free plan logic)
                        ((currentUser?.subscription_plan_id === plan.id) || (!currentUser?.subscription_plan_id && plan.id === 5)) ? (
                          <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                        ) : (
                          <Link to={`/payment/${plan.id}`} className="block">
                            <Button className="w-full border-maroon text-maroon hover:bg-maroon hover:text-white">
                              Select Plan
                            </Button>
                          </Link>
                        )
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-gray-500">No plans available at the moment.</div>
                )}
              </div>
            )}
          </motion.div>
        );

      case 'interests':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm border border-gold/20 p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-maroon">Interests Received</h2>
                <p className="text-gray-500">Respond to people who are interested in you.</p>
              </div>
              <Button onClick={fetchInterests} variant="outline" size="sm" className="border-gold text-maroon">Refresh</Button>
            </div>

            {interestsLoading ? (
              <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon mx-auto mb-4"></div>
                <p className="text-gray-500">Loading interests...</p>
              </div>
            ) : receivedInterests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {receivedInterests.map((interest) => (
                  <div key={interest.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                      <img
                        src={getFullImageUrl(interest.profile_photo) || "https://via.placeholder.com/150"}
                        alt={interest.first_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{interest.first_name} {interest.last_name}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                          <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {interest.age} Yrs</span>
                          <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {interest.city}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">
                          Sent {formatTimeAgo(interest.sent_at)}
                        </p>
                      </div>

                      <div className="mt-3 flex gap-2">
                        {interest.status === 'pending' ? (
                          <>
                            <Button
                              onClick={() => handleAcceptInterest(interest.id, interest.first_name)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 h-8 text-xs flex-1"
                            >
                              <Check className="h-3 w-3 mr-1" /> Accept
                            </Button>
                            <Button
                              onClick={() => handleRejectInterest(interest.id)}
                              variant="outline"
                              size="sm"
                              className="border-red-200 text-red-500 hover:bg-red-50 h-8 text-xs flex-1"
                            >
                              <X className="h-3 w-3 mr-1" /> Reject
                            </Button>
                          </>
                        ) : (
                          <div className={`w-full py-1 rounded text-center text-xs font-bold uppercase tracking-wider ${interest.status === 'accepted' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {interest.status}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 py-12 border-2 border-dashed border-gray-200 rounded-xl text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-gray-400">No interests received yet</p>
              </div>
            )}
          </motion.div>
        );

      case 'messages':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm border border-gold/20 flex flex-col h-[600px] overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar - Conversations List */}
              <div className="w-1/3 border-r border-gray-100 flex flex-col">
                <div className="p-4 border-b border-gray-50 flex items-center bg-gray-50/50">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search chats..."
                      className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {/* Horizontal Connections List (Stories style) */}
                  {connections.length > 0 && (
                    <div className="p-4 border-b border-gray-50 overflow-x-auto whitespace-nowrap scrollbar-hide">
                      <div className="flex gap-4">
                        {connections.map((conn) => (
                          <div
                            key={`h-${conn.other_user_id}`}
                            onClick={() => setSelectedConversation(conn)}
                            className="flex flex-col items-center gap-1 cursor-pointer min-w-[60px]"
                          >
                            <div className="relative w-12 h-12">
                              <div className={`w-12 h-12 rounded-full overflow-hidden border-2 p-0.5 ${conn.unread_count > 0 ? 'border-gold' : 'border-gray-100'}`}>
                                <img
                                  src={getFullImageUrl(conn.profile_photo) || "https://via.placeholder.com/150"}
                                  alt={conn.first_name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              </div>
                              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${conn.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            </div>
                            <span className="text-[10px] font-medium text-gray-600 truncate w-full text-center">
                              {conn.first_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vertical Conversations List */}
                  {connections.length > 0 ? (
                    connections.map((conn) => (
                      <div
                        key={conn.other_user_id}
                        onClick={() => setSelectedConversation(conn)}
                        className={`p-4 flex gap-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${selectedConversation?.other_user_id === conn.other_user_id
                          ? 'bg-maroon/5 border-l-4 border-maroon'
                          : 'hover:bg-gray-50'
                          }`}
                      >
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100">
                            <img
                              src={getFullImageUrl(conn.profile_photo) || "https://via.placeholder.com/150"}
                              alt={conn.first_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Online Status Indicator */}
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${conn.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-gray-800 text-sm truncate">{conn.first_name} {conn.last_name}</h4>
                            <span className="text-[10px] text-gray-400">
                              {conn.last_message_at ? formatTimeAgo(conn.last_message_at) : ''}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">{conn.last_message}</p>
                          {conn.unread_count > 0 && (
                            <div className="mt-1 flex justify-end">
                              <span className="bg-gold text-maroon text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {conn.unread_count}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400">
                      <p className="text-sm">No connections yet.</p>
                      <p className="text-xs mt-1">Accept interests to start chatting.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col bg-gray-50/30">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                          <img
                            src={getFullImageUrl(selectedConversation.profile_photo) || "https://via.placeholder.com/150"}
                            alt={selectedConversation.first_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{selectedConversation.first_name} {selectedConversation.last_name}</h4>
                          <span className="text-xs text-green-500 font-medium">Online</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-maroon">
                        <UserIcon className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {chatLoading ? (
                        <div className="flex justify-center py-10">
                          <Loader2 className="h-6 w-6 text-maroon animate-spin" />
                        </div>
                      ) : chatMessages.length > 0 ? (
                        chatMessages.map((msg, idx) => (
                          <div
                            key={msg.id || idx}
                            className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.sender_id === currentUser.id
                                ? 'bg-maroon text-white rounded-tr-none'
                                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                }`}
                            >
                              <p>{msg.message}</p>
                              <p className={`text-[10px] mt-1 text-right ${msg.sender_id === currentUser.id ? 'text-white/60' : 'text-gray-400'}`}>
                                {new Date(msg.sent_at || msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-gray-400 text-sm">
                          Start your conversation with {selectedConversation.first_name}
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-white border-t border-gray-100">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20"
                          disabled={sendingMessage}
                        />
                        <Button
                          disabled={!newMessage.trim() || sendingMessage}
                          type="submit"
                          className="bg-maroon text-white rounded-full w-10 h-10 p-0 flex items-center justify-center hover:bg-maroon-dark"
                        >
                          {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">Select a Conversation</h3>
                    <p className="text-sm text-gray-500">Choose a chat from the left to start messaging.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <>
      <Helmet>
        <title>My Dashboard - Merukulam Matrimony</title>
        <meta name="description" content="Manage your Merukulam Matrimony profile" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="pt-28 pb-16 px-4 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-maroon mb-8">My Dashboard</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              <UserSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

              {/* Quick Stats Widget */}
              <div className="bg-white rounded-xl shadow-sm border border-gold/20 p-6 mt-6">
                <h3 className="font-semibold text-maroon mb-4">Profile Completion</h3>
                {(() => {
                  const calculateCompletion = (user) => {
                    if (!user) return 0;
                    const fields = [
                      'firstName', 'lastName', 'email', 'mobile',
                      'dateOfBirth', 'gender', 'maritalStatus', 'height', 'weight', 'complexion',
                      'education', 'occupation', 'annualIncome',
                      'city', 'state', 'country', 'permanentAddress',
                      'fatherOccupation', 'motherOccupation', 'bio'
                    ];

                    // Add photo check (either profilePhoto string or images array)
                    let filledCount = 0;
                    // Check standard fields
                    fields.forEach(field => {
                      if (user[field]) filledCount++;
                    });

                    // Check photo
                    if (user.profilePhoto || (user.images && user.images.length > 0)) filledCount++;

                    const totalFields = fields.length + 1; // +1 for photo
                    return Math.round((filledCount / totalFields) * 100);
                  };

                  const percent = calculateCompletion(currentUser);

                  return (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div className="bg-gradient-to-r from-gold to-yellow-500 h-2.5 rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500 text-right">{percent}% Completed</p>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-3">
              {renderContent()}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default UserProfilePage;
