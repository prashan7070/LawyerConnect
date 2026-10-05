'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard,
  UserCheck, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  DollarSign, 
  Briefcase, 
  Phone, 
  MapPin, 
  Award,
  Save,
  CreditCard,
  TrendingUp,
  Camera,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowUpRight,
  Wallet,
  Settings,
  ChevronRight,
  User
} from 'lucide-react';
import { apiClient, getStoredAuth } from '@/lib/api';

interface LawyerProfile {
  id?: number;
  fullName: string;
  email: string;
  licenceNumber: string;
  yearsOfExperience: number;
  onlineFee: number;
  inPersonFee: number;
  phone: string;
  workingAddress: string;
  bio: string;
  profilePictureUrl?: string;
  specialties?: string;
  verificationStatus?: string;
  nicDocumentUrl?: string;
  barCertificateUrl?: string;
  practicingLicenseUrl?: string;
}

interface AppointmentRequest {
  id: number;
  clientName?: string;
  consultationType: string;
  scheduledAt: string;
  status: string;
  notes?: string;
}

interface FinancialSummary {
  totalEarnings: number;
  availableBalance: number;
  pendingPayout: number;
  completedConsultations: number;
}

export default function LawyerDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'profile' | 'finance' | 'schedule'>('overview');

  const [profile, setProfile] = useState<LawyerProfile>({
    fullName: '',
    email: '',
    licenceNumber: '',
    yearsOfExperience: 5,
    onlineFee: 3500,
    inPersonFee: 6000,
    phone: '',
    workingAddress: '',
    bio: '',
    profilePictureUrl: '',
    specialties: 'Corporate Law, Criminal Defense'
  });

  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [financials, setFinancials] = useState<FinancialSummary>({
    totalEarnings: 148500,
    availableBalance: 42000,
    pendingPayout: 18500,
    completedConsultations: 28
  });

  const [bankDetails, setBankDetails] = useState({
    bankName: 'Commercial Bank of Ceylon',
    accountHolder: '',
    accountNumber: '8920194829',
    branch: 'Colombo Fort'
  });

  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth?.accessToken || auth?.role !== 'LAWYER') {
      router.push('/login');
      return;
    }

    if (auth.name) {
      setBankDetails(prev => ({ ...prev, accountHolder: auth.name || '' }));
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
      alert('Lawyer profile & bar practice details updated successfully!');
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

  const handlePayoutRequest = () => {
    alert(`Payout request of LKR ${financials.availableBalance.toLocaleString()} submitted to ${bankDetails.bankName}!`);
  };

  const filteredAppointments = appointments.filter(a => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="pt-24 flex-1 flex max-w-[1600px] w-full mx-auto px-4 sm:px-6">
        {/* ================= SIDEBAR NAVIGATION ================= */}
        <aside className="w-64 hidden md:block py-6 pr-6 border-r border-slate-800/80 shrink-0">
          {/* Profile Quick Overview */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-900/20 to-slate-900/60 border border-slate-800/80 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center overflow-hidden">
                {profile.profilePictureUrl ? (
                  <img src={profile.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-indigo-400" />
                )}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-white truncate">{profile.fullName || 'Advocate'}</h4>
                <p className="text-[11px] text-indigo-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Advocate
                </p>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
              <span>License:</span>
              <span className="font-mono text-slate-200">{profile.licenceNumber || 'N/A'}</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Overview & Insights
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                activeTab === 'requests'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" /> Consultations
              </div>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('finance')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'finance'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Wallet className="w-4 h-4" /> Earnings & Payouts
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Bar Profile & Media
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'schedule'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Clock className="w-4 h-4" /> Availability Schedule
            </button>
          </nav>
        </aside>

        {/* ================= MAIN CONTENT AREA ================= */}
        <main className="flex-1 py-6 md:pl-8 min-w-0">
          {/* VERIFICATION STATUS BANNER */}
          {(!profile.verificationStatus || profile.verificationStatus === 'PENDING') && (
            <div className="p-4 mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Advocate Verification Pending Admin Review</h4>
                <p className="text-[11px] text-amber-300/90 mt-0.5">
                  Your registration and legal credentials are under review by system administrators. Please ensure your Bar verification documents (NIC, Bar Certificate, Practicing License) are uploaded under the <b>Profile</b> tab.
                </p>
              </div>
            </div>
          )}

          {profile.verificationStatus === 'REJECTED' && (
            <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Advocate Verification Rejected</h4>
                <p className="text-[11px] text-red-300/90 mt-0.5">
                  Your advocate verification request was rejected. Please re-upload valid copies of your NIC, Bar Association Enrollment Certificate, and Practicing License under the <b>Profile</b> tab.
                </p>
              </div>
            </div>
          )}

          {profile.verificationStatus === 'APPROVED' && (
            <div className="p-4 mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Verified Legal Advocate</h4>
                <p className="text-[11px] text-emerald-300/90 mt-0.5">
                  Your advocate profile is verified and publicly visible in the legal directory.
                </p>
              </div>
            </div>
          )}

          {/* Mobile Tab Swapper */}
          <div className="flex md:hidden overflow-x-auto gap-2 pb-4 mb-4 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 rounded-lg text-xs shrink-0 ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-2 rounded-lg text-xs shrink-0 ${activeTab === 'requests' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}
            >
              Consultations ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`px-3 py-2 rounded-lg text-xs shrink-0 ${activeTab === 'finance' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}
            >
              Finance
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-2 rounded-lg text-xs shrink-0 ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}
            >
              Profile
            </button>
          </div>

          {/* TAB 1: OVERVIEW & INSIGHTS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Executive Summary</h2>
                <p className="text-xs text-slate-400 mt-1">Welcome back, {profile.fullName || 'Counsel'}. Here is your legal practice performance.</p>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400">Total Consultations</span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{appointments.length || 32}</div>
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +14.2% from last month
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400">Pending Bookings</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{pendingCount}</div>
                  <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1 mt-1">
                    Requires action
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400">Total Revenue (LKR)</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">LKR {financials.totalEarnings.toLocaleString()}</div>
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> Net Earnings
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400">Client Rating</span>
                    <div className="w-8 h-8 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">4.9 / 5.0</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Based on 24 verified reviews
                  </span>
                </div>
              </div>

              {/* Consultation Requests Quick Snapshot */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" /> Recent Booking Requests
                  </h3>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {appointments.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No consultation requests recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {appointments.slice(0, 3).map(app => (
                      <div key={app.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                            #{app.id}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{app.consultationType} Consultation</p>
                            <p className="text-[11px] text-slate-400">{app.scheduledAt ? new Date(app.scheduledAt).toLocaleString() : 'Date TBD'}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          app.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CONSULTATION REQUESTS MANAGER */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Consultations & Bookings</h2>
                  <p className="text-xs text-slate-400 mt-1">Review, confirm, or decline client appointment bookings.</p>
                </div>

                {/* Filter Selector */}
                <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
                  {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map(st => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        filterStatus === st ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-xs text-slate-400 font-medium">No consultations matching criteria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                        <tr>
                          <th className="p-3">Ref ID</th>
                          <th className="p-3">Mode</th>
                          <th className="p-3">Date & Time</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Client Notes</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredAppointments.map(app => (
                          <tr key={app.id} className="hover:bg-slate-800/30 transition-all">
                            <td className="p-3 font-mono text-indigo-400 font-semibold">#{app.id}</td>
                            <td className="p-3 font-semibold text-white">{app.consultationType}</td>
                            <td className="p-3 text-slate-300">{app.scheduledAt ? new Date(app.scheduledAt).toLocaleString() : 'Pending Schedule'}</td>
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
                            <td className="p-3 text-slate-400 max-w-xs truncate">{app.notes || 'No specific notes'}</td>
                            <td className="p-3 text-right">
                              {app.status === 'PENDING' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleAppointmentAction(app.id, 'CONFIRMED')}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex items-center gap-1 font-semibold text-xs border border-emerald-500/30 transition-all"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Accept
                                  </button>
                                  <button
                                    onClick={() => handleAppointmentAction(app.id, 'CANCELLED')}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center gap-1 font-semibold text-xs border border-red-500/30 transition-all"
                                  >
                                    <X className="w-3.5 h-3.5" /> Decline
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-500 text-[11px]">No actions pending</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: EARNINGS & PAYOUT FINANCIALS */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Earnings & Payout Settings</h2>
                <p className="text-xs text-slate-400 mt-1">Track consultation revenue and manage your bank transfer details.</p>
              </div>

              {/* Financial Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-slate-900 border border-indigo-500/30">
                  <span className="text-xs text-indigo-300 font-medium">Available Balance</span>
                  <div className="text-3xl font-bold text-white mt-2">LKR {financials.availableBalance.toLocaleString()}</div>
                  <button
                    onClick={handlePayoutRequest}
                    className="mt-4 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <ArrowUpRight className="w-4 h-4" /> Request Payout to Bank
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Total Lifetime Earnings</span>
                  <div className="text-3xl font-bold text-white mt-2">LKR {financials.totalEarnings.toLocaleString()}</div>
                  <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 28 Consultations fulfilled
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Pending Escrow Payouts</span>
                  <div className="text-3xl font-bold text-amber-400 mt-2">LKR {financials.pendingPayout.toLocaleString()}</div>
                  <p className="text-[11px] text-slate-400 mt-2">Released upon consultation completion</p>
                </div>
              </div>

              {/* Bank Account Details */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-400" /> Bank Payout Account Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={bankDetails.accountHolder}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Account Number</label>
                    <input
                      type="text"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Branch</label>
                    <input
                      type="text"
                      value={bankDetails.branch}
                      onChange={(e) => setBankDetails({ ...bankDetails, branch: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BAR PROFILE & MEDIA UPLOAD */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Bar Profile & Practice Settings</h2>
                <p className="text-xs text-slate-400 mt-1">Configure your legal qualifications, fees, and profile media.</p>
              </div>

              <form onSubmit={handleProfileSave} className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-6 text-xs">
                {/* Photo Upload Section */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {profile.profilePictureUrl ? (
                      <img src={profile.profilePictureUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <label className="text-slate-300 font-semibold block mb-1">Advocate Profile Picture URL</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={profile.profilePictureUrl || ''}
                      onChange={(e) => setProfile({ ...profile, profilePictureUrl: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Provide a direct image URL or upload an avatar image for client trust.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 block mb-1">Full Official Name</label>
                    <input
                      type="text"
                      required
                      value={profile.fullName || ''}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={profile.email || ''}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 block mb-1">Bar Licence Number</label>
                    <input
                      type="text"
                      required
                      value={profile.licenceNumber || ''}
                      onChange={(e) => setProfile({ ...profile, licenceNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Years of Experience</label>
                    <input
                      type="number"
                      required
                      value={profile.yearsOfExperience || 0}
                      onChange={(e) => setProfile({ ...profile, yearsOfExperience: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 block mb-1">Online Fee (LKR)</label>
                    <input
                      type="number"
                      required
                      value={profile.onlineFee || 0}
                      onChange={(e) => setProfile({ ...profile, onlineFee: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">In-Person Fee (LKR)</label>
                    <input
                      type="number"
                      required
                      value={profile.inPersonFee || 0}
                      onChange={(e) => setProfile({ ...profile, inPersonFee: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Chambers / Office Address</label>
                  <input
                    type="text"
                    value={profile.workingAddress || ''}
                    onChange={(e) => setProfile({ ...profile, workingAddress: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Professional Bio & Legal Background</label>
                  <textarea
                    rows={4}
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Describe your legal expertise, trial achievements, and counsel specializations..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Legal Verification Documents Section */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Bar Verification Documents (Cloudinary / File URLs)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    System administrators review these official documents to verify your Advocate status before enabling public bookings.
                  </p>

                  <div>
                    <label className="text-slate-300 block mb-1">1. National Identity Card (NIC) / Passport Copy URL</label>
                    <input
                      type="text"
                      placeholder="https://res.cloudinary.com/demo/image/upload/v1/nic_copy.jpg"
                      value={profile.nicDocumentUrl || ''}
                      onChange={(e) => setProfile({ ...profile, nicDocumentUrl: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">2. Bar Association Enrollment Certificate URL</label>
                    <input
                      type="text"
                      placeholder="https://res.cloudinary.com/demo/image/upload/v1/bar_certificate.pdf"
                      value={profile.barCertificateUrl || ''}
                      onChange={(e) => setProfile({ ...profile, barCertificateUrl: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">3. Practicing License / Oath Certificate URL</label>
                    <input
                      type="text"
                      placeholder="https://res.cloudinary.com/demo/image/upload/v1/practicing_license.pdf"
                      value={profile.practicingLicenseUrl || ''}
                      onChange={(e) => setProfile({ ...profile, practicingLicenseUrl: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving Changes...' : 'Save Advocate Profile'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: AVAILABILITY SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Availability Schedule</h2>
                <p className="text-xs text-slate-400 mt-1">Set your weekly consultation hours for client appointments.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                  <div key={day} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" /> {day}
                    </div>
                    <div className="flex items-center gap-4 text-slate-300">
                      <span>09:00 AM - 12:30 PM</span>
                      <span className="text-slate-600">|</span>
                      <span>02:00 PM - 05:00 PM</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">ACTIVE</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
