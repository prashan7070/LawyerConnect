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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:border-zinc-700 transition-all">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-1">
              Lawyer<span className="text-zinc-400 font-normal">Connect</span>
            </span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">Legal Platform</span>
          </div>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="#explore" className="hover:text-white transition-colors">Explore Advocates</Link>
          <Link href="#practice-areas" className="hover:text-white transition-colors">Practice Areas</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
        </div>

        {/* Auth / Action */}
        <div className="flex items-center gap-4">
          {auth?.accessToken ? (
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium flex items-center gap-1.5">
                {auth.role === 'ADMIN' && <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />}
                {auth.role}
              </span>
              <Link
                href={getDashboardLink()}
                className="bg-white text-zinc-950 hover:bg-zinc-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-400 hover:text-white px-4 py-2 rounded-xl hover:bg-zinc-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login?tab=register"
                className="bg-white text-zinc-950 hover:bg-zinc-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
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
