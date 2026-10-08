import { describe, it, expect } from 'vitest';
import { prebuiltPCs } from '../data/prebuilt';
import { componentsById } from '../data/components';
import { checkCompatibility } from './compatibility';
import { Category, Component } from '../types';

describe('Prebuilt PCs Moslik Testi', () => {
  it('barcha 6 ta tayyor kompyuter checkCompatibility dan 0 ta xato bilan oʻtishi kerak', () => {
    expect(prebuiltPCs.length).toBe(6);

    prebuiltPCs.forEach((pc) => {
      const selection: Partial<Record<Category, Component>> = {};

      pc.componentIds.forEach((id) => {
        const comp = componentsById[id];
        expect(comp, `Komponent mavjud boʻlishi kerak: ${id}`).toBeDefined();
        selection[comp.category] = comp;
      });

      const result = checkCompatibility(selection);

      expect(
        result.errors.length,
        `Kompyuterda apparat xatolari boʻlmasligi kerak: "${pc.name}" (${result.errors.map((e) => e.message).join(', ')})`
      ).toBe(0);

      expect(
        result.warnings.length,
        `Kompyuterda ogohlantirishlar boʻlmasligi kerak: "${pc.name}" (${result.warnings.map((w) => w.message).join(', ')})`
      ).toBe(0);
    });
  });
});
