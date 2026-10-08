import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Laptop as LaptopIcon,
  Heart,
  ShoppingCart,
  SlidersHorizontal,
  Filter,
  Check,
  Cpu,
  Zap,
  Battery,
  Monitor,
  X,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { ProductImage } from '../components/ProductImage';
import { laptops } from '../data/laptops';
import { useStore } from '../store';
import { formatPrice } from '../lib/format';
import { Laptop } from '../types';

export function LaptopsPage() {
  const navigate = useNavigate();
  const {
    favorites,
    toggleFavorite,
    addToCart,
    compareLaptops,
    toggleCompareLaptop,
  } = useStore();

  // Mobile filter drawer open/close
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [selectedRam, setSelectedRam] = useState<number[]>([]);
  const [selectedScreen, setSelectedScreen] = useState<string>('all');
  const [hasDedicatedGpu, setHasDedicatedGpu] = useState<boolean | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(35000000);
  const [sortBy, setSortBy] = useState<'default' | 'asc' | 'desc'>('default');

  const allBrands = useMemo(() => Array.from(new Set(laptops.map((l) => l.brand))), []);
  const allPurposes = ['Oʻqish', 'Ish', "O'yin", 'Dizayn'];

  const toggleBrand = (b: string) => {
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    );
  };

  const togglePurpose = (p: string) => {
    setSelectedPurposes((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const toggleRam = (r: number) => {
    setSelectedRam((prev) =>
      prev.includes(r) ? prev.filter((item) => item !== r) : [...prev, r]
    );
  };

  const filteredLaptops = useMemo(() => {
    return laptops
      .filter((l) => {
        if (selectedBrands.length > 0 && !selectedBrands.includes(l.brand)) {
          return false;
        }
        if (
          selectedPurposes.length > 0 &&
          !selectedPurposes.includes(l.purpose)
        ) {
          return false;
        }
        if (selectedRam.length > 0 && !selectedRam.includes(l.ramGB)) {
          return false;
        }
        if (selectedScreen === 'compact' && l.screenInches > 14.5) return false;
        if (selectedScreen === 'large' && l.screenInches <= 14.5) return false;
        if (hasDedicatedGpu === true && l.gpu.includes('Intel') && !l.gpu.includes('RTX')) {
          return false;
        }
        if (hasDedicatedGpu === false && (l.gpu.includes('RTX') || l.gpu.includes('GeForce'))) {
          return false;
        }
        if (l.price > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'asc') return a.price - b.price;
        if (sortBy === 'desc') return b.price - a.price;
        return 0;
      });
  }, [
    selectedBrands,
    selectedPurposes,
    selectedRam,
    selectedScreen,
    hasDedicatedGpu,
    maxPrice,
    sortBy,
  ]);

  const handleAddToCart = (laptop: Laptop) => {
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
  };

  const renderFilterPanel = () => (
    <div className="space-y-6 text-xs text-[#E5E7EB]">
      {/* Brands */}
      <div>
        <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-2.5">
          Brendlar
        </h4>
        <div className="space-y-1.5">
          {allBrands.map((b) => (
            <label key={b} className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b)}
                onChange={() => toggleBrand(b)}
                className="rounded border-[#1F2A44] text-[#22C55E] focus:ring-0 accent-emerald-500"
              />
              <span>{b}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Purpose */}
      <div>
        <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-2.5">
          Asosiy Maqsad
        </h4>
        <div className="space-y-1.5">
          {allPurposes.map((p) => (
            <label key={p} className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={selectedPurposes.includes(p)}
                onChange={() => togglePurpose(p)}
                className="rounded border-[#1F2A44] text-[#22C55E] focus:ring-0 accent-emerald-500"
              />
              <span>{p}</span>
            </label>
          ))}
        </div>
      </div>

      {/* RAM (8, 16, 32) */}
      <div>
        <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-2.5">
          Operativ xotira (RAM)
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {[8, 16, 18, 32].map((r) => (
            <button
              key={r}
              onClick={() => toggleRam(r)}
              className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                selectedRam.includes(r)
                  ? 'bg-[#22C55E] text-black font-bold'
                  : 'bg-[#0B0F1A] border border-[#1F2A44] text-[#94A3B8] hover:text-white'
              }`}
            >
              {r} GB
            </button>
          ))}
        </div>
      </div>

      {/* Screen Size */}
      <div>
        <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-2.5">
          Ekran oʻlchami
        </h4>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="screen"
              checked={selectedScreen === 'all'}
              onChange={() => setSelectedScreen('all')}
              className="accent-emerald-500"
            />
            <span>Barchasi</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="screen"
              checked={selectedScreen === 'compact'}
              onChange={() => setSelectedScreen('compact')}
              className="accent-emerald-500"
            />
            <span>Ixcham (13" - 14.2")</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="screen"
              checked={selectedScreen === 'large'}
              onChange={() => setSelectedScreen('large')}
              className="accent-emerald-500"
            />
            <span>Katta ekran (15.6" - 16")</span>
          </label>
        </div>
      </div>

      {/* Dedicated GPU */}
      <div>
        <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-2.5">
          Videokarta turi
        </h4>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gpuType"
              checked={hasDedicatedGpu === null}
              onChange={() => setHasDedicatedGpu(null)}
              className="accent-emerald-500"
            />
            <span>Farqi yoʻq</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gpuType"
              checked={hasDedicatedGpu === true}
              onChange={() => setHasDedicatedGpu(true)}
              className="accent-emerald-500"
            />
            <span>Diskret (RTX / GeForce)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gpuType"
              checked={hasDedicatedGpu === false}
              onChange={() => setHasDedicatedGpu(false)}
              className="accent-emerald-500"
            />
            <span>Oʻrnatilgan (Intel Iris / UHD)</span>
          </label>
        </div>
      </div>

      {/* Price Slider */}
      <div>
        <div className="flex justify-between items-center mb-1 text-[11px]">
          <span className="text-[#94A3B8]">Maksimal narx:</span>
          <span className="text-white font-medium">{formatPrice(maxPrice)}</span>
        </div>
        <input
          type="range"
          min={5000000}
          max={35000000}
          step={1000000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer"
        />
      </div>

      {/* Reset button */}
      <button
        onClick={() => {
          setSelectedBrands([]);
          setSelectedPurposes([]);
          setSelectedRam([]);
          setSelectedScreen('all');
          setHasDedicatedGpu(null);
          setMaxPrice(35000000);
        }}
        className="w-full rounded-xl border border-[#1F2A44] bg-[#0B0F1A] py-2 text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-[#1F2A44] transition-colors"
      >
        Filtrlarni tozalash
      </button>
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <SEO
        title="Noutbuklar Katalogi - Lenovo, ASUS, HP, Apple"
        description="O'qish, ish, o'yin va dizayn uchun barcha turdagi zamonaviy noutbuklar. Taqqoslash va kafolat."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title & Mobile Filter Trigger */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <LaptopIcon className="h-8 w-8 text-[#22C55E]" />
              Noutbuklar Katalogi
            </h1>
            <p className="mt-1 text-sm text-[#94A3B8]">
              Dunyoning yetakchi brendlaridan kuchli va ixcham portativ kompyuterlar ({filteredLaptops.length} ta).
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 rounded-xl border border-[#1F2A44] bg-[#121829] px-3.5 py-2 text-xs font-semibold text-white"
            >
              <Filter className="h-4 w-4 text-[#22C55E]" />
              Filtrlar
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="hidden sm:inline text-[#94A3B8]">Saralash:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-[#1F2A44] bg-[#121829] px-3 py-2 text-[#E5E7EB] focus:outline-none"
              >
                <option value="default">Mashhurligi</option>
                <option value="asc">Arzondan qimmatga</option>
                <option value="desc">Qimmatdan arzonga</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout: Left Sidebar Filter + Right Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-[#1F2A44] bg-[#121829] p-5 shadow-lg">
              <div className="flex items-center gap-2 border-b border-[#1F2A44] pb-3 mb-4">
                <SlidersHorizontal className="h-4 w-4 text-[#22C55E]" />
                <h3 className="font-display text-sm font-bold text-white">Filtrlar</h3>
              </div>
              {renderFilterPanel()}
            </div>
          </div>

          {/* Laptops Cards Grid */}
          <div className="lg:col-span-3">
            {filteredLaptops.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#1F2A44] bg-[#121829]/50 p-12 text-center">
                <LaptopIcon className="h-12 w-12 text-[#94A3B8] mx-auto mb-3 opacity-50" />
                <h3 className="text-base font-bold text-white">Noutbuk topilmadi</h3>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  Tanlangan filtrlarga mos keluvchi modellar mavjud emas. Filtrlarni oʻzgartirib koʻring.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredLaptops.map((laptop) => {
                  const isFav = favorites.includes(laptop.id);
                  const isCompared = compareLaptops.includes(laptop.id);

                  return (
                    <div
                      key={laptop.id}
                      className="group flex flex-col justify-between rounded-2xl border border-[#1F2A44] bg-[#121829] overflow-hidden hover:border-[#22C55E]/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-200"
                    >
                      {/* Image & Badges */}
                      <div className="relative w-full overflow-hidden">
                        <ProductImage
                          category="laptop"
                          brand={laptop.brand}
                          name={laptop.name}
                          image={laptop.image}
                        />
                        <span className="absolute top-3 left-3 z-20 rounded-lg bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                          {laptop.purpose}
                        </span>
                        {laptop.stock === 0 && (
                          <span className="absolute top-3 left-20 z-20 rounded-lg bg-red-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white">
                            Omborda yoʻq
                          </span>
                        )}
                        <button
                          onClick={() => toggleFavorite(laptop.id)}
                          className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-md hover:bg-black/90 transition-colors"
                          aria-label="Sevimlilarga qo'shish"
                        >
                          <Heart className={`h-4 w-4 ${isFav ? 'fill-pink-500 text-pink-500' : ''}`} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#22C55E]">
                            {laptop.brand}
                          </span>
                          <Link to={`/laptops/${laptop.id}`}>
                            <h3 className="font-display text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                              {laptop.name}
                            </h3>
                          </Link>
                        </div>

                        {/* Specs */}
                        <div className="space-y-1.5 text-xs text-[#94A3B8] bg-[#0B0F1A] p-2.5 rounded-xl border border-[#1F2A44]/60">
                          <div className="flex items-center gap-1.5 truncate">
                            <Cpu className="h-3.5 w-3.5 text-[#3B82F6] shrink-0" />
                            <span className="truncate">{laptop.cpu}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{laptop.gpu}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] pt-1 border-t border-[#1F2A44]/60 text-white">
                            <span>{laptop.ramGB}GB RAM / {laptop.storageGB >= 1000 ? `${laptop.storageGB / 1000}TB` : `${laptop.storageGB}GB`} SSD</span>
                            <span>{laptop.screenInches}" {laptop.refreshRateHz}Hz</span>
                          </div>
                        </div>

                        {/* Compare checkbox & Price */}
                        <div className="pt-2 border-t border-[#1F2A44] space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] cursor-pointer hover:text-white select-none">
                              <input
                                type="checkbox"
                                checked={isCompared}
                                onChange={() => toggleCompareLaptop(laptop.id)}
                                className="rounded border-[#1F2A44] text-[#F59E0B] focus:ring-0 accent-amber-500"
                              />
                              <span>Taqqoslash</span>
                            </label>

                            <div className="font-display text-base font-bold text-white">
                              {formatPrice(laptop.price)}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link
                              to={`/laptops/${laptop.id}`}
                              className="flex-1 text-center rounded-xl border border-[#1F2A44] bg-[#1F2A44] py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
                            >
                              Batafsil
                            </Link>
                            <button
                              onClick={() => handleAddToCart(laptop)}
                              disabled={laptop.stock === 0}
                              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#22C55E] px-3 py-2 text-xs font-bold text-black hover:bg-emerald-400 disabled:opacity-40 transition-colors"
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
                              Savatga
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Compare Button when items are selected */}
      {compareLaptops.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={() => navigate('/compare')}
            className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-display text-sm font-bold text-black shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Noutbuklarni taqqoslash ({compareLaptops.length}/3)</span>
          </button>
        </div>
      )}

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/75 backdrop-blur-sm lg:hidden">
          <div className="ml-auto w-4/5 max-w-sm h-full bg-[#121829] border-l border-[#1F2A44] p-5 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2A44] pb-3">
              <h3 className="font-display text-base font-bold text-white">Filtrlar</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="rounded-lg p-1 text-[#94A3B8] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderFilterPanel()}
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full rounded-xl bg-[#22C55E] py-2.5 text-xs font-bold text-black mt-4"
            >
              Natijalarni koʻrish ({filteredLaptops.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
