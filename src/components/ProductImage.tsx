import React, { useState } from 'react';

export type ProductCategory =
  | 'cpu'
  | 'motherboard'
  | 'ram'
  | 'gpu'
  | 'storage'
  | 'case'
  | 'psu'
  | 'cooler'
  | 'laptop'
  | 'prebuilt';

interface ProductImageProps {
  category?: ProductCategory | string;
  brand?: string;
  name?: string;
  image?: string;
  className?: string;
  aspectRatio?: string; // default aspect-[4/3]
}

/**
 * Category-specific custom tech SVG illustrations.
 * Visual style:
 * - Deep dark background (#121829)
 * - Blue to purple vibrant gradient traces (#3B82F6 -> #8B5CF6)
 * - Subtle neon glow filter
 * - High-detail technical accents (pins, heatsinks, solder pads, circuit traces)
 */
export const CategoryIllustration: React.FC<{ category: string; className?: string }> = ({
  category,
  className = 'w-full h-full',
}) => {
  const normCat = (category || 'prebuilt').toLowerCase();
  const gradId = `pg-${normCat}`;
  const glowId = `glow-${normCat}`;

  return (
    <svg
      viewBox="0 0 320 240"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id={`${gradId}-cyan`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <radialGradient id={`${gradId}-radial`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#121829" stopOpacity="0" />
        </radialGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background with tech grid */}
      <rect width="320" height="240" fill="#121829" />
      <circle cx="160" cy="120" r="100" fill={`url(#${gradId}-radial)`} />

      {/* Subtle background circuit pattern */}
      <g stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" opacity="0.6">
        <line x1="20" y1="40" x2="300" y2="40" />
        <line x1="20" y1="200" x2="300" y2="200" />
        <line x1="40" y1="20" x2="40" y2="220" />
        <line x1="280" y1="20" x2="280" y2="220" />
      </g>

      {/* Specific category drawings */}
      {normCat === 'cpu' && (
        <g filter={`url(#${glowId})`}>
          {/* Substrate outer base */}
          <rect x="85" y="45" width="150" height="150" rx="8" fill="#0F172A" stroke={`url(#${gradId})`} strokeWidth="2.5" />
          {/* Gold pins/contacts edges */}
          {[-4, 150].map((yOff) => (
            <g key={yOff}>
              {[100, 115, 130, 145, 160, 175, 190, 205].map((x) => (
                <rect key={x} x={x} y={45 + yOff} width="6" height="4" rx="1" fill="#F59E0B" opacity="0.9" />
              ))}
            </g>
          ))}
          {/* Inner Heat Spreader (IHS) */}
          <rect x="105" y="65" width="110" height="110" rx="6" fill="#1E293B" stroke={`url(#${gradId})`} strokeWidth="2" />
          {/* Silicon Die Center */}
          <rect x="125" y="85" width="70" height="70" rx="4" fill="#0B0F19" stroke={`url(#${gradId}-cyan)`} strokeWidth="1.5" />
          {/* Core logic traces */}
          <path d="M135 95 L185 95 M135 105 L185 105 M135 115 L185 115 M135 125 L185 125 M135 135 L185 135 M135 145 L185 145" stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 2" opacity="0.7" />
          <circle cx="160" cy="120" r="14" fill="#1E1B4B" stroke="#8B5CF6" strokeWidth="1.5" />
          {/* Triangle mark pin 1 */}
          <polygon points="90,50 96,50 90,56" fill="#F59E0B" />
        </g>
      )}

      {normCat === 'motherboard' && (
        <g filter={`url(#${glowId})`}>
          {/* PCB Base */}
          <rect x="55" y="30" width="210" height="180" rx="6" fill="#0B1329" stroke={`url(#${gradId})`} strokeWidth="2.5" />
          {/* CPU Socket in center-upper */}
          <rect x="95" y="55" width="70" height="70" rx="4" fill="#1E293B" stroke={`url(#${gradId})`} strokeWidth="1.5" />
          <rect x="110" y="70" width="40" height="40" rx="2" fill="#0F172A" stroke="#3B82F6" strokeWidth="1" />
          <circle cx="130" cy="90" r="8" fill="#3B82F6" opacity="0.4" />
          {/* Socket latch lever */}
          <path d="M168 60 L168 120 L174 120" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          {/* 4 RAM Slots on right */}
          {[180, 192, 204, 216].map((x) => (
            <g key={x}>
              <rect x={x} y="50" width="7" height="90" rx="1.5" fill="#1E293B" stroke={`url(#${gradId})`} strokeWidth="1" />
              <rect x={x + 1.5} y="92" width="4" height="6" fill="#0F172A" />
            </g>
          ))}
          {/* PCIe x16 Slot */}
          <rect x="80" y="150" width="145" height="12" rx="2" fill="#1E293B" stroke={`url(#${gradId}-cyan)`} strokeWidth="1.5" />
          <line x1="85" y1="156" x2="220" y2="156" stroke="#06B6D4" strokeWidth="1" strokeDasharray="3 2" />
          {/* PCIe x1 Slot */}
          <rect x="80" y="172" width="60" height="10" rx="2" fill="#1E293B" stroke="#6366F1" strokeWidth="1" />
          {/* VRM Heatsink */}
          <rect x="70" y="55" width="18" height="70" rx="2" fill="#334155" stroke={`url(#${gradId})`} strokeWidth="1" />
          <path d="M72 65 H86 M72 75 H86 M72 85 H86 M72 95 H86 M72 105 H86 M72 115 H86" stroke="#94A3B8" strokeWidth="1" />
          {/* Capacitors */}
          <circle cx="75" cy="138" r="4" fill="#3B82F6" />
          <circle cx="85" cy="138" r="4" fill="#8B5CF6" />
        </g>
      )}

      {normCat === 'ram' && (
        <g filter={`url(#${glowId})`}>
          {/* RAM PCB stick */}
          <rect x="40" y="80" width="240" height="80" rx="4" fill="#0F172A" stroke={`url(#${gradId})`} strokeWidth="2.5" />
          {/* Heat spreader decorative top fin */}
          <path d="M40 85 L70 70 L250 70 L280 85 Z" fill="#1E293B" stroke={`url(#${gradId})`} strokeWidth="1.5" />
          {/* RGB Light Bar on top */}
          <rect x="65" y="72" width="190" height="5" rx="2" fill={`url(#${gradId})`} opacity="0.9" />
          {/* Memory IC Chips (4 chips) */}
          {[60, 110, 160, 210].map((x) => (
            <g key={x}>
              <rect x={x} y="95" width="40" height="42" rx="2" fill="#1E293B" stroke="#3B82F6" strokeWidth="1.2" />
              <line x1={x + 5} y1="116" x2={x + 35} y2="116" stroke="#6366F1" strokeWidth="1" strokeDasharray="2 2" />
            </g>
          ))}
          {/* Golden edge connector pins with notch */}
          <rect x="45" y="160" width="230" height="10" fill="#F59E0B" opacity="0.9" rx="1" />
          {/* RAM notch */}
          <rect x="145" y="157" width="10" height="15" fill="#121829" />
        </g>
      )}

      {normCat === 'gpu' && (
        <g filter={`url(#${glowId})`}>
          {/* Shroud */}
          <rect x="45" y="60" width="230" height="120" rx="8" fill="#0F172A" stroke={`url(#${gradId})`} strokeWidth="2.5" />
          {/* Top RGB accent strip */}
          <path d="M55 70 L265 70" stroke={`url(#${gradId}-cyan)`} strokeWidth="3" strokeLinecap="round" />
          {/* Left Fan */}
          <circle cx="110" cy="120" r="40" fill="#1E293B" stroke={`url(#${gradId})`} strokeWidth="2" />
          <circle cx="110" cy="120" r="14" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
          {/* Left Fan Blades */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="110"
              y1="120"
              x2={110 + 36 * Math.cos((deg * Math.PI) / 180)}
              y2={120 + 36 * Math.sin((deg * Math.PI) / 180)}
              stroke="#60A5FA"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.8"
            />
          ))}
          {/* Right Fan */}
          <circle cx="210" cy="120" r="40" fill="#1E293B" stroke={`url(#${gradId})`} strokeWidth="2" />
          <circle cx="210" cy="120" r="14" fill="#0F172A" stroke="#8B5CF6" strokeWidth="1.5" />
          {/* Right Fan Blades */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="210"
              y1="120"
              x2={210 + 36 * Math.cos((deg * Math.PI) / 180)}
              y2={120 + 36 * Math.sin((deg * Math.PI) / 180)}
              stroke="#A78BFA"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.8"
            />
          ))}
          {/* Metal IO Bracket on left */}
          <rect x="35" y="45" width="10" height="150" rx="2" fill="#475569" stroke="#94A3B8" strokeWidth="1" />
          {/* PCIe Connector bottom */}
          <rect x="80" y="180" width="80" height="8" rx="1" fill="#F59E0B" />
        </g>
      )}

      {normCat === 'storage' && (
        <g filter={`url(#${glowId})`}>
          {/* M.2 SSD PCB Form Factor */}
          <rect x="50" y="90" width="220" height="60" rx="3" fill="#0B1329" stroke={`url(#${gradId})`} strokeWidth="2.5" />
          {/* M.2 Gold Notch Connector (left) */}
          <rect x="42" y="96" width="8" height="48" fill="#F59E0B" rx="1" />
          <rect x="42" y="112" width="10" height="8" fill="#121829" />
          {/* Controller chip */}
          <rect x="75" y="100" width="38" height="40" rx="2" fill="#1E293B" stroke="#06B6D4" strokeWidth="1.5" />
          <text x="94" y="124" fill="#06B6D4" fontSize="8" fontFamily="monospace" textAnchor="middle">NVMe</text>
          {/* NAND Flash chip 1 */}
          <rect x="130" y="100" width="55" height="40" rx="2" fill="#1E293B" stroke={`url(#${gradId})`} strokeWidth="1.5" />
          <text x="157" y="124" fill="#818CF8" fontSize="8" fontFamily="monospace" textAnchor="middle">NAND</text>
          {/* NAND Flash chip 2 */}
          <rect x="195" y="100" width="55" height="40" rx="2" fill="#1E293B" stroke={`url(#${gradId})`} strokeWidth="1.5" />
          <text x="222" y="124" fill="#A78BFA" fontSize="8" fontFamily="monospace" textAnchor="middle">NAND</text>
          {/* Semi-circle screw notch on right */}
          <path d="M270 115 A5 5 0 0 0 270 125 Z" fill="#121829" stroke={`url(#${gradId})`} strokeWidth="1" />
        </g>
      )}

      {normCat === 'case' && (
        <g filter={`url(#${glowId})`}>
          {/* Tower Chassis Frame */}
          <rect x="90" y="30" width="140" height="180" rx="6" fill="#0F172A" stroke={`url(#${gradId})`} strokeWidth="2.5" />
          {/* Front Panel (Mesh / Airflow) */}
          <rect x="200" y="35" width="24" height="170" rx="3" fill="#1E293B" stroke="#3B82F6" strokeWidth="1" />
          {/* Front Mesh Holes */}
          {[50, 70, 90, 110, 130, 150, 170, 190].map((y) => (
            <line key={y} x1="205" y1={y} x2="219" y2={y} stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="2 2" />
          ))}
          {/* Tempered Glass Window */}
          <rect x="98" y="40" width="96" height="130" rx="4" fill="#0B1329" fillOpacity="0.8" stroke={`url(#${gradId}-cyan)`} strokeWidth="1.5" />
          {/* PSU Shroud chamber */}
          <rect x="98" y="175" width="96" height="30" rx="2" fill="#1E293B" stroke="#475569" strokeWidth="1" />
          {/* Visible interior GPU line */}
          <rect x="105" y="105" width="65" height="18" rx="2" fill="#1E1B4B" stroke="#8B5CF6" strokeWidth="1" />
          {/* Visible interior Cooler fan */}
          <circle cx="138" cy="72" r="16" fill="#1E293B" stroke="#3B82F6" strokeWidth="1.5" />
          {/* Power button on top front */}
          <circle cx="212" cy="42" r="2.5" fill="#3B82F6" />
          {/* Case Feet */}
          <rect x="100" y="210" width="16" height="5" rx="1" fill="#475569" />
          <rect x="204" y="210" width="16" height="5" rx="1" fill="#475569" />
        </g>
      )}

      {normCat === 'psu' && (
        <g filter={`url(#${glowId})`}>
          {/* PSU Enclosure Box */}
          <rect x="60" y="55" width="200" height="130" rx="6" fill="#0F172A" stroke={`url(#${gradId})`} strokeWidth="2.5" />
          {/* Large 120mm Intake Fan Grille */}
          <circle cx="130" cy="120" r="48" fill="#1E293B" stroke={`url(#${gradId})`} strokeWidth="2" />
          <circle cx="130" cy="120" r="16" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
          {/* Concentric rings */}
          <circle cx="130" cy="120" r="32" stroke="#60A5FA" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
          {/* Fan blades */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <line
              key={deg}
              x1="130"
              y1="120"
              x2={130 + 44 * Math.cos((deg * Math.PI) / 180)}
              y2={120 + 44 * Math.sin((deg * Math.PI) / 180)}
              stroke="#A78BFA"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
          {/* Modular cable ports on right side */}
          <g>
            <rect x="200" y="70" width="48" height="16" rx="2" fill="#1E293B" stroke="#3B82F6" strokeWidth="1" />
            <rect x="200" y="92" width="48" height="16" rx="2" fill="#1E293B" stroke="#6366F1" strokeWidth="1" />
            <rect x="200" y="114" width="48" height="16" rx="2" fill="#1E293B" stroke="#8B5CF6" strokeWidth="1" />
            <rect x="200" y="136" width="48" height="16" rx="2" fill="#1E293B" stroke="#A855F7" strokeWidth="1" />
            <text x="224" y="81" fill="#93C5FD" fontSize="7" textAnchor="middle">24-PIN</text>
            <text x="224" y="103" fill="#A5B4FC" fontSize="7" textAnchor="middle">CPU</text>
            <text x="224" y="125" fill="#C4B5FD" fontSize="7" textAnchor="middle">PCI-E</text>
            <text x="224" y="147" fill="#E9D5FF" fontSize="7" textAnchor="middle">SATA</text>
          </g>
          {/* 80 Plus Badge Accent */}
          <rect x="68" y="65" width="28" height="16" rx="2" fill="#F59E0B" fillOpacity="0.2" stroke="#F59E0B" strokeWidth="1" />
          <text x="82" y="76" fill="#FBBF24" fontSize="7" fontWeight="bold" textAnchor="middle">GOLD</text>
        </g>
      )}

      {normCat === 'cooler' && (
        <g filter={`url(#${glowId})`}>
          {/* Tower Heatsink Stack */}
          <rect x="95" y="45" width="130" height="130" rx="4" fill="#0F172A" stroke={`url(#${gradId})`} strokeWidth="2" />
          {/* Fin Array Horizontal lines */}
          {[55, 63, 71, 79, 87, 95, 103, 111, 119, 127, 135, 143, 151, 159, 167].map((y) => (
            <line key={y} x1="100" y1={y} x2="220" y2={y} stroke="#475569" strokeWidth="1.2" />
          ))}
          {/* Copper Heatpipes tops */}
          {[115, 135, 165, 185, 205].map((x) => (
            <circle key={x} cx={x} cy="42" r="4" fill="#EA580C" stroke="#F97316" strokeWidth="1" />
          ))}
          {/* Front Mounted RGB Fan */}
          <circle cx="160" cy="110" r="48" fill="#1E293B" stroke={`url(#${gradId})`} strokeWidth="2.5" />
          <circle cx="160" cy="110" r="16" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
          {/* Fan Blades with RGB glow */}
          {[0, 51, 102, 153, 204, 255, 306].map((deg) => (
            <line
              key={deg}
              x1="160"
              y1="110"
              x2={160 + 44 * Math.cos((deg * Math.PI) / 180)}
              y2={110 + 44 * Math.sin((deg * Math.PI) / 180)}
              stroke="#60A5FA"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.8"
            />
          ))}
          {/* Baseplate / CPU contact block */}
          <rect x="125" y="175" width="70" height="16" rx="2" fill="#EA580C" stroke="#F97316" strokeWidth="1.5" />
        </g>
      )}

      {normCat === 'laptop' && (
        <g filter={`url(#${glowId})`}>
          {/* Open Laptop: Upper Lid / Screen */}
          <polygon
            points="70,40 250,40 265,135 55,135"
            fill="#0F172A"
            stroke={`url(#${gradId})`}
            strokeWidth="2.5"
          />
          {/* Inner Display Screen with Bezel */}
          <polygon
            points="77,48 243,48 256,128 64,128"
            fill="#030712"
            stroke="#1E293B"
            strokeWidth="1"
          />
          {/* Screen Content Gradient Art */}
          <polygon
            points="82,53 238,53 250,123 70,123"
            fill={`url(#${gradId})`}
            fillOpacity="0.2"
          />
          {/* Webcam dot */}
          <circle cx="160" cy="44" r="1.5" fill="#3B82F6" />
          {/* Central Logo on Screen */}
          <circle cx="160" cy="88" r="14" fill="#1E1B4B" stroke="#60A5FA" strokeWidth="1.5" />
          <path d="M154 88 L166 88 M160 82 L160 94" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" />
          {/* Lower Base / Chassis */}
          <polygon
            points="35,175 285,175 265,135 55,135"
            fill="#1E293B"
            stroke={`url(#${gradId})`}
            strokeWidth="2.5"
          />
          {/* Keyboard Deck */}
          <polygon
            points="65,140 255,140 268,162 52,162"
            fill="#0F172A"
            stroke="#334155"
            strokeWidth="1"
          />
          {/* Keyboard Keys Rows */}
          {[144, 150, 156].map((y) => (
            <line
              key={y}
              x1="70"
              y1={y}
              x2="250"
              y2={y}
              stroke={`url(#${gradId}-cyan)`}
              strokeWidth="2"
              strokeDasharray="4 2"
              opacity="0.85"
            />
          ))}
          {/* Touchpad */}
          <polygon
            points="130,165 190,165 192,173 128,173"
            fill="#0F172A"
            stroke={`url(#${gradId})`}
            strokeWidth="1"
          />
          {/* Front Lip */}
          <rect x="35" y="175" width="250" height="5" rx="2" fill="#334155" />
        </g>
      )}

      {normCat === 'prebuilt' && (
        <g filter={`url(#${glowId})`}>
          {/* Modern Gaming Desktop Case */}
          <rect x="75" y="25" width="170" height="190" rx="8" fill="#0F172A" stroke={`url(#${gradId})`} strokeWidth="2.5" />
          {/* Tempered Glass Side Panel */}
          <rect x="85" y="35" width="125" height="135" rx="4" fill="#030712" fillOpacity="0.8" stroke={`url(#${gradId}-cyan)`} strokeWidth="1.5" />
          {/* Interior Motherboard & Components */}
          {/* AIO Liquid Cooler Pump with RGB ring */}
          <circle cx="145" cy="80" r="18" fill="#1E293B" stroke={`url(#${gradId})`} strokeWidth="2" />
          <circle cx="145" cy="80" r="8" fill="#06B6D4" opacity="0.8" />
          {/* AIO Cooling Tubes */}
          <path d="M145 65 Q 160 50, 185 45" stroke="#3B82F6" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M152 70 Q 170 58, 192 52" stroke="#8B5CF6" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* 3 Front RGB Intake Fans */}
          {[50, 100, 150].map((y) => (
            <g key={y}>
              <circle cx="225" cy={y} r="16" fill="#1E293B" stroke={`url(#${gradId})`} strokeWidth="1.5" />
              <circle cx="225" cy={y} r="5" fill="#3B82F6" />
            </g>
          ))}
          {/* Beefy High-End GPU installed */}
          <rect x="92" y="115" width="105" height="28" rx="3" fill="#1E1B4B" stroke={`url(#${gradId})`} strokeWidth="2" />
          {/* GPU 2 visible fans inside */}
          <circle cx="120" cy="129" r="10" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.2" />
          <circle cx="165" cy="129" r="10" fill="#0F172A" stroke="#8B5CF6" strokeWidth="1.2" />
          {/* Lower PSU Shroud */}
          <rect x="85" y="175" width="125" height="32" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1" />
          {/* Side Logo on shroud */}
          <rect x="95" y="184" width="45" height="14" rx="2" fill="#0B1329" stroke="#3B82F6" strokeWidth="1" />
          <text x="117" y="194" fill="#60A5FA" fontSize="7" fontWeight="bold" textAnchor="middle">GAMING</text>
          {/* Case feet */}
          <rect x="85" y="215" width="22" height="6" rx="2" fill="#475569" />
          <rect x="215" y="215" width="22" height="6" rx="2" fill="#475569" />
        </g>
      )}
    </svg>
  );
};

// Known categories with generated photo assets
const CATEGORY_IMAGES: Record<string, string> = {
  laptop: '/images/categories/laptop.jpg',
  prebuilt: '/images/categories/prebuilt.jpg',
  cpu: '/images/categories/cpu.jpg',
  motherboard: '/images/categories/motherboard.jpg',
  ram: '/images/categories/ram.jpg',
  gpu: '/images/categories/gpu.jpg',
  storage: '/images/categories/storage.jpg',
  case: '/images/categories/case.jpg',
  psu: '/images/categories/psu.jpg',
  cooler: '/images/categories/cooler.jpg',
};

export const ProductImage: React.FC<ProductImageProps> = ({
  category = 'prebuilt',
  brand,
  name,
  image,
  className = '',
  aspectRatio = 'aspect-[4/3]',
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [categoryImageError, setCategoryImageError] = useState(false);

  // Normalize category name
  const safeCat = (category || 'prebuilt').toLowerCase();
  const displayBrand = brand?.trim().toUpperCase();

  // If there is a valid non-picsum custom product image URL
  const hasValidCustomImageUrl = Boolean(
    image && image.trim().length > 0 && !image.includes('picsum.photos')
  );

  // Tier 1: Product's own image (if provided and hasn't failed)
  // Tier 2: Category studio image (if available and hasn't failed)
  // Tier 3: High-tech Category SVG illustration
  const categoryFallbackSrc = CATEGORY_IMAGES[safeCat];
  const activeImageSrc =
    hasValidCustomImageUrl && !hasError
      ? image
      : !categoryImageError && categoryFallbackSrc
      ? categoryFallbackSrc
      : null;

  return (
    <div
      className={`relative w-full ${aspectRatio} overflow-hidden rounded-xl bg-[#0B0F1A] flex items-center justify-center select-none group/img ${className}`}
    >
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-radial-gradient from-blue-600/10 via-transparent to-transparent pointer-events-none" />

      {activeImageSrc ? (
        <>
          {/* Skeleton loader shown while downloading image */}
          {!imageLoaded && (
            <div className="absolute inset-0 z-0 animate-pulse bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
          )}
          <img
            src={activeImageSrc}
            alt={name || brand || category}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              if (activeImageSrc === image) {
                // Product image failed, will fallback to category image or SVG
                setHasError(true);
                setImageLoaded(false);
              } else {
                // Category image failed, will fallback to SVG
                setCategoryImageError(true);
                setImageLoaded(false);
              }
            }}
            className={`w-full h-full object-contain p-3 transition-transform duration-500 group-hover/img:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      ) : (
        /* Tier 3: Custom SVG tech illustration */
        <div className="w-full h-full p-3 flex items-center justify-center transition-transform duration-500 group-hover/img:scale-105">
          <CategoryIllustration category={safeCat} />
        </div>
      )}

      {/* Brand badge in the bottom corner */}
      {displayBrand && (
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
          <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider rounded bg-slate-900/85 text-blue-300 border border-blue-500/30 backdrop-blur-xs uppercase shadow-sm">
            {displayBrand}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductImage;
