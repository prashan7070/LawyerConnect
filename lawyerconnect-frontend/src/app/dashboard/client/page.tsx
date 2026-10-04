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
  X
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
}

interface Appointment {
  id: number;
  lawyerName?: string;
  consultationType: string;
  scheduledAt: string;
  status: string;
  notes?: string;
}

export default function ClientDashboardPage() {
  const router = useRouter();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);

  // Booking Modal Form State
  const [consultationType, setConsultationType] = useState<'ONLINE' | 'IN_PERSON'>('ONLINE');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth?.accessToken) {
      router.push('/login');
      return;
    }

    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      const [lawyersRes, appointmentsRes] = await Promise.all([
        apiClient.get('/api/client/explore/getAllLawyers').catch(() => ({ data: { data: [] } })),
        apiClient.get('/api/v1/appointments/my-appointments').catch(() => ({ data: { data: [] } }))
      ]);

      if (lawyersRes.data?.data) setLawyers(lawyersRes.data.data);
      if (appointmentsRes.data?.data) setAppointments(appointmentsRes.data.data);
    } catch (err) {
      console.error('Failed to load client data', err);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLawyer || !scheduledAt) return;
    setLoading(true);

    try {
      await apiClient.post('/api/v1/appointments/book', {
        lawyerProfileId: selectedLawyer.id,
        consultationType,
        scheduledAt,
        notes
      });
      alert('Appointment request submitted successfully!');
      setSelectedLawyer(null);
      loadDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLawyers = lawyers.filter(l =>
    (l.fullName && l.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (l.specialties && l.specialties.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <Navbar />

      <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Client Portal & Consultations</h1>
            <p className="text-xs text-slate-400 mt-1">Discover verified advocates, schedule meetings & manage your active cases</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="glass-panel p-4 rounded-2xl mb-10 border border-slate-800 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search advocates by name, practice area, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* SECTION 1: ADVOCATE DIRECTORY */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" /> Verified Legal Counsel Directory
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredLawyers.map((lawyer) => (
              <div key={lawyer.id} className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> BAR VERIFIED
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{lawyer.licenceNumber}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{lawyer.fullName}</h3>
                  <p className="text-xs text-indigo-400 font-medium mb-4">{lawyer.specialties || 'General Practice'}</p>

                  <div className="space-y-2 text-xs text-slate-400 mb-6 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span>Experience:</span>
                      <span className="text-slate-200 font-semibold">{lawyer.yearsOfExperience || 5} Years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Online Session Fee:</span>
                      <span className="text-emerald-400 font-semibold">Rs. {lawyer.onlineFee || 3500}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>In-Person Fee:</span>
                      <span className="text-indigo-400 font-semibold">Rs. {lawyer.inPersonFee || 6000}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLawyer(lawyer)}
                  className="w-full glow-btn py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Book Consultation
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: MY APPOINTMENTS HISTORY */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> Scheduled Consultations & History
          </h2>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            {appointments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No scheduled appointments found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Consultation Type</th>
                      <th className="p-3">Scheduled Date/Time</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {appointments.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-900/40">
                        <td className="p-3 text-slate-400">#{app.id}</td>
                        <td className="p-3 font-semibold text-white">{app.consultationType}</td>
                        <td className="p-3">{app.scheduledAt ? new Date(app.scheduledAt).toLocaleString() : 'N/A'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            app.status === 'CONFIRMED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : app.status === 'CANCELLED'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{app.notes || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* BOOKING MODAL */}
      {selectedLawyer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-800 relative">
            <button
              onClick={() => setSelectedLawyer(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Book Legal Consultation</h3>
            <p className="text-xs text-indigo-400 font-medium mb-4">With {selectedLawyer.fullName}</p>

            <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Consultation Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultationType('ONLINE')}
                    className={`py-2 rounded-xl border font-semibold ${
                      consultationType === 'ONLINE'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    Online (Rs. {selectedLawyer.onlineFee || 3500})
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultationType('IN_PERSON')}
                    className={`py-2 rounded-xl border font-semibold ${
                      consultationType === 'IN_PERSON'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    In-Person (Rs. {selectedLawyer.inPersonFee || 6000})
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Select Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Case Brief / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Describe your legal query briefly..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full glow-btn py-3 rounded-xl font-semibold text-white mt-2 disabled:opacity-50"
              >
                {loading ? 'Submitting Request...' : 'Confirm Appointment Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
