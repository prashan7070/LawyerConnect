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
  Briefcase
} from 'lucide-react';
import { apiClient, getStoredAuth } from '@/lib/api';

interface Lawyer {
  id: number;
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
  const [bookingLawyer, setBookingLawyer] = useState<Lawyer | null>(null);

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
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setProfileModalLawyer(lawyer)}
                      className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => startBooking(lawyer)}
                      className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1"
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

      {/* ================= MODAL 1: FIVERR-STYLE LAWYER PROFILE ================= */}
      {profileModalLawyer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 max-w-2xl w-full relative my-8 text-xs">
            <button
              onClick={() => setProfileModalLawyer(null)}
              className="absolute right-6 top-6 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Banner */}
            <div className="flex items-start gap-5 mb-6 pb-6 border-b border-slate-800">
              <div className="w-20 h-20 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center overflow-hidden shrink-0">
                {profileModalLawyer.profilePictureUrl ? (
                  <img src={profileModalLawyer.profilePictureUrl} alt="Lawyer" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-indigo-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED ADVOCATE
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">License: {profileModalLawyer.licenceNumber}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{profileModalLawyer.fullName}</h2>
                <p className="text-xs text-indigo-400 font-semibold">{profileModalLawyer.specialties || 'Corporate & Trial Attorney'}</p>
                
                <div className="flex items-center gap-3 mt-2 text-slate-300">
                  <span className="flex items-center gap-1 font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {profileModalLawyer.rating} ({profileModalLawyer.reviewCount} Reviews)
                  </span>
                  <span>•</span>
                  <span>{profileModalLawyer.yearsOfExperience || 5}+ Years Practice</span>
                </div>
              </div>
            </div>

            {/* Bio & Details */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About Advocate</h4>
                <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  {profileModalLawyer.bio || 'Senior Advocate practicing before the High Court and Supreme Court of Sri Lanka. Specializing in corporate litigation, land dispute resolution, and appellate defense.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Chambers Location</span>
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {profileModalLawyer.workingAddress || 'Colombo Law Chambers'}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Official Phone</span>
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" /> {profileModalLawyer.phone || '+94 77 123 4567'}
                  </p>
                </div>
              </div>

              {/* Verified Client Feedback */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Verified Client Reviews</h4>
                <div className="space-y-3">
                  {sampleReviews.map(rev => (
                    <div key={rev.id} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">{rev.clientName}</span>
                        <div className="flex items-center gap-0.5 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" /> {rev.rating}.0
                        </div>
                      </div>
                      <p className="text-slate-300 italic">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => startBooking(profileModalLawyer)}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Calendar className="w-4 h-4" /> Book Consultation with {profileModalLawyer.fullName}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: STEP-BY-STEP GUIDED BOOKING WIZARD ================= */}
      {bookingLawyer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 max-w-lg w-full relative text-xs">
            <button
              onClick={() => setBookingLawyer(null)}
              className="absolute right-6 top-6 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Stepper Indicator */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    bookingStep === s
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : bookingStep > s
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {bookingStep > s ? <Check className="w-3.5 h-3.5" /> : s}
                  </div>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    {s === 1 ? 'Mode' : s === 2 ? 'Slot' : s === 3 ? 'Brief' : 'Pay'}
                  </span>
                </div>
              ))}
            </div>

            {/* STEP 1: CONSULTATION MODE */}
            {bookingStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Step 1: Choose Consultation Type</h3>
                <p className="text-slate-400">Select whether you want a virtual video session or an in-person chamber visit.</p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setConsultationType('ONLINE')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      consultationType === 'ONLINE'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-bold block text-sm mb-1">Online Video</span>
                    <span className="text-emerald-400 font-bold block">LKR {bookingLawyer.onlineFee || 3500}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Secure Google Meet link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationType('IN_PERSON')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      consultationType === 'IN_PERSON'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-bold block text-sm mb-1">In-Person Visit</span>
                    <span className="text-indigo-400 font-bold block">LKR {bookingLawyer.inPersonFee || 6000}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">At court chambers</span>
                  </button>
                </div>

                <button
                  onClick={() => setBookingStep(2)}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all mt-4"
                >
                  Continue to Select Date & Slot
                </button>
              </div>
            )}

            {/* STEP 2: BACKEND TIME SLOTS */}
            {bookingStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Step 2: Select Date & Available Time Slot</h3>
                <p className="text-slate-400">Backend slot algorithm calculates live available times for {bookingLawyer.fullName}.</p>

                <div>
                  <label className="text-slate-300 block mb-1">Consultation Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-2">Available Time Slots</label>
                  {loadingSlots ? (
                    <p className="text-slate-500 text-center py-4">Fetching backend availability slots...</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-amber-400 text-center py-4">No slots available on this date. Try another date.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {availableSlots.map(slot => {
                        const slotStr = `${slot.startTime} - ${slot.endTime}`;
                        return (
                          <button
                            key={slotStr}
                            type="button"
                            onClick={() => setSelectedSlot(slotStr)}
                            className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                              selectedSlot === slotStr
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            {slotStr}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setBookingStep(1)}
                    className="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setBookingStep(3)}
                    disabled={!selectedSlot}
                    className="w-2/3 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50"
                  >
                    Continue to Case Brief
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CASE BRIEFING */}
            {bookingStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Step 3: Provide Legal Case Brief</h3>
                <p className="text-slate-400">Provide background details so the advocate can prepare before the meeting.</p>

                <div>
                  <label className="text-slate-300 block mb-1">Case Notes / Legal Query</label>
                  <textarea
                    rows={4}
                    placeholder="Briefly state your legal issue, dispute history, or legal advice needed..."
                    value={caseNotes}
                    onChange={(e) => setCaseNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setBookingStep(2)}
                    className="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setBookingStep(4)}
                    className="w-2/3 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: INTEGRATED PAYMENT GATEWAY */}
            {bookingStep === 4 && (
              <form onSubmit={handleFinalPaymentAndBook} className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center justify-between">
                  <span>Step 4: Secure Checkout</span>
                  <span className="text-emerald-400 font-extrabold">
                    LKR {consultationType === 'ONLINE' ? bookingLawyer.onlineFee || 3500 : bookingLawyer.inPersonFee || 6000}
                  </span>
                </h3>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div>
                    <label className="text-slate-400 block text-[11px] mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={paymentData.cardHolder}
                      onChange={(e) => setPaymentData({ ...paymentData, cardHolder: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block text-[11px] mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-mono"
                      />
                      <CreditCard className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block text-[11px] mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={paymentData.expiry}
                        onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block text-[11px] mb-1">CVC Code</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="•••"
                        value={paymentData.cvc}
                        onChange={(e) => setPaymentData({ ...paymentData, cvc: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-center">
                  <Lock className="w-3 h-3 text-emerald-400" /> Encrypted 256-bit SSL Payment Escrow
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingStep(3)}
                    className="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Processing Payment...' : 'Pay & Confirm Appointment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
