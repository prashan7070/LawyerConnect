'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Interactive3DBackground from '@/components/Interactive3DBackground';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Gavel, 
  Users, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  Sparkles,
  Award,
  Video,
  Building2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Lawyer {
  id: number;
  fullName: string;
  specialties: string;
  yearsOfExperience: number;
  onlineFee: number;
  inPersonFee: number;
  licenceNumber: string;
}

export default function HomePage() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch Lawyers & Specializations from Backend
    apiClient.get('/api/client/explore/getAllLawyers')
      .then(res => setLawyers(res.data?.data || []))
      .catch(() => {
        // Fallback demo advocates
        setLawyers([
          { id: 1, fullName: 'Adv. S. K. Jayawardena', specialties: 'Corporate & Commercial Law', yearsOfExperience: 14, onlineFee: 4500, inPersonFee: 8000, licenceNumber: 'BASL-4921' },
          { id: 2, fullName: 'Adv. Dilani Perera', specialties: 'Criminal Litigation', yearsOfExperience: 10, onlineFee: 3500, inPersonFee: 6500, licenceNumber: 'BASL-5812' },
          { id: 3, fullName: 'Adv. Oshan Fernando', specialties: 'Family & Property Disputes', yearsOfExperience: 8, onlineFee: 3000, inPersonFee: 5500, licenceNumber: 'BASL-6204' }
        ]);
      });

    apiClient.get('/api/v1/explore/specializations')
      .then(res => {
        const specs = (res.data?.data || []).map((s: { specialization: string }) => s.specialization);
        setSpecializations(specs);
      })
      .catch(() => {
        setSpecializations([
          'Criminal Law', 'Civil Litigation', 'Family Law', 'Corporate Law', 
          'Intellectual Property', 'Immigration Law', 'Tax Law', 'Constitutional Law'
        ]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar />

      {/* Hero Section with Interactive 3D Canvas Mesh Background */}
      <section className="relative pt-36 pb-24 px-6 border-b border-slate-200/80 overflow-hidden hero-gradient min-h-[85vh] flex items-center">
        
        {/* Dynamic Interactive 3D Canvas Background */}
        <Interactive3DBackground />

        <div className="max-w-7xl mx-auto text-center relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/90 border border-indigo-200/80 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs backdrop-blur-xs"
          >
            <Shield className="w-4 h-4 text-amber-500 shrink-0" />
            Verified Legal Services Marketplace • Sri Lanka
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display tracking-tight max-w-5xl mx-auto leading-tight mb-6 text-slate-900"
          >
            Connect with <span className="bg-gradient-to-r from-indigo-600 via-indigo-800 to-slate-900 bg-clip-text text-transparent">Verified Advocates</span> & Legal Counsel
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            Seamlessly search, schedule chamber & online consultations, and manage legal matters with Sri Lanka's leading legal professionals.
          </motion.p>

          {/* Search Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto glass-card p-2 rounded-2xl flex items-center gap-3 shadow-xl mb-12 border border-slate-200/90"
          >
            <Search className="w-5 h-5 text-indigo-600 ml-3 shrink-0" />
            <input 
              type="text" 
              placeholder="Search by advocate name or practice area (e.g. Criminal, Corporate)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 flex-grow text-xs sm:text-sm py-2.5 font-medium"
            />
            <Link 
              href={`/login?search=${encodeURIComponent(searchQuery)}`} 
              className="bg-gradient-to-r from-indigo-600 to-slate-900 hover:from-indigo-700 hover:to-slate-800 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all shadow-md shadow-indigo-600/20 hover:scale-[1.02]"
            >
              Search Advocates
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto"
          >
            <div className="glass-card glass-card-hover border border-slate-200/80 p-5 rounded-2xl text-center shadow-sm">
              <span className="text-3xl font-extrabold font-display bg-gradient-to-r from-indigo-600 to-slate-900 bg-clip-text text-transparent block mb-1">500+</span>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Verified Advocates</span>
            </div>
            <div className="glass-card glass-card-hover border border-slate-200/80 p-5 rounded-2xl text-center shadow-sm">
              <span className="text-3xl font-extrabold font-display bg-gradient-to-r from-indigo-600 to-slate-900 bg-clip-text text-transparent block mb-1">1,200+</span>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Consultations</span>
            </div>
            <div className="glass-card glass-card-hover border border-slate-200/80 p-5 rounded-2xl text-center shadow-sm">
              <span className="text-3xl font-extrabold font-display bg-gradient-to-r from-indigo-600 to-slate-900 bg-clip-text text-transparent block mb-1">99.4%</span>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Client Satisfaction</span>
            </div>
            <div className="glass-card glass-card-hover border border-slate-200/80 p-5 rounded-2xl text-center shadow-sm">
              <span className="text-3xl font-extrabold font-display bg-gradient-to-r from-indigo-600 to-slate-900 bg-clip-text text-transparent block mb-1">24/7</span>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Instant Booking</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Specializations Section */}
      <section id="practice-areas" className="py-20 px-6 bg-slate-50/70 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider block">Legal Domains</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-slate-900">Practice Specializations</h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto font-medium">
              Find specialized legal assistance tailored precisely to your legal dispute or advisory needs.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {specializations.map((spec, index) => (
              <div 
                key={index} 
                className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-200/80 flex flex-col justify-between group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Gavel className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display mb-1">{spec}</h3>
                  <p className="text-xs text-slate-500 font-medium">BASL Advocates</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Advocates Section */}
      <section id="explore" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider block mb-1">Verified Counsel</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-slate-900">Featured Legal Advocates</h2>
            </div>
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-bold text-xs sm:text-sm flex items-center gap-1 mt-4 md:mt-0">
              View All Advocates <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lawyers.slice(0, 3).map((lawyer) => (
              <div key={lawyer.id} className="glass-card glass-card-hover border border-slate-200/90 p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Advocate
                    </span>
                    <span className="text-xs font-semibold text-slate-400 font-mono">{lawyer.licenceNumber}</span>
                  </div>

                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-slate-900 text-white flex items-center justify-center font-display font-extrabold text-base shadow-md shrink-0">
                      {lawyer.fullName ? lawyer.fullName.split(' ').map(n=>n[0]).join('').slice(0,2) : 'LC'}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold font-display text-slate-900">{lawyer.fullName}</h3>
                      <p className="text-xs text-slate-500 font-medium">{lawyer.specialties || 'General Practice'}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 mb-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 font-medium">
                    <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Experience:</span>
                      <span className="text-slate-900 font-bold">{lawyer.yearsOfExperience} Years</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Online Consultation:</span>
                      <span className="text-indigo-600 font-extrabold">LKR {lawyer.onlineFee || 3500}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500">Chamber Meeting:</span>
                      <span className="text-indigo-600 font-extrabold">LKR {lawyer.inPersonFee || 6000}</span>
                    </div>
                  </div>
                </div>

                <Link 
                  href="/login"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-slate-900 hover:from-indigo-700 hover:to-slate-800 text-white font-bold text-xs text-center transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/15 hover:scale-[1.01]"
                >
                  <Clock className="w-3.5 h-3.5" /> Book Consultation <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
