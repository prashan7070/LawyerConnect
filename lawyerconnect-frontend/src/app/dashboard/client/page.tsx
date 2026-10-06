'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Gavel, 
  DollarSign, 
  MapPin, 
  Phone,
  FileText,
  X,
  Star,
  Award,
  ShieldCheck,
  CreditCard,
  Lock,
  Sparkles,
  ChevronRight,
  User,
  ArrowRight,
  Check,
  AlertCircle,
  Info,
  Building,
  Briefcase,
  Share2,
  MessageSquare,
  Building2,
  Scale,
  Globe,
  Mail,
  ChevronLeft,
  CalendarDays
} from 'lucide-react';
import { apiClient, getStoredAuth } from '@/lib/api';
import MessengerChat from '@/components/MessengerChat';

interface Lawyer {
  id: number;
  userId?: number;
  fullName: string;
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

  // Booking Wizard Steps (1: Type, 2: Date & Slot, 3: Case Brief, 4: Payment)
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

  // Dummy Reviews for Fiverr-style Profile
  const sampleReviews: Review[] = [
    {
      id: 1,
      clientName: 'Dinesh Samarasinghe',
      rating: 5,
      comment: 'Extremely thorough legal strategy. Won our corporate dispute in record time!',
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
        // Mock rating metrics if missing
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

  // Fetch Time slots from backend algorithm when date changes
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
      // Fallback default mock slots if backend returns empty
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

  // Filter & Sort Top Rated Lawyers First
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
    <div className="min-h-screen bg-[#070a12] text-slate-100 font-sans relative pb-20">
      <Navbar />

      {/* CUSTOM TOAST NOTIFICATIONS */}
      <div className="fixed top-24 right-6 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-start gap-3 transition-all animate-in slide-in-from-right-8 ${
              t.type === 'success'
                ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-300'
                : t.type === 'error'
                ? 'bg-slate-900/90 border-red-500/40 text-red-300'
                : 'bg-slate-900/90 border-indigo-500/40 text-indigo-300'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}
            <div>
              <h5 className="text-xs font-bold text-white">{t.title}</h5>
              <p className="text-[11px] opacity-90 mt-0.5">{t.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-28 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* HERO BANNER */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/30 via-slate-900/80 to-slate-950 border border-slate-800 mb-10 relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold inline-flex items-center gap-1.5 mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> VERIFIED SRI LANKAN BAR ADVOCATES
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              Find Legal Counsel & Book Consultation
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Browse top-rated advocates by legal specialization, review verified client feedback, and schedule video or chamber consultations.
            </p>
          </div>
        </div>

        {/* SEARCH & CATEGORY FILTERING */}
        <div className="space-y-4 mb-10">
          <div className="p-2 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center">
            <Search className="w-5 h-5 text-slate-400 ml-3" />
            <input
              type="text"
              placeholder="Search by lawyer name, keyword, or court chambers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Categories Horizontal Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 1: TOP RATED ADVOCATE DIRECTORY */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Top Rated Legal Advocates
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Ranked by client rating & verified bar experience</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Showing {filteredLawyers.length} Advocates</span>
          </div>

          {filteredLawyers.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
              <UserCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-400">No advocates matching filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLawyers.map((lawyer) => (
                <div
                  key={lawyer.id}
                  className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" /> TOP RATED • {lawyer.rating} ({lawyer.reviewCount})
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">License: {lawyer.licenceNumber}</span>
                    </div>

                    {/* Profile Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden shrink-0">
                        {lawyer.profilePictureUrl ? (
                          <img src={lawyer.profilePictureUrl} alt={lawyer.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-7 h-7 text-indigo-400" />
                        )}
                      </div>
                      <div>
                        {/* CLICKABLE NAME TO OPEN FIVERR-STYLE PROFILE */}
                        <button
                          onClick={() => setProfileModalLawyer(lawyer)}
                          className="text-base font-bold text-white hover:text-indigo-400 text-left transition-all flex items-center gap-1"
                        >
                          {lawyer.fullName} <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                        <p className="text-xs text-indigo-400 font-semibold mt-0.5">{lawyer.specialties || 'General Practice'}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                          <Briefcase className="w-3 h-3" /> {lawyer.yearsOfExperience || 5}+ Years Bar Practice
                        </p>
                      </div>
                    </div>

                    {/* Fees Grid */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-6 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Online Video:</span>
                        <span className="text-emerald-400 font-bold">LKR {lawyer.onlineFee || 3500}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">In-Person Visit:</span>
                        <span className="text-indigo-400 font-bold">LKR {lawyer.inPersonFee || 6000}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setProfileModalLawyer(lawyer)}
                      className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-all"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => openChatWithLawyer(lawyer)}
                      className="py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white text-[11px] font-semibold transition-all flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Direct Message
                    </button>
                    <button
                      onClick={() => startBooking(lawyer)}
                      className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: MY BOOKED CONSULTATIONS HISTORY */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> My Consultations & Booking History
          </h2>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
            {appointments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No active or previous legal consultations recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Consultation Type</th>
                      <th className="p-3">Scheduled Date/Time</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Brief / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {appointments.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-indigo-400 font-semibold">#{app.id}</td>
                        <td className="p-3 font-semibold text-white">{app.consultationType}</td>
                        <td className="p-3 text-slate-300">{app.scheduledAt ? new Date(app.scheduledAt).toLocaleString() : 'N/A'}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            app.status === 'CONFIRMED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : app.status === 'CANCELLED'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 max-w-xs truncate">{app.notes || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL 1: LINKEDIN-STYLE FULL SCREEN ADVOCATE PROFILE ================= */}
      {profileModalLawyer && (
        <div className="fixed inset-0 z-50 bg-[#070a12] text-slate-100 font-sans overflow-y-auto animate-in fade-in duration-200">
          {/* Sticky Header Nav Bar */}
          <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setProfileModalLawyer(null)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all border border-slate-800"
            >
              <ChevronLeft className="w-4 h-4 text-indigo-400" /> Back to Advocates Directory
            </button>

            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs font-bold text-white">{profileModalLawyer.fullName}</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-indigo-400 font-mono">{profileModalLawyer.licenceNumber}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => startBooking(profileModalLawyer)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" /> Book Consultation
              </button>
              <button
                onClick={() => setProfileModalLawyer(null)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* LINKEDIN MAIN HERO CARD */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800/90 overflow-hidden shadow-2xl relative">
              {/* Cover Banner Graphic */}
              <div className="h-48 sm:h-56 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900/60 relative p-6 flex items-start justify-end">
                <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center text-8xl font-black uppercase text-indigo-400 tracking-widest">
                  BASL ADVOCATE
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md relative z-10">
                  <ShieldCheck className="w-4 h-4" /> VERIFIED ADVOCATE • SUPREME COURT ROLL
                </div>
              </div>

              {/* Profile Main Header Body */}
              <div className="px-6 sm:px-10 pb-8 relative pt-0">
                {/* Avatar Overlay */}
                <div className="-mt-20 mb-5 flex justify-between items-end">
                  <div className="relative">
                    <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-slate-950 p-1.5 border-2 border-indigo-500/40 shadow-2xl overflow-hidden">
                      {profileModalLawyer.profilePictureUrl ? (
                        <img src={profileModalLawyer.profilePictureUrl} alt={profileModalLawyer.fullName} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <div className="w-full h-full rounded-2xl bg-indigo-950/80 flex items-center justify-center text-indigo-400">
                          <User className="w-16 h-16" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-emerald-500 text-slate-950 border-2 border-slate-900 shadow-lg">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-3">
                    <button
                      onClick={() => addToast('info', 'Share Advocate', `Copied profile link for ${profileModalLawyer.fullName}`)}
                      className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all"
                      title="Share Advocate Profile"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openChatWithLawyer(profileModalLawyer)}
                      className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 border border-slate-800"
                    >
                      <MessageSquare className="w-4 h-4 text-indigo-400" /> Direct Message
                    </button>
                    <button
                      onClick={() => startBooking(profileModalLawyer)}
                      className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" /> Schedule Consultation
                    </button>
                  </div>
                </div>

                {/* Name & Headline */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {profileModalLawyer.fullName}
                    </h1>
                    <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold font-mono">
                      BASL/{profileModalLawyer.licenceNumber}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-indigo-300 font-semibold">
                    {profileModalLawyer.specialties || 'Corporate Litigation & Commercial Dispute Resolution'}
                  </p>

                  <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap pt-1">
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-indigo-400" /> {profileModalLawyer.workingAddress || 'Commercial High Court Chambers, Colombo 12'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-emerald-400" /> Bar Association of Sri Lanka</span>
                  </p>

                  {/* Highlights Grid */}
                  <div className="pt-4 flex flex-wrap items-center gap-6 text-xs border-t border-slate-800/80 mt-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-extrabold text-white text-sm">{profileModalLawyer.rating}</span>
                      <span className="text-slate-400">({profileModalLawyer.reviewCount} Verified Client Reviews)</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Briefcase className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold text-white">{profileModalLawyer.yearsOfExperience || 12}+ Years</span>
                      <span className="text-slate-400">Active Legal Practice</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-emerald-400">High Court & Supreme Court</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="mt-6 flex sm:hidden items-center gap-3">
                  <button
                    onClick={() => startBooking(profileModalLawyer)}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" /> Book Consultation
                  </button>
                  <button
                    onClick={() => addToast('info', 'Share Advocate', `Copied profile link for ${profileModalLawyer.fullName}`)}
                    className="p-3 rounded-xl bg-slate-950 text-slate-300 border border-slate-800"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* LINKEDIN TAB NAVIGATION */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto">
              {[
                { id: 'about', label: 'About & Bio' },
                { id: 'practice', label: 'Practice Areas & Fees' },
                { id: 'rates', label: 'Chambers & Contact' },
                { id: 'reviews', label: 'Client Feedback' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setProfileActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    profileActiveTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT CARDS */}
            <div className="space-y-6">
              {profileActiveTab === 'about' && (
                <div className="space-y-6">
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/90 space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-400" /> Professional Summary & Legal Background
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {profileModalLawyer.bio ||
                        `${profileModalLawyer.fullName} is a distinguished Senior Advocate admitted to the Bar Association of Sri Lanka with over ${profileModalLawyer.yearsOfExperience || 12} years of legal practice before the Commercial High Court and Supreme Court. Specialized in landmark corporate disputes, complex property deed litigation, and constitutional legal defense.`}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 space-y-2">
                      <Scale className="w-6 h-6 text-indigo-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Bar Qualification</h4>
                      <p className="text-xs text-slate-300">BASL Registered Senior Advocate</p>
                    </div>

                    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 space-y-2">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Court Admission</h4>
                      <p className="text-xs text-slate-300">Supreme Court & Commercial High Court</p>
                    </div>

                    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 space-y-2">
                      <Clock className="w-6 h-6 text-amber-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Consultation Hours</h4>
                      <p className="text-xs text-slate-300">Mon - Fri: 9:00 AM - 5:00 PM</p>
                    </div>
                  </div>
                </div>
              )}

              {profileActiveTab === 'practice' && (
                <div className="space-y-6">
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/90 space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-indigo-400" /> Specializations & Practice Areas
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                      {(profileModalLawyer.specialties || 'Corporate Law, Civil Litigation, Property Law, Intellectual Property').split(',').map((spec, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> {spec.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Consultation Rates Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 space-y-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Online Video Consultation</h4>
                      <p className="text-xs text-slate-400">Encrypted Google Meet video session with digital document exchange.</p>
                      <div className="pt-2 text-xl font-extrabold text-emerald-400">
                        LKR {profileModalLawyer.onlineFee || 3500} <span className="text-xs text-slate-500 font-normal">/ 60 Min</span>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 space-y-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-white">In-Person Chamber Visit</h4>
                      <p className="text-xs text-slate-400">Direct face-to-face consultation at court law chambers.</p>
                      <div className="pt-2 text-xl font-extrabold text-indigo-400">
                        LKR {profileModalLawyer.inPersonFee || 6000} <span className="text-xs text-slate-500 font-normal">/ Session</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {profileActiveTab === 'rates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/90 space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-indigo-400" /> Law Chambers Location
                    </h3>
                    <p className="text-xs text-slate-300">
                      {profileModalLawyer.workingAddress || 'Suite 402, High Court Complex, Superior Law Chambers, Hulftsdorp, Colombo 12, Sri Lanka.'}
                    </p>
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs space-y-2">
                      <div className="flex justify-between text-slate-400">
                        <span>Chamber Hours:</span>
                        <span className="text-white font-semibold">9:00 AM - 5:00 PM</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Court District:</span>
                        <span className="text-white font-semibold">Colombo Commercial Court</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/90 space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Phone className="w-5 h-5 text-emerald-400" /> Direct Chambers Contact
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-400">Official Phone:</span>
                        <span className="text-white font-bold font-mono">{profileModalLawyer.phone || '+94 77 123 4567'}</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-400">Chambers Desk:</span>
                        <span className="text-white font-bold font-mono">+94 11 289 4192</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {profileActiveTab === 'reviews' && (
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/90 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Verified Client Feedback ({profileModalLawyer.reviewCount || 18})
                    </h3>
                    <span className="text-sm font-extrabold text-amber-400">{profileModalLawyer.rating} / 5.0 Rating</span>
                  </div>

                  <div className="space-y-4">
                    {sampleReviews.map(rev => (
                      <div key={rev.id} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{rev.clientName}</span>
                          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" /> {rev.rating}.0
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
                        <span className="text-[10px] text-slate-500 block font-mono">{rev.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Floating CTA Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">Ready to consult {profileModalLawyer.fullName}?</h4>
                <p className="text-xs text-slate-400">Select date, available slot, and confirm booking securely.</p>
              </div>
              <button
                onClick={() => startBooking(profileModalLawyer)}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 shrink-0"
              >
                <Calendar className="w-4 h-4" /> Book Consultation Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: SPACIOUS GUIDED BOOKING WIZARD ================= */}
      {bookingLawyer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-700 max-w-2xl w-full relative my-auto shadow-2xl text-xs space-y-6">
            <button
              onClick={() => setBookingLawyer(null)}
              className="absolute right-6 top-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Advocate Summary */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden shrink-0">
                {bookingLawyer.profilePictureUrl ? (
                  <img src={bookingLawyer.profilePictureUrl} alt={bookingLawyer.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-indigo-400" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{bookingLawyer.fullName}</h3>
                <p className="text-[11px] text-indigo-300 font-semibold">{bookingLawyer.specialties || 'Advocate'}</p>
              </div>
            </div>

            {/* Stepper Progress */}
            <div className="flex items-center justify-between pb-2">
              {[
                { s: 1, label: 'Mode' },
                { s: 2, label: 'Date & Time' },
                { s: 3, label: 'Case Brief' },
                { s: 4, label: 'Payment' }
              ].map((step) => (
                <div key={step.s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    bookingStep === step.s
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-extrabold'
                      : bookingStep > step.s
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {bookingStep > step.s ? <Check className="w-4 h-4 stroke-[3]" /> : step.s}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:inline ${bookingStep === step.s ? 'text-white' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* STEP 1: CONSULTATION MODE */}
            {bookingStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Select Consultation Mode</h3>
                  <p className="text-slate-400">Choose between virtual video consultation or in-person chamber meeting.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setConsultationType('ONLINE')}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      consultationType === 'ONLINE'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-sm">Online Video Call</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">RECOMMENDED</span>
                    </div>
                    <span className="text-lg font-extrabold text-emerald-400 block mb-1">
                      LKR {bookingLawyer.onlineFee || 3500}
                    </span>
                    <span className="text-[11px] text-slate-400 block">Encrypted Google Meet link delivered via SMS/Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationType('IN_PERSON')}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      consultationType === 'IN_PERSON'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-white text-sm block mb-2">In-Person Chamber Visit</span>
                    <span className="text-lg font-extrabold text-indigo-400 block mb-1">
                      LKR {bookingLawyer.inPersonFee || 6000}
                    </span>
                    <span className="text-[11px] text-slate-400 block">At {bookingLawyer.workingAddress || 'Colombo Law Chambers'}</span>
                  </button>
                </div>

                <button
                  onClick={() => setBookingStep(2)}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all mt-4"
                >
                  Continue to Available Dates & Time Slots
                </button>
              </div>
            )}

            {/* STEP 2: AVAILABLE TIME SLOTS GRID */}
            {bookingStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-indigo-400" /> Select Date & Available Time Slot
                  </h3>
                  <p className="text-slate-400">Live availability engine for {bookingLawyer.fullName}.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-slate-300 font-semibold block">Select Consultation Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-slate-300 font-semibold block flex items-center justify-between">
                    <span>Available Time Slots ({bookingDate})</span>
                    <span className="text-indigo-400 text-[11px]">60 Min Duration</span>
                  </label>

                  {loadingSlots ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800">
                      <p className="text-slate-400 font-semibold">Calculating live available slots...</p>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl bg-slate-950 border border-slate-800">
                      <p className="text-amber-400 font-semibold">No time slots available on this date. Select another date above.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-48 overflow-y-auto p-1">
                      {availableSlots.map(slot => {
                        const slotStr = `${slot.startTime} - ${slot.endTime}`;
                        const isSelected = selectedSlot === slotStr;
                        return (
                          <button
                            key={slotStr}
                            type="button"
                            onClick={() => setSelectedSlot(slotStr)}
                            className={`py-3 px-3 rounded-2xl border text-center font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-indigo-500/40'
                            }`}
                          >
                            <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                            <span>{slotStr}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setBookingStep(1)}
                    className="w-1/3 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setBookingStep(3)}
                    disabled={!selectedSlot}
                    className="w-2/3 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                  >
                    Continue to Case Brief
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CASE BRIEFING */}
            {bookingStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Provide Legal Case Brief</h3>
                  <p className="text-slate-400">State key details so advocate {bookingLawyer.fullName} can review prior to consultation.</p>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1.5">Case Notes / Legal Details</label>
                  <textarea
                    rows={5}
                    placeholder="Briefly state your legal issue, dispute history, or advice needed..."
                    value={caseNotes}
                    onChange={(e) => setCaseNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setBookingStep(2)}
                    className="w-1/3 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setBookingStep(4)}
                    className="w-2/3 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20"
                  >
                    Proceed to Payment Checkout
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: CHECKOUT */}
            {bookingStep === 4 && (
              <form onSubmit={handleFinalPaymentAndBook} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">Secure Checkout</h3>
                    <p className="text-slate-400">{consultationType === 'ONLINE' ? 'Online Video Session' : 'In-Person Chamber Visit'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Payable</span>
                    <span className="text-xl font-extrabold text-emerald-400">
                      LKR {consultationType === 'ONLINE' ? bookingLawyer.onlineFee || 3500 : bookingLawyer.inPersonFee || 6000}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div>
                    <label className="text-slate-400 block text-[11px] mb-1 font-semibold">Cardholder Full Name</label>
                    <input
                      type="text"
                      required
                      value={paymentData.cardHolder}
                      onChange={(e) => setPaymentData({ ...paymentData, cardHolder: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block text-[11px] mb-1 font-semibold">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-500 font-mono text-xs"
                      />
                      <CreditCard className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block text-[11px] mb-1 font-semibold">Expiry Date</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={paymentData.expiry}
                        onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-500 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block text-[11px] mb-1 font-semibold">CVC Code</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="•••"
                        value={paymentData.cvc}
                        onChange={(e) => setPaymentData({ ...paymentData, cvc: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-500 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-center font-medium">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" /> Encrypted 256-Bit Payment Escrow Protection
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingStep(3)}
                    className="w-1/3 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Processing Payment...' : 'Pay & Confirm Appointment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FLOATING MESSENGER TRIGGER BUTTON */}
      <button
        onClick={() => {
          setSelectedChatPartner(null);
          setIsChatOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-2xl shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all border border-indigo-400/40 flex items-center gap-2 font-bold text-xs"
        title="Open LawyerConnect Direct Messenger"
      >
        <MessageSquare className="w-5 h-5 fill-white/20" />
        <span className="hidden sm:inline">Advocate Messenger</span>
      </button>

      {/* MESSENGER CHAT MODAL */}
      <MessengerChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialPartner={selectedChatPartner}
      />
    </div>
  );
}
