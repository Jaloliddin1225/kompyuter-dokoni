import express from 'express';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { allComponents, componentsById } from './src/data/components';
import { prebuiltPCs } from './src/data/prebuilt';
import { laptops } from './src/data/laptops';
import { checkCompatibility } from './src/lib/compatibility';
import { Category, Component } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client safely
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Function Declarations for Gemini
const searchComponentsDeclaration: FunctionDeclaration = {
  name: 'searchComponents',
  description: 'Doʻkondagi komponentlarni qidirish (CPU, GPU, RAM, va b.)',
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: 'Toifa: cpu, motherboard, ram, gpu, storage, case, psu, cooler',
      },
      maxPrice: { type: Type.NUMBER, description: 'Maksimal narx (soʻmda)' },
      brand: { type: Type.STRING, description: 'Brend nomi (Intel, AMD, ASUS...)' },
      socket: { type: Type.STRING, description: 'Soket turi (AM4, AM5, LGA1700)' },
      minVram: { type: Type.NUMBER, description: 'Minimal VRAM hajmi (GB)' },
      minRamGB: { type: Type.NUMBER, description: 'Minimal RAM hajmi (GB)' },
    },
    required: ['category'],
  },
};

const checkBuildCompatibilityDeclaration: FunctionDeclaration = {
  name: 'checkBuildCompatibility',
  description: 'Berilgan komponentlar roʻyxatining oʻzaro mosligini tekshiradi',
  parameters: {
    type: Type.OBJECT,
    properties: {
      componentIds: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Tekshiriladigan komponentlar ID roʻyxati',
      },
    },
    required: ['componentIds'],
  },
};

const buildForBudgetDeclaration: FunctionDeclaration = {
  name: 'buildForBudget',
  description: 'Belgilangan byudjet va maqsad boʻyicha toʻliq 8 qismli mos yigʻma tuzish',
  parameters: {
    type: Type.OBJECT,
    properties: {
      budget: { type: Type.NUMBER, description: 'Jami byudjet (soʻmda)' },
      purpose: {
        type: Type.STRING,
        description: "Maqsad: 'oʻyin', 'ofis', 'montaj', 'oʻqish'",
      },
    },
    required: ['budget', 'purpose'],
  },
};

const getPrebuiltDeclaration: FunctionDeclaration = {
  name: 'getPrebuilt',
  description: 'Mavjud tayyor kompyuterlarni olish',
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: "Toifa: 'Ofis', 'Oʻyin', 'Dizayn va montaj', 'Boshlangʻich'",
      },
      maxPrice: { type: Type.NUMBER, description: 'Maksimal narx (soʻmda)' },
    },
  },
};

const searchLaptopsDeclaration: FunctionDeclaration = {
  name: 'searchLaptops',
  description: 'Mavjud noutbuklar roʻyxatidan qidirish',
  parameters: {
    type: Type.OBJECT,
    properties: {
      purpose: {
        type: Type.STRING,
        description: "Maqsad: 'Oʻqish', 'Ish', 'Oʻyin', 'Dizayn'",
      },
      maxPrice: { type: Type.NUMBER, description: 'Maksimal narx (soʻmda)' },
      minRamGB: { type: Type.NUMBER, description: 'Minimal operativ xotira (GB)' },
    },
  },
};

const loadBuildToBuilderDeclaration: FunctionDeclaration = {
  name: 'loadBuildToBuilder',
  description: "Foydalanuvchi qabul qilgan yigʻmani PC Builder sahifasiga yoʻnaltirish",
  parameters: {
    type: Type.OBJECT,
    properties: {
      componentIds: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Komponentlar ID roʻyxati',
      },
    },
    required: ['componentIds'],
  },
};

const recommendForGameDeclaration: FunctionDeclaration = {
  name: 'recommendForGame',
  description: "Foydalanuvchi soʻragan oʻyin (masalan Cyberpunk 2077, CS2, GTA 5, Dota 2, RDR 2) va grafika sozlamalari (Ultra, High, Medium, 2K, 4K) uchun talab qilinadigan GPU va CPU darajasini tushuntiradi hamda mos yigʻmani tavsiya qiladi",
  parameters: {
    type: Type.OBJECT,
    properties: {
      gameName: {
        type: Type.STRING,
        description: "Oʻyin nomi (masalan: 'Cyberpunk 2077', 'CS2', 'GTA 5', 'Dota 2', 'RDR 2')",
      },
      settings: {
        type: Type.STRING,
        description: "Grafika sozlamalari: 'Ultra', 'High', 'Medium', '2K', '4K'",
      },
    },
    required: ['gameName'],
  },
};

const analyzeUpgradeDeclaration: FunctionDeclaration = {
  name: 'analyzeUpgrade',
  description: "Foydalanuvchining mavjud kompyuter parametrlarini (CPU, GPU, RAM, PSU va b.) tahlil qilib, asosiy toʻsiq (bottleneck) larni aniqlaydi va doʻkondagi mahsulotlar asosida bosqichma-bosqich upgrade tavsiyalarini beradi",
  parameters: {
    type: Type.OBJECT,
    properties: {
      specsText: {
        type: Type.STRING,
        description: "Foydalanuvchi yozgan xususiyatlar (masalan: 'i3-10100f, gtx 1050 ti, 8gb ram, 450w psu')",
      },
      targetGoal: {
        type: Type.STRING,
        description: "Upgrade maqsadi (masalan: 'zamonaviy oʻyinlar', 'FPS oshirish')",
      },
    },
    required: ['specsText'],
  },
};

const toolDeclarations = [
  searchComponentsDeclaration,
  checkBuildCompatibilityDeclaration,
  buildForBudgetDeclaration,
  getPrebuiltDeclaration,
  searchLaptopsDeclaration,
  loadBuildToBuilderDeclaration,
  recommendForGameDeclaration,
  analyzeUpgradeDeclaration,
];

// Helper to provide contextual suggested replies
export function getContextualSuggestedReplies(userMsg: string, aiText: string): string[] {
  const lowerUser = (userMsg || '').toLowerCase();
  const lowerAi = (aiText || '').toLowerCase();

  if (
    lowerUser.includes('cyberpunk') ||
    lowerUser.includes('cs2') ||
    lowerUser.includes('gta') ||
    lowerUser.includes('oʻyin') ||
    lowerUser.includes('oyun') ||
    lowerUser.includes('fps') ||
    lowerUser.includes('ultra') ||
    lowerAi.includes('fps') ||
    lowerAi.includes('ultra')
  ) {
    return [
      '2K va 4K monitorda FPS qanday boʻladi?',
      'Bu yigʻmani 12 mln soʻmgacha arzonlashtirish mumkinmi?',
      'Yigʻmadagi qismlarni Builderʻda koʻrish',
    ];
  }

  if (
    lowerUser.includes('upgrade') ||
    lowerUser.includes('yangila') ||
    lowerUser.includes('almashtir') ||
    lowerUser.includes('bor menda') ||
    lowerUser.includes('menda bor') ||
    lowerUser.includes('bottleneck') ||
    lowerAi.includes('upgrade') ||
    lowerAi.includes('bottleneck')
  ) {
    return [
      'RTX 4060 va 16GB RAM ning narxi qancha?',
      'Mavjud quvvat blokim (PSU) yangi kartaga yetadimi?',
      'Eski qismlarni sotib toʻliq yangi kompyuter olgan yaxshimi?',
    ];
  }

  if (lowerUser.includes('noutbuk') || lowerUser.includes('laptop') || lowerAi.includes('noutbuk')) {
    return [
      'Batareya quvvati necha soatga yetadi?',
      'Oʻyinlar uchun eng maqbul noutbuk qaysi?',
      'Kafolat muddati va muddatli toʻlov shartlari',
    ];
  }

  if (lowerUser.includes('ofis') || lowerUser.includes('ish') || lowerUser.includes('1c')) {
    return [
      'Monitor va klaviatura bilan birga qancha boʻladi?',
      'Muddatli toʻlov (boʻlib toʻlash) imkoniyati bormi?',
      'Toshkent boʻylab yetkazib berish va kafolat',
    ];
  }

  return [
    'Cyberpunk 2077 ni Ultra sozlamada oʻynash uchun yigʻma',
    'Mavjud kompyuterimni upgrade qilishga maslahat bering',
    '10 mln soʻmga oʻyin kompyuteri taklif qiling',
  ];
}

// Helper: Game requirement & recommended build generator
export function getGameRecommendationData(gameQuery: string, settingsQuery: string = 'ultra') {
  const g = gameQuery.toLowerCase();
  const s = settingsQuery.toLowerCase();

  if (g.includes('cyberpunk')) {
    const isUltra = s.includes('ultra') || s.includes('ray tracing') || s.includes('maksimal') || s.includes('2k') || s.includes('4k') || !s.includes('low');
    const targetPC = isUltra ? prebuiltPCs.find((p) => p.id === 'pc-cyberstrike-rtx')! : prebuiltPCs.find((p) => p.id === 'pc-gamemaster-rx')!;
    const items = targetPC.componentIds.map((id) => componentsById[id]).filter(Boolean);
    const total = items.reduce((sum, i) => sum + i.price, 0);

    const reply = `🎮 **Cyberpunk 2077 (${isUltra ? 'Ultra sozlamalar' : 'High 1080p'}) uchun texnik talablar va yigʻma:**\n\n` +
      `Cyberpunk 2077 — Night City shahridagi zich fotorealistik nurlar va fizikani hisoblash boʻyicha eng ogʻir zamonaviy oʻyinlardan biri. Ultra sifatda barqaror 60-90+ FPS olish uchun quyidagi darajadagi uskunalar zarur:\n\n` +
      `• **Videokarta (GPU darajasi):** Kamida **GeForce RTX 4060 (8GB)** yoki eng yuqori 2K/4K da oʻynash uchun **RTX 4070 (12GB)**. Cyberpunk'da Nvidia Ada Lovelace arxitekturasi va **DLSS 3 (Frame Generation)** kadrlarni silliqlashtirib, FPS ni 2 barobargacha oshiradi.\n` +
      `• **Protsessor (CPU darajasi):** Kamida 6 yadro / 12 oqimli **AMD Ryzen 5 7600 (AM5)** yoki **Intel Core i5-13400F**. Zich shahar olomoni va sunʼiy intellekt hisoblarida kuchli protsessor zarur.\n` +
      `• **Operativ xotira (RAM):** Kamida 16GB, tavsiya etiladi: 32GB DDR5.\n` +
      `• **Xotira:** Albatta tezkor **NVMe M.2 SSD** (teksturalar bir zumda yuklanishi uchun).\n\n` +
      `Doʻkonimizdan siz uchun toʻliq sinovdan oʻtgan **"${targetPC.name}"** tayyor yigʻmasini taklif qilaman (oʻrtacha **92 FPS** Ray Tracing + DLSS bilan).`;

    return {
      replyText: reply,
      recommendedBuild: {
        name: targetPC.name,
        totalPrice: total,
        componentIds: targetPC.componentIds,
        components: items,
      },
      suggestedReplies: [
        '2K va 4K monitorda FPS qanday boʻladi?',
        'Bu yigʻmani 12 mln soʻmgacha arzonlashtirish mumkinmi?',
        'Yigʻmadagi qismlarni Builderʻda koʻrish',
      ],
    };
  }

  if (g.includes('cs2') || g.includes('counter-strike') || g.includes('cs:go')) {
    const targetPC = prebuiltPCs.find((p) => p.id === 'pc-gamemaster-rx') || prebuiltPCs[0];
    const items = targetPC.componentIds.map((id) => componentsById[id]).filter(Boolean);
    const total = items.reduce((sum, i) => sum + i.price, 0);

    const reply = `🎯 **Counter-Strike 2 (CS2) uchun texnik talablar va yigʻma:**\n\n` +
      `CS2 — Source 2 dvigatelida ishlaydi va kibersportda 144Hz/240Hz monitorlarda kamida 200-260+ barqaror FPS talab qilinadi:\n\n` +
      `• **Protsessor (CPU):** CS2 protsessorning bitta yadro tezligi (IPC) va L3 keshiga juda talabchan. Kamida **AMD Ryzen 5 5600** yoki **Ryzen 5 7600 / Intel i3-12100F** zarur.\n` +
      `• **Videokarta (GPU):** 1080p oʻrtacha va yuqori sozlamalarda **Radeon RX 7600 (8GB)** yoki **RTX 3050 / RTX 4060** 200-260 FPS ni kafolatlaydi.\n` +
      `• **RAM:** 16GB Dual-Channel (DDR4 3200MHz yoki DDR5 5600MHz).\n\n` +
      `Sizga **"${targetPC.name}"** yigʻmasini tavsiya qilaman. Ushbu tizimda CS2 da 200+ FPS barqaror chiqadi!`;

    return {
      replyText: reply,
      recommendedBuild: {
        name: targetPC.name,
        totalPrice: total,
        componentIds: targetPC.componentIds,
        components: items,
      },
      suggestedReplies: [
        '240Hz monitor uchun bu yigʻma yetadimi?',
        'Byudjetim 8 mln soʻm, arzonroq variant bormi?',
        'Builderʻda komponentlarni koʻrish',
      ],
    };
  }

  if (g.includes('gta') || g.includes('grand theft auto')) {
    const targetPC = prebuiltPCs.find((p) => p.id === 'pc-starter-gaming')!;
    const items = targetPC.componentIds.map((id) => componentsById[id]).filter(Boolean);
    const total = items.reduce((sum, i) => sum + i.price, 0);

    const reply = `🚗 **GTA V va boʻlajak GTA 6 uchun texnik talablar va yigʻma:**\n\n` +
      `• **GTA V (High/Very High sozlamalar):** Bugungi kunda **Intel Core i3-12100F** va **RTX 3050 (8GB)** juftligi 1080p da 95-120 FPS ni bemalol beradi.\n` +
      `• **Boʻlajak GTA 6 uchun esa:** Kamida 8GB-12GB VRAM li **RTX 4060 / RTX 4070** va 6-8 yadroli **Ryzen 5 7600 / Ryzen 7 7800X3D**, 32GB RAM tavsiya etiladi.\n\n` +
      `GTA V va boshqa mashhur oʻyinlar uchun eng qulay hamyonbop variant — **"${targetPC.name}"**!`;

    return {
      replyText: reply,
      recommendedBuild: {
        name: targetPC.name,
        totalPrice: total,
        componentIds: targetPC.componentIds,
        components: items,
      },
      suggestedReplies: [
        'GTA 6 chiqishi uchun qaysi yigʻma mos keladi?',
        'RTX 4060 bilan kuchliroq variant bormi?',
        'Yigʻmani savatga qoʻshish',
      ],
    };
  }

  if (g.includes('rdr') || g.includes('red dead') || g.includes('warzone') || g.includes('pubg') || g.includes('dota')) {
    const targetPC = prebuiltPCs.find((p) => p.id === 'pc-gamemaster-rx')!;
    const items = targetPC.componentIds.map((id) => componentsById[id]).filter(Boolean);
    const total = items.reduce((sum, i) => sum + i.price, 0);

    const reply = `🎮 **${gameQuery.trim()} uchun texnik talablar va optimal yigʻma:**\n\n` +
      `Ushbu oʻyinda yuqori grafika va ravon harakat (60-120+ FPS) uchun tavsiya etiladi:\n` +
      `• **GPU:** Kamida **AMD Radeon RX 7600 (8GB)** yoki **Nvidia RTX 4060 (8GB)**.\n` +
      `• **CPU:** 6 yadroli **Ryzen 5 5600** yoki **Ryzen 5 7600**.\n` +
      `• **RAM:** 16GB Dual-Channel, NVMe SSD.\n\n` +
      `Doʻkonimizdagi eng mashhur **"${targetPC.name}"** yigʻmasini taklif qilaman!`;

    return {
      replyText: reply,
      recommendedBuild: {
        name: targetPC.name,
        totalPrice: total,
        componentIds: targetPC.componentIds,
        components: items,
      },
      suggestedReplies: [
        'Ushbu oʻyinda aniq necha FPS chiqadi?',
        'RTX 4060 li variant bilan narx farqi qancha?',
        'Savatga qoʻshish yoki Builderʻda ochish',
      ],
    };
  }

  // Generic AAA game
  const targetPC = prebuiltPCs.find((p) => p.id === 'pc-cyberstrike-rtx')!;
  const items = targetPC.componentIds.map((id) => componentsById[id]).filter(Boolean);
  const total = items.reduce((sum, i) => sum + i.price, 0);

  return {
    replyText: `🎮 **"${gameQuery.trim()}" uchun texnik talablar va tavsiya:**\n\n` +
      `Zamonaviy oʻyinlarda Ultra/High sifatda silliq harakat olish uchun:\n` +
      `• **GPU:** Kamida **GeForce RTX 4060 (8GB)** — DLSS 3 va Ray Tracing qoʻllovi bilan.\n` +
      `• **CPU:** 6 yadroli zamonaviy **AMD Ryzen 5 7600** yoki **Intel Core i5-13400F**.\n` +
      `• **RAM:** Kamida 16GB-32GB tezkor DDR4/DDR5.\n\n` +
      `Barcha talablarga javob beradigan **"${targetPC.name}"** yigʻmasini tavsiya qilaman!`,
    recommendedBuild: {
      name: targetPC.name,
      totalPrice: total,
      componentIds: targetPC.componentIds,
      components: items,
    },
    suggestedReplies: [
      'Ushbu oʻyinda aniq necha FPS beradi?',
      'Byudjetimni tejash uchun nimalarni almashtirish mumkin?',
      'Builderʻda qismlarni koʻrish',
    ],
  };
}

// Helper: Existing PC specs upgrade analyzer
export function getUpgradeAnalysisData(specsText: string) {
  const s = specsText.toLowerCase();

  // Identify bottleneck
  let gpuAnalysis = '';
  if (s.includes('1050') || s.includes('1030') || s.includes('750') || s.includes('960') || s.includes('gtx 1650') || s.includes('rx 550') || s.includes('rx 560')) {
    gpuAnalysis = "Videokartangiz (GTX 1050 / 1650 darajasi) zamonaviy oʻyinlar uchun asosiy toʻsiq (bottleneck) hisoblanadi. 4GB VRAM bugungi ogʻir teksturalar uchun yetarli emas.";
  } else if (s.includes('1060') || s.includes('1660') || s.includes('rx 580') || s.includes('rx 570')) {
    gpuAnalysis = "Videokartangiz (GTX 1060 / 1660 / RX 580) oʻrta darajadagi oʻyinlarda 1080p da ishlaydi, ammo yangi AAA oʻyinlarda va DLSS 3 / Ray Tracing imkoniyatlari yoʻq.";
  } else {
    gpuAnalysis = "Grafika unumdorligini oshirish uchun videokartani zamonaviy arxitekturaga yangilash eng katta samara beradi.";
  }

  let ramAnalysis = '';
  if (s.includes('8gb') || s.includes('8 gb') || s.includes('4gb') || s.includes('4 gb') || s.includes('6gb')) {
    ramAnalysis = "8GB yoki undan kam RAM — oʻyinlarda mikro-frizlar (qotishlar) va sekinlashuvga olib keladi. Uni kamida 16GB (2x8GB Dual-Channel) ga oshirish shart.";
  } else if (s.includes('16gb') || s.includes('16 gb')) {
    ramAnalysis = "16GB RAM bugungi oʻyinlar uchun optimal. Kelgusida ogʻir montaj yoki 32GB ga kengaytirish mumkin.";
  } else {
    ramAnalysis = "Tezkor xotirani kamida 16GB Dual-Channel qilish tizim ravonligini taʼminlaydi.";
  }

  let cpuAnalysis = '';
  if (s.includes('i3') || s.includes('10100') || s.includes('12100') || s.includes('9100') || s.includes('8100') || s.includes('ryzen 3') || s.includes('ryzen 1200')) {
    cpuAnalysis = "4 yadroli i3 protsessor yangi videokartani (masalan RTX 4060 yoki RX 7600) boshlangʻich darajada 70-85% gacha ochib bera oladi, ammo kelgusida 6 yadroli CPU ga oʻtish maksimal FPS beradi.";
  } else if (s.includes('i5') || s.includes('ryzen 5') || s.includes('2600') || s.includes('3600') || s.includes('9400')) {
    cpuAnalysis = "6 yadroli protsessoringiz yangi videokartalar bilan yaxshi ishlaydi, asosiy eʼtiborni GPU va tezkor xotiraga qarating.";
  } else {
    cpuAnalysis = "Protsessor platformasini tekshirib, eng kuchli mos modelga yangilash mumkin.";
  }

  const reply = `🛠️ **Mavjud kompyuteringiz tahlili va Upgrade (yangilash) boʻyicha maslahat:**\n\n` +
    `1. **Asosiy toʻsiq (Bottleneck) — Videokarta:**\n${gpuAnalysis}\n\n` +
    `2. **Operativ xotira (RAM):**\n${ramAnalysis}\n\n` +
    `3. **Protsessor va Tizim:**\n${cpuAnalysis}\n\n` +
    `4. **Quvvat bloki (PSU) ogohlantirishi:**\nAgar blok pitaniyangiz 450W dan past boʻlsa, yangi kuchli videokarta uchun kamida 550W-650W sifatli blok (masalan DeepCool PK550D yoki Chieftec 650W) oʻrnatish zarur.\n\n` +
    `**Doʻkonimizdagi mos qismlar asosida bosqichma-bosqich reja:**\n` +
    `• **1-bosqich (Eng katta oʻsish):** Videokartani **GeForce RTX 4060 (8GB)** (4,100,000 soʻm) yoki **Radeon RX 7600** (3,550,000 soʻm) ga yangilang — FPS 2.5 - 3 barobarga oshadi!\n` +
    `• **2-bosqich:** Qoʻshimcha **Kingston Fury 16GB DDR4** (450,000 soʻm) qoʻshib, RAM ni 16GB Dual-Channel ga yetkazing.\n` +
    `• **3-bosqich:** Agar Windows HDD da boʻlsa, tezkor **Kingston NV2 500GB M.2 NVMe SSD** (420,000 soʻm) oʻrnating — yuklanish 5 barobar tezlashadi.`;

  return {
    replyText: reply,
    suggestedReplies: [
      'RTX 4060 va 16GB RAM ning narxi qancha?',
      'Mavjud quvvat blokim (PSU) yangi kartaga yetadimi?',
      'Eski qismlarni sotib toʻliq yangi kompyuter olgan yaxshimi?',
    ],
  };
}

// Helper to execute tool calls
function executeTool(name: string, args: Record<string, unknown>): unknown {
  switch (name) {
    case 'searchComponents': {
      const cat = args.category as string;
      const maxPrice = args.maxPrice as number | undefined;
      const brand = (args.brand as string)?.toLowerCase();
      const socket = args.socket as string | undefined;

      let results = allComponents.filter((c) => c.category === cat && c.stock > 0);
      if (maxPrice) results = results.filter((c) => c.price <= maxPrice);
      if (brand) results = results.filter((c) => c.brand.toLowerCase().includes(brand));
      if (socket && cat === 'cpu') {
        results = results.filter((c) => (c as unknown as { socket: string }).socket === socket);
      }
      return results.map((c) => ({
        id: c.id,
        name: c.name,
        price: c.price,
        brand: c.brand,
      }));
    }

    case 'checkBuildCompatibility': {
      const ids = (args.componentIds as string[]) || [];
      const selection: Partial<Record<Category, Component>> = {};
      ids.forEach((id) => {
        const item = componentsById[id];
        if (item) selection[item.category] = item;
      });
      const res = checkCompatibility(selection);
      return {
        isCompatible: res.errors.length === 0,
        errors: res.errors.map((e) => e.message),
        warnings: res.warnings.map((w) => w.message),
        estimatedPower: res.estimatedPower,
        recommendedPsu: res.recommendedPsu,
      };
    }

    case 'buildForBudget': {
      const budget = (args.budget as number) || 10000000;
      const purpose = (args.purpose as string)?.toLowerCase() || 'oʻyin';

      // Pick an optimal pre-configured or dynamic build
      let targetPrebuilt = prebuiltPCs[0];
      if (purpose.includes('ofis') || purpose.includes('ish') || purpose.includes("o'qish")) {
        targetPrebuilt = prebuiltPCs.find((p) => p.category === 'Ofis') || prebuiltPCs[1];
      } else if (purpose.includes('montaj') || purpose.includes('dizayn')) {
        targetPrebuilt = prebuiltPCs.find((p) => p.category === 'Dizayn va montaj') || prebuiltPCs[5];
      } else if (budget < 8000000) {
        targetPrebuilt = prebuiltPCs.find((p) => p.category === "Boshlang'ich") || prebuiltPCs[0];
      } else if (budget >= 13000000) {
        targetPrebuilt = prebuiltPCs.find((p) => p.id === 'pc-cyberstrike-rtx') || prebuiltPCs[3];
      } else {
        targetPrebuilt = prebuiltPCs.find((p) => p.id === 'pc-gamemaster-rx') || prebuiltPCs[2];
      }

      const items = targetPrebuilt.componentIds.map((id) => componentsById[id]).filter(Boolean);
      const total = items.reduce((sum, i) => sum + i.price, 0);

      return {
        name: targetPrebuilt.name,
        components: items.map((i) => ({
          id: i.id,
          name: i.name,
          category: i.category,
          price: i.price,
          image: i.image,
        })),
        componentIds: targetPrebuilt.componentIds,
        totalPrice: total,
        purpose,
      };
    }

    case 'getPrebuilt': {
      const cat = args.category as string | undefined;
      const maxPrice = args.maxPrice as number | undefined;
      let list = [...prebuiltPCs];
      if (cat) list = list.filter((p) => p.category.toLowerCase().includes(cat.toLowerCase()));
      if (maxPrice) list = list.filter((p) => p.price <= maxPrice);
      return list.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        description: p.description,
      }));
    }

    case 'searchLaptops': {
      const purpose = args.purpose as string | undefined;
      const maxPrice = args.maxPrice as number | undefined;
      const minRamGB = args.minRamGB as number | undefined;
      let list = laptops.filter((l) => l.stock > 0);
      if (purpose) list = list.filter((l) => l.purpose.toLowerCase() === purpose.toLowerCase());
      if (maxPrice) list = list.filter((l) => l.price <= maxPrice);
      if (minRamGB) list = list.filter((l) => l.ramGB >= minRamGB);
      return list.map((l) => ({
        id: l.id,
        name: l.name,
        brand: l.brand,
        price: l.price,
        cpu: l.cpu,
        ramGB: l.ramGB,
        gpu: l.gpu,
      }));
    }

    case 'loadBuildToBuilder': {
      const ids = (args.componentIds as string[]) || [];
      return {
        redirectUrl: `/builder?build=${ids.join(',')}`,
        componentIds: ids,
      };
    }

    case 'recommendForGame': {
      const gameName = (args.gameName as string) || '';
      const settings = (args.settings as string) || 'Ultra';
      return getGameRecommendationData(gameName, settings);
    }

    case 'analyzeUpgrade': {
      const specsText = (args.specsText as string) || '';
      return getUpgradeAnalysisData(specsText);
    }

    default:
      return { error: 'Unknown tool' };
  }
}

// Helper: Local intelligent advisor response
export function getLocalAdvisorResponse(message: string) {
  const lower = (message || '').toLowerCase();
  let replyText = "Salom! Men PCForge maslahatchisiman. ";
  let recommendedBuild: unknown = null;
  let suggestedReplies: string[] = [];

  // (1) Check for Upgrade advice request
  const upgradeKeywords = ['upgrade', 'yangila', 'almashtir', 'kuchaytir', 'menda bor', 'bor menda', 'hozirgi kompyuter', 'bottleneck', 'tizimim'];
  const hasComponentSpecs = lower.includes('i3') || lower.includes('i5') || lower.includes('i7') || lower.includes('ryzen') || lower.includes('gtx') || lower.includes('rtx') || lower.includes('rx 5') || lower.includes('rx 6') || lower.includes('1050') || lower.includes('1650') || lower.includes('1060') || lower.includes('1660') || lower.includes('gb ram');
  const isUpgradeRequest = upgradeKeywords.some((k) => lower.includes(k)) || (hasComponentSpecs && (lower.includes('qanday') || lower.includes('maslahat') || lower.includes('tavsiya') || lower.includes('nima') || lower.includes('upgrade')));

  // (2) Check for Game recommendation request
  const gameKeywords = ['cyberpunk', 'cs2', 'counter-strike', 'cs:go', 'gta', 'dota', 'rdr', 'red dead', 'warzone', 'cod', 'pubg', 'valorant', 'forza', 'hogwarts', 'fortnite', 'apex', 'witcher', 'wukong', 'rust', 'minecraft'];
  const hasGameMention = gameKeywords.some((k) => lower.includes(k)) || ((lower.includes('oʻyin') || lower.includes("o'yin") || lower.includes('oyun')) && (lower.includes('ultra') || lower.includes('fps') || lower.includes('sozlama')));

  if (isUpgradeRequest) {
    const upgradeData = getUpgradeAnalysisData(message);
    replyText = upgradeData.replyText;
    suggestedReplies = upgradeData.suggestedReplies;
  } else if (hasGameMention) {
    const settings = lower.includes('medium') ? 'Medium' : lower.includes('high') ? 'High' : 'Ultra';
    const gameData = getGameRecommendationData(message, settings);
    replyText = gameData.replyText;
    recommendedBuild = gameData.recommendedBuild;
    suggestedReplies = gameData.suggestedReplies;
  } else if (lower.includes('ofis') || lower.includes('hujjat') || lower.includes('1c')) {
    const build = executeTool('buildForBudget', { budget: 6500000, purpose: 'ofis' }) as any;
    replyText = `Ofis, hisob-kitob va biznes dasturlari uchun tezkor hamda shovqinsiz "${build.name}" yigʻmasini tavsiya qilaman. AM5 zamonaviy DDR5 arxitekturasi bilan koʻp yillar muammosiz xizmat qiladi.`;
    recommendedBuild = build;
    suggestedReplies = [
      'Monitor va klaviatura bilan birga qancha boʻladi?',
      'Muddatli toʻlov shartlari qanday?',
      'Toshkent boʻylab yetkazib berish bormi?',
    ];
  } else if (lower.includes('noutbuk') || lower.includes('laptop')) {
    replyText = "Bizda oʻqish, ish va zamonaviy oʻyinlar uchun Lenovo, ASUS TUF/ROG, HP Victus va Apple MacBook noutbuklari mavjud. /laptops sahifasidan toʻliq koʻrib chiqishingiz mumkin!";
    suggestedReplies = [
      'Oʻyinlar uchun eng arzon noutbuk qaysi?',
      'Batareyasi uzoq yetadigan noutbuk taklif qiling',
      'Noutbuklarni taqqoslash sahifasiga oʻtish',
    ];
  } else {
    const build = executeTool('buildForBudget', { budget: 10000000, purpose: "o'yin" }) as any;
    replyText = `Salom! Men PCForge doʻkonining aqlli maslahatchisiman.\n\nSizga eng optimal variant sifatida xaridorgir "${build.name}" oʻyin kompyuterini taklif qila olaman. Yoki istalgan oʻyin nomini (masalan: "Cyberpunk 2077 Ultra") yozsangiz yoki mavjud kompyuteringiz parametrlarini aytsangiz, aniq maslahat beraman!`;
    recommendedBuild = build;
    suggestedReplies = [
      'Cyberpunk 2077 ni Ultra sozlamada oʻynash',
      'Mavjud kompyuterimni upgrade qilish',
      '10 mln soʻmga oʻyin kompyuteri',
    ];
  }

  return { text: replyText, recommendedBuild, suggestedReplies };
}

// API Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Xabar kiritilmadi' });
    }

    if (!ai) {
      const fallback = getLocalAdvisorResponse(message);
      return res.json(fallback);
    }

    // Call Gemini 3.8 Flash with tools
    const systemInstruction = `Sen PCForge kompyuter do'konining professional AI maslahatchisisan. Faqat o'zbek tilida, samimiy, do'stona, aniq va texnik savodli javob ber. Faqat do'kondagi mavjud mahsulotlarni tavsiya qil, narxlarni so'mda ayt.

MUHIM QOIDALAR:
1. O'YINLAR TALABI: Foydalanuvchi biror o'yin nomini yozsa (masalan: "Cyberpunk 2077 ni Ultra sozlamada o'ynamoqchiman", "CS2", "GTA 5", "Dota 2", "RDR 2"):
   - Kerak bo'ladigan GPU va CPU darajasini (arxitektura, VRAM, yadro soni, DLSS 3 / Ray Tracing, kutilayotgan FPS) sodda va tushunarli qilib izohla.
   - Do'kondagi mos to'liq yig'mani tavsiya qilish uchun "recommendForGame" yoki "buildForBudget" funksiyasini chaqir.
2. UPGRADE (YANGILASH): Foydalanuvchi mavjud kompyuter parametrlarini matn bilan yozsa (masalan: "Menda i3-10100F, GTX 1050 Ti, 8GB RAM bor, nimalarni yangilasam bo'ladi?"):
   - Tizimdagi eng katta to'siqni (bottleneck) aniqla.
   - Bosqichma-bosqich upgrade rejasini ber (1-bosqich: GPU, 2-bosqich: RAM, 3-bosqich: SSD / PSU).
   - Do'kondagi mavjud mos qismlarni (searchComponents yoki analyzeUpgrade) ko'rsat.
3. HAR DOIM JAVOBING OXIRIDA QAT'IY TALAB: Foydalanuvchi suhbatni oson davom ettirishi uchun 2-3 ta qisqa va aniq davomiy savolni (suggested replies) quyidagi maxsus formatda yoz:
---SUGGESTED_REPLIES---
- [1-davomiy savol]
- [2-davomiy savol]
- [3-davomiy savol]`;

    const contents: Array<{ role: string; parts: Array<{ text?: string }> }> = [];

    if (Array.isArray(history)) {
      history.slice(-8).forEach((h: { sender: string; text: string }) => {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini upstream timeout')), 7000)
    );

    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents as any,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: toolDeclarations }],
        },
      }),
      timeoutPromise,
    ]);

    let finalResponseText = response.text || '';
    let recommendedBuild: unknown = null;

    // Check if tool calls were made
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const toolCall = functionCalls[0];
      const toolName = toolCall.name ?? '';
      if (toolName) {
        const toolResult = executeTool(toolName, (toolCall.args as Record<string, unknown>) || {});

        if (toolName === 'buildForBudget' || toolName === 'recommendForGame') {
          const resObj = toolResult as any;
          if (resObj && (resObj.componentIds || resObj.recommendedBuild)) {
            recommendedBuild = resObj.recommendedBuild || resObj;
          }
        }

        // Generate a response incorporating tool output
        const followUp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            ...contents,
            {
              role: 'model',
              parts: [{ text: `Funksiya bajarildi: ${toolName}. Natija: ${JSON.stringify(toolResult)}` }],
            },
            {
              role: 'user',
              parts: [{ text: "Iltimos, ushbu maʼlumotlar asosida foydalanuvchiga chiroyli va qisqa oʻzbekcha tushuntirish ber. Oxirida 2-3 ta davomiy savolni ---SUGGESTED_REPLIES--- bo'limida ko'rsat." }],
            },
          ] as any,
          config: { systemInstruction },
        });

        finalResponseText = followUp.text || finalResponseText;
      }
    }

    // Extract suggested replies
    let suggestedReplies: string[] = [];
    if (finalResponseText.includes('---SUGGESTED_REPLIES---')) {
      const parts = finalResponseText.split('---SUGGESTED_REPLIES---');
      finalResponseText = parts[0].trim();
      const suggestionsBlock = parts[1] || '';
      suggestedReplies = suggestionsBlock
        .split('\n')
        .map((s) =>
          s
            .replace(/^[-*•\d.)\s]+/, '')
            .replace(/^\[+/, '')
            .replace(/\]+$/, '')
            .trim()
        )
        .filter((s) => s.length >= 3 && s.length <= 90)
        .slice(0, 3);
    }

    if (suggestedReplies.length < 2) {
      suggestedReplies = getContextualSuggestedReplies(message, finalResponseText);
    }

    return res.json({
      text: finalResponseText || "Savolingiz boʻyicha eng maqbul variantlarni koʻrib chiqdim. Qanday qoʻshimcha savolingiz bor?",
      recommendedBuild,
      suggestedReplies,
    });
  } catch (err: unknown) {
    console.error('Chat error, falling back to local advisor:', err);
    const fallback = getLocalAdvisorResponse(req.body?.message || '');
    return res.json(fallback);
  }
});

// Builder analysis endpoint
app.post('/api/analyze-build', async (req, res) => {
  try {
    const { componentIds } = req.body;
    if (!componentIds || !Array.isArray(componentIds)) {
      return res.status(400).json({ error: 'Komponentlar roʻyxati berilmadi' });
    }

    const items = componentIds.map((id: string) => componentsById[id]).filter(Boolean);
    const selection: Partial<Record<Category, Component>> = {};
    items.forEach((item) => {
      selection[item.category] = item;
    });

    const compatibility = checkCompatibility(selection);

    if (!ai) {
      // Local fallback analysis
      const strengths = [
        'Tanlangan barcha qismlar zamonaviy standartlarga mos.',
        `Taxminiy quvvat sarfi: ${compatibility.estimatedPower}W, tavsiya etilgan PSU: ${compatibility.recommendedPsu}W.`,
      ];
      const weaknesses: string[] = [];
      if (compatibility.warnings.length > 0) {
        compatibility.warnings.forEach((w) => weaknesses.push(w.message));
      } else {
        strengths.push('Komponentlar oʻrtasida hech qanday muvozanatsizlik yoki bottleneck aniqlanmadi.');
      }

      return res.json({
        summary: compatibility.errors.length === 0
          ? 'Yigʻma toʻliq mos va mukammal muvozanatda tuzilgan!'
          : 'Yigʻmada bartaraf etilishi kerak boʻlgan moslik xatolari bor.',
        strengths,
        weaknesses,
        advice: 'Tizim optimal ishlaydi. Doʻkonimiz orqali buyurtma berishingiz mumkin.',
      });
    }

    const prompt = `Foydalanuvchi quyidagi kompyuter komponentlarini tanladi:
${items.map((i) => `- ${i.category.toUpperCase()}: ${i.name} (${i.price} so'm)`).join('\n')}

Moslik xulosasi:
- Xatolar: ${compatibility.errors.map((e) => e.message).join('; ') || "Yo'q"}
- Ogohlantirishlar: ${compatibility.warnings.map((w) => w.message).join('; ') || "Yo'q"}
- Taxminiy quvvat: ${compatibility.estimatedPower}W, Tavsiya etilgan PSU: ${compatibility.recommendedPsu}W

Iltimos, o'zbek tilida sodda, do'stona va professional qilib baho ber:
1. Kuchli tomonlari
2. Kuchsiz tomonlari yoki bottleneck bormi?
3. Qaysi komponentni almashtirish ko'proq foyda berishi mumkin?
Qisqa va aniq punktlar bilan yoz.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      analysis: response.text,
    });
  } catch (err: unknown) {
    console.error('Analyze build error:', err);
    return res.status(500).json({ error: 'Tahlil qilishda xatolik yuz berdi' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PCForge full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
