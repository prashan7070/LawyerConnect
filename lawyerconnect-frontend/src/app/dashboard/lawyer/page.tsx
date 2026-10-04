'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Check, 
  X, 
  DollarSign, 
  Briefcase, 
  Phone, 
  MapPin, 
  Award,
  Save
} from 'lucide-react';
import { apiClient, getStoredAuth } from '@/lib/api';

interface LawyerProfile {
  id?: number;
  fullName: string;
  licenceNumber: string;
  yearsOfExperience: number;
  onlineFee: number;
  inPersonFee: number;
  phone: string;
  workingAddress: string;
  bio: string;
}

interface AppointmentRequest {
  id: number;
  clientName?: string;
  consultationType: string;
  scheduledAt: string;
  status: string;
  notes?: string;
}

export default function LawyerDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<LawyerProfile>({
    fullName: '',
    licenceNumber: '',
    yearsOfExperience: 5,
    onlineFee: 3500,
    inPersonFee: 6000,
    phone: '',
    workingAddress: '',
    bio: ''
  });

  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'requests' | 'profile'>('requests');

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth?.accessToken || auth?.role !== 'LAWYER') {
      router.push('/login');
      return;
    }

    loadLawyerData();
  }, [router]);

  const loadLawyerData = async () => {
    try {
      const [profileRes, appRes] = await Promise.all([
        apiClient.get('/api/lawyer/profile/getProfile').catch(() => ({ data: { data: null } })),
        apiClient.get('/api/v1/appointments/lawyer-requests').catch(() => ({ data: { data: [] } }))
      ]);

      if (profileRes.data?.data) {
        setProfile(profileRes.data.data);
      }
      if (appRes.data?.data) {
        setAppointments(appRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load lawyer profile', err);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.put('/api/lawyer/profile/updateProfileJson', profile);
      alert('Lawyer profile updated successfully!');
      loadLawyerData();
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentAction = async (id: number, status: 'CONFIRMED' | 'CANCELLED') => {
    try {
      await apiClient.patch(`/api/v1/appointments/${id}/status?status=${status}`);
      loadLawyerData();
    } catch (err) {
      alert('Failed to update appointment status.');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <Navbar />

      <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> LEGAL ADVOCATE PORTAL
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Advocate Practice Hub</h1>
            <p className="text-xs text-slate-400 mt-1">Manage consultation requests, fees, and bar profile details</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-3 border-b border-slate-800/80 mb-8 pb-2">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" /> Consultation Requests ({appointments.filter(a => a.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Bar Profile & Fees
          </button>
        </div>

        {/* TAB 1: CONSULTATION REQUESTS */}
        {activeTab === 'requests' && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-6">Client Appointment Requests</h3>

            {appointments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No appointment requests at present.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Scheduled Date & Time</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Notes</th>
                      <th className="p-3">Action</th>
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
                        <td className="p-3">
                          {app.status === 'PENDING' ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAppointmentAction(app.id, 'CONFIRMED')}
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex items-center gap-1 font-semibold text-[11px]"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleAppointmentAction(app.id, 'CANCELLED')}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center gap-1 font-semibold text-[11px]"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE & FEES */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto glass-panel p-8 rounded-3xl border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-6">Bar Profile & Practice Settings</h3>

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profile.fullName || ''}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">Bar Licence Number</label>
                  <input
                    type="text"
                    required
                    value={profile.licenceNumber || ''}
                    onChange={(e) => setProfile({ ...profile, licenceNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Years of Experience</label>
                  <input
                    type="number"
                    required
                    value={profile.yearsOfExperience || 0}
                    onChange={(e) => setProfile({ ...profile, yearsOfExperience: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">Online Fee (LKR)</label>
                  <input
                    type="number"
                    required
                    value={profile.onlineFee || 0}
                    onChange={(e) => setProfile({ ...profile, onlineFee: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">In-Person Fee (LKR)</label>
                  <input
                    type="number"
                    required
                    value={profile.inPersonFee || 0}
                    onChange={(e) => setProfile({ ...profile, inPersonFee: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Chambers / Office Address</label>
                <input
                  type="text"
                  value={profile.workingAddress || ''}
                  onChange={(e) => setProfile({ ...profile, workingAddress: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full glow-btn py-3 rounded-xl font-semibold text-white mt-4 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving Profile...' : 'Save Advocate Profile'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
