import { describe, it, expect } from 'vitest';
import { checkCompatibility, checkSingleComponentCompatibility } from './compatibility';
import { cpus, motherboards, rams, gpus, cases, psus } from '../data/components';
import { CPU, Motherboard, RAM, GPU, PCCase, PSU } from '../types';

describe('Foydalanuvchi soʻragan 4 ta holat boʻyicha tekshiruv', () => {
  // 1. AM5 CPU + LGA1700 Motherboard
  it('(1) AM5 protsessor va LGA1700 anakart bloklanadi va toʻgʻri xato beradi', () => {
    const am5Cpu = cpus.find((c) => c.socket === 'AM5') as CPU;
    const lgaMb = motherboards.find((m) => m.socket === 'LGA1700') as Motherboard;

    expect(am5Cpu).toBeDefined();
    expect(lgaMb).toBeDefined();

    // checkSingleComponentCompatibility
    const singleCheck = checkSingleComponentCompatibility(lgaMb, { cpu: am5Cpu });
    expect(singleCheck.compatible).toBe(false);
    expect(singleCheck.reason).toContain('Protsessor va anakart soketi mos emas');
    expect(singleCheck.reason).toContain('AM5 ≠ LGA1700');

    // checkCompatibility
    const res = checkCompatibility({ cpu: am5Cpu, motherboard: lgaMb });
    expect(res.errors.length).toBeGreaterThan(0);
    const socketError = res.errors.find((e) => e.code === 'SOCKET');
    expect(socketError).toBeDefined();
    expect(socketError?.message).toBe('Protsessor va anakart soketi mos emas (AM5 ≠ LGA1700).');
  });

  // 2. DDR4 Motherboard + DDR5 RAM
  it('(2) DDR4 anakart va DDR5 RAM bloklanadi va toʻgʻri xato beradi', () => {
    const ddr4Mb = motherboards.find((m) => m.ramType === 'DDR4') as Motherboard;
    const ddr5Ram = rams.find((r) => r.type === 'DDR5') as RAM;

    expect(ddr4Mb).toBeDefined();
    expect(ddr5Ram).toBeDefined();

    // checkSingleComponentCompatibility
    const singleCheck = checkSingleComponentCompatibility(ddr5Ram, { motherboard: ddr4Mb });
    expect(singleCheck.compatible).toBe(false);
    expect(singleCheck.reason).toContain('Anakart DDR4 ni qoʻllaydi, siz esa DDR5 tanladingiz');

    // checkCompatibility
    const res = checkCompatibility({ motherboard: ddr4Mb, ram: ddr5Ram });
    expect(res.errors.length).toBeGreaterThan(0);
    const ramError = res.errors.find((e) => e.code === 'RAM_TYPE');
    expect(ramError).toBeDefined();
    expect(ramError?.message).toBe('Anakart DDR4 ni qoʻllaydi, siz esa DDR5 tanladingiz.');
  });

  // 3. Uzun videokarta va kichik korpus
  it('(3) Uzun videokarta va kichik korpus bloklanadi va toʻgʻri xato beradi', () => {
    // gpu-rx-7800xt (322mm)
    const longGpu = gpus.find((g) => g.id === 'gpu-rx-7800xt') as GPU;
    // case-deepcool-cc360 (maxGpuLengthMm: 320mm)
    const smallCase = cases.find((c) => c.id === 'case-deepcool-cc360') as PCCase;

    expect(longGpu).toBeDefined();
    expect(smallCase).toBeDefined();
    expect(longGpu.lengthMm).toBeGreaterThan(smallCase.maxGpuLengthMm);

    // checkSingleComponentCompatibility
    const singleCheck = checkSingleComponentCompatibility(longGpu, { case: smallCase });
    expect(singleCheck.compatible).toBe(false);
    expect(singleCheck.reason).toContain('Videokarta korpusga sigʻmaydi');
    expect(singleCheck.reason).toContain('322 mm > 320 mm');

    // checkCompatibility
    const res = checkCompatibility({ gpu: longGpu, case: smallCase });
    expect(res.errors.length).toBeGreaterThan(0);
    const gpuError = res.errors.find((e) => e.code === 'GPU_LENGTH');
    expect(gpuError).toBeDefined();
    expect(gpuError?.message).toBe('Videokarta korpusga sigʻmaydi (322 mm > 320 mm).');
  });

  // 4. 450W PSU va RTX 4070
  it('(4) 450W PSU va RTX 4070 bloklanadi va toʻgʻri xato beradi', () => {
    const lowPsu = psus.find((p) => p.wattage === 450) as PSU;
    const rtx4070 = gpus.find((g) => g.id === 'gpu-rtx-4070') as GPU;

    expect(lowPsu).toBeDefined();
    expect(rtx4070).toBeDefined();

    // checkSingleComponentCompatibility
    const singleCheck = checkSingleComponentCompatibility(lowPsu, { gpu: rtx4070 });
    expect(singleCheck.compatible).toBe(false);
    expect(singleCheck.reason).toContain('Quvvat bloki yetarli emas');

    // checkCompatibility
    const res = checkCompatibility({ psu: lowPsu, gpu: rtx4070 });
    expect(res.errors.length).toBeGreaterThan(0);
    const psuError = res.errors.find((e) => e.code === 'PSU_POWER');
    expect(psuError).toBeDefined();
    expect(psuError?.message).toContain('Quvvat bloki yetarli emas');
  });
});
