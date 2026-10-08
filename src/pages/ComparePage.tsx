import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal,
  Trash2,
  ShoppingCart,
  Award,
  ArrowLeft,
  Laptop as LaptopIcon,
  Check,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { ProductImage } from '../components/ProductImage';
import { laptops } from '../data/laptops';
import { useStore } from '../store';
import { formatPrice } from '../lib/format';
import { Laptop } from '../types';

export function ComparePage() {
  const navigate = useNavigate();
  const { compareLaptops, removeCompareLaptop, clearCompare, addToCart } = useStore();

  const selectedLaptops = laptops.filter((l) => compareLaptops.includes(l.id));

  if (selectedLaptops.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <SEO title="Noutbuklarni Taqqoslash" description="Taqqoslash uchun noutbuklarni tanlang." />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-[#F59E0B] mb-4">
          <SlidersHorizontal className="h-8 w-8" />
        </div>
        <h2 className="font-display text-xl font-bold text-white mb-2">
          Taqqoslash uchun noutbuk tanlanmagan
        </h2>
        <p className="text-sm text-[#94A3B8] max-w-md mb-6">
          Katalogdan 3 tagacha noutbukni tanlab, ularning narxi, protsessori, ekran sifati va batareyasini yonma-yon taqqoslang.
        </p>
        <Link
          to="/laptops"
          className="rounded-xl bg-[#22C55E] px-5 py-2.5 text-xs font-bold text-black hover:bg-emerald-400 transition-colors"
        >
          Noutbuklar katalogiga oʻtish
        </Link>
      </div>
    );
  }

  // Best-in-class highlights
  const minPrice = Math.min(...selectedLaptops.map((l) => l.price));
  const maxBattery = Math.max(...selectedLaptops.map((l) => l.batteryHours));
  const minWeight = Math.min(...selectedLaptops.map((l) => l.weightKg));
  const maxRam = Math.max(...selectedLaptops.map((l) => l.ramGB));
  const maxRefresh = Math.max(...selectedLaptops.map((l) => l.refreshRateHz));

  // Specs definitions
  const specRows = [
    {
      label: 'Narxi',
      getValue: (l: Laptop) => formatPrice(l.price),
      isBest: (l: Laptop) => selectedLaptops.length > 1 && l.price === minPrice,
      bestLabel: 'Eng arzon',
      isDiff: selectedLaptops.some((l) => l.price !== selectedLaptops[0].price),
    },
    {
      label: 'Protsessor (CPU)',
      getValue: (l: Laptop) => l.cpu,
      isDiff: selectedLaptops.some((l) => l.cpu !== selectedLaptops[0].cpu),
    },
    {
      label: 'Videokarta (GPU)',
      getValue: (l: Laptop) => l.gpu,
      isDiff: selectedLaptops.some((l) => l.gpu !== selectedLaptops[0].gpu),
    },
    {
      label: 'Operativ xotira (RAM)',
      getValue: (l: Laptop) => `${l.ramGB} GB`,
      isBest: (l: Laptop) => selectedLaptops.length > 1 && l.ramGB === maxRam,
      bestLabel: 'Eng koʻp RAM',
      isDiff: selectedLaptops.some((l) => l.ramGB !== selectedLaptops[0].ramGB),
    },
    {
      label: 'Doimiy xotira (SSD)',
      getValue: (l: Laptop) => (l.storageGB >= 1000 ? `${l.storageGB / 1000} TB` : `${l.storageGB} GB`),
      isDiff: selectedLaptops.some((l) => l.storageGB !== selectedLaptops[0].storageGB),
    },
    {
      label: 'Ekran',
      getValue: (l: Laptop) => `${l.screenInches}" (${l.resolution})`,
      isDiff: selectedLaptops.some((l) => l.screenInches !== selectedLaptops[0].screenInches || l.resolution !== selectedLaptops[0].resolution),
    },
    {
      label: 'Chastota',
      getValue: (l: Laptop) => `${l.refreshRateHz} Hz`,
      isBest: (l: Laptop) => selectedLaptops.length > 1 && l.refreshRateHz === maxRefresh && maxRefresh > 60,
      bestLabel: 'Eng silliq ekran',
      isDiff: selectedLaptops.some((l) => l.refreshRateHz !== selectedLaptops[0].refreshRateHz),
    },
    {
      label: 'Batareya quvvati',
      getValue: (l: Laptop) => `${l.batteryHours} soat`,
      isBest: (l: Laptop) => selectedLaptops.length > 1 && l.batteryHours === maxBattery,
      bestLabel: 'Eng uzoq batareya',
      isDiff: selectedLaptops.some((l) => l.batteryHours !== selectedLaptops[0].batteryHours),
    },
    {
      label: 'Vazni',
      getValue: (l: Laptop) => `${l.weightKg} kg`,
      isBest: (l: Laptop) => selectedLaptops.length > 1 && l.weightKg === minWeight,
      bestLabel: 'Eng yengil',
      isDiff: selectedLaptops.some((l) => l.weightKg !== selectedLaptops[0].weightKg),
    },
    {
      label: 'Operatsion tizim',
      getValue: (l: Laptop) => l.os,
      isDiff: selectedLaptops.some((l) => l.os !== selectedLaptops[0].os),
    },
    {
      label: 'Kafolat muddati',
      getValue: (l: Laptop) => `${l.warrantyMonths} oy`,
      isDiff: selectedLaptops.some((l) => l.warrantyMonths !== selectedLaptops[0].warrantyMonths),
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <SEO
        title="Noutbuklarni Taqqoslash - Parametrlar va Narxlar"
        description="Noutbuklarni yonma-yon taqqoslang. Farqlar va ustunliklar tahlili."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              to="/laptops"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-white mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Katalogga qaytish
            </Link>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <SlidersHorizontal className="h-7 w-7 text-[#F59E0B]" />
              Noutbuklarni Taqqoslash ({selectedLaptops.length}/3)
            </h1>
          </div>

          <button
            onClick={clearCompare}
            className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors w-fit"
          >
            <Trash2 className="h-4 w-4" />
            Taqqoslashni tozalash
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#1F2A44] bg-[#121829] shadow-xl">
          <table className="w-full text-left text-xs min-w-[700px]">
            {/* Headers with Laptop Card Overviews */}
            <thead>
              <tr className="border-b border-[#1F2A44] bg-[#0B0F1A]/80">
                <th className="p-4 w-48 text-[#94A3B8] font-semibold uppercase text-[10px] tracking-wider">
                  Xususiyat
                </th>
                {selectedLaptops.map((l) => (
                  <th key={l.id} className="p-4 w-72 align-top">
                    <div className="space-y-3">
                      <div className="relative w-full rounded-xl overflow-hidden bg-slate-900 border border-[#1F2A44]">
                        <ProductImage
                          category="laptop"
                          brand={l.brand}
                          name={l.name}
                          image={l.image}
                        />
                        <button
                          onClick={() => removeCompareLaptop(l.id)}
                          className="absolute top-2 right-2 z-20 rounded-lg bg-black/70 p-1 text-[#94A3B8] hover:text-red-400"
                          title="Taqqoslashdan oʻchirish"
                        >
                          ✕
                        </button>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#22C55E]">{l.brand}</span>
                        <h4 className="font-display text-sm font-bold text-white line-clamp-2">{l.name}</h4>
                        <div className="font-display text-base font-bold text-emerald-400 mt-1">
                          {formatPrice(l.price)}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          addToCart({
                            id: l.id,
                            type: 'laptop',
                            name: l.name,
                            price: l.price,
                            quantity: 1,
                            image: l.image,
                            stock: l.stock,
                          });
                          navigate('/cart');
                        }}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#22C55E] py-2 text-xs font-bold text-black hover:bg-emerald-400 transition-colors"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Savatga
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Spec Rows */}
            <tbody className="divide-y divide-[#1F2A44]">
              {specRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    row.isDiff ? 'bg-amber-500/5' : 'hover:bg-[#1F2A44]/20'
                  }`}
                >
                  <td className="p-4 font-semibold text-[#94A3B8] flex items-center gap-2">
                    {row.label}
                    {row.isDiff && (
                      <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">
                        Farq
                      </span>
                    )}
                  </td>

                  {selectedLaptops.map((l) => {
                    const value = row.getValue(l);
                    const isBest = row.isBest ? row.isBest(l) : false;

                    return (
                      <td key={l.id} className="p-4 align-middle">
                        <div className="space-y-1">
                          <span className={`text-sm font-medium ${isBest ? 'text-emerald-400 font-bold' : 'text-white'}`}>
                            {value}
                          </span>
                          {isBest && row.bestLabel && (
                            <div className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                              <Award className="h-3 w-3" />
                              {row.bestLabel}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
