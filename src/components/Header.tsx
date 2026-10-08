import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Cpu,
  Search,
  Heart,
  ShoppingCart,
  Menu,
  X,
  Laptop as LaptopIcon,
  Monitor,
  Layers,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { useStore } from '../store';
import { allComponents } from '../data/components';
import { prebuiltPCs } from '../data/prebuilt';
import { laptops } from '../data/laptops';
import { ProductImage } from './ProductImage';
import { formatPrice } from '../lib/format';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const cart = useStore((s) => s.cart);
  const favorites = useStore((s) => s.favorites);
  const compareLaptops = useStore((s) => s.compareLaptops);

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Global search filtering
  const query = searchQuery.trim().toLowerCase();
  const matchedPrebuilt = query
    ? prebuiltPCs.filter((p) => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)).slice(0, 3)
    : [];
  const matchedLaptops = query
    ? laptops.filter((l) => l.name.toLowerCase().includes(query) || l.brand.toLowerCase().includes(query) || l.cpu.toLowerCase().includes(query)).slice(0, 3)
    : [];
  const matchedComponents = query
    ? allComponents.filter((c) => c.name.toLowerCase().includes(query) || c.brand.toLowerCase().includes(query)).slice(0, 4)
    : [];

  const hasSearchResults = matchedPrebuilt.length > 0 || matchedLaptops.length > 0 || matchedComponents.length > 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1F2A44] bg-[#0B0F1A]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="PCForge bosh sahifasi">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] p-0.5 shadow-md shadow-blue-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0B0F1A] transition-all group-hover:bg-transparent">
              <Cpu className="h-5 w-5 text-[#3B82F6] group-hover:text-white transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-tight text-white flex items-center">
              PC<span className="text-[#3B82F6]">Forge</span>
            </span>
            <span className="text-[10px] tracking-wider text-[#94A3B8] uppercase font-medium">Hardware Lab</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1" aria-label="Asosiy menyu">
          <Link
            to="/builder"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
              location.pathname === '/builder'
                ? 'bg-[#1F2A44] text-[#3B82F6] shadow-sm'
                : 'text-[#E5E7EB] hover:text-white hover:bg-[#121829]'
            }`}
          >
            <Layers className="h-4 w-4 text-[#3B82F6]" />
            PC Builder
            <span className="ml-1 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-1.5 py-0.5 rounded-full">
              Yangi
            </span>
          </Link>
          <Link
            to="/prebuilt"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
              location.pathname.startsWith('/prebuilt')
                ? 'bg-[#1F2A44] text-[#3B82F6]'
                : 'text-[#E5E7EB] hover:text-white hover:bg-[#121829]'
            }`}
          >
            <Monitor className="h-4 w-4 text-[#8B5CF6]" />
            Tayyor PC
          </Link>
          <Link
            to="/laptops"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
              location.pathname.startsWith('/laptops')
                ? 'bg-[#1F2A44] text-[#3B82F6]'
                : 'text-[#E5E7EB] hover:text-white hover:bg-[#121829]'
            }`}
          >
            <LaptopIcon className="h-4 w-4 text-[#22C55E]" />
            Noutbuklar
          </Link>
          <Link
            to="/compare"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
              location.pathname === '/compare'
                ? 'bg-[#1F2A44] text-[#3B82F6]'
                : 'text-[#E5E7EB] hover:text-white hover:bg-[#121829]'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4 text-[#F59E0B]" />
            Taqqoslash
            {compareLaptops.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F59E0B] text-[10px] font-bold text-black">
                {compareLaptops.length}
              </span>
            )}
          </Link>
        </nav>

        {/* Global Search Bar with Dropdown */}
        <div ref={searchRef} className="relative hidden md:block w-72 lg:w-80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Qidiruv: RTX 4060, AM5, i5..."
              aria-label="Mahsulotlarni qidirish"
              className="w-full rounded-xl border border-[#1F2A44] bg-[#121829] py-2 pl-9 pr-3 text-sm text-[#E5E7EB] placeholder-[#94A3B8] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {searchOpen && searchQuery.trim() && (
            <div className="absolute left-0 mt-2 w-96 rounded-2xl border border-[#1F2A44] bg-[#121829] p-3 shadow-2xl backdrop-blur-xl z-50 max-h-[460px] overflow-y-auto">
              {!hasSearchResults ? (
                <div className="py-6 text-center text-sm text-[#94A3B8]">
                  "{searchQuery}" boʻyicha hech narsa topilmadi.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Prebuilt PCs */}
                  {matchedPrebuilt.length > 0 && (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">
                        <span>Tayyor Kompyuterlar</span>
                        <Monitor className="h-3.5 w-3.5" />
                      </div>
                      <div className="space-y-1">
                        {matchedPrebuilt.map((pc) => (
                          <button
                            key={pc.id}
                            onClick={() => {
                              navigate(`/prebuilt/${pc.id}`);
                              setSearchOpen(false);
                            }}
                            className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-[#1F2A44] transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="h-9 w-11 shrink-0">
                                <ProductImage
                                  category="prebuilt"
                                  name={pc.name}
                                  image={pc.image}
                                  className="rounded-md"
                                />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white line-clamp-1">{pc.name}</div>
                                <div className="text-xs text-[#94A3B8]">{pc.category}</div>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-[#3B82F6] whitespace-nowrap">
                              {formatPrice(pc.price)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Laptops */}
                  {matchedLaptops.length > 0 && (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#22C55E]">
                        <span>Noutbuklar</span>
                        <LaptopIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="space-y-1">
                        {matchedLaptops.map((lap) => (
                          <button
                            key={lap.id}
                            onClick={() => {
                              navigate(`/laptops/${lap.id}`);
                              setSearchOpen(false);
                            }}
                            className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-[#1F2A44] transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="h-9 w-11 shrink-0">
                                <ProductImage
                                  category="laptop"
                                  brand={lap.brand}
                                  name={lap.name}
                                  image={lap.image}
                                  className="rounded-md"
                                />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white line-clamp-1">{lap.name}</div>
                                <div className="text-xs text-[#94A3B8]">{lap.cpu}</div>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-[#22C55E] whitespace-nowrap">
                              {formatPrice(lap.price)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Components */}
                  {matchedComponents.length > 0 && (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8B5CF6]">
                        <span>Komponentlar</span>
                        <Cpu className="h-3.5 w-3.5" />
                      </div>
                      <div className="space-y-1">
                        {matchedComponents.map((comp) => (
                          <button
                            key={comp.id}
                            onClick={() => {
                              navigate(`/builder`);
                              setSearchOpen(false);
                            }}
                            className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-[#1F2A44] transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="h-9 w-11 shrink-0">
                                <ProductImage
                                  category={comp.category}
                                  brand={comp.brand}
                                  name={comp.name}
                                  image={comp.image}
                                  className="rounded-md"
                                />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white line-clamp-1">{comp.name}</div>
                                <div className="text-xs text-[#94A3B8] uppercase">{comp.category}</div>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-[#8B5CF6] whitespace-nowrap">
                              {formatPrice(comp.price)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons: Favorites, Cart, Mobile Menu */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Favorites */}
          <Link
            to="/favorites"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#1F2A44] bg-[#121829] text-[#E5E7EB] hover:border-pink-500/50 hover:text-pink-400 transition-all"
            aria-label={`Sevimlilar (${favorites.length})`}
          >
            <Heart className={`h-5 w-5 ${favorites.length > 0 ? 'fill-pink-500 text-pink-500' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[11px] font-bold text-white shadow-sm">
                {favorites.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-xl border border-[#1F2A44] bg-[#121829] px-3 py-2 text-[#E5E7EB] hover:border-[#3B82F6]/50 hover:text-white transition-all group"
            aria-label={`Savat (${cartItemCount} ta mahsulot)`}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5 text-[#3B82F6] group-hover:scale-105 transition-transform" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#3B82F6] text-[10px] font-bold text-white shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-[#94A3B8] group-hover:text-white">
              Savat
            </span>
          </Link>

          {/* Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1F2A44] bg-[#121829] text-[#E5E7EB] lg:hidden hover:border-[#3B82F6] transition-colors"
            aria-label="Menyuni ochish"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#1F2A44] bg-[#0B0F1A] px-4 pt-4 pb-6 space-y-4">
          {/* Mobile search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mahsulotlarni qidirish..."
              className="w-full rounded-xl border border-[#1F2A44] bg-[#121829] py-2.5 pl-9 pr-3 text-sm text-[#E5E7EB] placeholder-[#94A3B8] focus:border-[#3B82F6] focus:outline-none"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <Link
              to="/builder"
              className="flex items-center justify-between rounded-xl p-3 text-sm font-medium text-white hover:bg-[#121829]"
            >
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-[#3B82F6]" />
                <span>PC Builder (Kompyuter yigʻish)</span>
              </div>
              <ArrowRight className="h-4 w-4 text-[#94A3B8]" />
            </Link>
            <Link
              to="/prebuilt"
              className="flex items-center justify-between rounded-xl p-3 text-sm font-medium text-white hover:bg-[#121829]"
            >
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-[#8B5CF6]" />
                <span>Tayyor Kompyuterlar</span>
              </div>
              <ArrowRight className="h-4 w-4 text-[#94A3B8]" />
            </Link>
            <Link
              to="/laptops"
              className="flex items-center justify-between rounded-xl p-3 text-sm font-medium text-white hover:bg-[#121829]"
            >
              <div className="flex items-center gap-3">
                <LaptopIcon className="h-5 w-5 text-[#22C55E]" />
                <span>Noutbuklar katalogi</span>
              </div>
              <ArrowRight className="h-4 w-4 text-[#94A3B8]" />
            </Link>
            <Link
              to="/compare"
              className="flex items-center justify-between rounded-xl p-3 text-sm font-medium text-white hover:bg-[#121829]"
            >
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="h-5 w-5 text-[#F59E0B]" />
                <span>Noutbuklarni taqqoslash</span>
              </div>
              {compareLaptops.length > 0 && (
                <span className="rounded-full bg-[#F59E0B] px-2 py-0.5 text-xs font-bold text-black">
                  {compareLaptops.length} ta
                </span>
              )}
            </Link>
            <Link
              to="/favorites"
              className="flex items-center justify-between rounded-xl p-3 text-sm font-medium text-white hover:bg-[#121829]"
            >
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-pink-500" />
                <span>Sevimlilar roʻyxati</span>
              </div>
              <span className="text-xs text-[#94A3B8]">{favorites.length} ta</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
