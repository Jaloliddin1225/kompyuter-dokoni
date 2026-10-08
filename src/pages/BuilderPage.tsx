import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Share2,
  Trash2,
  Bot,
  ShoppingCart,
  Zap,
  Info,
  ChevronRight,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { ProductImage } from '../components/ProductImage';
import { useStore } from '../store';
import {
  Category,
  Component,
  CPU,
  Motherboard,
  RAM,
  GPU,
  Storage,
  PCCase,
  PSU,
  Cooler,
} from '../types';
import {
  cpus,
  motherboards,
  rams,
  gpus,
  storages,
  cases,
  psus,
  coolers,
  componentsById,
} from '../data/components';
import {
  checkCompatibility,
  checkSingleComponentCompatibility,
} from '../lib/compatibility';
import { formatPrice } from '../lib/format';

interface Step {
  id: Category;
  label: string;
  icon: typeof Cpu;
}

const STEPS: Step[] = [
  { id: 'cpu', label: 'Protsessor', icon: Cpu },
  { id: 'motherboard', label: 'Anakart', icon: Layers },
  { id: 'ram', label: 'Operativ xotira (RAM)', icon: Zap },
  { id: 'gpu', label: 'Videokarta', icon: Zap },
  { id: 'storage', label: 'Doimiy xotira (SSD/HDD)', icon: Zap },
  { id: 'case', label: 'Korpus', icon: Zap },
  { id: 'psu', label: 'Quvvat bloki (PSU)', icon: Zap },
  { id: 'cooler', label: 'Sovutgich', icon: Zap },
];

export function BuilderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    builderSelection,
    selectComponent,
    removeComponent,
    clearBuilder,
    loadBuild,
    addToCart,
    includeAssembly,
    setIncludeAssembly,
  } = useStore();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const currentCategory = STEPS[currentStepIndex].id;

  // Filter & Sort states
  const [onlyCompatible, setOnlyCompatible] = useState<boolean>(true);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'asc' | 'desc'>('default');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(10000000);

  // Category specific filters
  const [filterSocket, setFilterSocket] = useState<string>('all');
  const [filterRamType, setFilterRamType] = useState<string>('all');

  // Confirmation modal for conflict replacement
  const [conflictModalData, setConflictModalData] = useState<{
    newComponent: Component;
    conflicts: { category: Category; name: string }[];
  } | null>(null);

  // AI analysis state
  const [aiAnalysisModalOpen, setAiAnalysisModalOpen] = useState(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    advice?: string;
    analysis?: string;
  } | null>(null);

  // Share alert state
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Load build from URL ?build=id1,id2,id3... on mount
  useEffect(() => {
    const buildParam = searchParams.get('build');
    if (buildParam) {
      const ids = buildParam.split(',').filter(Boolean);
      const newSelection: Partial<Record<Category, Component>> = {};
      ids.forEach((id) => {
        const item = componentsById[id];
        if (item) newSelection[item.category] = item;
      });
      if (Object.keys(newSelection).length > 0) {
        loadBuild(newSelection);
      }
    }
  }, []);

  // Sync selection to URL query string
  useEffect(() => {
    const selectedIds = Object.values(builderSelection)
      .map((item) => item?.id)
      .filter(Boolean) as string[];

    if (selectedIds.length > 0) {
      setSearchParams({ build: selectedIds.join(',') }, { replace: true });
    } else if (searchParams.has('build')) {
      setSearchParams({}, { replace: true });
    }
  }, [builderSelection]);

  // Overall compatibility check of current selection
  const compatibility = useMemo(() => {
    return checkCompatibility(builderSelection);
  }, [builderSelection]);

  // Total price calculation
  const subtotalPrice = useMemo(() => {
    return Object.values(builderSelection).reduce(
      (sum, item) => sum + (item ? item.price : 0),
      0
    );
  }, [builderSelection]);

  const assemblyFee = includeAssembly ? 250000 : 0;
  const totalPrice = subtotalPrice + assemblyFee;

  // Selected components count (out of 8)
  const selectedCount = Object.keys(builderSelection).length;
  const isAllSelected = selectedCount === 8;
  const canAddToCart = isAllSelected && compatibility.errors.length === 0;

  // Get raw list for current category
  const rawCategoryItems: Component[] = useMemo(() => {
    switch (currentCategory) {
      case 'cpu':
        return cpus;
      case 'motherboard':
        return motherboards;
      case 'ram':
        return rams;
      case 'gpu':
        return gpus;
      case 'storage':
        return storages;
      case 'case':
        return cases;
      case 'psu':
        return psus;
      case 'cooler':
        return coolers;
      default:
        return [];
    }
  }, [currentCategory]);

  // Brands list for filtering
  const availableBrands = useMemo(() => {
    const set = new Set(rawCategoryItems.map((c) => c.brand));
    return ['all', ...Array.from(set)];
  }, [rawCategoryItems]);

  // Evaluate all raw category items for compatibility
  const evaluatedItems = useMemo(() => {
    return rawCategoryItems.map((item) => {
      const selectionWithoutCategory = { ...builderSelection };
      delete selectionWithoutCategory[currentCategory];

      const compResult = checkSingleComponentCompatibility(
        item,
        selectionWithoutCategory
      );

      return {
        item,
        isCompatible: compResult.compatible,
        incompatibilityReason: compResult.reason,
      };
    });
  }, [rawCategoryItems, builderSelection, currentCategory]);

  const incompatibleCount = useMemo(() => {
    return evaluatedItems.filter((i) => !i.isCompatible).length;
  }, [evaluatedItems]);

  // Filtered & sorted items
  const processedItems = useMemo(() => {
    return evaluatedItems
      .filter(({ item, isCompatible }) => {
        if (onlyCompatible && !isCompatible) return false;
        if (selectedBrand !== 'all' && item.brand !== selectedBrand) return false;
        if (item.price > maxPriceFilter) return false;

        // Specific category filters
        if (currentCategory === 'cpu' && filterSocket !== 'all') {
          if ((item as CPU).socket !== filterSocket) return false;
        }
        if (currentCategory === 'motherboard' && filterSocket !== 'all') {
          if ((item as Motherboard).socket !== filterSocket) return false;
        }
        if (currentCategory === 'ram' && filterRamType !== 'all') {
          if ((item as RAM).type !== filterRamType) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'asc') return a.item.price - b.item.price;
        if (sortBy === 'desc') return b.item.price - a.item.price;
        return 0;
      });
  }, [
    evaluatedItems,
    onlyCompatible,
    selectedBrand,
    maxPriceFilter,
    filterSocket,
    filterRamType,
    sortBy,
  ]);

  // Handle component selection attempt
  const handleAttemptSelect = (component: Component) => {
    const res = selectComponent(component);
    if (!res.success && res.conflicts) {
      setConflictModalData({
        newComponent: component,
        conflicts: res.conflicts,
      });
    } else {
      // Auto move to next unselected step
      const nextIndex = STEPS.findIndex(
        (s, idx) => idx > currentStepIndex && !builderSelection[s.id]
      );
      if (nextIndex !== -1) {
        setCurrentStepIndex(nextIndex);
      }
    }
  };

  // Confirm replacement modal
  const handleConfirmConflictReplacement = () => {
    if (!conflictModalData) return;
    const { newComponent, conflicts } = conflictModalData;

    // Remove conflicting components
    conflicts.forEach((c) => removeComponent(c.category));

    // Force add new component
    selectComponent(newComponent);
    setConflictModalData(null);
  };

  // Share build link
  const handleShareBuild = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2500);
  };

  // Add whole build to cart
  const handleAddBuildToCart = () => {
    if (!canAddToCart) return;

    addToCart({
      id: `custom-build-${Date.now()}`,
      type: 'custom-build',
      name: `PCForge Maxsus Yigʻma (${(builderSelection.cpu as CPU)?.name.split(' ')[2] || ''} + ${(builderSelection.gpu as GPU)?.chip || 'iGPU'})`,
      price: totalPrice,
      quantity: 1,
      image: builderSelection.case?.image || '',
      stock: 5,
      details: {
        components: builderSelection,
        assemblyService: includeAssembly,
      },
    });

    navigate('/cart');
  };

  // AI analysis request
  const handleAnalyzeWithAI = async () => {
    const selectedIds = Object.values(builderSelection)
      .map((i) => i?.id)
      .filter(Boolean);

    if (selectedIds.length === 0) return;

    setAiAnalysisLoading(true);
    setAiAnalysisModalOpen(true);
    setAiAnalysisResult(null);

    try {
      const res = await fetch('/api/analyze-build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentIds: selectedIds }),
      });
      const data = await res.json();
      setAiAnalysisResult(data);
    } catch (err) {
      console.error(err);
      setAiAnalysisResult({
        summary: 'Tahlil qilishda xatolik yuz berdi.',
        advice: 'Iltimos internet aloqasini tekshirib qayta urinib koʻring.',
      });
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  // Render spec pills for a component
  const renderItemSpecs = (item: Component) => {
    switch (item.category) {
      case 'cpu': {
        const c = item as CPU;
        return (
          <div className="flex flex-wrap gap-1.5 text-xs text-[#94A3B8]">
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md font-mono text-[#3B82F6]">{c.socket}</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">{c.cores}C/{c.threads}T</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">{c.boostClockGHz} GHz</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">{c.tdp}W TDP</span>
            {c.hasIntegratedGraphics && (
              <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md">iGPU</span>
            )}
          </div>
        );
      }
      case 'motherboard': {
        const m = item as Motherboard;
        return (
          <div className="flex flex-wrap gap-1.5 text-xs text-[#94A3B8]">
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md font-mono text-[#3B82F6]">{m.socket}</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">{m.chipset}</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">{m.ramType}</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">{m.formFactor}</span>
            {m.wifi && <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md">Wi-Fi</span>}
          </div>
        );
      }
      case 'ram': {
        const r = item as RAM;
        return (
          <div className="flex flex-wrap gap-1.5 text-xs text-[#94A3B8]">
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md font-mono text-[#3B82F6]">{r.type}</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">{r.capacityGB} GB</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">{r.modules} modul</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">{r.speedMHz} MHz</span>
          </div>
        );
      }
      case 'gpu': {
        const g = item as GPU;
        return (
          <div className="flex flex-wrap gap-1.5 text-xs text-[#94A3B8]">
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md font-semibold text-emerald-400">{g.chip}</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">{g.vramGB} GB VRAM</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">{g.lengthMm} mm</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">{g.tdp}W</span>
          </div>
        );
      }
      case 'storage': {
        const s = item as Storage;
        return (
          <div className="flex flex-wrap gap-1.5 text-xs text-[#94A3B8]">
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md font-mono text-[#8B5CF6]">{s.type}</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">{s.capacityGB >= 1000 ? `${s.capacityGB / 1000} TB` : `${s.capacityGB} GB`}</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">{s.readSpeedMBs} MB/s</span>
          </div>
        );
      }
      case 'case': {
        const c = item as PCCase;
        return (
          <div className="flex flex-wrap gap-1.5 text-xs text-[#94A3B8]">
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md text-[#3B82F6]">{c.formFactorSupport.join(', ')}</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">Maks GPU: {c.maxGpuLengthMm} mm</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">{c.includedFans} ta fan</span>
          </div>
        );
      }
      case 'psu': {
        const p = item as PSU;
        return (
          <div className="flex flex-wrap gap-1.5 text-xs text-[#94A3B8]">
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md font-bold text-amber-400">{p.wattage}W</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">{p.efficiency}</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">Modul: {p.modular}</span>
          </div>
        );
      }
      case 'cooler': {
        const cl = item as Cooler;
        return (
          <div className="flex flex-wrap gap-1.5 text-xs text-[#94A3B8]">
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md text-[#3B82F6]">{cl.type}</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">{cl.heightMm} mm</span>
            <span className="bg-[#1F2A44] px-2 py-0.5 rounded-md">Maks {cl.maxTdp}W TDP</span>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-16 pt-6">
      <SEO
        title="PC Builder - O'z kompyuteringizni moslik tekshiruvi bilan yig'ing"
        description="Kompyuter konstruktori: protsessor, anakart, videokarta, RAM va sovutgichni tanlang. Avtomatik apparat moslik nazorati."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              PC Builder Konstruktori
              <span className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-[#3B82F6]">
                Moslik nazorati faol
              </span>
            </h1>
            <p className="mt-1 text-sm text-[#94A3B8]">
              Orzuingizdagi kompyuterni bosqichma-bosqich yigʻing. Tizim xatoliklarni avtomatik tekshiradi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareBuild}
              className="flex items-center gap-1.5 rounded-xl border border-[#1F2A44] bg-[#121829] px-3.5 py-2 text-xs font-medium text-[#E5E7EB] hover:border-[#3B82F6] hover:text-white transition-colors"
            >
              <Share2 className="h-4 w-4 text-[#3B82F6]" />
              {copiedShareLink ? 'Havola nusxalandi!' : 'Yigʻmani ulashish'}
            </button>
            <button
              onClick={clearBuilder}
              disabled={selectedCount === 0}
              className="flex items-center gap-1.5 rounded-xl border border-[#1F2A44] bg-[#121829] px-3.5 py-2 text-xs font-medium text-red-400 hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-40 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Tozalash
            </button>
          </div>
        </div>

        {/* 8-Step Progress Bar Navigation */}
        <div className="mb-8 rounded-2xl border border-[#1F2A44] bg-[#121829] p-3 shadow-md">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {STEPS.map((step, idx) => {
              const isSelected = !!builderSelection[step.id];
              const isCurrent = idx === currentStepIndex;

              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center transition-all ${
                    isCurrent
                      ? 'bg-[#1F2A44] border-2 border-[#3B82F6] text-white shadow-md'
                      : isSelected
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-[#0B0F1A]/60 border border-[#1F2A44] text-[#94A3B8] hover:text-white hover:bg-[#1F2A44]/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                    <span>{idx + 1}.</span>
                    {isSelected ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <step.icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium truncate max-w-full">
                    {step.label}
                  </span>
                  {isSelected && (
                    <span className="mt-1 text-[9px] text-[#94A3B8] truncate max-w-full">
                      {builderSelection[step.id]?.name.split(' ')[0]}...
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Two-Column Layout: Left (2/3) Catalog & Filters, Right (1/3) Sticky Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Component Picker */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter Bar & Controls */}
            <div className="rounded-2xl border border-[#1F2A44] bg-[#121829] p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F2A44] pb-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#3B82F6]" />
                  <span className="text-sm font-semibold text-white">
                    {STEPS[currentStepIndex].label} tanlovi ({processedItems.length} ta mavjud)
                  </span>
                </div>

                {/* Compatibility toggle switch */}
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#E5E7EB]">
                  <input
                    type="checkbox"
                    checked={onlyCompatible}
                    onChange={(e) => setOnlyCompatible(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-9 h-5 bg-[#1F2A44] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3B82F6]"></div>
                  <span className="font-medium">Faqat mosini koʻrsat</span>
                </label>
              </div>

              {/* Filter controls row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* Brand select */}
                <div>
                  <label className="text-[11px] text-[#94A3B8] block mb-1">Brend</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full rounded-xl border border-[#1F2A44] bg-[#0B0F1A] px-2.5 py-1.5 text-[#E5E7EB] focus:border-[#3B82F6] focus:outline-none"
                  >
                    {availableBrands.map((b) => (
                      <option key={b} value={b}>
                        {b === 'all' ? 'Barcha brendlar' : b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort select */}
                <div>
                  <label className="text-[11px] text-[#94A3B8] block mb-1">Saralash</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full rounded-xl border border-[#1F2A44] bg-[#0B0F1A] px-2.5 py-1.5 text-[#E5E7EB] focus:border-[#3B82F6] focus:outline-none"
                  >
                    <option value="default">Mashhurligi boʻyicha</option>
                    <option value="asc">Arzondan qimmatga</option>
                    <option value="desc">Qimmatdan arzonga</option>
                  </select>
                </div>

                {/* Category specific filter (Socket or RAM type) */}
                {(currentCategory === 'cpu' || currentCategory === 'motherboard') && (
                  <div>
                    <label className="text-[11px] text-[#94A3B8] block mb-1">Soket</label>
                    <select
                      value={filterSocket}
                      onChange={(e) => setFilterSocket(e.target.value)}
                      className="w-full rounded-xl border border-[#1F2A44] bg-[#0B0F1A] px-2.5 py-1.5 text-[#E5E7EB] focus:border-[#3B82F6] focus:outline-none"
                    >
                      <option value="all">Barcha soketlar</option>
                      <option value="AM5">AM5 (AMD)</option>
                      <option value="AM4">AM4 (AMD)</option>
                      <option value="LGA1700">LGA1700 (Intel)</option>
                    </select>
                  </div>
                )}

                {currentCategory === 'ram' && (
                  <div>
                    <label className="text-[11px] text-[#94A3B8] block mb-1">Xotira turi</label>
                    <select
                      value={filterRamType}
                      onChange={(e) => setFilterRamType(e.target.value)}
                      className="w-full rounded-xl border border-[#1F2A44] bg-[#0B0F1A] px-2.5 py-1.5 text-[#E5E7EB] focus:border-[#3B82F6] focus:outline-none"
                    >
                      <option value="all">Barchasi</option>
                      <option value="DDR4">DDR4</option>
                      <option value="DDR5">DDR5</option>
                    </select>
                  </div>
                )}

                {/* Max price slider */}
                <div className="col-span-2 sm:col-span-1">
                  <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
                    <span>Maks narx:</span>
                    <span className="text-white font-medium">{formatPrice(maxPriceFilter)}</span>
                  </div>
                  <input
                    type="range"
                    min={500000}
                    max={10000000}
                    step={250000}
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Notice banner when incompatible items are hidden */}
            {incompatibleCount > 0 && onlyCompatible && (
              <div className="flex items-center justify-between rounded-2xl bg-amber-500/10 border border-amber-500/25 px-4 py-3 text-xs text-amber-300">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>
                    Tanlovingizga mos kelmaydigan <strong>{incompatibleCount} ta</strong> qism yashirildi.
                  </span>
                </div>
                <button
                  onClick={() => setOnlyCompatible(false)}
                  className="font-bold text-[#3B82F6] hover:underline whitespace-nowrap ml-3"
                >
                  Barchasini koʻrish
                </button>
              </div>
            )}

            {/* List of Component Cards */}
            <div className="space-y-3">
              {processedItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#1F2A44] bg-[#121829]/50 p-8 text-center">
                  <p className="text-sm text-[#94A3B8]">
                    Ushbu filtrlarga mos yoki avval tanlangan qismlarga toʻgʻri keladigan komponent topilmadi.
                  </p>
                  <button
                    onClick={() => {
                      setOnlyCompatible(false);
                      setSelectedBrand('all');
                      setMaxPriceFilter(10000000);
                      setFilterSocket('all');
                      setFilterRamType('all');
                    }}
                    className="mt-3 rounded-xl bg-[#1F2A44] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-colors"
                  >
                    Filtrlarni tozalash
                  </button>
                </div>
              ) : (
                processedItems.map(({ item, isCompatible, incompatibilityReason }) => {
                  const isCurrentlySelected = builderSelection[currentCategory]?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border p-4 transition-all ${
                        isCurrentlySelected
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                          : !isCompatible
                          ? 'border-red-500/30 bg-red-950/15 opacity-70'
                          : 'border-[#1F2A44] bg-[#121829] hover:border-[#3B82F6]/60 hover:shadow-md'
                      }`}
                    >
                      {/* Left: Image & Info */}
                      <div className="flex items-start gap-3 sm:gap-4 flex-1">
                        <div className="h-16 w-20 sm:h-20 sm:w-24 shrink-0">
                          <ProductImage
                            category={item.category}
                            brand={item.brand}
                            name={item.name}
                            image={item.image}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase text-[#3B82F6]">{item.brand}</span>
                            {!isCompatible && (
                              <span className="text-[10px] font-bold text-red-400 bg-red-500/20 border border-red-500/30 px-2 py-0.5 rounded-full">
                                Mos kelmaydi
                              </span>
                            )}
                            {item.stock === 0 && (
                              <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                                Omborda yoʻq
                              </span>
                            )}
                          </div>
                          <h3 className="text-xs sm:text-sm font-semibold text-white leading-snug">{item.name}</h3>
                          {renderItemSpecs(item)}

                          {/* Incompatibility Warning Message */}
                          {!isCompatible && incompatibilityReason && (
                            <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/25 px-2.5 py-1 text-xs text-red-400 font-medium">
                              <XCircle className="h-3.5 w-3.5 shrink-0" />
                              <span className="break-words">Bloklangan: {incompatibilityReason}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Price & Select Action */}
                      <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center sm:flex-col sm:items-end justify-between w-full sm:w-auto gap-3">
                        <div className="font-display text-sm sm:text-base font-bold text-white whitespace-nowrap">
                          {formatPrice(item.price)}
                        </div>

                        {isCurrentlySelected ? (
                          <button
                            onClick={() => removeComponent(currentCategory)}
                            className="flex items-center gap-1.5 rounded-xl border border-emerald-500 bg-emerald-500 px-3.5 py-2 text-xs font-bold text-black hover:bg-emerald-400 active:scale-95 transition-all"
                          >
                            <Check className="h-4 w-4" />
                            Tanlangan
                          </button>
                        ) : !isCompatible ? (
                          <button
                            onClick={() => handleAttemptSelect(item)}
                            className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/15 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/25 active:scale-95 transition-all cursor-pointer"
                            title={incompatibilityReason}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Bloklangan
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAttemptSelect(item)}
                            disabled={item.stock === 0}
                            className="rounded-xl bg-[#3B82F6] px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            {item.stock === 0 ? "Omborda yo'q" : 'Tanlash'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Sticky Summary Panel */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-[#1F2A44] bg-[#121829] p-5 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-[#1F2A44] pb-3">
                <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#3B82F6]" />
                  Sizning yigʻmangiz
                </h2>
                <span className="text-xs font-semibold text-[#94A3B8]">
                  {selectedCount} / 8 qism
                </span>
              </div>

              {/* Power usage meter */}
              <div className="rounded-xl border border-[#1F2A44] bg-[#0B0F1A] p-3.5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#94A3B8] flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    Quvvat hisobi:
                  </span>
                  <span className="font-bold text-white">
                    {compatibility.estimatedPower}W / {compatibility.recommendedPsu}W tavsiya
                  </span>
                </div>
                {/* Progress meter */}
                <div className="h-2 w-full rounded-full bg-[#1F2A44] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      compatibility.estimatedPower > 700
                        ? 'bg-red-500'
                        : compatibility.estimatedPower > 450
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (compatibility.estimatedPower / (compatibility.recommendedPsu || 600)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Selected items breakdown */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {STEPS.map((s) => {
                  const item = builderSelection[s.id];
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl bg-[#0B0F1A]/70 p-2 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate max-w-[170px]">
                        {item ? (
                          <div className="h-7 w-9 shrink-0">
                            <ProductImage
                              category={item.category}
                              brand={item.brand}
                              name={item.name}
                              image={item.image}
                              className="rounded-md"
                            />
                          </div>
                        ) : (
                          <div className="h-7 w-7 rounded-md bg-[#1F2A44] flex items-center justify-center text-[#94A3B8]">
                            <s.icon className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <div className="truncate">
                          <div className="text-[10px] uppercase font-semibold text-[#3B82F6]">{s.label}</div>
                          <div className="text-white truncate font-medium">
                            {item ? item.name : "Tanlanmagan"}
                          </div>
                        </div>
                      </div>

                      {item ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white whitespace-nowrap">
                            {formatPrice(item.price)}
                          </span>
                          <button
                            onClick={() => removeComponent(s.id)}
                            className="text-[#94A3B8] hover:text-red-400 transition-colors"
                            title="Oʻchirish"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const idx = STEPS.findIndex((step) => step.id === s.id);
                            setCurrentStepIndex(idx);
                          }}
                          className="text-[#3B82F6] font-semibold hover:underline"
                        >
                          Tanlash
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Compatibility Status Block */}
              <div className="rounded-xl border border-[#1F2A44] bg-[#0B0F1A] p-3 space-y-2">
                {compatibility.errors.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Hammasi mos! Xatoliklar yoʻq.</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold">
                      <XCircle className="h-4 w-4 shrink-0" />
                      <span>{compatibility.errors.length} ta moslik xatosi:</span>
                    </div>
                    {compatibility.errors.map((err, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          const idx = STEPS.findIndex((s) => s.id === err.between[0]);
                          if (idx !== -1) setCurrentStepIndex(idx);
                        }}
                        className="cursor-pointer text-[11px] text-red-300 bg-red-950/40 p-1.5 rounded-lg hover:bg-red-900/40 transition-colors"
                      >
                        • {err.message}
                      </div>
                    ))}
                  </div>
                )}

                {compatibility.warnings.length > 0 && (
                  <div className="pt-2 border-t border-[#1F2A44]/60 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>Ogohlantirishlar ({compatibility.warnings.length}):</span>
                    </div>
                    {compatibility.warnings.map((warn, i) => (
                      <div key={i} className="text-[11px] text-amber-300/90 leading-tight">
                        • {warn.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assembly Service Checkbox */}
              <label className="flex items-center gap-2 text-xs text-[#E5E7EB] cursor-pointer bg-[#0B0F1A] p-2.5 rounded-xl border border-[#1F2A44]">
                <input
                  type="checkbox"
                  checked={includeAssembly}
                  onChange={(e) => setIncludeAssembly(e.target.checked)}
                  className="rounded border-[#1F2A44] text-[#3B82F6] focus:ring-0 accent-blue-600"
                />
                <span className="flex-1">Professional yigʻib berish xizmati</span>
                <span className="font-semibold text-emerald-400">+250 000 soʻm</span>
              </label>

              {/* Total Price display */}
              <div className="border-t border-[#1F2A44] pt-3">
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-xs text-[#94A3B8]">Jami narx:</span>
                  <span className="font-display text-2xl font-black text-white">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleAddBuildToCart}
                    disabled={!canAddToCart}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {!isAllSelected
                      ? `Yana ${8 - selectedCount} ta qism tanlang`
                      : compatibility.errors.length > 0
                      ? 'Xatoliklarni bartaraf eting'
                      : 'Savatga qoʻshish'}
                  </button>

                  <button
                    onClick={handleAnalyzeWithAI}
                    disabled={selectedCount === 0}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/10 py-2.5 text-xs font-bold text-purple-300 hover:bg-purple-500/20 disabled:opacity-40 transition-colors"
                  >
                    <Bot className="h-4 w-4 text-purple-400" />
                    AI dan tekshirtirish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar (opens drawer when tapped) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[#1F2A44] bg-[#0B0F1A]/95 p-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="flex items-center gap-2 text-left"
          >
            <div>
              <div className="text-[11px] text-[#94A3B8]">{selectedCount}/8 qism tanlandi</div>
              <div className="font-display text-base font-bold text-white">
                {formatPrice(totalPrice)}
              </div>
            </div>
            <ChevronUp className="h-5 w-5 text-[#3B82F6]" />
          </button>

          <button
            onClick={handleAddBuildToCart}
            disabled={!canAddToCart}
            className="rounded-xl bg-[#3B82F6] px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-600 disabled:opacity-40"
          >
            Savatga ({selectedCount}/8)
          </button>
        </div>
      </div>

      {/* Mobile Bottom Sheet Drawer */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm">
          <div className="max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-[#1F2A44] bg-[#121829] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2A44] pb-3">
              <h3 className="font-display text-base font-bold text-white">Yigʻma tafsiloti</h3>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="rounded-lg p-1.5 text-[#94A3B8] hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {STEPS.map((s) => {
                const item = builderSelection[s.id];
                return (
                  <div key={s.id} className="flex justify-between items-center text-xs bg-[#0B0F1A] p-2 rounded-xl">
                    <span className="text-[#94A3B8]">{s.label}:</span>
                    <span className="text-white font-medium truncate max-w-[180px]">
                      {item ? item.name : 'Tanlanmagan'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Status */}
            <div className="rounded-xl bg-[#0B0F1A] p-3 text-xs">
              {compatibility.errors.length === 0 ? (
                <div className="text-emerald-400 font-semibold">✓ Barcha qismlar mos</div>
              ) : (
                <div className="text-red-400">
                  Moslik xatosi: {compatibility.errors.map((e) => e.message).join(' ')}
                </div>
              )}
            </div>

            <button
              onClick={handleAddBuildToCart}
              disabled={!canAddToCart}
              className="w-full rounded-xl bg-[#3B82F6] py-3 text-sm font-bold text-white"
            >
              Savatga qoʻshish ({formatPrice(totalPrice)})
            </button>
          </div>
        </div>
      )}

      {/* Conflict Replacement Confirmation Modal */}
      {conflictModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/40 bg-[#121829] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="font-display text-base font-bold text-white">
                Moslik ziddiyati aniqlandi
              </h3>
            </div>
            <p className="text-xs text-[#E5E7EB] leading-relaxed">
              <strong>"{conflictModalData.newComponent.name}"</strong> ni tanlash quyidagi avval tanlangan qismlar bilan mos kelmay qoladi va ularni bekor qiladi:
            </p>
            <div className="rounded-xl bg-[#0B0F1A] p-3 space-y-1 text-xs text-red-300">
              {conflictModalData.conflicts.map((c, i) => (
                <div key={i}>• {c.category.toUpperCase()}: {c.name}</div>
              ))}
            </div>
            <p className="text-xs text-[#94A3B8]">
              Davom etsangiz, ushbu qismlar oʻchirilib, yangisi oʻrnatiladi. Davom etasizmi?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConflictModalData(null)}
                className="flex-1 rounded-xl border border-[#1F2A44] bg-[#1F2A44] py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmConflictReplacement}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
              >
                Almashtirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {aiAnalysisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-purple-500/40 bg-[#121829] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1F2A44] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-white">
                  Gemini AI Yigʻma Ekspertizasi
                </h3>
              </div>
              <button
                onClick={() => setAiAnalysisModalOpen(false)}
                className="rounded-lg p-1 text-[#94A3B8] hover:text-white"
              >
                ✕
              </button>
            </div>

            {aiAnalysisLoading ? (
              <div className="py-12 text-center space-y-3">
                <Bot className="h-10 w-10 text-purple-400 mx-auto animate-bounce" />
                <p className="text-sm text-white font-medium">Yigʻma sinchkovlik bilan tahlil qilinmoqda...</p>
                <p className="text-xs text-[#94A3B8]">Bottleneck, quvvat va komponentlar muvozanati baholanmoqda.</p>
              </div>
            ) : aiAnalysisResult ? (
              <div className="space-y-4 text-xs leading-relaxed text-[#E5E7EB]">
                {aiAnalysisResult.analysis ? (
                  <div className="whitespace-pre-wrap rounded-xl bg-[#0B0F1A] p-4 text-sm leading-relaxed border border-[#1F2A44]">
                    {aiAnalysisResult.analysis}
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-3 text-purple-200">
                      <strong>Xulosa:</strong> {aiAnalysisResult.summary}
                    </div>

                    {aiAnalysisResult.strengths && (
                      <div>
                        <h4 className="font-semibold text-emerald-400 mb-1">Kuchli tomonlari:</h4>
                        <ul className="list-disc list-inside space-y-0.5 text-[#94A3B8]">
                          {aiAnalysisResult.strengths.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiAnalysisResult.weaknesses && aiAnalysisResult.weaknesses.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-amber-400 mb-1">Eʼtibor berish lozim:</h4>
                        <ul className="list-disc list-inside space-y-0.5 text-[#94A3B8]">
                          {aiAnalysisResult.weaknesses.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiAnalysisResult.advice && (
                      <div className="rounded-xl bg-[#0B0F1A] p-3 text-[#94A3B8]">
                        <strong>Tavsiya:</strong> {aiAnalysisResult.advice}
                      </div>
                    )}
                  </>
                )}
                <button
                  onClick={() => setAiAnalysisModalOpen(false)}
                  className="w-full rounded-xl bg-[#3B82F6] py-2.5 text-xs font-bold text-white hover:bg-blue-600 transition-colors"
                >
                  Tushundim
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
