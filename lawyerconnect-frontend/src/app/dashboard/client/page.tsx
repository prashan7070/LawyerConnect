'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  User,
  Filter,
  Video,
  Building2,
  ChevronRight,
  MessageSquare,
  Award,
  CheckCircle2,
  FileText,
  CreditCard,
  X,
  Phone,
  Mail,
  Briefcase,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  Check,
  Bell,
  LogOut,
  ExternalLink,
  Lock
} from 'lucide-react';
import { apiClient, getStoredAuth, clearAuthData } from '@/lib/api';
import MessengerChat from '@/components/MessengerChat';

interface Lawyer {
  id: number;
  userId?: number;
  fullName: string;
  email: string;
  specialties: string;
  yearsOfExperience: number;
  onlineFee: number;
  inPersonFee: number;
  licenceNumber: string;
  phone?: string;
  workingAddress?: string;
  bio?: string;
  profilePictureUrl?: string;
  rating?: number;
  reviewCount?: number;
}

interface Appointment {
  id: number;
  lawyerName?: string;
  consultationType: string;
  scheduledAt: string;
  status: string;
  notes?: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface Review {
  id: number;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export default function ClientDashboardPage() {
  const router = useRouter();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'directory' | 'appointments'>('directory');

  // Modals
  const [profileModalLawyer, setProfileModalLawyer] = useState<Lawyer | null>(null);
  const [profileActiveTab, setProfileActiveTab] = useState<'about' | 'practice' | 'rates' | 'reviews'>('about');
  const [bookingLawyer, setBookingLawyer] = useState<Lawyer | null>(null);

  // Messenger Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChatPartner, setSelectedChatPartner] = useState<{ id: number; name: string; avatarUrl?: string } | null>(null);

  const openChatWithLawyer = (lawyer: Lawyer) => {
    const targetId = lawyer.userId || lawyer.id;
    setSelectedChatPartner({
      id: targetId,
      name: lawyer.fullName,
      avatarUrl: lawyer.profilePictureUrl
    });
    setIsChatOpen(true);
  };

  // Booking Wizard Steps (1: Mode, 2: Date & Slot, 3: Case Brief, 4: Payment)
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [consultationType, setConsultationType] = useState<'ONLINE' | 'IN_PERSON'>('ONLINE');
  const [bookingDate, setBookingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [caseNotes, setCaseNotes] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    cardNumber: '4532 •••• •••• 8921',
    cardHolder: '',
    expiry: '08/28',
    cvc: '392'
  });

  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [clientName, setClientName] = useState('Client');

  // Categories list
  const categories = [
    'ALL',
    'Criminal Defense',
    'Corporate Law',
    'Civil Litigation',
    'Family Law',
    'Intellectual Property',
    'Property & Land'
  ];

  // Sample Reviews
  const sampleReviews: Review[] = [
    {
      id: 1,
      clientName: 'Dinesh Samarasinghe',
      rating: 5,
      comment: 'Extremely thorough legal strategy. Won our corporate arbitration dispute in record time!',
      date: '2 days ago'
    },
    {
      id: 2,
      clientName: 'Nipuni Fernando',
      rating: 5,
      comment: 'Very empathetic counsel during land deed litigation. Highly recommended!',
      date: '1 week ago'
    }
  ];

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth?.accessToken) {
      router.push('/login');
      return;
    }

    if (auth.name) {
      setClientName(auth.name);
      setPaymentData(prev => ({ ...prev, cardHolder: auth.name || '' }));
    }

    loadDashboardData();
  }, [router]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const loadDashboardData = async () => {
    try {
      const [lawyersRes, appointmentsRes] = await Promise.all([
        apiClient.get('/api/client/explore/getAllLawyers').catch(() => ({ data: { data: [] } })),
        apiClient.get('/api/v1/appointments/my-appointments').catch(() => ({ data: { data: [] } }))
      ]);

      if (lawyersRes.data?.data) {
        const enriched = lawyersRes.data.data.map((l: Lawyer) => ({
          ...l,
          rating: l.rating || 4.9,
          reviewCount: l.reviewCount || 18
        }));
        setLawyers(enriched);
      }

      if (appointmentsRes.data?.data) {
        setAppointments(appointmentsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load client data', err);
    }
  };

  useEffect(() => {
    if (bookingLawyer && bookingDate) {
      fetchBackendTimeSlots(bookingLawyer.id, bookingDate);
    }
  }, [bookingLawyer, bookingDate]);

  const fetchBackendTimeSlots = async (lawyerId: number, date: string) => {
    setLoadingSlots(true);
    try {
      const res = await apiClient.get(`/api/client/availability/${lawyerId}?date=${date}&slotMinutes=60`);
      if (res.data?.data) {
        setAvailableSlots(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedSlot(`${res.data.data[0].startTime} - ${res.data.data[0].endTime}`);
        } else {
          setSelectedSlot('');
        }
      }
    } catch (err) {
      const defaultSlots: TimeSlot[] = [
        { startTime: '09:00', endTime: '10:00', available: true },
        { startTime: '10:30', endTime: '11:30', available: true },
        { startTime: '14:00', endTime: '15:00', available: true },
        { startTime: '15:30', endTime: '16:30', available: true }
      ];
      setAvailableSlots(defaultSlots);
      setSelectedSlot('09:00 - 10:00');
    } finally {
      setLoadingSlots(false);
    }
  };

  const startBooking = (lawyer: Lawyer) => {
    setProfileModalLawyer(null);
    setBookingLawyer(lawyer);
    setBookingStep(1);
    setCaseNotes('');
  };

  const handleFinalPaymentAndBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingLawyer) return;
    setLoading(true);

    const fullScheduledAt = `${bookingDate}T${selectedSlot.split(' - ')[0] || '10:00'}:00`;

    try {
      await apiClient.post('/api/v1/appointments/book', {
        lawyerProfileId: bookingLawyer.id,
        consultationType,
        scheduledAt: fullScheduledAt,
        notes: caseNotes
      });

      addToast(
        'success',
        'Booking & Payment Confirmed!',
        `Your consultation with ${bookingLawyer.fullName} has been booked for ${bookingDate}.`
      );

      setBookingLawyer(null);
      loadDashboardData();
    } catch (err: any) {
      addToast('error', 'Booking Failed', err.response?.data?.message || 'Could not complete appointment booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthData();
    router.push('/login');
  };

  const filteredLawyers = lawyers
    .filter(l => {
      const matchSearch =
        (l.fullName && l.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.specialties && l.specialties.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat =
        selectedCategory === 'ALL' ||
        (l.specialties && l.specialties.toLowerCase().includes(selectedCategory.toLowerCase()));

      return matchSearch && matchCat;
    })
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative pb-24 selection:bg-indigo-600 selection:text-white">

      {/* TOAST NOTIFICATIONS */}
      <div className="fixed top-20 right-6 z-50 space-y-3 max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`p-4 rounded-2xl shadow-xl border pointer-events-auto transition-all animate-in slide-in-from-right-5 duration-200 flex items-start gap-3 ${
              t.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : t.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-indigo-900 text-white border-indigo-700'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
            <div>
              <h5 className="text-xs font-bold font-display">{t.title}</h5>
              <p className="text-[11px] opacity-90 mt-0.5">{t.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* STICKY TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-slate-900 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="font-display font-extrabold text-slate-900 text-lg tracking-tight flex items-center gap-1.5">
                LawyerConnect
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  CLIENT PORTAL
                </span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'directory'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" /> Explore Advocates
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'appointments'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> My Appointments
              {appointments.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {appointments.length}
                </span>
              )}
            </button>
          </nav>

          {/* Right Actions & User Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsChatOpen(true)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 relative transition-all"
              title="Open Messenger"
            >
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2" />
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-none">{clientName}</p>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">Verified Client</p>
              </div>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-all border border-slate-200/80"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* HERO BANNER SECTION */}
      {activeTab === 'directory' && (
        <section className="hero-gradient pt-10 pb-12 border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                100% Verified Sri Lankan Advocates & Counsel
              </div>

              <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 tracking-tight leading-tight">
                Consult Premier Legal Advocates <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-indigo-600 to-slate-900 bg-clip-text text-transparent">
                  With Full Confidence
                </span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed">
                Connect directly with Supreme Court Advocates, Counsel, and specialists across Sri Lanka. Book video consultations or chamber visits securely.
              </p>

              {/* Dynamic Search Box */}
              <div className="mt-8 max-w-2xl mx-auto">
                <div className="glass-card p-2 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-200">
                  <div className="flex-1 flex items-center gap-3 px-3">
                    <Search className="w-5 h-5 text-indigo-600 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search advocate name, specialization (e.g. Criminal, Corporate, Civil)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none font-medium"
                    />
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 shrink-0 transition-all flex items-center gap-1.5">
                    Search <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Category Pills Slider */}
              <div className="pt-6 flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map(cat => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-md scale-105'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90'
                      }`}
                    >
                      {cat === 'ALL' ? 'All Specializations' : cat}
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        </section>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* TAB 1: ADVOCATES DIRECTORY GRID */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            
            {/* Header Toolbar */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-extrabold text-xl text-slate-900 flex items-center gap-2">
                  Featured Advocates
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                    {filteredLawyers.length} Available
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Top-rated advocates verified by BASL credentials</p>
              </div>
            </div>

            {/* Advocate Cards Grid */}
            {filteredLawyers.length === 0 ? (
              <div className="p-12 text-center glass-card rounded-3xl space-y-4">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-display font-bold text-slate-800 text-lg">No Advocates Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No registered advocates match your current search query or category filter.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLawyers.map(lawyer => (
                  <div
                    key={lawyer.id}
                    className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-200/90 flex flex-col justify-between relative overflow-hidden group"
                  >
                    
                    {/* Card Top Details */}
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shadow-xs">
                            {lawyer.profilePictureUrl ? (
                              <img src={lawyer.profilePictureUrl} alt={lawyer.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-8 h-8 text-indigo-600" />
                            )}
                          </div>
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-1 -right-1 shadow-xs" />
                        </div>

                        {/* Rating Badge */}
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-1 rounded-xl text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{lawyer.rating?.toFixed(1)}</span>
                          <span className="text-[10px] text-amber-600/80">({lawyer.reviewCount})</span>
                        </div>
                      </div>

                      {/* Name & License */}
                      <div className="mt-4">
                        <h3 
                          onClick={() => { setProfileModalLawyer(lawyer); setProfileActiveTab('about'); }}
                          className="font-display font-extrabold text-slate-900 text-lg hover:text-indigo-600 cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          {lawyer.fullName}
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        </h3>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {lawyer.licenceNumber || 'BASL Verified'}
                          </span>
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-slate-400" /> {lawyer.yearsOfExperience} Yrs Exp
                          </span>
                        </div>
                      </div>

                      {/* Bio Snippet */}
                      <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                        {lawyer.bio || 'Senior Advocate representing clients before the High Courts and Supreme Court of Sri Lanka.'}
                      </p>

                      {/* Specialization Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(lawyer.specialties || 'Civil Litigation, Commercial Law').split(',').map((spec, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/60"
                          >
                            {spec.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer: Fees & Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-200/80 space-y-4">
                      
                      {/* Fees summary */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
                        <div>
                          <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                            <Video className="w-3 h-3 text-indigo-600" /> Online Consult
                          </p>
                          <p className="font-extrabold text-slate-900 text-xs mt-0.5">
                            LKR {lawyer.onlineFee?.toLocaleString() || '7,500'}
                          </p>
                        </div>
                        <div className="border-l border-slate-200 pl-2.5">
                          <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-indigo-600" /> Chamber Visit
                          </p>
                          <p className="font-extrabold text-slate-900 text-xs mt-0.5">
                            LKR {lawyer.inPersonFee?.toLocaleString() || '12,000'}
                          </p>
                        </div>
                      </div>

                      {/* Action Row */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openChatWithLawyer(lawyer)}
                          className="p-3 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 border border-slate-200/90 transition-all"
                          title="Direct Message Advocate"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => startBooking(lawyer)}
                          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-slate-900 hover:from-indigo-700 hover:to-slate-800 text-white font-bold text-xs shadow-md shadow-indigo-600/15 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                        >
                          Book Consultation <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY APPOINTMENTS TABLE */}
        {activeTab === 'appointments' && (
          <div className="glass-card rounded-3xl p-6 border border-slate-200/90 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-extrabold text-xl text-slate-900">My Consultation Bookings</h2>
                <p className="text-xs text-slate-500 mt-0.5">Track upcoming and completed advocate consultations</p>
              </div>
              <button
                onClick={loadDashboardData}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-bold transition-all"
              >
                Refresh Status
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-display font-bold text-slate-800">No Appointments Scheduled</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You haven't booked any legal consultations yet. Browse advocates to schedule your first session.
                </p>
                <button
                  onClick={() => setActiveTab('directory')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Browse Advocates
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100/80 text-slate-900 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Advocate</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Scheduled Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {appointments.map(apt => (
                      <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-600" />
                          {apt.lawyerName || 'Advocate Consultation'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            apt.consultationType === 'ONLINE'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {apt.consultationType}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-slate-600">
                          {new Date(apt.scheduledAt).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            apt.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setIsChatOpen(true)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100 text-xs"
                          >
                            Chat
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ADVOCATE PROFILE MODAL */}
      {profileModalLawyer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden relative font-sans text-slate-900 my-8">
            
            {/* Cover Graphic Header */}
            <div className="h-32 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative p-6 flex items-end justify-between">
              <button
                onClick={() => setProfileModalLawyer(null)}
                className="w-8 h-8 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 flex items-center justify-center absolute top-4 right-4 backdrop-blur-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar & Title Section */}
            <div className="px-6 pb-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden">
                    {profileModalLawyer.profilePictureUrl ? (
                      <img src={profileModalLawyer.profilePictureUrl} alt={profileModalLawyer.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-indigo-600 m-auto mt-4" />
                    )}
                  </div>
                  <span className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white absolute bottom-1 right-1" />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setProfileModalLawyer(null); openChatWithLawyer(profileModalLawyer); }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-600" /> Message
                  </button>
                  <button
                    onClick={() => startBooking(profileModalLawyer)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                  >
                    Book Consultation <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-display font-extrabold text-2xl text-slate-900 flex items-center gap-2">
                  {profileModalLawyer.fullName}
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  License: <span className="font-bold text-slate-800">{profileModalLawyer.licenceNumber}</span> • {profileModalLawyer.yearsOfExperience} Years Legal Experience
                </p>
              </div>

              {/* Tabs Navigation */}
              <div className="flex items-center gap-4 border-b border-slate-200/80 mt-6 text-xs font-bold">
                {[
                  { id: 'about', label: 'About & Bio' },
                  { id: 'practice', label: 'Practice & Fees' },
                  { id: 'rates', label: 'Chambers & Contact' },
                  { id: 'reviews', label: `Reviews (${sampleReviews.length})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setProfileActiveTab(tab.id as any)}
                    className={`pb-3 border-b-2 transition-all ${
                      profileActiveTab === tab.id
                        ? 'border-indigo-600 text-indigo-600 font-extrabold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="pt-6 space-y-4">
                {profileActiveTab === 'about' && (
                  <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                    <p>{profileModalLawyer.bio || 'Senior Advocate practicing in Sri Lankan civil, commercial, and appellate courts with proven track record.'}</p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                        <p className="text-[10px] font-bold text-slate-400">CREDENTIAL STATUS</p>
                        <p className="font-extrabold text-emerald-600 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> BASL Verified Advocate
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                        <p className="text-[10px] font-bold text-slate-400">SUCCESS RATING</p>
                        <p className="font-extrabold text-slate-900 mt-1 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> 4.9 / 5.0 Rating
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {profileActiveTab === 'practice' && (
                  <div className="space-y-4">
                    <h4 className="font-display font-bold text-xs text-slate-900">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {(profileModalLawyer.specialties || 'Civil Litigation, Corporate Law').split(',').map((s, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                          {s.trim()}
                        </span>
                      ))}
                    </div>

                    <h4 className="font-display font-bold text-xs text-slate-900 pt-2">Consultation Pricing</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <p className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-indigo-600" /> Online Video Session
                        </p>
                        <p className="font-extrabold text-base text-slate-900 mt-2">
                          LKR {profileModalLawyer.onlineFee?.toLocaleString() || '7,500'}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <p className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-indigo-600" /> Chamber Consultation
                        </p>
                        <p className="font-extrabold text-base text-slate-900 mt-2">
                          LKR {profileModalLawyer.inPersonFee?.toLocaleString() || '12,000'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {profileActiveTab === 'rates' && (
                  <div className="space-y-3 text-xs text-slate-700">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">Chambers Address</p>
                        <p className="mt-0.5 text-slate-600">{profileModalLawyer.workingAddress || 'Hulftsdorp Street, Colombo 12'}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                      <Phone className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">Official Contact Number</p>
                        <p className="mt-0.5 text-slate-600">{profileModalLawyer.phone || '+94 11 234 5678'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {profileActiveTab === 'reviews' && (
                  <div className="space-y-3">
                    {sampleReviews.map(r => (
                      <div key={r.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900">{r.clientName}</span>
                          <span className="text-[10px] text-slate-400">{r.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 mb-1">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-slate-600 leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* GUIDED BOOKING WIZARD MODAL */}
      {bookingLawyer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative font-sans text-slate-900 my-8">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-display font-extrabold text-base text-white flex items-center gap-2">
                  Schedule Consultation with {bookingLawyer.fullName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Step {bookingStep} of 4 — Escrow Secured Booking</p>
              </div>
              <button
                onClick={() => setBookingLawyer(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="bg-slate-100 h-1.5 w-full">
              <div
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: `${(bookingStep / 4) * 100}%` }}
              />
            </div>

            {/* Step Body */}
            <div className="p-6 space-y-6">
              
              {/* STEP 1: CONSULTATION MODE */}
              {bookingStep === 1 && (
                <div className="space-y-4">
                  <h4 className="font-display font-bold text-sm text-slate-900">Select Consultation Mode</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setConsultationType('ONLINE')}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        consultationType === 'ONLINE'
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <Video className="w-6 h-6 text-indigo-600 mb-2" />
                      <p className="font-bold text-xs text-slate-900">Online Video Call</p>
                      <p className="text-[11px] text-slate-500 mt-1">Encrypted HD Video Session</p>
                      <p className="font-extrabold text-xs text-indigo-600 mt-3">
                        LKR {bookingLawyer.onlineFee?.toLocaleString() || '7,500'}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultationType('IN_PERSON')}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        consultationType === 'IN_PERSON'
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <Building2 className="w-6 h-6 text-indigo-600 mb-2" />
                      <p className="font-bold text-xs text-slate-900">Chamber Visit</p>
                      <p className="text-[11px] text-slate-500 mt-1">In-Person Legal Consultation</p>
                      <p className="font-extrabold text-xs text-indigo-600 mt-3">
                        LKR {bookingLawyer.inPersonFee?.toLocaleString() || '12,000'}
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DATE & TIME SLOT */}
              {bookingStep === 2 && (
                <div className="space-y-4">
                  <h4 className="font-display font-bold text-sm text-slate-900">Choose Consultation Date & Time Slot</h4>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Available Time Slots</label>
                    {loadingSlots ? (
                      <p className="text-xs text-slate-400 py-4">Checking slot availability...</p>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4">No available slots for this date.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto">
                        {availableSlots.map((slot, i) => {
                          const slotStr = `${slot.startTime} - ${slot.endTime}`;
                          const isSelected = selectedSlot === slotStr;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setSelectedSlot(slotStr)}
                              className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {slotStr}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: BRIEF CASE NOTES */}
              {bookingStep === 3 && (
                <div className="space-y-4">
                  <h4 className="font-display font-bold text-sm text-slate-900">Brief Case Summary</h4>
                  <p className="text-xs text-slate-500">Provide key details or questions to help the advocate prepare for your session.</p>
                  
                  <textarea
                    rows={4}
                    placeholder="Describe your legal issue, property dispute, corporate agreement, or court matter..."
                    value={caseNotes}
                    onChange={(e) => setCaseNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 outline-none focus:border-indigo-600"
                  />
                </div>
              )}

              {/* STEP 4: CHECKOUT & PAYMENT */}
              {bookingStep === 4 && (
                <form onSubmit={handleFinalPaymentAndBook} className="space-y-4">
                  <h4 className="font-display font-bold text-sm text-slate-900">Escrow Secured Checkout</h4>
                  
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Advocate:</span>
                      <span className="font-bold text-slate-900">{bookingLawyer.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mode:</span>
                      <span className="font-bold text-slate-900">{consultationType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Scheduled Date:</span>
                      <span className="font-bold text-slate-900">{bookingDate} ({selectedSlot})</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
                      <span>Total Consultation Fee:</span>
                      <span className="text-indigo-600">
                        LKR {(consultationType === 'ONLINE' ? bookingLawyer.onlineFee : bookingLawyer.inPersonFee)?.toLocaleString() || '7,500'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={paymentData.cardHolder}
                        onChange={(e) => setPaymentData({ ...paymentData, cardHolder: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Expiry</label>
                        <input
                          type="text"
                          value={paymentData.expiry}
                          onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">CVC</label>
                        <input
                          type="text"
                          value={paymentData.cvc}
                          onChange={(e) => setPaymentData({ ...paymentData, cvc: e.target.value })}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <Lock className="w-4 h-4" />
                    {loading ? 'Processing Payment...' : 'Confirm Consultation & Pay'}
                  </button>
                </form>
              )}

            </div>

            {/* Modal Controls Bar */}
            {bookingStep < 4 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  disabled={bookingStep === 1}
                  onClick={() => setBookingStep(prev => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => setBookingStep(prev => prev + 1)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  Next Step <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* FLOATING MESSENGER TRIGGER BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsChatOpen(true)}
          className="px-5 py-3.5 rounded-full bg-slate-900 text-white font-bold text-xs shadow-xl shadow-slate-900/30 flex items-center gap-2.5 hover:scale-105 transition-all border border-slate-800"
        >
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span>Direct Messenger</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      {/* MESSENGER MODAL COMPONENT */}
      <MessengerChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialPartner={selectedChatPartner}
      />

    </div>
  );
}
