import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ShieldCheck, Truck, Wrench, Headphones, MapPin, Phone, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[#1F2A44] bg-[#080B14] text-[#94A3B8]">
      {/* Advantages Banner */}
      <div className="border-b border-[#1F2A44]/60 bg-[#0B0F1A]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-[#3B82F6]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Rasmiy Kafolat</h4>
                <p className="text-xs text-[#94A3B8]">12 oydan 36 oygacha toʻliq kafolat</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-[#8B5CF6]">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Tezkor Yetkazish</h4>
                <p className="text-xs text-[#94A3B8]">Toshkent boʻylab 3 soatda, viloyatlarga 24 soatda</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-[#22C55E]">
                <Wrench className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Professional Yigʻish</h4>
                <p className="text-xs text-[#94A3B8]">Kabel-menejment va stress-test</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-[#F59E0B]">
                <Headphones className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">24/7 Qoʻllab-quvvatlash</h4>
                <p className="text-xs text-[#94A3B8]">AI va mutaxassislar konsultatsiyasi</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B82F6] text-white">
                <Cpu className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                PC<span className="text-[#3B82F6]">Forge</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-[#94A3B8]">
              Oʻzbekistondagi zamonaviy kompyuter va noutbuklar doʻkoni. Oʻz kompyuteringizni moslik xatolarisiz oson yigʻing yoki tayyor sinovdan oʻtgan modellarni tanlang.
            </p>
            <div className="flex items-center gap-3 text-sm text-[#E5E7EB]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#121829] border border-[#1F2A44] hover:border-[#3B82F6] transition-colors cursor-pointer">
                TG
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#121829] border border-[#1F2A44] hover:border-[#3B82F6] transition-colors cursor-pointer">
                IG
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#121829] border border-[#1F2A44] hover:border-[#3B82F6] transition-colors cursor-pointer">
                YT
              </span>
            </div>
          </div>

          {/* Catalog Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Katalog</h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link to="/builder" className="hover:text-white transition-colors">
                  PC Builder (Kompyuter konstruktori)
                </Link>
              </li>
              <li>
                <Link to="/prebuilt" className="hover:text-white transition-colors">
                  Tayyor oʻyin kompyuterlari
                </Link>
              </li>
              <li>
                <Link to="/prebuilt" className="hover:text-white transition-colors">
                  Ofis va ish stansiyalari
                </Link>
              </li>
              <li>
                <Link to="/laptops" className="hover:text-white transition-colors">
                  Noutbuklar katalogi
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition-colors">
                  Noutbuklarni taqqoslash
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Mijozlar uchun</h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Savat va buyurtma
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-white transition-colors">
                  Tanlangan sevimlilar
                </Link>
              </li>
              <li>
                <span className="text-[#94A3B8]">Yetkazib berish shartlari</span>
              </li>
              <li>
                <span className="text-[#94A3B8]">Toʻlov usullari (Naqd, Click, Payme)</span>
              </li>
              <li>
                <span className="text-[#94A3B8]">Kafolat va qaytarish siyosati</span>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Aloqa & Manzil</h4>
            <div className="flex items-start gap-2.5 text-xs text-[#94A3B8]">
              <MapPin className="h-4 w-4 shrink-0 text-[#3B82F6] mt-0.5" />
              <span>Toshkent shahri, Shayxontohur tumani, Kichik halqa yoʻli, Malika savdo markazi, A-22 doʻkoni</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#94A3B8]">
              <Phone className="h-4 w-4 shrink-0 text-[#22C55E]" />
              <span className="font-semibold text-white">+998 (71) 200-44-22</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#94A3B8]">
              <Send className="h-4 w-4 shrink-0 text-[#8B5CF6]" />
              <span>@PCForge_support_bot</span>
            </div>
            <div className="pt-2 text-xs text-emerald-400 font-medium">
              ● Ish vaqti: Har kuni 09:00 dan 20:00 gacha
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-[#1F2A44] pt-6 text-xs text-[#94A3B8] sm:flex-row">
          <p>© {new Date().getFullYear()} PCForge. Barcha huquqlar himoyalangan.</p>
          <p className="mt-2 sm:mt-0">Oʻzbekistonda tayyorlangan • Yuqori sifat kafolati</p>
        </div>
      </div>
    </footer>
  );
}
