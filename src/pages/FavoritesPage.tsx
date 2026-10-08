import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { ProductImage } from '../components/ProductImage';
import { useStore } from '../store';
import { prebuiltPCs } from '../data/prebuilt';
import { laptops } from '../data/laptops';
import { allComponents } from '../data/components';
import { formatPrice } from '../lib/format';

export function FavoritesPage() {
  const { favorites, toggleFavorite, addToCart } = useStore();

  // Look up all items across catalogs
  const favoriteItems = favorites.map((id) => {
    const pc = prebuiltPCs.find((p) => p.id === id);
    if (pc) return { ...pc, itemType: 'prebuilt' as const };

    const lap = laptops.find((l) => l.id === id);
    if (lap) return { ...lap, itemType: 'laptop' as const };

    const comp = allComponents.find((c) => c.id === id);
    if (comp) return { ...comp, itemType: 'component' as const };

    return null;
  }).filter(Boolean);

  if (favoriteItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <SEO title="Sevimlilar bo'sh" description="Sizda hali saqlangan mahsulotlar yo'q." />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500 mb-4">
          <Heart className="h-8 w-8" />
        </div>
        <h2 className="font-display text-xl font-bold text-white mb-2">
          Sevimlilar roʻyxati boʻsh
        </h2>
        <p className="text-sm text-[#94A3B8] max-w-sm mb-6">
          Sizga yoqqan kompyuter yoki noutbuklarni yurakcha tugmasini bosib saqlab qoʻyishingiz mumkin.
        </p>
        <Link
          to="/prebuilt"
          className="rounded-xl bg-[#3B82F6] px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-600 transition-colors"
        >
          Katalogga oʻtish
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <SEO title="Sevimlilar ro'yxati - PCForge" description="Siz saqlab qo'ygan mahsulotlar." />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#1F2A44] pb-4">
          <h1 className="font-display text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Heart className="h-6 w-6 fill-pink-500 text-pink-500" />
            Sevimlilar ({favoriteItems.length} ta)
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteItems.map((item: any) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-[#1F2A44] bg-[#121829] overflow-hidden p-4 space-y-3"
            >
              <div className="relative w-full rounded-xl overflow-hidden bg-slate-900">
                <ProductImage
                  category={item.category || (item.itemType === 'laptop' ? 'laptop' : 'prebuilt')}
                  brand={item.brand}
                  name={item.name}
                  image={item.image}
                />
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className="absolute top-2 right-2 z-20 rounded-lg bg-black/70 p-1.5 text-pink-500 hover:text-white transition-colors"
                  title="Sevimlilardan oʻchirish"
                >
                  ✕
                </button>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#3B82F6]">
                  {item.itemType === 'prebuilt' ? 'Tayyor PC' : item.itemType === 'laptop' ? 'Noutbuk' : 'Komponent'}
                </span>
                <h3 className="font-display text-sm font-bold text-white line-clamp-1">{item.name}</h3>
                <div className="font-display text-base font-bold text-emerald-400 mt-1">
                  {formatPrice(item.price)}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#1F2A44]">
                <Link
                  to={item.itemType === 'prebuilt' ? `/prebuilt/${item.id}` : item.itemType === 'laptop' ? `/laptops/${item.id}` : '/builder'}
                  className="flex-1 text-center rounded-xl border border-[#1F2A44] bg-[#1F2A44] py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
                >
                  Batafsil
                </Link>
                <button
                  onClick={() => {
                    addToCart({
                      id: item.id,
                      type: item.itemType,
                      name: item.name,
                      price: item.price,
                      quantity: 1,
                      image: item.image,
                      stock: item.stock || 5,
                    });
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#3B82F6] px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 transition-colors"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Savatga
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
