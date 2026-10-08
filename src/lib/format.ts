/**
 * Narxni o'zbek so'mida minglik ajratgich bilan formatlaydi
 * Masalan: 7450000 -> "7 450 000 so'm"
 */
export function formatPrice(n: number): string {
  if (isNaN(n) || n === null || n === undefined) return "0 so'm";
  const formatted = Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} so'm`;
}
