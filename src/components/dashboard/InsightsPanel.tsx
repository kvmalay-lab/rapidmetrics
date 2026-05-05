import { AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";

export type Insight = {
  problem: string;
  data: string;
  recommendation: string;
};

export function InsightsPanel({ insight }: { insight: Insight }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground"
          style={{ background: "var(--gradient-accent)" }}
        >
          <Lightbulb className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">AI Insights</h3>
          <p className="text-xs text-muted-foreground">
            Updates with your filter selection
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <InsightBlock
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Problem"
          tone="destructive"
          text={insight.problem}
        />
        <InsightBlock
          icon={<TrendingUp className="h-4 w-4" />}
          label="What the data says"
          tone="accent"
          text={insight.data}
        />
        <InsightBlock
          icon={<Lightbulb className="h-4 w-4" />}
          label="Recommendation"
          tone="success"
          text={insight.recommendation}
        />
      </div>
    </div>
  );
}

function InsightBlock({
  icon,
  label,
  text,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
  tone: "destructive" | "accent" | "success";
}) {
  const toneClass =
    tone === "destructive"
      ? "bg-destructive/10 text-destructive"
      : tone === "success"
        ? "bg-success/10 text-success"
        : "bg-accent/10 text-accent";

  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${toneClass}`}
        >
          {icon}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-foreground">{text}</p>
    </div>
  );
}
