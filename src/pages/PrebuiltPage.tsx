import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Monitor,
  Heart,
  ShoppingCart,
  ArrowRight,
  Filter,
  Check,
  Cpu,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { ProductImage } from '../components/ProductImage';
import { prebuiltPCs } from '../data/prebuilt';
import { componentsById } from '../data/components';
import { useStore } from '../store';
import { formatPrice } from '../lib/format';
import { PrebuiltPC, Category, Component } from '../types';

const CATEGORIES = [
  'Barchasi',
  'Ofis',
  "O'yin",
  'Dizayn va montaj',
  "Boshlang'ich",
];

export function PrebuiltPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi');
  const [sortBy, setSortBy] = useState<'default' | 'asc' | 'desc'>('default');
  const [maxPrice, setMaxPrice] = useState<number>(30000000);

  const { favorites, toggleFavorite, addToCart } = useStore();
  const navigate = useNavigate();

  const filteredPCs = useMemo(() => {
    return prebuiltPCs
      .filter((pc) => {
        if (selectedCategory !== 'Barchasi' && pc.category !== selectedCategory) {
          return false;
        }
        if (pc.price > maxPrice) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'asc') return a.price - b.price;
        if (sortBy === 'desc') return b.price - a.price;
        return 0;
      });
  }, [selectedCategory, maxPrice, sortBy]);

  const handleAddToCart = (pc: PrebuiltPC) => {
    const selection: Partial<Record<Category, Component>> = {};
    pc.componentIds.forEach((id) => {
      const c = componentsById[id];
      if (c) selection[c.category] = c;
    });

    addToCart({
      id: pc.id,
      type: 'prebuilt',
      name: pc.name,
      price: pc.price,
      quantity: 1,
      image: pc.image,
      stock: pc.stock,
      details: {
        components: selection,
        assemblyService: true,
      },
    });
  };

  return (
    <div className="min-h-screen py-8">
      <SEO
        title="Tayyor Kompyuterlar - O'yin, Ofis va Montaj Yig'malari"
        description="Sinovdan o'tgan professional yig'ilgan kompyuterlar. Rasmiy kafolat va tezkor yetkazib berish."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Title & Intro */}
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Monitor className="h-8 w-8 text-[#8B5CF6]" />
            Tayyor Kompyuterlar
          </h1>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Muhandislarimiz tomonidan professional tarzda yigʻilgan, sinovdan oʻtgan va kafolatlangan tizimlar.
          </p>
        </div>

        {/* Filter bar: Category Tabs & Sort */}
        <div className="mb-8 space-y-4 rounded-2xl border border-[#1F2A44] bg-[#121829] p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#8B5CF6] text-white shadow-md shadow-purple-500/20'
                      : 'bg-[#0B0F1A] text-[#94A3B8] hover:text-white hover:bg-[#1F2A44]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort & Max price slider */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#94A3B8]">Saralash:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-xl border border-[#1F2A44] bg-[#0B0F1A] px-2.5 py-1.5 text-[#E5E7EB] focus:outline-none"
                >
                  <option value="default">Mashhurligi boʻyicha</option>
                  <option value="asc">Arzondan qimmatga</option>
                  <option value="desc">Qimmatdan arzonga</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#94A3B8]">Maks:</span>
                <span className="text-white font-medium">{formatPrice(maxPrice)}</span>
                <input
                  type="range"
                  min={6000000}
                  max={30000000}
                  step={1000000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="accent-purple-500 cursor-pointer w-28"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PC Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPCs.map((pc) => {
            const isFav = favorites.includes(pc.id);

            // Extract 4 main specs (CPU, GPU, RAM, Storage)
            const cpu = pc.componentIds.map((id) => componentsById[id]).find((c) => c?.category === 'cpu');
            const gpu = pc.componentIds.map((id) => componentsById[id]).find((c) => c?.category === 'gpu');
            const ram = pc.componentIds.map((id) => componentsById[id]).find((c) => c?.category === 'ram');
            const storage = pc.componentIds.map((id) => componentsById[id]).find((c) => c?.category === 'storage');

            return (
              <div
                key={pc.id}
                className="tech-card tech-card-purple group relative flex flex-col justify-between overflow-hidden"
              >
                {/* Image & Favorite Badge */}
                <div className="relative w-full overflow-hidden">
                  <ProductImage
                    category="prebuilt"
                    name={pc.name}
                    image={pc.image}
                    brand="PCFORGE"
                  />
                  <div className="absolute top-3 left-3 z-20">
                    <span className="rounded-lg bg-purple-600/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                      {pc.category}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleFavorite(pc.id)}
                    className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-md hover:bg-black/90 transition-colors"
                    aria-label="Sevimlilarga qo'shish"
                  >
                    <Heart className={`h-4 w-4 ${isFav ? 'fill-pink-500 text-pink-500' : ''}`} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                      {pc.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                      {pc.description}
                    </p>
                  </div>

                  {/* 4 Main Specs */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#94A3B8] bg-[#0B0F1A] p-3 rounded-xl border border-[#1F2A44]/60">
                    <div>
                      <span className="block text-[10px] text-[#3B82F6] font-semibold">Protsessor</span>
                      <span className="text-white font-medium truncate block">
                        {cpu ? cpu.name.split('(')[0] : 'CPU'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-emerald-400 font-semibold">Videokarta</span>
                      <span className="text-white font-medium truncate block">
                        {gpu ? (gpu as any).chip : 'Oʻrnatilgan grafika'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-purple-400 font-semibold">Tezkor xotira (RAM)</span>
                      <span className="text-white font-medium truncate block">
                        {ram ? `${(ram as any).capacityGB}GB ${(ram as any).type}` : 'RAM'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-amber-400 font-semibold">Doimiy xotira</span>
                      <span className="text-white font-medium truncate block">
                        {storage ? `${(storage as any).capacityGB >= 1000 ? `${(storage as any).capacityGB / 1000}TB` : `${(storage as any).capacityGB}GB`} ${(storage as any).type}` : 'SSD'}
                      </span>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="pt-2 border-t border-[#1F2A44] flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-[#94A3B8]">Toʻliq narx:</span>
                      <div className="font-display text-xl font-bold text-white">
                        {formatPrice(pc.price)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/prebuilt/${pc.id}`}
                        className="rounded-xl border border-[#1F2A44] bg-[#1F2A44] px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
                      >
                        Batafsil
                      </Link>
                      <button
                        onClick={() => handleAddToCart(pc)}
                        className="flex items-center gap-1.5 rounded-xl bg-[#8B5CF6] px-3.5 py-2 text-xs font-bold text-white hover:bg-purple-600 transition-colors shadow-md shadow-purple-500/20"
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
      </div>
    </div>
  );
}
