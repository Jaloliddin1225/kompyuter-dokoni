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

export interface CompatibilityError {
  code: string;
  message: string;
  between: [Category, Category];
}

export interface CompatibilityWarning {
  code: string;
  message: string;
}

export interface CompatibilityResult {
  errors: CompatibilityError[];
  warnings: CompatibilityWarning[];
  estimatedPower: number;
  recommendedPsu: number;
}

export function calculatePowerRequirements(
  cpu?: CPU,
  gpu?: GPU
): { estimatedPower: number; recommendedPsu: number } {
  const cpuTdp = cpu?.tdp ?? 65;
  const gpuTdp = gpu?.tdp ?? 0;
  // 100W for motherboard, RAM, storage, fans, chipset
  const estimatedPower = cpuTdp + gpuTdp + 100;
  // 25% safety overhead, rounded up to 50W step
  const calculatedPsu = Math.ceil((estimatedPower * 1.25) / 50) * 50;
  const recommendedPsu = Math.max(calculatedPsu, gpu?.recommendedPsuW ?? 0);

  return { estimatedPower, recommendedPsu };
}

export function checkCompatibility(
  selection: Partial<Record<Category, Component>>
): CompatibilityResult {
  const errors: CompatibilityError[] = [];
  const warnings: CompatibilityWarning[] = [];

  const cpu = selection.cpu as CPU | undefined;
  const mb = selection.motherboard as Motherboard | undefined;
  const ram = selection.ram as RAM | undefined;
  const gpu = selection.gpu as GPU | undefined;
  const storage = selection.storage as Storage | undefined;
  const pcCase = selection.case as PCCase | undefined;
  const psu = selection.psu as PSU | undefined;
  const cooler = selection.cooler as Cooler | undefined;

  const { estimatedPower, recommendedPsu } = calculatePowerRequirements(cpu, gpu);

  // 1. SOCKET (CPU <-> Motherboard)
  if (cpu && mb) {
    if (cpu.socket !== mb.socket) {
      errors.push({
        code: 'SOCKET',
        message: `Protsessor va anakart soketi mos emas (${cpu.socket} ≠ ${mb.socket}).`,
        between: ['cpu', 'motherboard'],
      });
    }
  }

  // 2. RAM_TYPE (RAM <-> Motherboard)
  if (ram && mb) {
    if (ram.type !== mb.ramType) {
      errors.push({
        code: 'RAM_TYPE',
        message: `Anakart ${mb.ramType} ni qoʻllaydi, siz esa ${ram.type} tanladingiz.`,
        between: ['ram', 'motherboard'],
      });
    }

    // 3. RAM_SLOTS
    if (ram.modules > mb.ramSlots) {
      errors.push({
        code: 'RAM_SLOTS',
        message: `Anakartda yetarli RAM uyasi yoʻq (${ram.modules} ta modul > ${mb.ramSlots} ta uya).`,
        between: ['ram', 'motherboard'],
      });
    }

    // 4. RAM_MAX
    if (ram.capacityGB > mb.maxRamGB) {
      errors.push({
        code: 'RAM_MAX',
        message: `RAM hajmi (${ram.capacityGB}GB) anakart ruxsat bergan maksimal hajm (${mb.maxRamGB}GB) dan koʻp.`,
        between: ['ram', 'motherboard'],
      });
    }
  }

  // 5. FORM_FACTOR (Motherboard <-> Case)
  if (mb && pcCase) {
    if (!pcCase.formFactorSupport.includes(mb.formFactor)) {
      errors.push({
        code: 'FORM_FACTOR',
        message: `Korpus ushbu anakart oʻlchamini (${mb.formFactor}) sigʻdirmaydi. Qoʻllab-quvvatlaydi: ${pcCase.formFactorSupport.join(', ')}.`,
        between: ['motherboard', 'case'],
      });
    }
  }

  // 6. GPU_LENGTH (GPU <-> Case)
  if (gpu && pcCase) {
    if (gpu.lengthMm > pcCase.maxGpuLengthMm) {
      errors.push({
        code: 'GPU_LENGTH',
        message: `Videokarta korpusga sigʻmaydi (${gpu.lengthMm} mm > ${pcCase.maxGpuLengthMm} mm).`,
        between: ['gpu', 'case'],
      });
    }
  }

  // 7. COOLER_HEIGHT (Cooler <-> Case)
  if (cooler && pcCase) {
    if (cooler.type === 'Havo' && cooler.heightMm > pcCase.maxCoolerHeightMm) {
      errors.push({
        code: 'COOLER_HEIGHT',
        message: `Sovutgich balandligi (${cooler.heightMm} mm) korpus ruxsat berganidan (${pcCase.maxCoolerHeightMm} mm) baland.`,
        between: ['cooler', 'case'],
      });
    }
  }

  // 8. COOLER_SOCKET (Cooler <-> CPU)
  if (cooler && cpu) {
    if (!cooler.supportedSockets.includes(cpu.socket)) {
      errors.push({
        code: 'COOLER_SOCKET',
        message: `Sovutgich protsessor soketiga (${cpu.socket}) mos kelmaydi.`,
        between: ['cooler', 'cpu'],
      });
    }
  }

  // 9. PSU_POWER (PSU <-> CPU & GPU)
  if (psu) {
    if (psu.wattage < recommendedPsu) {
      errors.push({
        code: 'PSU_POWER',
        message: `Quvvat bloki yetarli emas (${psu.wattage}W < tavsiya etilgan ${recommendedPsu}W).`,
        between: ['psu', gpu ? 'gpu' : 'cpu'],
      });
    }
  }

  // 10. PSU_LENGTH (PSU <-> Case)
  if (psu && pcCase) {
    if (psu.lengthMm > pcCase.maxPsuLengthMm) {
      errors.push({
        code: 'PSU_LENGTH',
        message: `Quvvat bloki uzunligi (${psu.lengthMm} mm) korpus boʻsh joyidan (${pcCase.maxPsuLengthMm} mm) katta.`,
        between: ['psu', 'case'],
      });
    }
  }

  // 11. M2_SLOTS (Storage NVMe <-> Motherboard)
  if (storage && mb) {
    if (storage.type === 'NVMe' && mb.m2Slots < 1) {
      errors.push({
        code: 'M2_SLOTS',
        message: `Anakartda M.2 NVMe diski uchun uya mavjud emas.`,
        between: ['storage', 'motherboard'],
      });
    }
  }

  // --- OGOHLANTIRISHLAR (WARNINGS) ---

  // COOLER_TDP
  if (cooler && cpu) {
    if (cooler.maxTdp < cpu.tdp) {
      warnings.push({
        code: 'COOLER_TDP',
        message: `Sovutgich bu protsessor uchun zaif boʻlishi mumkin (${cooler.maxTdp}W < ${cpu.tdp}W). Harorat yuqori boʻlishi mumkin.`,
      });
    }
  }

  // NO_GPU
  if (cpu && !gpu && !cpu.hasIntegratedGraphics) {
    warnings.push({
      code: 'NO_GPU',
      message: `Bu protsessorda (${cpu.name}) oʻrnatilgan grafika (iGPU) yoʻq, monitordan tasvir olish uchun videokarta kerak.`,
    });
  }

  // PSU_TIGHT
  if (psu && psu.wattage >= recommendedPsu && psu.wattage < recommendedPsu * 1.15) {
    warnings.push({
      code: 'PSU_TIGHT',
      message: `Quvvat bloki zaxirasi kam (${psu.wattage}W tavsiya etilgan ${recommendedPsu}W ga juda yaqin).`,
    });
  }

  // BOTTLENECK (CPU & GPU imbalance)
  if (cpu && gpu) {
    const isWeakCpu = cpu.id === 'cpu-i3-12100f';
    const isHighGpu = gpu.id === 'gpu-rtx-4070' || gpu.id === 'gpu-rx-7800xt';
    const isStrongCpu = cpu.id === 'cpu-ryzen7-7800x3d';
    const isBudgetGpu = gpu.id === 'gpu-rtx-3050';

    if (isWeakCpu && isHighGpu) {
      warnings.push({
        code: 'BOTTLENECK',
        message: `Protsessor (${cpu.name}) kuchli videokartani (${gpu.name}) toʻliq ocha olmasligi mumkin (bottleneck).`,
      });
    } else if (isStrongCpu && isBudgetGpu) {
      warnings.push({
        code: 'BOTTLENECK',
        message: `Protsessor juda kuchli, lekin videokarta boshlangʻich darajada. Oʻyinlarda videokarta cheklov beradi.`,
      });
    }
  }

  // NO_COOLER_INCLUDED
  if (cpu && !cpu.includedCooler && !cooler) {
    warnings.push({
      code: 'NO_COOLER_INCLUDED',
      message: `Protsessor toʻplamida kuler yoʻq, qoʻshimcha sovutgich tanlash tavsiya etiladi.`,
    });
  }

  // OUT_OF_STOCK
  Object.values(selection).forEach((item) => {
    if (item && item.stock === 0) {
      warnings.push({
        code: 'OUT_OF_STOCK',
        message: `Tanlangan "${item.name}" hozirda omborda qolmagan.`,
      });
    }
  });

  return { errors, warnings, estimatedPower, recommendedPsu };
}

/**
 * Berilgan komponent joriy tanlovga toʻgʻri keladimi-yoʻqligini tekshiradi
 */
export function checkSingleComponentCompatibility(
  candidate: Component,
  currentSelection: Partial<Record<Category, Component>>
): { compatible: boolean; reason?: string } {
  // Test selection with candidate added
  const testSelection = {
    ...currentSelection,
    [candidate.category]: candidate,
  };

  const result = checkCompatibility(testSelection);
  const relevantError = result.errors.find(
    (e) => e.between[0] === candidate.category || e.between[1] === candidate.category
  );

  if (relevantError) {
    return {
      compatible: false,
      reason: relevantError.message,
    };
  }

  return { compatible: true };
}
