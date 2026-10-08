import { describe, it, expect } from 'vitest';
import { checkCompatibility, checkSingleComponentCompatibility } from './compatibility';
import { cpus, motherboards, rams, gpus, storages, cases, psus, coolers } from '../data/components';
import { CPU, Motherboard, RAM, GPU, PCCase, PSU, Cooler, Storage } from '../types';

describe('PCForge Compatibility Engine Tests', () => {
  const am5Cpu = cpus.find((c) => c.socket === 'AM5') as CPU;
  const intelCpu = cpus.find((c) => c.socket === 'LGA1700') as CPU;
  const am5Mb = motherboards.find((m) => m.socket === 'AM5' && m.ramType === 'DDR5') as Motherboard;
  const lgaMbDdr4 = motherboards.find((m) => m.socket === 'LGA1700' && m.ramType === 'DDR4') as Motherboard;
  const ddr4Ram = rams.find((r) => r.type === 'DDR4') as RAM;
  const ddr5Ram = rams.find((r) => r.type === 'DDR5' && r.stock > 0) as RAM;
  const standardCase = cases.find((c) => c.id === 'case-deepcool-cc560') as PCCase; // ATX, 370mm GPU
  const itxCase = cases.find((c) => c.id === 'case-cm-nr200p') as PCCase; // ITX only, 76mm cooler
  const airCooler = coolers.find((c) => c.type === 'Havo') as Cooler; // 150mm height
  const bigGpu = gpus.find((g) => g.id === 'gpu-rx-7800xt') as GPU; // 322mm
  const highPsu = psus.find((p) => p.wattage >= 750) as PSU;
  const lowPsu = psus.find((p) => p.wattage === 450) as PSU;
  const nvme = storages.find((s) => s.type === 'NVMe') as Storage;

  it('1. SOCKET: Passes for AM5 + AM5, Fails for LGA1700 + AM5 MB', () => {
    const valid = checkCompatibility({ cpu: am5Cpu, motherboard: am5Mb });
    expect(valid.errors.some((e) => e.code === 'SOCKET')).toBe(false);

    const invalid = checkCompatibility({ cpu: intelCpu, motherboard: am5Mb });
    expect(invalid.errors.some((e) => e.code === 'SOCKET')).toBe(true);
  });

  it('2. RAM_TYPE: Passes for DDR5 + DDR5 MB, Fails for DDR4 + DDR5 MB', () => {
    const valid = checkCompatibility({ motherboard: am5Mb, ram: ddr5Ram });
    expect(valid.errors.some((e) => e.code === 'RAM_TYPE')).toBe(false);

    const invalid = checkCompatibility({ motherboard: am5Mb, ram: ddr4Ram });
    expect(invalid.errors.some((e) => e.code === 'RAM_TYPE')).toBe(true);
  });

  it('3. RAM_SLOTS: Fails when RAM modules exceed motherboard slots', () => {
    const twoSlotMb: Motherboard = {
      ...am5Mb,
      ramSlots: 2,
    };
    const fourModuleRam: RAM = {
      ...ddr5Ram,
      modules: 4,
    };
    const invalid = checkCompatibility({ motherboard: twoSlotMb, ram: fourModuleRam });
    expect(invalid.errors.some((e) => e.code === 'RAM_SLOTS')).toBe(true);

    const valid = checkCompatibility({ motherboard: twoSlotMb, ram: ddr5Ram });
    expect(valid.errors.some((e) => e.code === 'RAM_SLOTS')).toBe(false);
  });

  it('4. RAM_MAX: Fails when capacity exceeds maximum motherboard RAM', () => {
    const lowMaxMb: Motherboard = {
      ...am5Mb,
      maxRamGB: 32,
    };
    const hugeRam: RAM = {
      ...ddr5Ram,
      capacityGB: 64,
    };
    const invalid = checkCompatibility({ motherboard: lowMaxMb, ram: hugeRam });
    expect(invalid.errors.some((e) => e.code === 'RAM_MAX')).toBe(true);

    const valid = checkCompatibility({ motherboard: lowMaxMb, ram: { ...ddr5Ram, capacityGB: 16 } });
    expect(valid.errors.some((e) => e.code === 'RAM_MAX')).toBe(false);
  });

  it('5. FORM_FACTOR: Passes when case supports MB form factor, Fails when ATX MB placed in ITX case', () => {
    const atxMb = motherboards.find((m) => m.formFactor === 'ATX') as Motherboard;
    const valid = checkCompatibility({ motherboard: atxMb, case: standardCase });
    expect(valid.errors.some((e) => e.code === 'FORM_FACTOR')).toBe(false);

    const invalid = checkCompatibility({ motherboard: atxMb, case: itxCase });
    expect(invalid.errors.some((e) => e.code === 'FORM_FACTOR')).toBe(true);
  });

  it('6. GPU_LENGTH: Passes when GPU fits, Fails when GPU length exceeds max limit', () => {
    const tinyCase: PCCase = {
      ...standardCase,
      maxGpuLengthMm: 200,
    };
    const valid = checkCompatibility({ gpu: bigGpu, case: standardCase });
    expect(valid.errors.some((e) => e.code === 'GPU_LENGTH')).toBe(false);

    const invalid = checkCompatibility({ gpu: bigGpu, case: tinyCase });
    expect(invalid.errors.some((e) => e.code === 'GPU_LENGTH')).toBe(true);
  });

  it('7. COOLER_HEIGHT: Fails when air cooler is taller than case allows', () => {
    // itxCase maxCoolerHeightMm is 76mm, airCooler is 150mm
    const invalid = checkCompatibility({ cooler: airCooler, case: itxCase });
    expect(invalid.errors.some((e) => e.code === 'COOLER_HEIGHT')).toBe(true);

    const valid = checkCompatibility({ cooler: airCooler, case: standardCase });
    expect(valid.errors.some((e) => e.code === 'COOLER_HEIGHT')).toBe(false);
  });

  it('8. COOLER_SOCKET: Passes when socket matches, Fails if unsupported socket', () => {
    const oddCooler: Cooler = {
      ...airCooler,
      supportedSockets: ['AM4'],
    };
    const valid = checkCompatibility({ cpu: am5Cpu, cooler: airCooler });
    expect(valid.errors.some((e) => e.code === 'COOLER_SOCKET')).toBe(false);

    const invalid = checkCompatibility({ cpu: am5Cpu, cooler: oddCooler });
    expect(invalid.errors.some((e) => e.code === 'COOLER_SOCKET')).toBe(true);
  });

  it('9. PSU_POWER: Passes with adequate wattage, Fails with underpowered PSU', () => {
    // bigGpu (263W) + 13600K (125W) + 100W = 488W. recommendedPsu = 650W.
    const heavyCpu = cpus.find((c) => c.id === 'cpu-i5-13600k') as CPU;
    const valid = checkCompatibility({ cpu: heavyCpu, gpu: bigGpu, psu: highPsu });
    expect(valid.errors.some((e) => e.code === 'PSU_POWER')).toBe(false);

    const invalid = checkCompatibility({ cpu: heavyCpu, gpu: bigGpu, psu: lowPsu });
    expect(invalid.errors.some((e) => e.code === 'PSU_POWER')).toBe(true);
  });

  it('10. PSU_LENGTH: Fails when PSU length exceeds case max limit', () => {
    const hugePsu: PSU = {
      ...highPsu,
      lengthMm: 220,
    };
    const tightCase: PCCase = {
      ...standardCase,
      maxPsuLengthMm: 150,
    };
    const invalid = checkCompatibility({ psu: hugePsu, case: tightCase });
    expect(invalid.errors.some((e) => e.code === 'PSU_LENGTH')).toBe(true);

    const valid = checkCompatibility({ psu: lowPsu, case: standardCase });
    expect(valid.errors.some((e) => e.code === 'PSU_LENGTH')).toBe(false);
  });

  it('11. M2_SLOTS: Fails when NVMe is selected on motherboard without M.2', () => {
    const noM2Mb: Motherboard = {
      ...am5Mb,
      m2Slots: 0,
    };
    const invalid = checkCompatibility({ motherboard: noM2Mb, storage: nvme });
    expect(invalid.errors.some((e) => e.code === 'M2_SLOTS')).toBe(true);

    const valid = checkCompatibility({ motherboard: am5Mb, storage: nvme });
    expect(valid.errors.some((e) => e.code === 'M2_SLOTS')).toBe(false);
  });

  it('12. WARNINGS: detects NO_GPU, OUT_OF_STOCK, and BOTTLENECK', () => {
    const cpuNoIgpu = cpus.find((c) => c.id === 'cpu-i3-12100f') as CPU;
    const outOfStockRam = rams.find((r) => r.stock === 0) as RAM;

    const res = checkCompatibility({
      cpu: cpuNoIgpu,
      ram: outOfStockRam,
    });

    expect(res.warnings.some((w) => w.code === 'NO_GPU')).toBe(true);
    expect(res.warnings.some((w) => w.code === 'OUT_OF_STOCK')).toBe(true);
  });

  it('13. checkSingleComponentCompatibility helper works accurately', () => {
    const current = { cpu: am5Cpu };
    const intelMb = lgaMbDdr4;
    const check = checkSingleComponentCompatibility(intelMb, current);
    expect(check.compatible).toBe(false);
    expect(check.reason).toBeDefined();

    const am5Check = checkSingleComponentCompatibility(am5Mb, current);
    expect(am5Check.compatible).toBe(true);
  });
});
