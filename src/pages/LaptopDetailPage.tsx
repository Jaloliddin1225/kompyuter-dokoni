import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Laptop as LaptopIcon,
  Heart,
  ShoppingCart,
  SlidersHorizontal,
  ShieldCheck,
  Battery,
  Monitor,
  Cpu,
  Zap,
  HardDrive,
  Scale,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { ProductImage } from '../components/ProductImage';
import { laptops } from '../data/laptops';
import { useStore } from '../store';
import { formatPrice } from '../lib/format';

export function LaptopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const laptop = laptops.find((l) => l.id === id);

  const {
    favorites,
    toggleFavorite,
    addToCart,
    compareLaptops,
    toggleCompareLaptop,
  } = useStore();

  if (!laptop) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Noutbuk topilmadi</h2>
        <p className="text-sm text-[#94A3B8] mb-4">Qidirilgan noutbuk mavjud emas yoki oʻchirilgan.</p>
        <Link to="/laptops" className="rounded-xl bg-[#22C55E] px-4 py-2 text-xs font-semibold text-black">
          Katalogga qaytish
        </Link>
      </div>
    );
  }

  const isFav = favorites.includes(laptop.id);
  const isCompared = compareLaptops.includes(laptop.id);

  const handleAddToCart = () => {
    addToCart({
      id: laptop.id,
      type: 'laptop',
      name: laptop.name,
      price: laptop.price,
      quantity: 1,
      image: laptop.image,
      stock: laptop.stock,
      details: {
        subtitle: `${laptop.cpu} • ${laptop.ramGB}GB RAM • ${laptop.gpu}`,
      },
    });
    navigate('/cart');
  };

  return (
    <div className="min-h-screen py-8">
      <SEO
        title={`${laptop.name} - Narxi, Xususiyatlari`}
        description={`${laptop.name}: ${laptop.cpu}, ${laptop.ramGB}GB RAM, ${laptop.storageGB}GB SSD, ${laptop.screenInches} dyuym ekran.`}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          to="/laptops"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Noutbuklar katalogiga qaytish
        </Link>

        {/* Top Product Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Main Photo */}
          <div className="relative rounded-3xl border border-[#1F2A44] bg-[#121829] overflow-hidden p-2 shadow-2xl">
            <ProductImage
              category="laptop"
              brand={laptop.brand}
              name={laptop.name}
              image={laptop.image}
              aspectRatio="aspect-[4/3]"
              className="rounded-2xl"
            />
            <span className="absolute top-6 left-6 z-20 rounded-xl bg-emerald-600/90 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white shadow-md">
              {laptop.purpose}
            </span>
            <button
              onClick={() => toggleFavorite(laptop.id)}
              className="absolute top-6 right-6 z-20 flex h-11 w-11 items-center justify-center rounded-2xl bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors"
            >
              <Heart className={`h-5 w-5 ${isFav ? 'fill-pink-500 text-pink-500' : ''}`} />
            </button>
          </div>

          {/* Core Info & Buy Card */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#22C55E] mb-1">
                <span>{laptop.brand}</span>
                <span>•</span>
                <span className={laptop.stock > 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {laptop.stock > 0 ? `Omborda bor (${laptop.stock} dona)` : 'Omborda tugagan'}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                {laptop.name}
              </h1>
              <p className="mt-2 text-xs text-[#94A3B8]">
                Operatsion tizim: <strong className="text-white">{laptop.os}</strong> • Kafolat: <strong className="text-white">{laptop.warrantyMonths} oy</strong>
              </p>
            </div>

            {/* Quick spec cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="rounded-xl border border-[#1F2A44] bg-[#121829] p-3 text-center">
                <Battery className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                <div className="font-bold text-white">{laptop.batteryHours} soat</div>
                <div className="text-[10px] text-[#94A3B8]">Batareya</div>
              </div>

              <div className="rounded-xl border border-[#1F2A44] bg-[#121829] p-3 text-center">
                <Scale className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                <div className="font-bold text-white">{laptop.weightKg} kg</div>
                <div className="text-[10px] text-[#94A3B8]">Ogʻirlik</div>
              </div>

              <div className="rounded-xl border border-[#1F2A44] bg-[#121829] p-3 text-center">
                <Monitor className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                <div className="font-bold text-white">{laptop.screenInches}" {laptop.refreshRateHz}Hz</div>
                <div className="text-[10px] text-[#94A3B8]">Displey</div>
              </div>

              <div className="rounded-xl border border-[#1F2A44] bg-[#121829] p-3 text-center">
                <ShieldCheck className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                <div className="font-bold text-white">{laptop.warrantyMonths} oy</div>
                <div className="text-[10px] text-[#94A3B8]">Kafolat</div>
              </div>
            </div>

            {/* Purchase & Compare Action Card */}
            <div className="rounded-2xl border border-[#1F2A44] bg-[#121829] p-5 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#94A3B8]">Rasmiy narxi:</span>
                <span className="font-display text-3xl font-extrabold text-white">
                  {formatPrice(laptop.price)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={laptop.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 transition-all"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {laptop.stock > 0 ? 'Savatga qoʻshish' : 'Omborda yoʻq'}
                </button>

                <button
                  onClick={() => toggleCompareLaptop(laptop.id)}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-3 px-4 text-xs font-semibold transition-colors ${
                    isCompared
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                      : 'border-[#1F2A44] bg-[#1F2A44] text-[#E5E7EB] hover:bg-slate-700'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {isCompared ? 'Taqqoslanmoqda' : 'Taqqoslashga qoʻshish'}
                </button>
              </div>

              {isCompared && (
                <div className="text-center">
                  <Link to="/compare" className="text-xs font-semibold text-amber-400 hover:underline">
                    Taqqoslash sahifasiga oʻtish ({compareLaptops.length} ta) →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Specs Table */}
        <div className="rounded-2xl border border-[#1F2A44] bg-[#121829] p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <LaptopIcon className="h-5 w-5 text-[#22C55E]" />
            Barcha Texnik Xususiyatlar
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-[#1F2A44]/60">
              <span className="text-[#94A3B8]">Brend:</span>
              <span className="font-medium text-white">{laptop.brand}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2A44]/60">
              <span className="text-[#94A3B8]">Model:</span>
              <span className="font-medium text-white">{laptop.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2A44]/60">
              <span className="text-[#94A3B8]">Protsessor (CPU):</span>
              <span className="font-medium text-white">{laptop.cpu}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2A44]/60">
              <span className="text-[#94A3B8]">Videokarta (GPU):</span>
              <span className="font-medium text-white">{laptop.gpu}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2A44]/60">
              <span className="text-[#94A3B8]">Operativ xotira (RAM):</span>
              <span className="font-medium text-white">{laptop.ramGB} GB</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2A44]/60">
              <span className="text-[#94A3B8]">Doimiy xotira (SSD):</span>
              <span className="font-medium text-white">{laptop.storageGB >= 1000 ? `${laptop.storageGB / 1000} TB` : `${laptop.storageGB} GB`} NVMe</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2A44]/60">
              <span className="text-[#94A3B8]">Ekran diagonali:</span>
              <span className="font-medium text-white">{laptop.screenInches} dyuym</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2A44]/60">
              <span className="text-[#94A3B8]">Ekran aniqligi:</span>
              <span className="font-medium text-white">{laptop.resolution}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2A44]/60">
              <span className="text-[#94A3B8]">Yangilanish chastotasi:</span>
              <span className="font-medium text-white">{laptop.refreshRateHz} Hz</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2A44]/60">
              <span className="text-[#94A3B8]">Batareya quvvati:</span>
              <span className="font-medium text-white">~{laptop.batteryHours} soat avtonom ish</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2A44]/60">
              <span className="text-[#94A3B8]">Vazni:</span>
              <span className="font-medium text-white">{laptop.weightKg} kg</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2A44]/60">
              <span className="text-[#94A3B8]">Oʻrnatilgan OT:</span>
              <span className="font-medium text-white">{laptop.os}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
