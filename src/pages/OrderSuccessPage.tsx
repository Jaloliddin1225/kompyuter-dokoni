import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  ArrowRight,
  Phone,
  Home,
  Monitor,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { ProductImage } from '../components/ProductImage';
import { useStore } from '../store';
import { formatPrice } from '../lib/format';

export function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const getOrderById = useStore((s) => s.getOrderById);
  const order = id ? getOrderById(id) : undefined;

  return (
    <div className="min-h-screen py-12">
      <SEO
        title={`Buyurtma ${id || 'Muvaffaqiyatli'} - PCForge`}
        description="Buyurtmangiz muvaffaqiyatli qabul qilindi. Tez orada operatorimiz siz bilan bog'lanadi."
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Success Banner */}
        <div className="rounded-3xl border border-emerald-500/30 bg-[#121829] p-8 text-center space-y-4 shadow-2xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="h-12 w-12 animate-pulse" />
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Buyurtma qabul qilindi!
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Rahmat, xaridingiz uchun tashakkur!
            </h1>
            <p className="mt-2 text-sm text-[#94A3B8] max-w-md mx-auto">
              Sizning buyurtmangiz navbatga qoʻyildi. 15 daqiqa ichida operatorimiz koʻrsatilgan raqamga qoʻngʻiroq qilib, buyurtmani tasdiqlaydi.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-[#1F2A44] bg-[#0B0F1A] px-5 py-2.5 text-sm font-mono text-white">
            <span className="text-[#94A3B8]">Buyurtma raqami:</span>
            <strong className="text-[#3B82F6]">{id}</strong>
          </div>
        </div>

        {/* Order Details Breakdown if found */}
        {order ? (
          <div className="rounded-2xl border border-[#1F2A44] bg-[#121829] p-6 space-y-6">
            <h2 className="font-display text-base font-bold text-white border-b border-[#1F2A44] pb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-[#3B82F6]" />
              Buyurtma Tafsilotlari
            </h2>

            {/* Customer & Delivery Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#0B0F1A] p-4 rounded-xl border border-[#1F2A44]/60">
              <div>
                <span className="text-[#94A3B8] block">Mijoz:</span>
                <strong className="text-white text-sm">{order.customer.fullName}</strong>
                <div className="text-[#94A3B8] mt-1 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-emerald-400" />
                  {order.customer.phone}
                </div>
              </div>

              <div>
                <span className="text-[#94A3B8] block">Yetkazish usuli & Manzil:</span>
                <strong className="text-white">
                  {order.customer.deliveryMethod === 'pickup'
                    ? 'Doʻkondan olib ketish (Malika A-22)'
                    : `${order.customer.region}, ${order.customer.city || ''}`}
                </strong>
                {order.customer.address && (
                  <div className="text-[#94A3B8] mt-1">{order.customer.address}</div>
                )}
              </div>
            </div>

            {/* Items list */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                Xarid qilingan mahsulotlar:
              </h3>
              <div className="divide-y divide-[#1F2A44]/60">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-12 shrink-0">
                        <ProductImage
                          category={item.type === 'laptop' ? 'laptop' : 'prebuilt'}
                          name={item.name}
                          image={item.image}
                          className="rounded-lg"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-white">{item.name}</div>
                        <div className="text-[11px] text-[#94A3B8]">Miqdor: {item.quantity} dona</div>
                      </div>
                    </div>
                    <span className="font-bold text-white">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-[#1F2A44] pt-4 space-y-1.5 text-xs text-[#94A3B8]">
              <div className="flex justify-between">
                <span>Mahsulotlar qiymati:</span>
                <span className="text-white font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promokod chegirmasi:</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Yetkazib berish xizmati:</span>
                <span className="text-white font-medium">
                  {order.deliveryFee === 0 ? 'Bepul' : formatPrice(order.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#1F2A44]">
                <span>Jami toʻlov summasi:</span>
                <span className="font-display text-lg text-emerald-400">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-6 py-3 text-xs font-bold text-white hover:bg-blue-600 transition-colors"
          >
            <Home className="h-4 w-4" />
            Bosh sahifaga qaytish
          </Link>
          <Link
            to="/prebuilt"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[#1F2A44] bg-[#121829] px-6 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
          >
            <Monitor className="h-4 w-4" />
            Tayyor kompyuterlarni koʻrish
          </Link>
        </div>
      </div>
    </div>
  );
}
