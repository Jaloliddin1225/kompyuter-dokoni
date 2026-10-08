import { prebuiltPCs } from '../src/data/prebuilt';
import { componentsById } from '../src/data/components';
import { checkCompatibility } from '../src/lib/compatibility';
import { Category, Component } from '../src/types';

console.log('=== PREBUILT PCS COMPATIBILITY VERIFICATION ===\n');

const results: Array<{
  id: string;
  name: string;
  category: string;
  errorsCount: number;
  errors: string[];
  warningsCount: number;
  warnings: string[];
  estimatedPower: number;
  recommendedPsu: number;
}> = [];

for (const pc of prebuiltPCs) {
  const selection: Partial<Record<Category, Component>> = {};
  for (const compId of pc.componentIds) {
    const comp = componentsById[compId];
    if (!comp) {
      console.error(`Component not found: ${compId} in ${pc.id}`);
      continue;
    }
    selection[comp.category] = comp;
  }

  const compResult = checkCompatibility(selection);
  results.push({
    id: pc.id,
    name: pc.name,
    category: pc.category,
    errorsCount: compResult.errors.length,
    errors: compResult.errors.map((e) => `[${e.code}] ${e.message}`),
    warningsCount: compResult.warnings.length,
    warnings: compResult.warnings.map((w) => `[${w.code}] ${w.message}`),
    estimatedPower: compResult.estimatedPower,
    recommendedPsu: compResult.recommendedPsu,
  });
}

console.table(
  results.map((r) => ({
    'ID': r.id,
    'Nomi': r.name,
    'Kategoriya': r.category,
    'Xatolar soni': r.errorsCount,
    'Ogohlantirishlar': r.warningsCount,
    'Hisoblangan Quvvat': `${r.estimatedPower}W`,
    'Tavsiya PSU': `${r.recommendedPsu}W`,
    'Moslik Holati': r.errorsCount === 0 ? '✅ 100% MOS' : '❌ XATOLIK BOR',
  }))
);

for (const r of results) {
  if (r.errors.length > 0) {
    console.log(`\n❌ ${r.name} xatolari:`);
    r.errors.forEach((e) => console.log(`   - ${e}`));
  }
  if (r.warnings.length > 0) {
    console.log(`\n⚠️ ${r.name} ogohlantirishlari:`);
    r.warnings.forEach((w) => console.log(`   - ${w}`));
  }
}
