import { componentsById } from '../src/data/components';
import { checkCompatibility, checkSingleComponentCompatibility } from '../src/lib/compatibility';
import { Category, Component } from '../src/types';

console.log('=== BUILDER 4 SCENARIOS VERIFICATION ===\n');

// 1. AM5 CPU + LGA1700 Motherboard
const am5Cpu = componentsById['cpu-ryzen5-7600']; // AM5
const lgaMotherboard = componentsById['mb-gigabyte-b760-gaming-x']; // LGA1700
console.log('1. AM5 CPU + LGA1700 Motherboard:');
const res1_single = checkSingleComponentCompatibility(lgaMotherboard, { cpu: am5Cpu });
const res1_full = checkCompatibility({ cpu: am5Cpu, motherboard: lgaMotherboard });
console.log('Single check compatible:', res1_single.compatible, 'Reason:', res1_single.reason);
console.log('Full check errors:', res1_full.errors);

// 2. DDR4 Motherboard + DDR5 RAM
const ddr4Motherboard = componentsById['mb-asus-tuf-b550-plus']; // DDR4
const ddr5Ram = componentsById['ram-kingston-16gb-ddr5']; // DDR5
console.log('\n2. DDR4 Motherboard + DDR5 RAM:');
const res2_single = checkSingleComponentCompatibility(ddr5Ram, { motherboard: ddr4Motherboard });
const res2_full = checkCompatibility({ motherboard: ddr4Motherboard, ram: ddr5Ram });
console.log('Single check compatible:', res2_single.compatible, 'Reason:', res2_single.reason);
console.log('Full check errors:', res2_full.errors);

// 3. Uzun videokarta va kichik korpus (Long GPU + Small Case)
const longGpu = componentsById['gpu-rx-7800xt']; // 322mm
const smallCase = componentsById['case-cm-nr200p']; // max 280mm
console.log('\n3. Uzun GPU (322mm) + Kichik korpus (max 280mm):');
const res3_single = checkSingleComponentCompatibility(longGpu, { case: smallCase });
const res3_full = checkCompatibility({ gpu: longGpu, case: smallCase });
console.log('Single check compatible:', res3_single.compatible, 'Reason:', res3_single.reason);
console.log('Full check errors:', res3_full.errors);

// 4. 450W PSU + RTX 4070
const psu450 = componentsById['psu-deepcool-pf450']; // 450W
const rtx4070 = componentsById['gpu-rtx-4070']; // requires 650W
console.log('\n4. 450W PSU + RTX 4070 (650W required):');
const res4_single = checkSingleComponentCompatibility(psu450, { gpu: rtx4070 });
const res4_full = checkCompatibility({ psu: psu450, gpu: rtx4070 });
console.log('Single check compatible:', res4_single.compatible, 'Reason:', res4_single.reason);
console.log('Full check errors:', res4_full.errors);
