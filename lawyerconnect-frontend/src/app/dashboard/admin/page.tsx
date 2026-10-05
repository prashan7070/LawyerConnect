'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  UserCheck, 
  Briefcase, 
  Calendar, 
  Plus, 
  Trash2, 
  Search, 
  ShieldCheck, 
  Activity,
  Layers,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { apiClient, getStoredAuth } from '@/lib/api';

interface UserItem {
  userId: number;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface LawyerItem {
  id: number;
  fullName: string;
  licenceNumber: string;
  yearsOfExperience: number;
  onlineFee: number;
  inPersonFee: number;
  phone: string;
  verificationStatus?: string;
  nicDocumentUrl?: string;
  barCertificateUrl?: string;
  practicingLicenseUrl?: string;
}

interface SpecializationItem {
  id: number;
  specialization: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLawyers: 0,
    totalClients: 0,
    totalAppointments: 0,
    totalSpecializations: 0
  });

  const [users, setUsers] = useState<UserItem[]>([]);
  const [lawyers, setLawyers] = useState<LawyerItem[]>([]);
  const [specs, setSpecs] = useState<SpecializationItem[]>([]);

  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'users' | 'lawyers' | 'specs'>('verifications');
  const [searchUser, setSearchUser] = useState('');
  const [newSpecName, setNewSpecName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth?.accessToken || auth?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, lawyersRes, specsRes] = await Promise.all([
        apiClient.get('/api/v1/admin/stats').catch(() => ({ data: { data: {} } })),
        apiClient.get('/api/v1/admin/users').catch(() => ({ data: { data: [] } })),
        apiClient.get('/api/v1/admin/lawyers').catch(() => ({ data: { data: [] } })),
        apiClient.get('/api/v1/explore/specializations').catch(() => ({ data: { data: [] } }))
      ]);

      if (statsRes.data?.data) setStats(statsRes.data.data);
      if (usersRes.data?.data) setUsers(usersRes.data.data);
      if (lawyersRes.data?.data) setLawyers(lawyersRes.data.data);
      if (specsRes.data?.data) setSpecs(specsRes.data.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await apiClient.patch(`/api/v1/admin/users/${userId}/status?status=${nextStatus}`);
      loadDashboardData();
    } catch (err) {
      alert('Failed to update user status.');
    }
  };

  const handleVerifyLawyer = async (lawyerId: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiClient.patch(`/api/v1/admin/lawyers/${lawyerId}/verify?status=${status}`);
      alert(`Lawyer verification status updated to ${status}!`);
      loadDashboardData();
    } catch (err) {
      alert('Failed to update lawyer verification status.');
    }
  };

  const handleAddSpec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecName.trim()) return;
    try {
      await apiClient.post('/api/v1/admin/specializations', { name: newSpecName.trim() });
      setNewSpecName('');
      loadDashboardData();
    } catch (err) {
      alert('Failed to add specialization.');
    }
  };

  const handleDeleteSpec = async (id: number) => {
    if (!confirm('Are you sure you want to delete this specialization?')) return;
    try {
      await apiClient.delete(`/api/v1/admin/specializations/${id}`);
      loadDashboardData();
    } catch (err) {
      alert('Failed to delete specialization.');
    }
  };

  const pendingLawyers = lawyers.filter(l => !l.verificationStatus || l.verificationStatus === 'PENDING');
  const filteredUsers = users.filter(u =>
    (u.name && u.name.toLowerCase().includes(searchUser.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchUser.toLowerCase())) ||
    (u.username && u.username.toLowerCase().includes(searchUser.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans">
      <Navbar />

      <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> SYSTEM ADMINISTRATOR
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Admin Governance & Advocate Verification</h1>
            <p className="text-xs text-slate-400 mt-1">Verify advocate credentials, inspect Bar documents & govern user access</p>
          </div>

          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Backend API Active</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-slate-800/80 mb-8 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'verifications'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Pending Approvals ({pendingLawyers.length})
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> User Directory
          </button>
          <button
            onClick={() => setActiveTab('lawyers')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'lawyers' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" /> All Advocates
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'specs' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Specializations
          </button>
        </div>

        {/* TAB 0: PENDING LAWYER VERIFICATIONS */}
        {activeTab === 'verifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" /> Advocate Credentials Verification Queue
                </h2>
                <p className="text-xs text-slate-400 mt-1">Review uploaded NICs, Bar Certificates & Practicing Licenses before approving</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold font-mono">
                {pendingLawyers.length} Pending Approvals
              </span>
            </div>

            {pendingLawyers.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white mb-1">Queue Clean!</h4>
                <p className="text-xs text-slate-400">All advocate registration applications have been reviewed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pendingLawyers.map((l) => (
                  <div key={l.id} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-white">{l.fullName || 'Unnamed Advocate'}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                          PENDING REVIEW
                        </span>
                      </div>
                      <p className="text-xs text-indigo-400 font-medium">Bar License No: <span className="font-mono text-slate-200">{l.licenceNumber || 'N/A'}</span></p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                        <span>Experience: <strong className="text-white">{l.yearsOfExperience || 0} Years</strong></span>
                        <span>Phone: <strong className="text-white">{l.phone || 'N/A'}</strong></span>
                      </div>

                      {/* Documents Section */}
                      <div className="pt-3 flex flex-wrap gap-2">
                        {l.nicDocumentUrl ? (
                          <a
                            href={l.nicDocumentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-400" /> NIC Document <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-slate-950 text-slate-600 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-slate-600" /> NIC Missing
                          </span>
                        )}

                        {l.barCertificateUrl ? (
                          <a
                            href={l.barCertificateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-400" /> Bar Certificate <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-slate-950 text-slate-600 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-slate-600" /> Bar Cert Missing
                          </span>
                        )}

                        {l.practicingLicenseUrl ? (
                          <a
                            href={l.practicingLicenseUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-400" /> Practicing License <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-slate-950 text-slate-600 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-slate-600" /> License Missing
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleVerifyLawyer(l.id, 'REJECTED')}
                        className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Reject Application
                      </button>
                      <button
                        onClick={() => handleVerifyLawyer(l.id, 'APPROVED')}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve Advocate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass-panel p-6 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-3xl font-extrabold text-white block mb-1">{stats.totalUsers || users.length}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider">Total Users</span>
              </div>

              <div className="glass-panel p-6 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-3xl font-extrabold text-white block mb-1">{stats.totalLawyers || lawyers.length}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider">Registered Lawyers</span>
              </div>

              <div className="glass-panel p-6 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-3xl font-extrabold text-white block mb-1">{stats.totalClients || users.filter(u=>u.role==='CLIENT').length}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider">Active Clients</span>
              </div>

              <div className="glass-panel p-6 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-3xl font-extrabold text-white block mb-1">{stats.totalAppointments || 0}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider">Appointments</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">User Accounts & Governance</h3>
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Username / Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.userId} className="hover:bg-slate-900/40">
                      <td className="p-3 text-slate-400">#{u.userId}</td>
                      <td className="p-3 font-semibold text-white">{u.name || 'N/A'}</td>
                      <td className="p-3">{u.email || u.username}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold text-[10px]">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.status === 'SUSPENDED'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {u.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="p-3">
                        {u.role !== 'ADMIN' ? (
                          <button
                            onClick={() => handleToggleUserStatus(u.userId, u.status || 'ACTIVE')}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium"
                          >
                            {u.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LAWYERS DIRECTORY */}
        {activeTab === 'lawyers' && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-6">All Advocate Directory</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">License No.</th>
                    <th className="p-3">Verification</th>
                    <th className="p-3">Fees (Online / In-Person)</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {lawyers.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-900/40">
                      <td className="p-3 text-slate-400">#{l.id}</td>
                      <td className="p-3 font-semibold text-white">{l.fullName || 'N/A'}</td>
                      <td className="p-3 font-mono">{l.licenceNumber || 'Pending'}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          l.verificationStatus === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : l.verificationStatus === 'REJECTED'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {l.verificationStatus || 'PENDING'}
                        </span>
                      </td>
                      <td className="p-3 text-emerald-400 font-semibold">
                        LKR {l.onlineFee || 0} / LKR {l.inPersonFee || 0}
                      </td>
                      <td className="p-3">
                        {l.verificationStatus !== 'APPROVED' ? (
                          <button
                            onClick={() => handleVerifyLawyer(l.id, 'APPROVED')}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px]"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyLawyer(l.id, 'REJECTED')}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 text-[11px]"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SPECIALIZATIONS */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-4">Add Practice Area</h3>
              <form onSubmit={handleAddSpec} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Specialization Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Environmental Law"
                    value={newSpecName}
                    onChange={(e) => setNewSpecName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full glow-btn py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Specialization
                </button>
              </form>
            </div>

            <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-4">Active Practice Areas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Specialization Name</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {specs.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-900/40">
                        <td className="p-3 text-slate-400">#{s.id}</td>
                        <td className="p-3 font-semibold text-white">{s.specialization}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDeleteSpec(s.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
