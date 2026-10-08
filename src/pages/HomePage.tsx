import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Monitor,
  Laptop as LaptopIcon,
  Bot,
  ShieldCheck,
  Truck,
  Wrench,
  Headphones,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Sparkles,
  Zap,
  ShoppingCart,
  Heart,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { ProductImage } from '../components/ProductImage';
import { prebuiltPCs } from '../data/prebuilt';
import { laptops } from '../data/laptops';
import { formatPrice } from '../lib/format';
import { useStore } from '../store';
import { PrebuiltPC, Laptop } from '../types';

export function HomePage() {
  const navigate = useNavigate();
  const { addToCart, favorites, toggleFavorite } = useStore();

  const featuredPrebuilts = prebuiltPCs.slice(0, 3);
  const featuredLaptops = laptops.slice(0, 4);

  const handleAddPrebuiltToCart = (pc: PrebuiltPC) => {
    addToCart({
      id: pc.id,
      type: 'prebuilt',
      name: pc.name,
      price: pc.price,
      quantity: 1,
      image: pc.image,
      stock: pc.stock,
      details: {
        assemblyService: true,
      },
    });
  };

  const handleAddLaptopToCart = (l: Laptop) => {
    addToCart({
      id: l.id,
      type: 'laptop',
      name: l.name,
      price: l.price,
      quantity: 1,
      image: l.image,
      stock: l.stock,
    });
  };

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      <SEO
        title="PCForge - Orzuingizdagi Kompyuter va Noutbuklar"
        description="O'zbekistondagi zamonaviy kompyuter va noutbuklar do'koni. PC Builder, moslik tekshiruvi va Gemini AI maslahatchisi."
      />

      {/* Hero Section with Tech Grid & Radial Glow */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[#1F2A44]/60 tech-grid-pattern tech-radial-glow">
        {/* Soft Ambient Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] sm:w-[450px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-[#3B82F6] shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Oʻzbekistondagi 1-raqamli apparat moslik nazorati</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Orzuingizdagi kompyuterni{' '}
            <span className="bg-gradient-to-r from-[#3B82F6] via-indigo-400 to-[#8B5CF6] bg-clip-text text-transparent">
              oʻzingiz yigʻing
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            Bizning PC Builder soket, RAM turi, quvvat va oʻlchamlar mosligini soniya ichida tekshiradi. Xatolikka oʻrin yoʻq!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
            <Link
              to="/builder"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-indigo-600 px-7 sm:px-9 py-3.5 sm:py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Layers className="h-5 w-5" />
              Yigʻishni boshlash
            </Link>
            <Link
              to="/prebuilt"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl border border-[#1F2A44] bg-[#121829] px-7 sm:px-9 py-3.5 sm:py-4 text-sm font-bold text-white hover:bg-slate-800 hover:border-purple-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <Monitor className="h-5 w-5 text-[#8B5CF6]" />
              Tayyor kompyuterlar
            </Link>
          </div>

          {/* Stat Badges (Clean responsive grid for 375px mobile) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto pt-8 sm:pt-10 text-xs">
            <div className="rounded-2xl border border-[#1F2A44] bg-[#121829]/80 p-3 sm:p-3.5 backdrop-blur-sm">
              <div className="font-display font-bold text-white text-base sm:text-lg">100%</div>
              <div className="text-[11px] sm:text-xs text-[#94A3B8]">Apparat mosligi</div>
            </div>
            <div className="rounded-2xl border border-[#1F2A44] bg-[#121829]/80 p-3 sm:p-3.5 backdrop-blur-sm">
              <div className="font-display font-bold text-white text-base sm:text-lg">12 - 36 oy</div>
              <div className="text-[11px] sm:text-xs text-[#94A3B8]">Rasmiy kafolat</div>
            </div>
            <div className="rounded-2xl border border-[#1F2A44] bg-[#121829]/80 p-3 sm:p-3.5 backdrop-blur-sm">
              <div className="font-display font-bold text-white text-base sm:text-lg">3 soatda</div>
              <div className="text-[11px] sm:text-xs text-[#94A3B8]">Toshkentda yetkazish</div>
            </div>
            <div className="rounded-2xl border border-[#1F2A44] bg-[#121829]/80 p-3 sm:p-3.5 backdrop-blur-sm">
              <div className="font-display font-bold text-white text-base sm:text-lg">AI Yordam</div>
              <div className="text-[11px] sm:text-xs text-[#94A3B8]">Gemini maslahatchi</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section (3 Steps) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3B82F6]">
            Oddiy va xavfsiz jarayon
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Qanday ishlaydi?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* Step 1 */}
          <div className="tech-card p-6 space-y-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-[#3B82F6] font-display font-black text-xl">
              1
            </div>
            <h3 className="font-display text-base font-bold text-white">
              Komponent tanlang
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Protsessor, videokarta, anakart va boshqa qismlarni oʻzingizning byudjetingiz hamda maqsadingizga qarab erkin tanlaysiz.
            </p>
          </div>

          {/* Step 2 */}
          <div className="tech-card tech-card-purple p-6 space-y-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-[#8B5CF6] font-display font-black text-xl">
              2
            </div>
            <h3 className="font-display text-base font-bold text-white">
              Moslikni tekshiramiz
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Tizim avtomatik soket, RAM turi, korpus oʻlchamlari va kerakli quvvat bloki (PSU) vattini hisoblab, ziddiyatlarni oldini oladi.
            </p>
          </div>

          {/* Step 3 */}
          <div className="tech-card tech-card-emerald p-6 space-y-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-[#22C55E] font-display font-black text-xl">
              3
            </div>
            <h3 className="font-display text-base font-bold text-white">
              Buyurtma bering
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Muhandislarimiz kompyuterni kabel-menejment bilan professional yigʻib, toʻliq stress-testdan oʻtkazib, uyingizgacha yetkazib beradi.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Prebuilt PCs (3 Cards) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6]">
              Sinovdan oʻtgan
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Mashhur tayyor kompyuterlar
            </h2>
          </div>
          <Link
            to="/prebuilt"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#8B5CF6] hover:underline"
          >
            Barcha modellarni koʻrish ({prebuiltPCs.length} ta)
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredPrebuilts.map((pc) => {
            const isFav = favorites.includes(pc.id);
            return (
              <div
                key={pc.id}
                className="tech-card tech-card-purple group flex flex-col justify-between overflow-hidden"
              >
                <div className="relative w-full overflow-hidden">
                  <ProductImage
                    category="prebuilt"
                    name={pc.name}
                    image={pc.image}
                    brand="PCFORGE"
                  />
                  <span className="absolute top-3 left-3 z-20 rounded-xl bg-purple-600/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                    {pc.category}
                  </span>
                  <button
                    onClick={() => toggleFavorite(pc.id)}
                    className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 text-white hover:bg-black/80 active:scale-95 transition-all"
                    aria-label="Sevimlilarga qo'shish"
                  >
                    <Heart className={`h-4 w-4 ${isFav ? 'fill-pink-500 text-pink-500' : ''}`} />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-display text-base font-bold text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
                      {pc.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                      {pc.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#1F2A44] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#94A3B8] block">Narxi:</span>
                      <div className="font-display text-lg font-bold text-white">
                        {formatPrice(pc.price)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/prebuilt/${pc.id}`}
                        className="rounded-xl border border-[#1F2A44] bg-[#1F2A44] px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 active:scale-95 transition-all"
                      >
                        Batafsil
                      </Link>
                      <button
                        onClick={() => handleAddPrebuiltToCart(pc)}
                        className="rounded-xl bg-[#8B5CF6] px-3 py-2 text-xs font-bold text-white hover:bg-purple-600 active:scale-95 transition-all shadow-md shadow-purple-500/20"
                        aria-label="Savatga qo'shish"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Consultant Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/60 via-[#121829] to-indigo-950/60 p-7 sm:p-12 overflow-hidden shadow-2xl tech-grid-pattern">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-xl bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-400">
              <Bot className="h-4 w-4" />
              <span>Aqlli AI Maslahatchi</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Byudjetingizni ayting, biz eng zoʻrini tanlab beramiz
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Oʻyin, video montaj yoki ofis uchun qaysi kompyuter toʻgʻri kelishini bilmayapsizmi? AI maslahatchimiz sizning byudjetingizga mos, oʻzaro toʻliq mos keluvchi komponentlarni topib beradi.
            </p>
            <div className="pt-2">
              <p className="text-xs text-blue-400 font-semibold">
                👉 Pastki oʻng burchakdagi suzuvchi "AI Maslahatchi" tugmasini bosing yoki tayyor soʻrovlarni yuboring!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Laptops (4 Cards) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">
              Ixcham va kuchli
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Mashhur noutbuklar
            </h2>
          </div>
          <Link
            to="/laptops"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#22C55E] hover:underline"
          >
            Barcha noutbuklar ({laptops.length} ta)
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {featuredLaptops.map((l) => {
            const isFav = favorites.includes(l.id);
            return (
              <div
                key={l.id}
                className="tech-card tech-card-emerald group flex flex-col justify-between overflow-hidden"
              >
                <div className="relative w-full overflow-hidden">
                  <ProductImage
                    category="laptop"
                    brand={l.brand}
                    name={l.name}
                    image={l.image}
                  />
                  <span className="absolute top-3 left-3 z-20 rounded-lg bg-emerald-600/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                    {l.purpose}
                  </span>
                  <button
                    onClick={() => toggleFavorite(l.id)}
                    className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 text-white hover:bg-black/80 active:scale-95 transition-all"
                    aria-label="Sevimlilarga qo'shish"
                  >
                    <Heart className={`h-4 w-4 ${isFav ? 'fill-pink-500 text-pink-500' : ''}`} />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#22C55E]">{l.brand}</span>
                    <h3 className="font-display text-sm font-bold text-white line-clamp-2 group-hover:text-emerald-300 transition-colors">
                      {l.name}
                    </h3>
                  </div>

                  <div className="text-[11px] text-[#94A3B8] bg-[#0B0F1A] p-2.5 rounded-xl border border-[#1F2A44]/60 space-y-1">
                    <div className="truncate">{l.cpu}</div>
                    <div>{l.ramGB}GB RAM • {l.storageGB}GB SSD</div>
                  </div>

                  <div className="pt-2 border-t border-[#1F2A44] flex items-center justify-between">
                    <div className="font-display text-base font-bold text-white">
                      {formatPrice(l.price)}
                    </div>
                    <div className="flex gap-1.5">
                      <Link
                        to={`/laptops/${l.id}`}
                        className="rounded-xl border border-[#1F2A44] bg-[#1F2A44] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 active:scale-95 transition-all"
                      >
                        Batafsil
                      </Link>
                      <button
                        onClick={() => handleAddLaptopToCart(l)}
                        className="rounded-xl bg-[#22C55E] px-2.5 py-1.5 text-xs font-bold text-black hover:bg-emerald-400 active:scale-95 transition-all"
                        aria-label="Savatga qo'shish"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why PCForge (Advantages) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3B82F6]">
            Nega aynan biz?
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            PCForge Afzalliklari
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          <div className="tech-card p-5 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-[#3B82F6]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-display text-sm font-bold text-white">Rasmiy Kafolat</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Barcha qismlar va tayyor kompyuterlarga 12 oydan 36 oygacha yozma rasmiy kafolat taqdim etiladi.
            </p>
          </div>

          <div className="tech-card tech-card-purple p-5 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-[#8B5CF6]">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="font-display text-sm font-bold text-white">Tezkor Yetkazib Berish</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Toshkent boʻylab buyurtma kuni 3 soatda, viloyatlarga esa 24 soat ichida eshigingizgacha yetkaziladi.
            </p>
          </div>

          <div className="tech-card tech-card-emerald p-5 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-[#22C55E]">
              <Wrench className="h-5 w-5" />
            </div>
            <h3 className="font-display text-sm font-bold text-white">Professional Yigʻish</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Ideal kabel-menejment, yuqori sifatli termopasta va FurMark, AIDA64 stress-testlar orqali sinov.
            </p>
          </div>

          <div className="tech-card p-5 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-[#F59E0B]">
              <Headphones className="h-5 w-5" />
            </div>
            <h3 className="font-display text-sm font-bold text-white">24/7 Qoʻllab-quvvatlash</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Har qanday texnik masalada mutaxassislarimiz va sunʼiy intellekt maslahatchimiz yordamga tayyor.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
