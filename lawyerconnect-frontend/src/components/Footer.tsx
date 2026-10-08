import React from 'react';
import { Scale, ShieldCheck, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#F8F9FB] pt-16 pb-12 px-6 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#1E3A5F] flex items-center justify-center text-white shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold font-serif text-[#1E3A5F] tracking-tight">
              Lawyer<span className="text-[#B08D57] font-normal">Connect</span>
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Bridging the gap between clients and verified legal experts in Sri Lanka. Transparent consultations, encrypted data security, and seamless scheduling.
          </p>
        </div>

        <div>
          <h4 className="text-[#1E3A5F] font-bold text-xs uppercase tracking-wider mb-4 font-serif">Quick Links</h4>
          <ul className="space-y-2.5 text-sm text-gray-600">
            <li><a href="#explore" className="hover:text-[#1E3A5F] transition-colors">Find a Lawyer</a></li>
            <li><a href="#practice-areas" className="hover:text-[#1E3A5F] transition-colors">Specializations</a></li>
            <li><a href="#how-it-works" className="hover:text-[#1E3A5F] transition-colors">Client Guide</a></li>
            <li><a href="/login" className="hover:text-[#1E3A5F] transition-colors">Lawyer Registration</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[#1E3A5F] font-bold text-xs uppercase tracking-wider mb-4 font-serif">Legal Practice</h4>
          <ul className="space-y-2.5 text-sm text-gray-600">
            <li>Corporate & Commercial</li>
            <li>Criminal Defense</li>
            <li>Civil Litigation & Property</li>
            <li>Intellectual Property</li>
          </ul>
        </div>

        <div>
          <h4 className="text-[#1E3A5F] font-bold text-xs uppercase tracking-wider mb-4 font-serif">Support & Governance</h4>
          <ul className="space-y-2.5 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B08D57]" /> Verified Advocate Bar Reg
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" /> support@lawyerconnect.lk
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" /> +94 11 234 5678
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <p>© {new Date().getFullYear()} LawyerConnect Legal Services Marketplace. All rights reserved.</p>
        <p className="text-gray-600 font-medium flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#1E3A5F] inline" /> Official Sri Lankan Legal Governance & Advocate Portal
        </p>
      </div>
    </footer>
  );
}
