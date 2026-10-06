'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Gavel, 
  Users, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Clock
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-8"
          >
            <Shield className="w-3.5 h-3.5 text-zinc-400" />
            Next-Generation Legal Consultation Platform
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold font-sans tracking-tight max-w-4xl mx-auto leading-tight mb-6 text-white"
          >
            Connect with <span className="text-zinc-400 font-light">Verified Advocates</span> & Legal Counsel
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Seamlessly search, schedule consultations, and manage legal cases with top-tier legal professionals in one secure platform.
          </motion.p>

          {/* Search Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto bg-zinc-900 p-2.5 rounded-2xl flex items-center gap-3 shadow-2xl mb-16 border border-zinc-800"
          >
            <Search className="w-5 h-5 text-zinc-500 ml-3" />
            <input 
              type="text" 
              placeholder="Search by advocate name or practice area (e.g. Criminal, Corporate)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-zinc-200 placeholder-zinc-500 flex-grow text-sm py-2"
            />
            <Link 
              href={`/login?search=${encodeURIComponent(searchQuery)}`} 
              className="bg-white text-zinc-950 hover:bg-zinc-200 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all shadow-sm"
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
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl text-center">
              <span className="text-3xl font-extrabold text-white block mb-1">500+</span>
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Verified Advocates</span>
            </div>
            <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl text-center">
              <span className="text-3xl font-extrabold text-white block mb-1">1,200+</span>
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Consultations</span>
            </div>
            <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl text-center">
              <span className="text-3xl font-extrabold text-white block mb-1">99.4%</span>
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Client Satisfaction</span>
            </div>
            <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl text-center">
              <span className="text-3xl font-extrabold text-white block mb-1">24/7</span>
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Instant Booking</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Specializations Section */}
      <section id="practice-areas" className="py-20 px-6 border-t border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">Legal Practice Specializations</h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto">
              Find specialized legal assistance tailored precisely to your dispute or counsel needs.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {specializations.map((spec, index) => (
              <div 
                key={index} 
                className="bg-zinc-900 hover:bg-zinc-800/80 p-6 rounded-2xl border border-zinc-800 transition-all flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center mb-4">
                  <Gavel className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{spec}</h3>
                  <p className="text-xs text-zinc-400">Expert Advocates Available</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Advocates Section */}
      <section id="explore" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block mb-2">Verified Counsel</span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Featured Legal Advocates</h2>
            </div>
            <Link href="/login" className="text-white hover:text-zinc-300 font-medium text-sm flex items-center gap-1 mt-4 md:mt-0">
              View All Advocates <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {lawyers.slice(0, 3).map((lawyer) => (
              <div key={lawyer.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-white" /> Verified Bar Member
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">{lawyer.licenceNumber}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{lawyer.fullName}</h3>
                  <p className="text-xs text-zinc-400 font-medium mb-4">{lawyer.specialties || 'General Practice'}</p>

                  <div className="space-y-2 text-xs text-zinc-400 mb-6">
                    <div className="flex items-center justify-between py-1 border-b border-zinc-800">
                      <span>Experience:</span>
                      <span className="text-zinc-200 font-semibold">{lawyer.yearsOfExperience} Years</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-zinc-800">
                      <span>Online Consultation:</span>
                      <span className="text-white font-semibold">Rs. {lawyer.onlineFee || 3500}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span>In-Person Meeting:</span>
                      <span className="text-white font-semibold">Rs. {lawyer.inPersonFee || 6000}</span>
                    </div>
                  </div>
                </div>

                <Link 
                  href="/login"
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs text-center transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Clock className="w-3.5 h-3.5" /> Book Consultation
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
