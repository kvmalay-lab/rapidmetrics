import { useState } from "react";
import { ChevronDown, Database, Rocket } from "lucide-react";

export function TechnicalNotes() {
  const [open, setOpen] = useState(false);
  return (
    <section className="space-y-3">
      <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
          aria-expanded={open}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Database className="h-4 w-4 text-accent" />
            Technical Notes &amp; Data Lineage
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
        {open && (
          <div className="space-y-3 border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              This dashboard uses synthetic data simulating 5 years of sales
              transactions across 4 regions, 4 product categories, and 6 sales
              reps. Data is generated deterministically with a seeded PRNG so
              every reload produces identical results — important for
              reproducible demos.
            </p>
            <p>
              In production, this connects to a PostgreSQL database via a typed
              API layer. Filtering logic is designed to be pushed down to
              server-side aggregation (SQL <code>GROUP BY</code> + indexed
              <code> WHERE</code>) so the client stays responsive at scale.
            </p>
            <p>
              Built with React, TanStack Start, Recharts, Tailwind CSS, Lucide
              icons, and jsPDF for client-side report generation.
            </p>
          </div>
        )}
      </div>

      <div
        className="flex items-start gap-3 rounded-xl border border-accent/30 p-4 text-sm text-foreground"
        style={{ background: "var(--gradient-accent)", color: "white" }}
      >
        <Rocket className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <span className="font-semibold">Next Project: </span>
          Real-time Supply Chain Dashboard using IoT Sensor Data.
        </div>
      </div>
    </section>
  );
}
