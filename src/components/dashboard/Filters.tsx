import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, RotateCcw } from "lucide-react";
import {
  ALL_CATEGORIES,
  ALL_QUARTERS,
  ALL_REGIONS,
  ALL_REPS,
  ALL_YEARS,
} from "@/lib/sales-data";

export type FilterState = {
  year: string;
  quarter: string;
  region: string;
  category: string;
  rep: string;
};

export const DEFAULT_FILTERS: FilterState = {
  year: "2025",
  quarter: "all",
  region: "all",
  category: "all",
  rep: "all",
};

type Props = {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
};

export function Filters({ filters, onChange, onReset }: Props) {
  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="h-4 w-4 text-accent" />
          Global Filters
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <FilterSelect
          label="Year"
          value={filters.year}
          onChange={(v) => set("year", v)}
          options={[
            { value: "all", label: "All Years" },
            ...ALL_YEARS.map((y) => ({ value: String(y), label: String(y) })),
          ]}
        />
        <FilterSelect
          label="Quarter"
          value={filters.quarter}
          onChange={(v) => set("quarter", v)}
          options={[
            { value: "all", label: "All Quarters" },
            ...ALL_QUARTERS.map((q) => ({ value: q, label: q })),
          ]}
        />
        <FilterSelect
          label="Region"
          value={filters.region}
          onChange={(v) => set("region", v)}
          options={[
            { value: "all", label: "All Regions" },
            ...ALL_REGIONS.map((r) => ({ value: r, label: r })),
          ]}
        />
        <FilterSelect
          label="Category"
          value={filters.category}
          onChange={(v) => set("category", v)}
          options={[
            { value: "all", label: "All Categories" },
            ...ALL_CATEGORIES.map((c) => ({ value: c, label: c })),
          ]}
        />
        <FilterSelect
          label="Sales Rep"
          value={filters.rep}
          onChange={(v) => set("rep", v)}
          options={[
            { value: "all", label: "All Reps" },
            ...ALL_REPS.map((r) => ({ value: r, label: r })),
          ]}
        />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-full bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
