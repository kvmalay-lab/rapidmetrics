import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sales Performance Dashboard · RapidMetrics" },
      {
        name: "description",
        content:
          "Interactive sales analytics dashboard with KPIs, trends, regional breakdowns, and AI-driven insights for data-driven growth.",
      },
      { property: "og:title", content: "Sales Performance Dashboard" },
      {
        property: "og:description",
        content: "Data-driven insights for strategic growth.",
      },
    ],
  }),
  component: Dashboard,
});
