import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { SEO } from '../components/SEO';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <SEO title="404 - Sahifa topilmadi" description="Sahifa topilmadi." />
      <span className="font-display text-8xl font-black text-[#1F2A44] select-none">404</span>
      <h1 className="font-display text-2xl font-bold text-white -mt-6 mb-2">
        Kechirasiz, sahifa topilmadi
      </h1>
      <p className="text-sm text-[#94A3B8] max-w-sm mb-6">
        Siz qidirayotgan sahifa oʻchirilgan, nomi oʻzgartirilgan yoki mavjud emas.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-600 transition-colors"
      >
        <Home className="h-4 w-4" />
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
