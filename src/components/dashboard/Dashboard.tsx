import { useMemo, useState } from "react";
import {
  BarChart3,
  Clock,
  DollarSign,
  Download,
  Repeat,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { KpiCard } from "./KpiCard";
import { DEFAULT_FILTERS, type FilterState, Filters } from "./Filters";
import {
  CategoryDonutChart,
  RegionBarChart,
  RevenueTrendChart,
} from "./Charts";
import { InsightsPanel, type Insight } from "./InsightsPanel";
import { TechnicalNotes } from "./TechnicalNotes";
import { exportDashboardPdf } from "@/lib/pdf-export";
import {
  generateSalesData,
  MONTH_ORDER,
  type SalesRecord,
} from "@/lib/sales-data";

const ALL_DATA = generateSalesData();

function applyFilters(data: SalesRecord[], f: FilterState) {
  return data.filter((r) => {
    if (f.year !== "all" && String(r.year) !== f.year) return false;
    if (f.quarter !== "all" && r.quarter !== f.quarter) return false;
    if (f.region !== "all" && r.region !== f.region) return false;
    if (f.category !== "all" && r.category !== f.category) return false;
    if (f.rep !== "all" && r.rep !== f.rep) return false;
    return true;
  });
}


const fmtMoney = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

function buildInsight(
  filters: FilterState,
  filtered: SalesRecord[],
  byRegion: { region: string; revenue: number }[],
  byCategory: { category: string; revenue: number }[],
): Insight {
  if (filtered.length === 0) {
    return {
      problem: "No records match the selected filters.",
      data: "Try widening the date range or clearing a filter to surface trends.",
      recommendation: "Reset filters to view the full sales picture.",
    };
  }

  const topRegion = [...byRegion].sort((a, b) => b.revenue - a.revenue)[0];
  const weakRegion = [...byRegion].sort((a, b) => a.revenue - b.revenue)[0];
  const topCategory = [...byCategory].sort((a, b) => b.revenue - a.revenue)[0];

  // Highlight the West Q3 2025 storyline when relevant.
  const westQ3Story =
    (filters.year === "2025" || filters.year === "all") &&
    (filters.quarter === "Q3" || filters.quarter === "all") &&
    (filters.region === "all" || filters.region === "West");

  if (westQ3Story && weakRegion?.region === "West") {
    return {
      problem:
        "The West region underperformed in Q3 2025, dragging down portfolio growth despite strong national demand.",
      data: `West revenue came in ~45% below trend while ${topRegion.region} led at ${fmtMoney(topRegion.revenue)}. ${topCategory.category} remained the most resilient category at ${fmtMoney(topCategory.revenue)}.`,
      recommendation: `Reallocate Q4 inventory from ${topRegion.region} into West, and run a targeted promo on ${topCategory.category} to recover lost momentum before year-end.`,
    };
  }

  return {
    problem: `${weakRegion.region} is the lowest-performing region in the current view, generating only ${fmtMoney(weakRegion.revenue)}.`,
    data: `${topRegion.region} leads with ${fmtMoney(topRegion.revenue)}, and ${topCategory.category} is the strongest category overall.`,
    recommendation: `Double down on ${topCategory.category} in ${topRegion.region}, and pilot a focused enablement program for ${weakRegion.region} reps next quarter.`,
  };
}

export function Dashboard() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const filtered = useMemo(() => applyFilters(ALL_DATA, filters), [filters]);

  // KPIs and YoY comparison
  const kpis = useMemo(() => {
    const totalRevenue = filtered.reduce((s, r) => s + r.revenue, 0);
    const totalOrders = filtered.reduce((s, r) => s + r.orders, 0);
    const aov = totalOrders ? totalRevenue / totalOrders : 0;
    const returning = filtered.filter((r) => r.returningCustomer).length;
    const retention = filtered.length ? (returning / filtered.length) * 100 : 0;

    // Compare against previous year for YoY
    const prevYearFilters: FilterState = {
      ...filters,
      year:
        filters.year === "all"
          ? "all"
          : String(Math.max(2023, parseInt(filters.year) - 1)),
    };
    const prev = applyFilters(ALL_DATA, prevYearFilters);
    const prevRevenue = prev.reduce((s, r) => s + r.revenue, 0);
    const prevOrders = prev.reduce((s, r) => s + r.orders, 0);
    const prevAov = prevOrders ? prevRevenue / prevOrders : 0;
    const prevReturning = prev.filter((r) => r.returningCustomer).length;
    const prevRetention = prev.length ? (prevReturning / prev.length) * 100 : 0;

    const pctChange = (cur: number, p: number) =>
      p === 0 ? 0 : ((cur - p) / p) * 100;

    return {
      totalRevenue,
      revenueChange: pctChange(totalRevenue, prevRevenue),
      aov,
      aovChange: pctChange(aov, prevAov),
      retention,
      retentionChange: retention - prevRetention,
    };
  }, [filtered, filters]);

  // Revenue trend by month (or by year if all years)
  const trendData = useMemo(() => {
    if (filters.year === "all") {
      const map = new Map<number, number>();
      filtered.forEach((r) => map.set(r.year, (map.get(r.year) ?? 0) + r.revenue));
      return [...map.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([y, v]) => ({ period: String(y), revenue: v }));
    }
    const map = new Map<string, number>();
    filtered.forEach((r) => map.set(r.month, (map.get(r.month) ?? 0) + r.revenue));
    return MONTH_ORDER.filter((m) => map.has(m)).map((m) => ({
      period: m,
      revenue: map.get(m) ?? 0,
    }));
  }, [filtered, filters.year]);

  const regionData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => map.set(r.region, (map.get(r.region) ?? 0) + r.revenue));
    return [...map.entries()].map(([region, revenue]) => ({ region, revenue }));
  }, [filtered]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) =>
      map.set(r.category, (map.get(r.category) ?? 0) + r.revenue),
    );
    return [...map.entries()].map(([category, revenue]) => ({ category, revenue }));
  }, [filtered]);

  const insight = useMemo(
    () => buildInsight(filters, filtered, regionData, categoryData),
    [filters, filtered, regionData, categoryData],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="border-b border-border/40 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3 w-3" />
              The Visual Project
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Sales Performance Dashboard
            </h1>
            <p className="mt-1 text-sm text-primary-foreground/80">
              Data-Driven Insights for Strategic Growth
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              exportDashboardPdf({
                filtersSummary: `Year: ${filters.year} · Quarter: ${filters.quarter} · Region: ${filters.region} · Category: ${filters.category} · Rep: ${filters.rep}`,
                kpis: [
                  {
                    label: "Total Revenue",
                    value: fmtMoney(kpis.totalRevenue),
                    change: `${kpis.revenueChange >= 0 ? "+" : ""}${kpis.revenueChange.toFixed(1)}% YoY`,
                  },
                  {
                    label: "Avg. Order Value",
                    value: fmtMoney(kpis.aov),
                    change: `${kpis.aovChange >= 0 ? "+" : ""}${kpis.aovChange.toFixed(1)}% YoY`,
                  },
                  {
                    label: "Customer Retention",
                    value: `${kpis.retention.toFixed(1)}%`,
                    change: `${kpis.retentionChange >= 0 ? "+" : ""}${kpis.retentionChange.toFixed(1)} pts`,
                  },
                  {
                    label: "Reporting Efficiency",
                    value: "4 hrs → 15 min",
                    change: "94% faster",
                  },
                ],
                regionRows: regionData,
                categoryRows: categoryData,
                trendRows: trendData,
                insight,
              })
            }
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary shadow-md backdrop-blur transition-all hover:bg-white/90 hover:shadow-lg md:self-auto"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8">
        {/* KPIs — first on mobile for the recruiter 10-second view */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Reporting Efficiency"
            value="4 hrs → 15 min"
            subtitle="94% faster · automated reporting"
            icon={Clock}
            highlight
          />
          <KpiCard
            label="Total Revenue"
            value={fmtMoney(kpis.totalRevenue)}
            changePct={kpis.revenueChange}
            icon={DollarSign}
          />
          <KpiCard
            label="Avg. Order Value"
            value={fmtMoney(kpis.aov)}
            changePct={kpis.aovChange}
            icon={ShoppingCart}
          />
          <KpiCard
            label="Customer Retention"
            value={`${kpis.retention.toFixed(1)}%`}
            changePct={kpis.retentionChange}
            icon={Repeat}
          />
        </section>

        {/* Filters */}
        <Filters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />

        {/* KPIs */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total Revenue"
            value={fmtMoney(kpis.totalRevenue)}
            changePct={kpis.revenueChange}
            icon={DollarSign}
          />
          <KpiCard
            label="Avg. Order Value"
            value={fmtMoney(kpis.aov)}
            changePct={kpis.aovChange}
            icon={ShoppingCart}
          />
          <KpiCard
            label="Customer Retention"
            value={`${kpis.retention.toFixed(1)}%`}
            changePct={kpis.retentionChange}
            icon={Repeat}
          />
          <KpiCard
            label="Reporting Efficiency"
            value="15 min"
            subtitle="Reduced from 4 hours — 94% faster"
            icon={Clock}
            highlight
          />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard
            title="Revenue Trend"
            subtitle={
              filters.year === "all" ? "Annual revenue" : `Monthly revenue · ${filters.year}`
            }
          >
            <RevenueTrendChart data={trendData} />
          </ChartCard>
          <ChartCard title="Sales by Region" subtitle="Total revenue per region">
            <RegionBarChart data={regionData} />
          </ChartCard>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartCard
              title="Sales by Product Category"
              subtitle="Share of revenue by category"
              icon={<BarChart3 className="h-4 w-4 text-accent" />}
            >
              <CategoryDonutChart data={categoryData} />
            </ChartCard>
          </div>
          <div>
            <InsightsPanel insight={insight} />
          </div>
        </section>

        <footer className="pt-2 pb-6 text-center text-xs text-muted-foreground">
          The Visual Project · {filtered.length.toLocaleString()} records in current view
        </footer>
      </main>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon}
      </div>
      {children}
    </div>
  );
}
