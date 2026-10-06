import React from 'react';
import { Scale, ShieldCheck, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 pt-16 pb-12 px-6 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <Scale className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Lawyer<span className="text-zinc-400 font-normal">Connect</span>
            </span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Bridging the gap between clients and verified legal experts. Transparent consultations, encrypted data security, and seamless scheduling.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm text-zinc-400">
            <li><a href="#explore" className="hover:text-white transition-colors">Find a Lawyer</a></li>
            <li><a href="#practice-areas" className="hover:text-white transition-colors">Specializations</a></li>
            <li><a href="#how-it-works" className="hover:text-white transition-colors">Client Guide</a></li>
            <li><a href="/login" className="hover:text-white transition-colors">Lawyer Registration</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Legal Practice</h4>
          <ul className="space-y-2.5 text-sm text-zinc-400">
            <li>Corporate & Commercial</li>
            <li>Criminal Defense</li>
            <li>Civil Litigation & Property</li>
            <li>Intellectual Property</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Support & Trust</h4>
          <ul className="space-y-2.5 text-sm text-zinc-400">
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-white" /> Verified Advocate Bar Reg
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-400" /> support@lawyerconnect.com
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-zinc-400" /> +94 11 234 5678
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-zinc-800/80 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <p>© {new Date().getFullYear()} LawyerConnect Legal Tech Platform. All rights reserved.</p>
        <p className="text-zinc-400 font-medium flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-white inline" /> Official Sri Lankan Legal Governance & Advocate Portal
        </p>
      </div>
    </footer>
  );
}
