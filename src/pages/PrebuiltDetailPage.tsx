import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Monitor,
  Heart,
  ShoppingCart,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Gamepad2,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { ProductImage } from '../components/ProductImage';
import { prebuiltPCs } from '../data/prebuilt';
import { componentsById } from '../data/components';
import { useStore } from '../store';
import { formatPrice } from '../lib/format';
import { Category, Component } from '../types';

export function PrebuiltDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pc = prebuiltPCs.find((p) => p.id === id);

  const { favorites, toggleFavorite, addToCart, loadBuild } = useStore();

  if (!pc) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Kompyuter topilmadi</h2>
        <p className="text-sm text-[#94A3B8] mb-4">Siz qidirayotgan kompyuter mavjud emas yoki oʻchirilgan.</p>
        <Link to="/prebuilt" className="rounded-xl bg-[#3B82F6] px-4 py-2 text-xs font-semibold text-white">
          Katalogga qaytish
        </Link>
      </div>
    );
  }

  const isFav = favorites.includes(pc.id);
  const installedComponents = pc.componentIds.map((cid) => componentsById[cid]).filter(Boolean);

  const handleAddToCart = () => {
    const selection: Partial<Record<Category, Component>> = {};
    pc.componentIds.forEach((cid) => {
      const c = componentsById[cid];
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
    navigate('/cart');
  };

  const handleCustomizeInBuilder = () => {
    const selection: Partial<Record<Category, Component>> = {};
    pc.componentIds.forEach((cid) => {
      const c = componentsById[cid];
      if (c) selection[c.category] = c;
    });
    loadBuild(selection);
    navigate(`/builder?build=${pc.componentIds.join(',')}`);
  };

  return (
    <div className="min-h-screen py-8">
      <SEO
        title={`${pc.name} - Tayyor Kompyuter`}
        description={pc.description}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          to="/prebuilt"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Tayyor kompyuterlar katalogiga qaytish
        </Link>

        {/* Top Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Large Image */}
          <div className="relative rounded-3xl border border-[#1F2A44] bg-[#121829] overflow-hidden p-2 shadow-2xl">
            <ProductImage
              category="prebuilt"
              name={pc.name}
              image={pc.image}
              brand="PCFORGE"
              aspectRatio="aspect-[4/3]"
              className="rounded-2xl"
            />
            <span className="absolute top-6 left-6 z-20 rounded-xl bg-purple-600/90 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white shadow-md">
              {pc.category}
            </span>
            <button
              onClick={() => toggleFavorite(pc.id)}
              className="absolute top-6 right-6 z-20 flex h-11 w-11 items-center justify-center rounded-2xl bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors"
            >
              <Heart className={`h-5 w-5 ${isFav ? 'fill-pink-500 text-pink-500' : ''}`} />
            </button>
          </div>

          {/* Details & Actions */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-purple-400 mb-1">
                <span>Rasmiy yigʻma</span>
                <span>•</span>
                <span className="text-emerald-400">Omborda mavjud ({pc.stock} dona)</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                {pc.name}
              </h1>
              <p className="mt-3 text-sm text-[#94A3B8] leading-relaxed">
                {pc.description}
              </p>
            </div>

            {/* Badges / Guarantees */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 rounded-xl border border-[#1F2A44] bg-[#121829] p-3 text-white">
                <ShieldCheck className="h-5 w-5 text-[#22C55E]" />
                <div>
                  <div className="font-semibold">{pc.warrantyMonths} oy kafolat</div>
                  <div className="text-[10px] text-[#94A3B8]">Rasmiy xizmat koʻrsatish</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-[#1F2A44] bg-[#121829] p-3 text-white">
                <CheckCircle2 className="h-5 w-5 text-[#3B82F6]" />
                <div>
                  <div className="font-semibold">Sinovdan oʻtgan</div>
                  <div className="text-[10px] text-[#94A3B8]">FurMark & Cinebench test</div>
                </div>
              </div>
            </div>

            {/* Price & Buy Actions */}
            <div className="rounded-2xl border border-[#1F2A44] bg-[#121829] p-5 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#94A3B8]">Jami narx (yigʻish bilan):</span>
                <span className="font-display text-3xl font-extrabold text-white">
                  {formatPrice(pc.price)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-500 transition-all"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Savatga qoʻshish
                </button>

                <button
                  onClick={handleCustomizeInBuilder}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#3B82F6] bg-blue-600/10 py-3 text-sm font-bold text-blue-400 hover:bg-blue-600/20 transition-all"
                >
                  <Wrench className="h-4 w-4 text-[#3B82F6]" />
                  Konfiguratsiyani oʻzgartirish
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Game Benchmark FPS Section */}
        {pc.benchmarks && pc.benchmarks.length > 0 && (
          <div className="rounded-2xl border border-[#1F2A44] bg-[#121829] p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-purple-400" />
              Oʻyinlardagi sinov natijalari (1080p Full HD)
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Bizning laboratoriyamizda yuqori grafik sozlamalarda oʻlchangan oʻrtacha kadrlar soni (FPS).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {pc.benchmarks.map((bm, idx) => (
                <div key={idx} className="rounded-xl border border-[#1F2A44] bg-[#0B0F1A] p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-white">{bm.game}</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">{bm.fps1080p} FPS</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#1F2A44] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      style={{ width: `${Math.min(100, (bm.fps1080p / 200) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Components Table */}
        <div className="rounded-2xl border border-[#1F2A44] bg-[#121829] p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Monitor className="h-5 w-5 text-[#3B82F6]" />
            Oʻrnatilgan komponentlar roʻyxati
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#1F2A44] text-[#94A3B8] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Qism</th>
                  <th className="py-3 px-4">Model & Nomi</th>
                  <th className="py-3 px-4">Brend</th>
                  <th className="py-3 px-4 text-right">Narxi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2A44]/60 text-[#E5E7EB]">
                {installedComponents.map((comp) => (
                  <tr key={comp.id} className="hover:bg-[#1F2A44]/30 transition-colors">
                    <td className="py-3 px-4 font-semibold uppercase text-[#3B82F6]">
                      {comp.category}
                    </td>
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="h-9 w-12 shrink-0">
                        <ProductImage
                          category={comp.category}
                          name={comp.name}
                          brand={comp.brand}
                          image={comp.image}
                          className="rounded-md"
                        />
                      </div>
                      <span className="font-medium text-white">{comp.name}</span>
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8]">{comp.brand}</td>
                    <td className="py-3 px-4 text-right font-semibold text-white">
                      {formatPrice(comp.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
