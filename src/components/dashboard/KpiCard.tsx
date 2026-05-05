import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

type KpiCardProps = {
  label: string;
  value: string;
  changePct?: number;
  icon: LucideIcon;
  highlight?: boolean;
  subtitle?: string;
};

export function KpiCard({
  label,
  value,
  changePct,
  icon: Icon,
  highlight,
  subtitle,
}: KpiCardProps) {
  const isUp = (changePct ?? 0) >= 0;
  return (
    <div
      className={[
        "relative overflow-hidden rounded-xl border p-5 transition-all",
        highlight
          ? "border-transparent text-primary-foreground shadow-[var(--shadow-elevated)]"
          : "border-border bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)]",
      ].join(" ")}
      style={highlight ? { background: "var(--gradient-hero)" } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={[
              "text-xs font-medium uppercase tracking-wider",
              highlight ? "text-primary-foreground/70" : "text-muted-foreground",
            ].join(" ")}
          >
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          {subtitle && (
            <p
              className={[
                "mt-1 text-xs",
                highlight ? "text-primary-foreground/80" : "text-muted-foreground",
              ].join(" ")}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            highlight ? "bg-white/15" : "bg-accent/10 text-accent",
          ].join(" ")}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {typeof changePct === "number" && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
          <span
            className={[
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
              highlight
                ? "bg-white/15 text-primary-foreground"
                : isUp
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive",
            ].join(" ")}
          >
            {isUp ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {isUp ? "+" : ""}
            {changePct.toFixed(1)}%
          </span>
          <span
            className={
              highlight ? "text-primary-foreground/70" : "text-muted-foreground"
            }
          >
            vs previous period
          </span>
        </div>
      )}
    </div>
  );
}
