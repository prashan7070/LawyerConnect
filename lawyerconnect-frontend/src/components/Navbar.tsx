'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scale, LogOut, LayoutDashboard, UserCheck, ShieldCheck } from 'lucide-react';
import { getStoredAuth, clearAuthData } from '@/lib/api';

export default function Navbar() {
  const router = useRouter();
  const [auth, setAuth] = useState<ReturnType<typeof getStoredAuth>>(null);

  useEffect(() => {
    setAuth(getStoredAuth());
  }, []);

  const handleLogout = () => {
    clearAuthData();
    setAuth(null);
    router.push('/');
  };

  const getDashboardLink = () => {
    if (auth?.role === 'ADMIN') return '/dashboard/admin';
    if (auth?.role === 'LAWYER') return '/dashboard/lawyer';
    return '/dashboard/client';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-slate-900 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-all">
            <Scale className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-lg font-extrabold font-display tracking-tight text-slate-900 flex items-center gap-1">
              Lawyer<span className="text-indigo-600 font-extrabold">Connect</span>
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Legal Tech Platform</span>
          </div>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <Link href="/dashboard/client" className="hover:text-indigo-600 transition-colors">Find Advocates</Link>
          <Link href="#practice-areas" className="hover:text-indigo-600 transition-colors">Specializations</Link>
          <Link href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</Link>
        </div>

        {/* Auth / Action */}
        <div className="flex items-center gap-3">
          {auth?.accessToken ? (
            <div className="flex items-center gap-3">
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center gap-1.5">
                {auth.role === 'ADMIN' && <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />}
                {auth.role}
              </span>
              <Link
                href={getDashboardLink()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/login?tab=register"
                className="bg-gradient-to-r from-indigo-600 to-slate-900 hover:from-indigo-700 hover:to-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-600/15"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
