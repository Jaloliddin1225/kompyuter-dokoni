export type Category =
  | 'cpu'
  | 'motherboard'
  | 'ram'
  | 'gpu'
  | 'storage'
  | 'case'
  | 'psu'
  | 'cooler';

export interface BaseComponent {
  id: string;
  category: Category;
  brand: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

export interface CPU extends BaseComponent {
  category: 'cpu';
  socket: 'AM4' | 'AM5' | 'LGA1700' | 'LGA1851';
  cores: number;
  threads: number;
  baseClockGHz: number;
  boostClockGHz: number;
  tdp: number;
  hasIntegratedGraphics: boolean;
  includedCooler: boolean;
}

export interface Motherboard extends BaseComponent {
  category: 'motherboard';
  socket: CPU['socket'];
  chipset: string;
  ramType: 'DDR4' | 'DDR5';
  ramSlots: number;
  maxRamGB: number;
  formFactor: 'ATX' | 'mATX' | 'ITX';
  m2Slots: number;
  sataPorts: number;
  pcieGen: 3 | 4 | 5;
  wifi: boolean;
}

export interface RAM extends BaseComponent {
  category: 'ram';
  type: 'DDR4' | 'DDR5';
  capacityGB: number;
  modules: number;
  speedMHz: number;
}

export interface GPU extends BaseComponent {
  category: 'gpu';
  chip: string;
  vramGB: number;
  tdp: number;
  lengthMm: number;
  powerConnectors: string;
  recommendedPsuW: number;
}

export interface Storage extends BaseComponent {
  category: 'storage';
  type: 'NVMe' | 'SATA SSD' | 'HDD';
  capacityGB: number;
  readSpeedMBs: number;
}

export interface PCCase extends BaseComponent {
  category: 'case';
  formFactorSupport: Array<'ATX' | 'mATX' | 'ITX'>;
  maxGpuLengthMm: number;
  maxCoolerHeightMm: number;
  maxPsuLengthMm: number;
  color: string;
  hasGlassPanel: boolean;
  includedFans: number;
}

export interface PSU extends BaseComponent {
  category: 'psu';
  wattage: number;
  efficiency: '80+ White' | '80+ Bronze' | '80+ Gold' | '80+ Platinum';
  modular: 'Yo\'q' | 'Yarim' | 'To\'liq';
  lengthMm: number;
}

export interface Cooler extends BaseComponent {
  category: 'cooler';
  type: 'Havo' | 'Suyuq';
  supportedSockets: Array<CPU['socket']>;
  heightMm: number;
  maxTdp: number;
}

export type Component =
  | CPU
  | Motherboard
  | RAM
  | GPU
  | Storage
  | PCCase
  | PSU
  | Cooler;

export interface PrebuiltPC {
  id: string;
  name: string;
  category: 'Ofis' | 'O\'yin' | 'Dizayn va montaj' | 'Boshlang\'ich';
  description: string;
  componentIds: string[];
  price: number;
  stock: number;
  image?: string;
  benchmarks: { game: string; fps1080p: number }[];
  warrantyMonths: number;
}

export interface Laptop {
  id: string;
  brand: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  purpose: 'O\'qish' | 'Ish' | 'O\'yin' | 'Dizayn';
  cpu: string;
  ramGB: number;
  storageGB: number;
  gpu: string;
  screenInches: number;
  resolution: string;
  refreshRateHz: number;
  batteryHours: number;
  weightKg: number;
  os: string;
  warrantyMonths: number;
}

export interface CartItem {
  id: string; // unique item id (can be prebuilt id, laptop id, or 'custom-build-' + id)
  type: 'prebuilt' | 'laptop' | 'custom-build' | 'component';
  name: string;
  price: number;
  quantity: number;
  image?: string;
  stock: number;
  details?: {
    components?: Partial<Record<Category, Component>>;
    assemblyService?: boolean;
    subtitle?: string;
  };
}

export interface OrderCustomer {
  fullName: string;
  phone: string;
  region: string;
  city: string;
  address: string;
  notes?: string;
  deliveryMethod: 'delivery' | 'pickup';
  paymentMethod: 'cash' | 'click' | 'payme';
}

export interface Order {
  id: string; // PF-2026-XXXXX
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  assemblyFee: number;
  total: number;
  status: 'Qabul qilindi' | 'Yetkazilmoqda' | 'Tugatildi';
  createdAt: string;
}
