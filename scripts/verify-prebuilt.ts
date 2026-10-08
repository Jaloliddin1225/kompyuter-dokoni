import { prebuiltPCs } from '../src/data/prebuilt';
import { componentsById } from '../src/data/components';
import { checkCompatibility } from '../src/lib/compatibility';
import { Category, Component, PSU } from '../src/types';
import { formatPrice } from '../src/lib/format';

interface PrebuiltCheckResult {
  id: string;
  name: string;
  category: string;
  price: string;
  status: 'MOS (OʻTDI)' | 'XATOLIK BOR';
  errorsCount: number;
  warningsCount: number;
  errors: string[];
  warnings: string[];
  psuStatus: string;
}

console.log('='.repeat(90));
console.log('PCFORGE: PREBUILT PC KOMPONENTLARI MOSLIGINI TEKSHIRISH SKRIPTI');
console.log('='.repeat(90));

const results: PrebuiltCheckResult[] = [];

prebuiltPCs.forEach((pc) => {
  const selection: Partial<Record<Category, Component>> = {};

  pc.componentIds.forEach((id) => {
    const comp = componentsById[id];
    if (comp) {
      selection[comp.category] = comp;
    } else {
      console.error(`[XATO] Komponent topilmadi: ${id} (${pc.name})`);
    }
  });

  const res = checkCompatibility(selection);
  const psu = selection.psu as PSU | undefined;

  results.push({
    id: pc.id,
    name: pc.name,
    category: pc.category,
    price: formatPrice(pc.price),
    status: res.errors.length === 0 ? 'MOS (OʻTDI)' : 'XATOLIK BOR',
    errorsCount: res.errors.length,
    warningsCount: res.warnings.length,
    errors: res.errors.map((e) => `[${e.code}] ${e.message}`),
    warnings: res.warnings.map((w) => `[${w.code}] ${w.message}`),
    psuStatus: psu
      ? `${psu.wattage}W (Sarf: ${res.estimatedPower}W, Tavsiya: ${res.recommendedPsu}W)`
      : `PSU tanlanmagan`,
  });
});

console.log('\n--- QISQA JADVAL ---');
console.table(
  results.map((r) => ({
    Nomi: r.name,
    Kategoriya: r.category,
    Narxi: r.price,
    Holati: r.status,
    Xatolar: r.errorsCount,
    Ogohlantirishlar: r.warningsCount,
    'PSU / Quvvat': r.psuStatus,
  }))
);

let allValid = true;
console.log('\n--- BATAFSIL NATIJALAR ---');
results.forEach((r, idx) => {
  console.log(`\n${idx + 1}. [${r.status}] ${r.name} (${r.category}) - ${r.price}`);
  console.log(`   Quvvat bloki: ${r.psuStatus}`);
  if (r.errors.length > 0) {
    allValid = false;
    console.log(`   ❌ Xatolar:`);
    r.errors.forEach((err) => console.log(`      • ${err}`));
  } else {
    console.log(`   ✅ Barcha apparat komponentlari 100% mos.`);
  }

  if (r.warnings.length > 0) {
    console.log(`   ⚠️  Ogohlantirishlar:`);
    r.warnings.forEach((warn) => console.log(`      • ${warn}`));
  }
});

console.log('\n' + '='.repeat(90));
if (allValid) {
  console.log('XULOSA: BARCHA 6 TA TAYYOR KOMPYUTER MOSLIK TEKSHIRUVIDAN 100% MUVAFFAQIYATLI OʻTDI!');
} else {
  console.log('XULOSA: AYRIM KOMPYUTERLARDA XATOLAR ANIQLANDI. KOMPONENTLARNI TUZATISH TALAB ETILADI.');
}
console.log('='.repeat(90));
