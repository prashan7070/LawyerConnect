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
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-1.5">
              Lawyer<span className="text-indigo-400">Connect</span>
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Enterprise Legal Platform</span>
          </div>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <Link href="#explore" className="hover:text-indigo-400 transition-colors">Explore Advocates</Link>
          <Link href="#practice-areas" className="hover:text-indigo-400 transition-colors">Practice Areas</Link>
          <Link href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</Link>
        </div>

        {/* Auth / Action */}
        <div className="flex items-center gap-4">
          {auth?.accessToken ? (
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold flex items-center gap-1">
                {auth.role === 'ADMIN' && <ShieldCheck className="w-3.5 h-3.5" />}
                {auth.role}
              </span>
              <Link
                href={getDashboardLink()}
                className="glow-btn px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-xl hover:bg-slate-800/50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login?tab=register"
                className="glow-btn px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
