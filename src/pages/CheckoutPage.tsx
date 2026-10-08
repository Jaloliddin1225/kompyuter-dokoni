import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Truck,
  Building,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { useStore } from '../store';
import { formatPrice } from '../lib/format';
import { Order, OrderCustomer } from '../types';

const REGIONS = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand viloyati',
  'Buxoro viloyati',
  'Fargʻona viloyati',
  'Andijon viloyati',
  'Namangan viloyati',
  'Qashqadaryo viloyati',
  'Surxondaryo viloyati',
  'Xorazm viloyati',
  'Navoiy viloyati',
  'Jizzax viloyati',
  'Sirdaryo viloyati',
  'Qoraqalpogʻiston Respublikasi',
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart, promoCode, discountPercent, addOrder } = useStore();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '+998 ',
    region: 'Toshkent shahri',
    city: 'Yunusobod tumani',
    address: '',
    notes: '',
    deliveryMethod: 'delivery' as 'delivery' | 'pickup',
    paymentMethod: 'click' as 'cash' | 'click' | 'payme',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const isFreeDelivery = subtotal >= 5000000;
  const deliveryFee =
    formData.deliveryMethod === 'pickup'
      ? 0
      : isFreeDelivery
      ? 0
      : formData.region === 'Toshkent shahri'
      ? 30000
      : 60000;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <SEO title="Buyurtma berish" description="Savatingiz bo'sh." />
        <h2 className="text-xl font-bold text-white mb-2">Savatingiz boʻsh</h2>
        <Link to="/builder" className="rounded-xl bg-[#3B82F6] px-4 py-2 text-xs font-bold text-white">
          Katalogga oʻtish
        </Link>
      </div>
    );
  }

  // Simple mask handler for +998 phone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) {
      val = '+998 ';
    }
    // Allow digits and spaces
    val = val.replace(/[^\d+ ]/g, '').slice(0, 17);
    setFormData((prev) => ({ ...prev, phone: val }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (formData.fullName.trim().length < 3) {
      errs.fullName = 'Iltimos, toʻliq ism-familiyangizni kiriting.';
    }
    if (formData.phone.replace(/\D/g, '').length < 12) {
      errs.phone = 'Telefon raqamni toʻliq kiriting (masalan: +998 90 123 45 67).';
    }
    if (formData.deliveryMethod === 'delivery' && formData.address.trim().length < 5) {
      errs.address = 'Aniq manzilni (koʻcha, uy, xonadon) kiriting.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Generate unique order ID in PF-2026-XXXXX format
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `PF-2026-${randomNum}`;

    const newOrder: Order = {
      id: orderId,
      customer: {
        fullName: formData.fullName,
        phone: formData.phone,
        region: formData.region,
        city: formData.city,
        address: formData.address,
        notes: formData.notes,
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
      },
      items: [...cart],
      subtotal,
      discount: discountAmount,
      deliveryFee,
      assemblyFee: 0,
      total: finalTotal,
      status: 'Qabul qilindi',
      createdAt: new Date().toISOString(),
    };

    addOrder(newOrder);
    clearCart();
    navigate(`/order/${orderId}`);
  };

  return (
    <div className="min-h-screen py-8">
      <SEO
        title="Buyurtmani rasmiylashtirish - PCForge"
        description="Yetkazib berish manzili va to'lov usulini tanlash."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Savatga qaytish
        </Link>

        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
          Buyurtmani rasmiylashtirish
        </h1>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Form: Details & Delivery */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Contact Info */}
            <div className="rounded-2xl border border-[#1F2A44] bg-[#121829] p-5 space-y-4">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <span>1. Aloqa maʼlumotlari</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">
                    Ism va familiya *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Masalan: Sardor Aliyev"
                    className="w-full rounded-xl border border-[#1F2A44] bg-[#0B0F1A] px-3.5 py-2.5 text-white placeholder-[#94A3B8] focus:border-[#3B82F6] focus:outline-none"
                  />
                  {errors.fullName && (
                    <span className="text-red-400 text-[11px] mt-1 block">{errors.fullName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">
                    Telefon raqam *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="+998 90 123 45 67"
                    className="w-full rounded-xl border border-[#1F2A44] bg-[#0B0F1A] px-3.5 py-2.5 text-white placeholder-[#94A3B8] focus:border-[#3B82F6] focus:outline-none font-mono"
                  />
                  {errors.phone && (
                    <span className="text-red-400 text-[11px] mt-1 block">{errors.phone}</span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Delivery Method */}
            <div className="rounded-2xl border border-[#1F2A44] bg-[#121829] p-5 space-y-4">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <span>2. Yetkazib berish usuli</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                    formData.deliveryMethod === 'delivery'
                      ? 'border-[#3B82F6] bg-blue-500/10 text-white'
                      : 'border-[#1F2A44] bg-[#0B0F1A] text-[#94A3B8]'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={formData.deliveryMethod === 'delivery'}
                    onChange={() => setFormData({ ...formData, deliveryMethod: 'delivery' })}
                    className="mt-0.5 accent-blue-500"
                  />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-[#3B82F6]" />
                      Yetkazib berish xizmati
                    </div>
                    <div className="text-[11px] mt-0.5">
                      {isFreeDelivery ? 'Bepul yetkazish' : 'Toshkentda 30 000 soʻm, viloyatlarda 60 000 soʻm'}
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                    formData.deliveryMethod === 'pickup'
                      ? 'border-[#3B82F6] bg-blue-500/10 text-white'
                      : 'border-[#1F2A44] bg-[#0B0F1A] text-[#94A3B8]'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={formData.deliveryMethod === 'pickup'}
                    onChange={() => setFormData({ ...formData, deliveryMethod: 'pickup' })}
                    className="mt-0.5 accent-blue-500"
                  />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-[#8B5CF6]" />
                      Doʻkondan olib ketish
                    </div>
                    <div className="text-[11px] mt-0.5">
                      Malika savdo markazi, A-22 doʻkoni (Bepul)
                    </div>
                  </div>
                </label>
              </div>

              {formData.deliveryMethod === 'delivery' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <label className="block text-[#94A3B8] mb-1 font-medium">Viloyat / Shahar *</label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full rounded-xl border border-[#1F2A44] bg-[#0B0F1A] px-3.5 py-2.5 text-white focus:outline-none"
                    >
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#94A3B8] mb-1 font-medium">Tuman / Shaharcha</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Masalan: Yunusobod tumani"
                      className="w-full rounded-xl border border-[#1F2A44] bg-[#0B0F1A] px-3.5 py-2.5 text-white placeholder-[#94A3B8] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[#94A3B8] mb-1 font-medium">Aniq manzil *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Koʻcha, uy raqami, xonadon, moʻljal..."
                      className="w-full rounded-xl border border-[#1F2A44] bg-[#0B0F1A] px-3.5 py-2.5 text-white placeholder-[#94A3B8] focus:outline-none"
                    />
                    {errors.address && (
                      <span className="text-red-400 text-[11px] mt-1 block">{errors.address}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Order notes */}
              <div className="text-xs">
                <label className="block text-[#94A3B8] mb-1 font-medium">
                  Kuryer yoki mutaxassis uchun izoh (ixtiyoriy)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Eshik kodi, qoʻngʻiroq qilish vaqti yoki qoʻshimcha talablar..."
                  className="w-full rounded-xl border border-[#1F2A44] bg-[#0B0F1A] px-3.5 py-2 text-white placeholder-[#94A3B8] focus:outline-none"
                />
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="rounded-2xl border border-[#1F2A44] bg-[#121829] p-5 space-y-4">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <span>3. Toʻlov usuli</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {[
                  { id: 'click', label: 'Click', desc: 'Online toʻlov' },
                  { id: 'payme', label: 'Payme', desc: 'Online toʻlov' },
                  { id: 'cash', label: 'Naqd pul', desc: 'Qabul qilganda' },
                ].map((pay) => (
                  <label
                    key={pay.id}
                    className={`flex items-start gap-2.5 rounded-xl border p-3.5 cursor-pointer transition-all ${
                      formData.paymentMethod === pay.id
                        ? 'border-[#3B82F6] bg-blue-500/10 text-white'
                        : 'border-[#1F2A44] bg-[#0B0F1A] text-[#94A3B8]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={formData.paymentMethod === pay.id}
                      onChange={() => setFormData({ ...formData, paymentMethod: pay.id as any })}
                      className="mt-0.5 accent-blue-500"
                    />
                    <div>
                      <div className="font-bold text-white">{pay.label}</div>
                      <div className="text-[11px] opacity-75">{pay.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Summary Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-[#1F2A44] bg-[#121829] p-5 shadow-xl space-y-4">
              <h3 className="font-display text-base font-bold text-white border-b border-[#1F2A44] pb-3">
                Buyurtma tarkibi
              </h3>

              {/* Items summary */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs py-1">
                    <div className="truncate pr-2">
                      <div className="text-white truncate font-medium">{item.name}</div>
                      <div className="text-[10px] text-[#94A3B8]">{item.quantity} dona</div>
                    </div>
                    <span className="font-semibold text-white whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary numbers */}
              <div className="border-t border-[#1F2A44] pt-3 space-y-2 text-xs text-[#94A3B8]">
                <div className="flex justify-between">
                  <span>Mahsulotlar:</span>
                  <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Chegirma:</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Yetkazib berish:</span>
                  <span className="text-white font-medium">
                    {deliveryFee === 0 ? 'Bepul' : formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              {/* Total & Submit */}
              <div className="border-t border-[#1F2A44] pt-3">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-xs text-[#94A3B8]">Jami toʻlov:</span>
                  <span className="font-display text-2xl font-black text-white">
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition-all"
                >
                  Buyurtmani tasdiqlash
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
