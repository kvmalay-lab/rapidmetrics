export type SalesRecord = {
  id: string;
  date: string; // ISO
  year: number;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  month: string;
  region: "North" | "South" | "East" | "West";
  category: "Electronics" | "Apparel" | "Home Goods" | "Software";
  rep: string;
  revenue: number;
  orders: number;
  returningCustomer: boolean;
};

const REGIONS: SalesRecord["region"][] = ["North", "South", "East", "West"];
const CATEGORIES: SalesRecord["category"][] = [
  "Electronics",
  "Apparel",
  "Home Goods",
  "Software",
];
const REPS = [
  "Alex Chen",
  "Priya Patel",
  "Marcus Johnson",
  "Sofia Rivera",
  "Daniel Kim",
  "Emma Thompson",
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Deterministic pseudo-random
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSalesData(): SalesRecord[] {
  const rand = mulberry32(42);
  const data: SalesRecord[] = [];
  const years = [2023, 2024, 2025];

  let id = 0;
  for (const year of years) {
    for (let m = 0; m < 12; m++) {
      const monthName = MONTHS[m];
      const quarter = (`Q${Math.floor(m / 3) + 1}` as SalesRecord["quarter"]);
      // ~20 records per month
      for (let i = 0; i < 20; i++) {
        const region = REGIONS[Math.floor(rand() * REGIONS.length)];
        const category = CATEGORIES[Math.floor(rand() * CATEGORIES.length)];
        const rep = REPS[Math.floor(rand() * REPS.length)];

        // Base revenue varies by year (growth) and category
        const yearGrowth = year === 2023 ? 1 : year === 2024 ? 1.18 : 1.32;
        const catBase: Record<SalesRecord["category"], number> = {
          Electronics: 4200,
          Apparel: 1800,
          "Home Goods": 2600,
          Software: 5200,
        };
        let revenue = catBase[category] * yearGrowth * (0.6 + rand() * 0.9);

        // Inject the "story": West region Q3 2025 supply chain dip
        if (region === "West" && year === 2025 && quarter === "Q3") {
          revenue *= 0.55;
        }
        // North region trending strong in 2025
        if (region === "North" && year === 2025) {
          revenue *= 1.15;
        }

        const orders = Math.max(1, Math.round(revenue / (180 + rand() * 220)));
        const day = Math.min(28, Math.floor(rand() * 28) + 1);
        const date = `${year}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        data.push({
          id: `s_${id++}`,
          date,
          year,
          quarter,
          month: monthName,
          region,
          category,
          rep,
          revenue: Math.round(revenue),
          orders,
          returningCustomer: rand() > 0.38,
        });
      }
    }
  }
  return data;
}

export const ALL_REGIONS = REGIONS;
export const ALL_CATEGORIES = CATEGORIES;
export const ALL_REPS = REPS;
export const ALL_YEARS = [2023, 2024, 2025];
export const ALL_QUARTERS = ["Q1", "Q2", "Q3", "Q4"] as const;
export const MONTH_ORDER = MONTHS;
