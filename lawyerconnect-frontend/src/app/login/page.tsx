'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { Scale, ShieldCheck, User, Briefcase, Lock, Mail, AlertCircle } from 'lucide-react';
import { apiClient, saveAuthData } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'CLIENT' | 'LAWYER'>('CLIENT');

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/login', { username, password });
      const data = res.data?.data;
      if (data?.accessToken) {
        saveAuthData(data);
        if (data.role === 'ADMIN') router.push('/dashboard/admin');
        else if (data.role === 'LAWYER') router.push('/dashboard/lawyer');
        else router.push('/dashboard/client');
      } else {
        setErrorMsg('Login failed: Invalid credentials or token missing.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/register', {
        name,
        username,
        password,
        email,
        role: selectedRole
      });

      if (res.status === 200 || res.data?.status === 200) {
        alert(`Account created successfully as ${selectedRole}! Please sign in.`);
        setIsLoginTab(true);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Username or email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#1F2937] flex flex-col justify-between font-sans">
      <Navbar />

      <div className="pt-32 pb-20 px-6 max-w-md mx-auto w-full flex-grow flex items-center">
        <div className="w-full bg-white p-8 rounded-lg border border-gray-200 shadow-sm relative">
          
          {/* Brand Badge */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-lg bg-[#EFF4F9] border border-[#1E3A5F]/20 flex items-center justify-center text-[#1E3A5F] mx-auto mb-3">
              <Scale className="w-6 h-6 text-[#1E3A5F]" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-[#1E3A5F] tracking-tight">
              {isLoginTab ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isLoginTab ? 'Sign in to access your legal dashboard' : 'Join LawyerConnect Sri Lanka legal network'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-lg bg-gray-100 border border-gray-200 mb-6">
            <button
              onClick={() => { setIsLoginTab(true); setErrorMsg(''); }}
              className={`py-2 rounded-md text-xs font-semibold transition-all ${
                isLoginTab ? 'bg-[#1E3A5F] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLoginTab(false); setErrorMsg(''); }}
              className={`py-2 rounded-md text-xs font-semibold transition-all ${
                !isLoginTab ? 'bg-[#1E3A5F] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Register
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {isLoginTab ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-[#1E3A5F] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-[#1E3A5F] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1E3A5F] text-white hover:bg-[#152C49] py-3 rounded-lg font-semibold text-xs transition-all shadow-sm mt-2 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Register As</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('CLIENT')}
                    className={`py-2 px-3 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      selectedRole === 'CLIENT'
                        ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" /> Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('LAWYER')}
                    className={`py-2 px-3 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      selectedRole === 'LAWYER'
                        ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" /> Lawyer
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-[#1E3A5F] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-[#1E3A5F] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  placeholder="johndoe123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-[#1E3A5F] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-[#1E3A5F] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1E3A5F] text-white hover:bg-[#152C49] py-3 rounded-lg font-semibold text-xs transition-all shadow-sm mt-2 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : `Register as ${selectedRole}`}
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
