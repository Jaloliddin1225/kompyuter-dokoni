import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  AlertCircle,
  Truck,
  Check,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { ProductImage } from '../components/ProductImage';
import { useStore } from '../store';
import { formatPrice } from '../lib/format';

export function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    promoCode,
    discountPercent,
    applyPromoCode,
    removePromoCode,
    deliveryCity,
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [selectedCity, setSelectedCity] = useState<'Toshkent' | 'Viloyatlar'>('Toshkent');

  // Subtotal calculation
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Discount calculation
  const discountAmount = Math.round((subtotal * discountPercent) / 100);

  // Delivery calculation: Free if subtotal >= 5 000 000
  const isFreeDelivery = subtotal >= 5000000;
  const deliveryFee = subtotal === 0 ? 0 : isFreeDelivery ? 0 : selectedCity === 'Toshkent' ? 30000 : 60000;

  // Final total
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoMessage({ text: res.message, success: res.success });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <SEO title="Savat bo'sh" description="Savatingizda hali mahsulotlar mavjud emas." />
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#121829] border border-[#1F2A44] text-[#94A3B8] mb-4">
          <ShoppingCart className="h-10 w-10 opacity-40" />
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
          Savatingiz hozircha boʻsh
        </h2>
        <p className="text-sm text-[#94A3B8] max-w-sm mb-6 leading-relaxed">
          Katalogimizdan kerakli tayyor kompyuter, noutbuk yoki oʻz yigʻmangizni tanlab, savatga qoʻshing.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/builder"
            className="rounded-xl bg-[#3B82F6] px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-600 transition-colors"
          >
            PC Builder ga oʻtish
          </Link>
          <Link
            to="/prebuilt"
            className="rounded-xl border border-[#1F2A44] bg-[#121829] px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Tayyor kompyuterlar
          </Link>
          <Link
            to="/laptops"
            className="rounded-xl border border-[#1F2A44] bg-[#121829] px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Noutbuklar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <SEO title="Savat - Xaridlar ro'yxati" description="Tanlangan mahsulotlarni ko'rib chiqish va buyurtma rasmiylashtirish." />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F2A44] pb-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <ShoppingCart className="h-7 w-7 text-[#3B82F6]" />
              Savatingiz ({cart.reduce((a, b) => a + b.quantity, 0)} dona)
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Savatni tozalash
          </button>
        </div>

        {/* Two Columns: Left Items, Right Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const isOutOfStock = item.stock === 0;

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border border-[#1F2A44] bg-[#121829] p-4 gap-4"
                >
                  {/* Photo & Details */}
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className="h-20 w-24 shrink-0">
                      <ProductImage
                        category={item.type === 'laptop' ? 'laptop' : 'prebuilt'}
                        name={item.name}
                        image={item.image}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#3B82F6]">
                        {item.type === 'custom-build'
                          ? 'PCForge Maxsus Yigʻma'
                          : item.type === 'prebuilt'
                          ? 'Tayyor Kompyuter'
                          : 'Noutbuk'}
                      </span>
                      <h3 className="font-display text-sm font-bold text-white leading-snug">
                        {item.name}
                      </h3>

                      {item.details?.subtitle && (
                        <p className="text-xs text-[#94A3B8]">{item.details.subtitle}</p>
                      )}

                      {item.details?.assemblyService && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <Check className="h-3 w-3" /> Professional yigʻish xizmati bilan
                        </span>
                      )}

                      {isOutOfStock && (
                        <div className="flex items-center gap-1 text-xs text-red-400 font-medium mt-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>Hozirda omborda yetarli emas</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    {/* Quantity Selector */}
                    <div className="flex items-center rounded-xl border border-[#1F2A44] bg-[#0B0F1A]">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-2 text-[#94A3B8] hover:text-white"
                        aria-label="Kamaytirish"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-2 text-[#94A3B8] hover:text-white"
                        aria-label="Ko'paytirish"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Price and Delete */}
                    <div className="text-right">
                      <div className="font-display text-base font-bold text-white">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[11px] text-[#94A3B8] hover:text-red-400 transition-colors mt-0.5"
                      >
                        Oʻchirish
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Summary Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-[#1F2A44] bg-[#121829] p-5 shadow-xl space-y-5">
              <h3 className="font-display text-base font-bold text-white border-b border-[#1F2A44] pb-3">
                Buyurtma xulosasi
              </h3>

              {/* Delivery region choice */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#94A3B8] block">Yetkazib berish hududi:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setSelectedCity('Toshkent')}
                    className={`rounded-xl p-2.5 border transition-all text-left ${
                      selectedCity === 'Toshkent'
                        ? 'border-[#3B82F6] bg-blue-500/10 text-white font-bold'
                        : 'border-[#1F2A44] bg-[#0B0F1A] text-[#94A3B8]'
                    }`}
                  >
                    <div>Toshkent sh.</div>
                    <div className="text-[10px] opacity-75">{isFreeDelivery ? 'Bepul' : '30 000 soʻm'}</div>
                  </button>

                  <button
                    onClick={() => setSelectedCity('Viloyatlar')}
                    className={`rounded-xl p-2.5 border transition-all text-left ${
                      selectedCity === 'Viloyatlar'
                        ? 'border-[#3B82F6] bg-blue-500/10 text-white font-bold'
                        : 'border-[#1F2A44] bg-[#0B0F1A] text-[#94A3B8]'
                    }`}
                  >
                    <div>Viloyatlar</div>
                    <div className="text-[10px] opacity-75">{isFreeDelivery ? 'Bepul' : '60 000 soʻm'}</div>
                  </button>
                </div>

                {isFreeDelivery && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium pt-1">
                    <Truck className="h-3.5 w-3.5" />
                    <span>5 000 000 soʻmdan yuqoriga yetkazish mutlaqo bepul!</span>
                  </div>
                )}
              </div>

              {/* Promo Code Input */}
              <div className="space-y-2 pt-2 border-t border-[#1F2A44]">
                <label className="text-xs font-semibold text-[#94A3B8] block">Promokod:</label>
                {promoCode ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-400">
                    <span className="font-bold">PCFORGE10 (-10%)</span>
                    <button
                      onClick={removePromoCode}
                      className="text-xs font-semibold text-red-400 hover:underline"
                    >
                      Bekor qilish
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Masalan: PCFORGE10"
                      className="flex-1 rounded-xl border border-[#1F2A44] bg-[#0B0F1A] px-3 py-2 text-xs text-white placeholder-[#94A3B8] uppercase focus:border-[#3B82F6] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-[#1F2A44] px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-600 transition-colors"
                    >
                      Qoʻllash
                    </button>
                  </form>
                )}

                {promoMessage && (
                  <div className={`text-[11px] ${promoMessage.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {promoMessage.text}
                  </div>
                )}
              </div>

              {/* Calculations breakdown */}
              <div className="space-y-2 text-xs border-t border-[#1F2A44] pt-3 text-[#94A3B8]">
                <div className="flex justify-between">
                  <span>Mahsulotlar narxi:</span>
                  <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Chegirma (10%):</span>
                    <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Yetkazib berish:</span>
                  <span className="text-white font-medium">
                    {deliveryFee === 0 ? 'Bepul' : formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              {/* Total Price */}
              <div className="border-t border-[#1F2A44] pt-3">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-xs text-[#94A3B8]">Jami toʻlov:</span>
                  <span className="font-display text-2xl font-black text-white">
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all"
                >
                  Buyurtmani rasmiylashtirish
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
